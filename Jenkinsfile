pipeline {
    agent any

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