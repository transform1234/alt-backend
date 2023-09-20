pipeline {
    agent any
    environment {
        DOCKERHUB_USERNAME = 'prasadharketekdi'
        DOCKERHUB_TOKEN = 'dckr_pat_wvt6NuX_22AMEkzo8WT-X2pbRr4'
        CONTAINER_REGISTRY = "prasadharketekdi/alt"
        DOCKER_SSH_PRIVATE_KEY = 
        CONTAINER_NAME = "altshiksha"
        NETWORK = "alt_backend"
        CONTAINER_PORT = 3000
    }
    stages {
        stage('Checkout'){
            steps{
                git branch: 'UAT' , url: 'https://github.com/transform1234/alt-backend.git'   
          }
        }
        stage('Build and Push') {
            steps {
                script {
                    docker.withRegistry(CONTAINER_REGISTRY, DOCKERHUB_USERNAME, DOCKERHUB_TOKEN) {
                        def imageTag = "${CONTAINER_REGISTRY}:${env.BUILD_NUMBER}"
                        docker.build(imageTag, '.').push()
                    }
                }
            }
        }
        stage('Deploy Stack') {
            when {
                expression {
                    currentBuild.resultIsBetterOrEqualTo('SUCCESS')
                }
            }
            steps {
                sshagent(credentials: ['DOCKER_SSH_PRIVATE_KEY']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -l $USERNAME -p $PORT $HOST << EOF
                        docker container stop $CONTAINER_NAME
                        docker rm $CONTAINER_NAME
                        docker pull $CONTAINER_REGISTRY:${env.BUILD_NUMBER}
                        docker run -d --name $CONTAINER_NAME --network $NETWORK -p $CONTAINER_PORT -t $CONTAINER_REGISTRY:${env.BUILD_NUMBER}
                        EOF
                    """
                }
            }
        }
    }
}
