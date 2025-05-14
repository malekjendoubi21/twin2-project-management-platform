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
                    sh 'npm test'
                }
            }
        }

     
        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker build -t mern-frontend ./Client'
                     sh 'docker build -t mern-backend ./Server'

                }
            }
        }

        stage('Deploy to Docker') {
            steps {
                script {
                    // Run Backend container
                                        sh 'docker run -d --name mongodb -p 27017:27017 mongo'

                    sh 'docker run -d --name mern-backend --link mongodb -p 3000:3000 mern-backend'

                    // Run Frontend container
                    sh 'docker run -d --name mern-frontend -p 5173:5173 mern-frontend'
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up workspace..."
            cleanWs()
        }
        success {
            echo "✅ Build and deployment completed successfully!"
        }
        failure {
            echo "❌ Build or deployment failed. Check the logs for details."
        }
    }
}
