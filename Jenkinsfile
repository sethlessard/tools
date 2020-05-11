pipeline {
  agent {
    docker {
      image "node:13"
      label "master"
      args "-u root:root"
    }
  }

  stages {
    stage("Install Test Dependencies") {
      steps {
        sh "npm install -g mocha"
      }
    }
    stage("Test") {
      steps {
        sh "npm test"
      }
    }
  }
}