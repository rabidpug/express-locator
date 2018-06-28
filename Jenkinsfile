#!/usr/bin/env groovy

pipeline {
agent none

    stages {
        stage('Test') {
            agent {
                docker {
                    image 'node'
                    args '-u root'
                }
            }
            steps {
                echo 'Beginning testing phase...'
                echo 'installing dependencies'
                sh 'yarn install --ignore-scripts'
                echo 'running tests'
                sh 'yarn test:lint'
                sh 'yarn test:flow'
                withEnv(["JEST_JUNIT_OUTPUT=./jest-test-results.xml"]) {
                    sh 'yarn test:jest --ci --testResultsProcessor="jest-junit"'
                }
                junit 'jest-test-results.xml'
                echo 'tests complete, sending coverage'
                sh 'cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js'
                echo 'Testing phase complete'
            }
        }
        stage('Build') {
            agent {
                docker {
                    image 'node'
                    args '-u root'
                }
            }
            options { skipDefaultCheckout() }
            steps {
                echo 'Beginning building phase...'
                sh 'yarn build'
                echo 'Building phase complete'
            }
        }
        stage('Publish') {
            agent {
                node {
                    label 'master'
                }
            }

            options { skipDefaultCheckout() }
            steps {
                echo 'publishing branch '  + env.BRANCH_NAME
                sh 'chmod +x ./publish.sh'
                sh './publish.sh ' + env.BRANCH_NAME
                echo 'Publishing complete'
            }
        }
    }
}
