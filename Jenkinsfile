pipeline {
  agent {
    docker {
      image "node:13"
      label "master"
      args "-u root:root"
    }
  }

  stages {
    stage("Install Dependencies") {
      steps {
        sh "npm install"
      }
    }

    stage("Test") {
      steps {
        sh "npm test"
      }
    }

    stage("Deploy") {
      when { expression { sh([returnStdout: true, script: 'echo $TAG_NAME | tr -d \'\n\'']) } }
      steps {
        sh "echo 'TODO: implement'"
      }
    }
  }
}