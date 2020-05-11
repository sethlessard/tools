pipeline {
  agent {
    docker {
      image "node:13"
      label "master"
    }
  }

  stages {
    stage("Test") {
      steps {
        sh '''
        !#/bin/bash
        npm test
        '''
      }
    }
  }
}