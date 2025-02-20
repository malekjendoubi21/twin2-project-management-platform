pipeline {
    agent any

    stages {

        stage('Build Server') {
            steps {
                dir('Server') {
                                sh '''
                export NVM_DIR="$HOME/.nvm"
                . "$NVM_DIR/nvm.sh"
                nvm use 18
                npm install
            '''
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
                    script {
                        sh 'npm start'
                    }
                }
            }
        }
    }
}
