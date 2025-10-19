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
        withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
            sh """
            docker run --rm \
                -e SONAR_HOST_URL=http://192.168.56.10:9000 \
                -e SONAR_LOGIN=\$SONAR_TOKEN \
                -v \$(pwd):/usr/src \
                sonarsource/sonar-scanner-cli
            """
        }
    }
}



    } // fermeture du bloc stages
} // fermeture du bloc pipeline
