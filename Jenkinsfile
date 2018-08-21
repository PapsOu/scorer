pipeline {
  agent any
  stages {
    stage('Clone') {
      steps {
        git(url: 'https://github.com/PapsOu/scorer.git', branch: 'master')
      }
    }
    stage('Cordova') {
      steps {
        sh '''cd ./cordova
cordova platform add android
cordova build'''
      }
    }
    stage('Publish adb') {
      steps {
        sh 'echo "tmp"'
      }
    }
  }
}