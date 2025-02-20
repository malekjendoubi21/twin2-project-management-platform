pipeline {
    agent any

    stages {

        stage('Build Server') {
            steps {
                dir('Server') {
                    sh '''
                    export NVM_DIR="$HOME/.nvm"
                    mkdir -p $NVM_DIR
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
                    . "$NVM_DIR/nvm.sh"
                    nvm install 18
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
