pipeline {
  agent any
  stages {
    stage('Clone') {
      steps {
        git(url: 'https://github.com/PapsOu/scorer.git', branch: 'master')
      }
    }
    stage('error') {
      steps {
        sh '''cd ./cordova
cordova platform add android
cordova build'''
      }
    }
  }
}