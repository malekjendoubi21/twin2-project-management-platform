pipeline {
    agent any

    tools {
        nodejs 'NodeJS v18'
    }

    stages {
        stage('Build Server') {
            steps {
                dir('Server') {
                    sh 'npm install'
                }
            }
        }

        stage('Test Server') {
            steps {
                dir('Server') {
                    sh 'npm test'
                }
            }
        }

        stage('Check if Application Runs') {
            steps {
                dir('Server') {
                    script {
                        // Lancer l'application en arrière-plan
                        sh 'nohup npm start > server.log 2>&1 &'
                        
                        // Attendre 5 secondes pour s'assurer que l'application démarre
                        sleep 5

                        // Vérifier si le serveur écoute sur le port 3000
                        def isRunning = sh(script: "netstat -tln | grep ':3000 '", returnStatus: true) == 0

                        if (!isRunning) {
                            error "L'application n'a pas démarré correctement !"
                        } else {
                            echo "✅ L'application tourne bien sur le port 3000."
                        }

                        // Tuer le processus pour ne pas bloquer Jenkins
                        sh "pkill -f 'node index.js'"
                    }
                }
            }
        }
    }
}
