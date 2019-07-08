# Introduction
cloudformation-custom-resource-provider

Aiming to be your one-stop-shop for all the gaps in Cloudformation support.

Sometimes when you are writing your Cloudformation templates you realize that AWS forgot to support the appropriate APIs for the resource you are attempting to allocate. There is a solution. AWS did make Cloudformation templates extendable. All you need to do is write and deploy a Lambda Function which can interpret [Cloudformation Custom Resources](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudformation.html).

This library is your Lambda function providing support for Custom Resources. This library aims to suppport all the missing resource types and resource fields that AWS left out. This library can be extended to provide support for convenient resource types that are not part of the AWS ecosystem already.

# References
For the Custom Resource interfaces, see references here:
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref.html

# Prior Art
Parts of this project were inspired by [cfn-lambda](https://github.com/andrew-templeton/cfn-lambda) which is a viable solution. My goals are to have a single stack with a single lambda capable of handling all custom resource types a developer chooses to register in the lambda code.

Another project that seems to create a small ecosystem to support custom resources was published by [@rosberglinhares](https://github.com/rosberglinhares/CloudFormationCognitoCustomResources). This project also used a multi-lambda architecture which I intend to avoid for the sake of simplicity.

# Dependencies
1. after `git clone`, you should run `npm install` as usual.
2. make sure [cf_deploy.sh](https://github.com/cyrfer/cli-wins) is in your path when using `npm run cf_deploy`

# Implementation
The latest additions are included by default. You can remove any you wish, or register your own (useful during development).

# Deployment
1. replace references to the 2 buckets with your own buckets used by `npm run cf_deploy` and all dependent scipts.

# Contributing
1. develop a custom resource implementation in your local checkout of this repo. see others in `./src` folder for inspiration.
2. register that code in `./src/registry.js` to be used.
3. expand on and run `./tests/unit.js` with `npm test`.
4. follow steps to deploy to your own AWS stack to demonstrate it works.
5. add your custom resource to this `README.md` (below) to show the community it exists.
6. make a merge request.

# Supported Custom resources
Markdown tables created by [tablesgenerator](https://www.tablesgenerator.com/markdown_tables)

## Gaps in AWS Resources Coverage
CognitoAppClientDomain Properties:
- UserPoolId
- Domain
## Convenient Tasks
## External Resources
## Exotic Community
