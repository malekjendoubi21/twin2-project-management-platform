pipeline {
    agent any

    stages {

        stage('Build Server') {
            steps {
                dir('server') {
                    sh 'npm install'
                }
            }
        }

        stage('Test Server') {
            steps {
                dir('server') {
                    sh 'npm test'
                }
            }
        }

        stage('Build application') {
            steps {
                dir('server') {
                    sh 'npm start'
                }
            }
        }
    }
}