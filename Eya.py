from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId

# Initialiser l'application Flask
app = Flask(__name__)

# Configurer CORS pour permettre les requêtes locales
CORS(app, resources={r"/predict": {"origins": ["http://localhost:3000", "http://localhost:5173"]}})

# Charger les modèles et le scaler sauvegardés
try:
    with open('rf_classifier.pkl', 'rb') as f:
        rf_classifier = pickle.load(f)
    with open('rf_regressor.pkl', 'rb') as f:
        rf_regressor = pickle.load(f)
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
except FileNotFoundError as e:
    print(f"Erreur : {e}. Assurez-vous que les fichiers .pkl sont dans le même dossier que ce script.")
    raise RuntimeError("Impossible de charger les modèles. Arrêt du programme.")
except Exception as e:
    print(f"Erreur inattendue lors du chargement des fichiers .pkl : {e}")
    raise

# Connexion à MongoDB
try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['ProjectManagement']  # Nom corrigé en minuscules
    projects_collection = db['projects']
    resources_collection = db['ressources']  # Nom corrigé en 'resources'
    workspaces_collection = db['workspaces']
except Exception as e:
    print(f"Erreur lors de la connexion à MongoDB : {e}")
    raise RuntimeError("Impossible de se connecter à MongoDB. Arrêt du programme.")

# Définir les features attendues par le modèle
features = [
    'duration_days', 'cost_ratio', 'time_ratio', 'team_size',
    'res_Financier', 'res_Humain', 'res_Matériel', 'estimated_cost',
    'allocated_cost', 'start_month', 'avg_time_diff', 'avg_cost_diff'
]

# Fonction pour calculer les features à partir des données MongoDB
def calculate_features(project, resources, workspace):
    try:
        # Vérifier et utiliser les champs start_date et end_date
        if 'start_date' not in project or 'end_date' not in project:
            raise ValueError("Les champs start_date et end_date sont requis dans le projet")
        
        start_date = project['start_date']
        end_date = project['end_date']
        
        # Vérifier que start_date et end_date sont des objets datetime
        if not isinstance(start_date, datetime) or not isinstance(end_date, datetime):
            raise ValueError("start_date et end_date doivent être des objets datetime")
        
        duration_days = (end_date - start_date).days
        if duration_days < 0:
            raise ValueError("end_date doit être postérieur à start_date")

        # Calculer cost_ratio, estimated_cost, et allocated_cost à partir des ressources
        total_estimated_cost = sum(float(r.get('estimated_cost', 0)) for r in resources)
        total_allocated_cost = sum(float(r.get('allocated_cost', 0)) for r in resources)
        cost_ratio = total_allocated_cost / total_estimated_cost if total_estimated_cost > 0 else 1.0

        # Calculer time_ratio (fixé à 1.0 pour le moment, à ajuster selon votre logique)
        time_ratio = 1.0

        # Calculer team_size (somme des team_size des ressources de type Humain)
        team_size = sum(int(r.get('team_size', 0)) for r in resources if r.get('resource_type') == 'Humain')

        # Vérifier les ressources disponibles
        res_Financier = 1 if any(r.get('resource_type') == 'Financier' for r in resources) else 0
        res_Humain = 1 if any(r.get('resource_type') == 'Humain' for r in resources) else 0
        res_Matériel = 1 if any(r.get('resource_type') == 'Matériel' for r in resources) else 0

        # Calculer start_month directement à partir de l'objet datetime
        start_month = start_date.month

        # Calculer avg_time_diff et avg_cost_diff à partir des projets terminés dans le workspace
        avg_time_diff = 0.0
        avg_cost_diff = 0.0
        if workspace and 'projects' in workspace:
            # Récupérer tous les projets du workspace
            workspace_projects = workspace['projects']  # Liste d'ObjectId
            completed_projects = list(projects_collection.find({
                '_id': {'$in': workspace_projects},
                'status': 'completed'
            }))
            
            if completed_projects:
                time_diffs = []
                cost_diffs = []
                for p in completed_projects:
                    if 'end_date' not in p or 'actual_end_date' not in p:
                        continue
                    try:
                        # Convertir les dates en objets datetime si nécessaire
                        end = p['end_date']
                        actual_end = p['actual_end_date']
                        if not isinstance(end, datetime) or not isinstance(actual_end, datetime):
                            continue
                        time_diff = (actual_end - end).days
                        time_diffs.append(time_diff)
                        
                        cost_diff = float(p.get('actual_cost', 0)) - float(p.get('estimated_cost', 0))
                        cost_diffs.append(cost_diff)
                    except Exception as e:
                        print(f"Erreur lors du calcul des différences pour le projet {p['_id']}: {e}")
                        continue
                
                if time_diffs:
                    avg_time_diff = sum(time_diffs) / len(time_diffs)
                if cost_diffs:
                    avg_cost_diff = sum(cost_diffs) / len(cost_diffs)

        # Créer le dictionnaire des features
        project_data = {
            'duration_days': duration_days,
            'cost_ratio': cost_ratio,
            'time_ratio': time_ratio,
            'team_size': team_size,
            'res_Financier': res_Financier,
            'res_Humain': res_Humain,
            'res_Matériel': res_Matériel,
            'estimated_cost': total_estimated_cost,
            'allocated_cost': total_allocated_cost,
            'start_month': start_month,
            'avg_time_diff': avg_time_diff,
            'avg_cost_diff': avg_cost_diff
        }
        return project_data

    except Exception as e:
        print(f"Erreur lors du calcul des features: {e}")
        raise

