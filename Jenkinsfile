pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        SONAR_SCANNER_HOME = tool 'SonarScanner' // Assurez-vous que SonarScanner est installé via Jenkins tools
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
                dir('backend') {
                    sh 'npm install'
                }
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build React App') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
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
