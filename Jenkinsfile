def AWS_SECRET_ACCESS_KEY = ''
def AWS_ACCESS_KEY_ID = ''
def AWS_DEFAULT_REGION = ''

pipeline {
    agent any

    // parameters {
    //     string(name: 'stack_name', defaultValue: 'contentnow-dev', description: 'the name of the CF stack')
    //     string(name: 'awsProfile', defaultValue: 'default', description: 'The name of the AWS profile running within the Jenkins image used to deploy to AWS')
    //     string(name: 'templatesBucket', defaultValue: 'contentnow-dev-cf-templates', description: 'the bucket subfolder to make the URL on S3 that CloudFormation use for deployment')
    //     string(name: 'templateUrlSubfolder', defaultValue: 'dev', description: 'the bucket subfolder to make the URL on S3 that CloudFormation use for deployment')
    //     string(name: 'lambdaBucket', defaultValue: 'contentnow-prod-lambda-functions', description: 'the bucket where the lambda artifact was uploaded')
    //     string(name: 'S3KeyLambdaProvider', defaultValue: 'devops/cfn-custom-resource/lambda.zip', description: 'the path to the lambda artifact in the S3 bucket')
    //     string(name: 'capabilities', defaultValue: '--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM', description: 'parameters for CF capabilities')
    //     booleanParam(name: 'RUN_E2E', defaultValue: false, description: 'will run E2E tests after deploy')
    // }

    stages{
        stage('Run infra changes') {
            steps {
                script {
                    def localTemplateFolder = "infra"
                    def s3Path = "s3://${params.templatesBucket}/${params.templateUrlSubfolder}"

                    sh "aws s3 sync \"${localTemplateFolder}\" \"${s3Path}\" --profile \"${params.awsProfile}\""
                }
                script {
                    def templateUrl = "https://${params.templatesBucket}.s3.amazonaws.com/${params.templateUrlSubfolder}/api.yaml"
                    sh "cd infra && ./cf_deploy.sh \"${params.stack_name}\" \"${params.awsProfile}\" \"${templateUrl}\" \"--parameters ParameterKey=S3Bucket,ParameterValue=${params.lambdaBucket} ParameterKey=S3Key,ParameterValue=${params.S3KeyLambdaProvider} \" \"${params.capabilities}\""
                }
            }
        }
    }

    // post
    // {
    //     success {
    //         sh """aws lambda invoke --invocation-type RequestResponse --function-name jenkins-slack-go --region us-west-2 --payload  '{"url": "https://wbapo.slack.com/services/hooks/jenkins-ci/oWbeMiHQ1OLPQmUIKSTqnmmU", "attachments": [{"title": "BTO","color": "#00FF00","text": "Job: ${env.JOB_NAME} Build number: ${env.BUILD_NUMBER} Check at ${env.BUILD_URL}","fields": [{"title": "Build Status","value": "SUCCESS","short": true}],"footer": "beans","pretext": "Git commit: ${env.GIT_COMMIT}"}]}' outputfile.txt"""
    //     }
        
    //     failure {
    //         sh """aws lambda invoke --invocation-type RequestResponse --function-name jenkins-slack-go --region us-west-2 --payload  '{"url": "https://wbapo.slack.com/services/hooks/jenkins-ci/oWbeMiHQ1OLPQmUIKSTqnmmU", "attachments": [{"title": "BTO","color": "#FF0000","text": "Job: ${env.JOB_NAME} Build number: ${env.BUILD_NUMBER} Check at ${env.BUILD_URL}","fields": [{"title": "Build Status","value": "FAILURE","short": true}],"footer": "beans","pretext": "Git commit: ${env.GIT_COMMIT}"}]}' outputfile.txt"""
    //     }
    // }
}
