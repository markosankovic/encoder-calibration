pipeline {
    agent any
    stages {
        stage('Build and Push Docker Image') {
            steps {
                script {
                    def tagName = env.TAG_NAME ? env.TAG_NAME : 'latest'
                    def image = docker.build('synapticon/encoder-calibration:' + tagName)
                    docker.withRegistry('https://registry.hub.docker.com', 'synapticon.registry.hub.docker.com') {
                        image.push(tagName)
                    }
                }
            }
        }
    }
    post {
        unstable {
            mail to: 'msankovic@synapticon.com',
                subject: "Unstable Pipeline: ${currentBuild.fullDisplayName}",
                body: "Something is wrong with ${env.BUILD_URL}"
        }
        failure {
            mail to: 'msankovic@synapticon.com',
                subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
                body: "Something is wrong with ${env.BUILD_URL}"
        }
    }
}
