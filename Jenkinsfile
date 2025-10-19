pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('GIT') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/malekjendoubi21/twin2-project-management-platform.git'
            }
        }

        stage('Debug Environment') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Build Server') {
            steps {
                dir('Server') {
                    sh 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('Test Server') {
            steps {
                dir('Server') {
                    sh 'npx jest --coverage'
                }
            }
        }
     stage('SONARQUBE SCAN') {
    steps {
        dir('.') { // à la racine du repo, là où se trouve sonar-project.properties
            script {
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    sh """
                        sonar-scanner \
                        -Dsonar.login=$SONAR_TOKEN \
                        -Dsonar.projectKey=piwebtest \
                        -Dsonar.host.url=localhost:9000
                    """
                }
            }
        }
    }
}



    } // fermeture du bloc stages
} // fermeture du bloc pipeline