# Route pour la prédiction d'un projet spécifique
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Récupérer le projectId depuis le corps de la requête
        data = request.get_json()
        project_id = data.get('projectId')  # Ligne ajoutée
        print(f"Requête reçue avec projectId: {project_id}")
        
        if not project_id:
            print("Erreur: projectId manquant")
            return jsonify({'error': 'projectId est requis dans le corps de la requête'}), 400

        # Convertir le projectId en ObjectId
        try:
            project_object_id = ObjectId(project_id)
            print(f"projectId converti en ObjectId: {project_object_id}")
        except Exception as e:
            print(f"Erreur lors de la conversion du projectId: {e}")
            return jsonify({'error': 'projectId invalide'}), 400

        # Récupérer le projet spécifique depuis MongoDB
        project = projects_collection.find_one({'_id': project_object_id})
        print(f"Projet récupéré: {project}")
        if not project:
            print(f"Projet non trouvé pour l'ID {project_id}")
            return jsonify({'error': f"Projet avec l'ID {project_id} non trouvé"}), 404

        # Récupérer les ressources du projet
        resources = list(resources_collection.find({'project_id': project_object_id}))
        print(f"Ressources récupérées: {resources}")
        if not resources:
            print(f"Aucune ressource trouvée pour le projet {project_id}")
            return jsonify({'error': f"Aucune ressource trouvée pour le projet {project_id}"}), 404

        # Trouver le workspace qui contient ce projet dans sa liste projects
        workspace = workspaces_collection.find_one({'projects': project_object_id})
        print(f"Workspace récupéré: {workspace}")
        if not workspace:
            print(f"Workspace non trouvé pour le projet {project_id}")
            return jsonify({'error': f"Workspace non trouvé pour le projet {project_id}"}), 404

        # Calculer les features à partir des données MongoDB
        project_data = calculate_features(project, resources, workspace)
        print(f"Features calculées: {project_data}")

        # Convertir les données en DataFrame
        input_data = pd.DataFrame([project_data], columns=features)

        # Standardiser les données
        input_scaled = scaler.transform(input_data)

        # Faire les prédictions
        pred_delay = rf_classifier.predict(input_scaled)
        pred_time_diff = rf_regressor.predict(input_scaled)

        # Ajuster time_diff pour éviter les valeurs négatives
        time_diff = max(0.0, float(pred_time_diff[0]))

        # Créer le résultat de la prédiction
        result = {
            'project_id': str(project['_id']),
            'project_name': project['project_name'],
            'is_delayed': 'En retard' if pred_delay[0] == 1 else 'À temps',
            'time_diff': time_diff
        }
        print(f"Prédiction générée: {result}")

        return jsonify(result), 200

    except Exception as e:
        print(f"Erreur complète lors de la prédiction: {e}")
        return jsonify({'error': str(e)}), 500

# Route de test pour vérifier que l'API fonctionne
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'API de prédiction de retard de projet. Utilisez la route /predict avec une requête POST.'})

# Exécuter le serveur Flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)