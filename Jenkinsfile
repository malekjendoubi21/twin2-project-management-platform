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
                    script {
                        sh '''
                            export NVM_DIR="$HOME/.nvm"
                            source "$NVM_DIR/nvm.sh"
                            nvm use 18
                            node -v
                            which node
                            npm start
                        '''
                    }
                }
            }
        }
    }
}
