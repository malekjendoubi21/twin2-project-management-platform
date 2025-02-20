pipeline {
    agent any

    tools {
        nodejs 'NodeJS v18'  // Utilise la version configurée dans Jenkins
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

        stage('Build application') {
            steps {
                dir('Server') {
                    sh 'npm start'
                }
            }
        }
    }
}
