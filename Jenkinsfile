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

        stage('Install dependencies') {
            steps {
                dir('Server') {
                    sh 'npm install'
                }
                dir('Client') {
                    sh 'npm install'
                }
            }
        }

      stage('Install Vite Globally') {
    steps {
        sh 'npm install --save-dev vite'
    }
}


      stage('Build React App') {
    steps {
        dir('Client') {
            sh 'npx vite build'
        }
    }
}


        stage('MVN SONARQUBE') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                        sh 'mvn sonar:sonar -Dsonar.login=$SONAR_TOKEN -Dmaven.test.skip=true'
                    }
                }
            }
        }
    }
}
