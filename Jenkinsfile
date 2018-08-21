pipeline {
  agent any
  stages {
    stage('Clone') {
      steps {
        git(url: 'https://github.com/PapsOu/scorer.git', branch: 'master')
      }
    }
    stage('') {
      steps {
        sh 'cordova build'
      }
    }
  }
}