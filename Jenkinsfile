pipeline {
    agent any

    tools {
        jdk 'JAVA_HOME'
        maven 'M2_HOME'
    }

    stages {
        stage('GIT') {
            steps {
                git branch: 'JendoubiMalek-4TWIN2-G3',
                    url: 'https://github.com/malekjendoubi21/twin2-project-management-platform.git'
            }
        }
            stage('Compile Stage') {
            steps {
                sh 'mvn clean compile'
            }
        }
    stage('Test Stage') {
            steps {
                sh 'mvn test'
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
