pipeline {
    agent any
        stages {
        stage('Checkout'){
            steps{
                git branch: 'uatnew' , url: 'https://github.com/transform1234/alt-backend.git'   
          }
        }
        
        stage ('Build') {
            steps {
                        sh 'docker rm -f shiksha-backend'
                        sh 'docker rmi backend_main'
                        sh 'cd /var/lib/jenkins/workspace/Backend/'
                        sh 'docker-compose up -d'
                   }
            }
       }
}
