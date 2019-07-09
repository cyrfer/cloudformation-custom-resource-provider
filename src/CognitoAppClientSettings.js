const AWS = require('aws-sdk');
const Ajv = require('ajv');
const { drillDown } = require('deepdown');
const stringify = JSON.stringify;

const compile = (schema) => {
    return (new Ajv({allErrors: true})).compile(schema);
};

const errorsEnum = {
    PROPS_VALIDATION: 'PROPS_VALIDATION',
};

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#updateUserPoolClient-property
const schemaProps = {
    "type": "object",
    "required": [
        "ClientId",
        "UserPoolId"
    ],
    "definitions": {
        "AnalyticsConfiguration": {
            "type": "object",
            "required": [
                "ApplicationId",
                "ExternalId",
                "RoleArn"
            ],
            "properties": {
                "ApplicationId": {"type": "string", "minLength": 1},
                "ExternalId": {"type": "string", "minLength": 1},
                "RoleArn": {"type": "string", "minLength": 1},
                "UserDataShared": {"enum": ["true", "false"]}
            }
        }
    },
    "properties": {
        "ClientId": {"type": "string", "minLength": 1},
        "UserPoolId": {"type": "string", "minLength": 1},
        "AllowedOAuthFlows": {
            "type": "array",
            "items": {
                "enum": [
                    "code",
                    "implicit",
                    "client_credentials"
                ]
            }
        },
        "AllowedOAuthFlowsUserPoolClient": { "enum": ["true", "false"] },
        "AllowedOAuthScopes": {
            "type": "array",
            "items": {
                "type": "string",
                "minLength": 1
            }
        },
        "AnalyticsConfiguration": {
            "$ref": "#/definitions/AnalyticsConfiguration"
        },
        "CallbackURLs": {
            "type": "array",
            "items": {"type": "string", "format": "uri"}
        },
        "ClientName": {"type": "string", "minLength": 1},
        "DefaultRedirectURI": {"type": "string", "format": "uri"},
        "ExplicitAuthFlows": {
            "type": "array",
            "items": {
                "enum": [
                    "ADMIN_NO_SRP_AUTH",
                    "CUSTOM_AUTH_FLOW_ONLY",
                    "USER_PASSWORD_AUTH"
                ]
            }
        },
        "LogoutURLs": {
            "type": "array",
            "items": {"type": "string", "format": "uri"}
        },
        "ReadAttributes": {
            "type": "array",
            "items": {"type": "string", "minLength": 1}
        },
        "RefreshTokenValidity": {"type": "string", "pattern": "^[0-9]+$"},
        "SupportedIdentityProviders": {
            "type": "array",
            "items": {"type": "string", "minLength": 1}
        },
        "WriteAttributes": {
            "type": "array",
            "items": {"type": "string", "minLength": 1}
        }
    }
};

const validateProps = compile(schemaProps);

// adapted from
// https://github.com/rosberglinhares/CloudFormationCognitoCustomResources/blob/master/CloudFormationCognitoUserPoolClientSettings.js
module.exports = async (event) => {
    console.log('hello CognitoAppClientSettings');
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({region: process.env.AWS_REGION || 'us-west-2'});

    switch (event.RequestType) {
        case 'Create':
        case 'Update': {
            if (!validateProps(event.ResourceProperties)) {
                console.error(`invalid properties: ${stringify(validateProps.errors)}`);
                return Promise.reject({type: errorsEnum.PROPS_VALIDATION, message: stringify(validateProps.errors)});
            }
            const { ServiceToken, ...params } = event.ResourceProperties;
            if (typeof params.AllowedOAuthFlowsUserPoolClient === 'string') {
                try {
                    params.AllowedOAuthFlowsUserPoolClient = JSON.parse(params.AllowedOAuthFlowsUserPoolClient);
                } catch (e) {
                    console.warn(`cognitoappclientsettings/create: could not parse AllowedOAuthFlowsUserPoolClient[${params.AllowedOAuthFlowsUserPoolClient}]`);
                }
            }
            if (typeof drillDown(params, 'AnalyticsConfiguration.UserDataShared'.split('.')) === 'string') {
                try {
                    params.AnalyticsConfiguration.UserDataShared = JSON.parse(params.AnalyticsConfiguration.UserDataShared);
                } catch (e) {
                    console.warn(`cognitoappclientsettings/create: could not parse AnalyticsConfiguration.UserDataShared[${params.AnalyticsConfiguration.UserDataShared}]`);
                }
            }
            const result = await cognitoIdentityServiceProvider.updateUserPoolClient(params).promise();
            console.log('cognitoappclientsettings/create: result:', stringify(result));
            return {
                physicalResourceId: event.ResourceProperties.ClientId,
            }
        }
        case 'Delete':
        default: {
            console.log('cognitoappclientsettings/delete');
            return {
                physicalResourceId: event.PhysicalResourceId,
            }
        }
    }
};
