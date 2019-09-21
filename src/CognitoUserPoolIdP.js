const AWS = require('aws-sdk');
const lib = require('./lib');
const stringify = JSON.stringify;

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#createIdentityProvider-property
const schemaProps = {
    "type": "object",
    "required": [
        "ProviderDetails",
        "ProviderName",
        "ProviderType",
        "UserPoolId"
    ],
    "definitions": {
        "ProviderDetails": {"type": "object"},
        "AttributeMapping": {"type": "object"}
    },
    "properties": {
        "ProviderDetails": { "$ref": "#/definitions/ProviderDetails" },
        "ProviderName": { "type": "string" },
        "ProviderType": {
            "enum": [
                "SAML",
                "Facebook",
                "Google",
                "LoginWithAmazon",
                "OIDC"
            ]
        },
        "UserPoolId": {"type": "string", "minLength": 1},
        "AttributeMapping": { "$ref": "#/definitions/AttributeMapping" },
        "IdpIdentifiers": {
            "type": "array",
            "items": {
                "type": "string",
                "minLength": 1
            }
        }
    }
};

const validateProps = lib.compile(schemaProps);

// adapted from
// https://github.com/rosberglinhares/CloudFormationCognitoCustomResources/blob/master/CloudFormationCognitoUserPoolClientSettings.js
module.exports = async (event) => {
    console.log('hello CognitoUserPoolIdP');
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({region: process.env.AWS_REGION || 'us-west-2'});

    switch (event.RequestType) {
        case 'Create': {
            if (!validateProps(event.ResourceProperties)) {
                console.error(`invalid properties: ${stringify(validateProps.errors)}`);
                return Promise.reject({type: lib.errorsEnum.PROPS_VALIDATION, message: stringify(validateProps.errors)});
            }
            const { ServiceToken, ...params } = event.ResourceProperties;
            const result = await cognitoIdentityServiceProvider.createIdentityProvider(params).promise();
            console.log('cognitouserpoolidp/create: result:', stringify(result));
            return {
                physicalResourceId: event.ResourceProperties.UserPoolId + '/' + event.ResourceProperties.ProviderName,
            }
        }
        case 'Update': {
            if (!validateProps(event.ResourceProperties)) {
                console.error(`invalid properties: ${stringify(validateProps.errors)}`);
                return Promise.reject({type: errorsEnum.PROPS_VALIDATION, message: stringify(validateProps.errors)});
            }
            const { ServiceToken, ProviderType, ...params } = event.ResourceProperties;
            const result = await cognitoIdentityServiceProvider.updateIdentityProvider(params).promise();
            console.log('cognitouserpoolidp/create: result:', stringify(result));
            return {
                physicalResourceId: event.PhysicalResourceId,
            }
        }
        case 'Delete':
        default: {
            console.log('cognitouserpoolidp/delete');
            return {
                physicalResourceId: event.PhysicalResourceId,
            }
        }
    }
};
