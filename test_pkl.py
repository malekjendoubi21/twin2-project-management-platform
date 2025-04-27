import pickle

try:
    print("Chargement de rf_classifier.pkl...")
    with open('rf_classifier.pkl', 'rb') as f:
        rf_classifier = pickle.load(f)
    print("rf_classifier chargé avec succès.")

    print("Chargement de rf_regressor.pkl...")
    with open('rf_regressor.pkl', 'rb') as f:
        rf_regressor = pickle.load(f)
    print("rf_regressor chargé avec succès.")

    print("Chargement de scaler.pkl...")
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    print("scaler chargé avec succès.")
except Exception as e:
    print(f"Erreur lors du chargement des fichiers .pkl : {e}")