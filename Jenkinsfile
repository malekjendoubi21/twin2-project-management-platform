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
    stage('Test Server') {
            steps {
                dir('Server') {
sh 'npx jest --coverage'
                }
            }
        }
        stage('Build Server') {
            steps {
                dir('Server') {
                    sh 'npm install --legacy-peer-deps'
                }
            }
        }

    

                   stage('SonarQube Analysis') {
                steps{
                script {
                def scannerHome = tool 'scanner'
                withSonarQubeEnv {
                sh "${scannerHome}/bin/sonar-scanner"
                }
                }
                }
                }

    }
}
