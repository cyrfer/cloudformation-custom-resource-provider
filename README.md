# Introduction
cloudformation-custom-resource-provider

Aiming to be your one-stop-shop for all the gaps in Cloudformation support.

Sometimes when you are writing your Cloudformation templates you realize that AWS forgot to support the appropriate APIs for the resource you are attempting to allocate. There is a solution. AWS did make Cloudformation templates extendable. All you need to do is write and deploy a Lambda Function which can interpret [Cloudformation Custom Resources](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudformation.html).

This library is your Lambda function providing support for Custom Resources. This library aims to suppport all the missing resource types and resource fields that AWS left out. This library can be extended to provide support for convenient resource types that are not part of the AWS ecosystem already.

# References
For the Custom Resource interfaces, see references here:
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref.html

# Prior Art
AWS provides a python based ["helper"](https://github.com/aws-cloudformation/custom-resource-helper) but it does not bring much to the community in the way of support for missing resource types.

AWS Document has an excellent [example](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/walkthrough-custom-resources-lambda-lookup-amiids.html) showcasing the advantages of using Custom Resource Types. This is a good intro to the concept.

Some examples of managing resource types that are completely unrelated to AWS are:
* [RandomString resource type](https://binx.io/blog/2018/08/25/building-cloudformation-custom-resources-is-plain-and-simple/)
* [Github Webhook resource type](https://www.alexdebrie.com/posts/cloudformation-custom-resources/)

[One github project](https://github.com/stelligent/cloudformation-custom-resources) seems to provide scaffolding in various languages supported by AWS Lambda, but contributes actually no custom resource suppport.

A project that seems to create a small ecosystem to support custom resources was published by [@rosberglinhares](https://github.com/rosberglinhares/CloudFormationCognitoCustomResources). This project also used a multi-lambda architecture which I intend to avoid for the sake of simplicity.

[ab77](https://github.com/ab77/cfn-generic-custom-resource#cognito-demo) had a lot of code in one spot, but I was confused by the ["agent"](https://github.com/ab77/cfn-generic-custom-resource/blob/master/cognito-idp/cognito-template.yaml) model he used in his templates.

[emdgroup](https://github.com/emdgroup/cfn-custom-resource) was the only author I found advertising suppport for [Cognito UI Customization](https://github.com/emdgroup/cfn-custom-resource#cognitouicustomization).

[base2Services](https://github.com/base2Services) provides a [package](https://github.com/base2Services/cloudformation-custom-resources-nodejs) that is very much inline with my goals. Unfortunately I discovered this project after I had a working POC and they did not have support for a [SAML](https://docs.aws.amazon.com/cognito/latest/developerguide/saml-identity-provider.html) resource which appears at `User Pool->Federation->Identity Providers`.

I hope that this project can one day approach the degree of professionalism in [cfn-lambda](https://github.com/andrew-templeton/cfn-lambda), which looks to be a viable solution. Unfortunately, my design goals differed slightly from `cfn-lambda`. Mostly I wanted to have a single stack with a single lambda capable of handling all custom resource types a developer chooses to register in the lambda code rather than many lambdas deployed by who knows what processes.

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
[CognitoUserPoolDomain](https://github.com/rosberglinhares/CloudFormationCognitoCustomResources/blob/master/CloudFormationCognitoUserPoolDomain.js) Properties:
- *UserPoolId
- *Domain

[CognitoAppClientSettings](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#updateUserPoolClient-property) Properties:
- *ClientId
- *UserPoolId
- AllowedOAuthFlows
- AllowedOAuthFlowsUserPoolClient
- AllowedOAuthScopes
- AnalyticsConfiguration
- CallbackURLs
- ClientName
- DefaultRedirectURI
- ExplicitAuthFlows
- LogoutURLs
- ReadAttributes
- RefreshTokenValidity
- SupportedIdentityProviders
- WriteAttributes

[CognitoUserPoolIdP](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#createIdentityProvider-property) Properties:
- *ProviderDetails
- *ProviderName
- *ProviderType
- *UserPoolId
- AttributeMapping
- IdpIdentifiers

[CognitoIdentityPoolRoleMapping](https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_SetIdentityPoolRoles.html)
- *(key: string)
- *[RoleMapping](https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_RoleMapping.html)

## Convenience Resources
## External Resources
## Exotic Community Resources
