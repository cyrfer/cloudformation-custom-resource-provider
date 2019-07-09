const AWS = require('aws-sdk');
const Ajv = require('ajv');
const stringify = JSON.stringify;


const compile = (schema) => {
    return (new Ajv({allErrors: true})).compile(schema);
};

const errorsEnum = {
    PROPS_VALIDATION: 'PROPS_VALIDATION',
};

const schemaProps = {
    "type": "object",
    "required": [
        "UserPoolId",
        "Domain"
    ],
    "properties": {
        "UserPoolId": {"type": "string", "minLength": 1},
        "Domain": {"type": "string", "minLength": 1}
    }
};

const validateProps = compile(schemaProps);

// adapted from
// https://github.com/rosberglinhares/CloudFormationCognitoCustomResources/blob/master/CloudFormationCognitoUserPoolDomain.js
module.exports = async (event) => {
    console.log('hello CognitoAppClientDomain');
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({region: process.env.AWS_REGION || 'us-west-2'});

    switch (event.RequestType) {
        case 'Create': {
            if (!validateProps(event.ResourceProperties)) {
                console.error(`invalid properties: ${stringify(validateProps.errors)}`);
                return Promise.reject({type: errorsEnum.PROPS_VALIDATION, message: stringify(validateProps.errors)});
            }
            const result = await cognitoIdentityServiceProvider.createUserPoolDomain({
                UserPoolId: event.ResourceProperties.UserPoolId,
                Domain: event.ResourceProperties.Domain
            }).promise();
            console.log('cognitoappclientdomain/create: ', stringify(result));
            // return result;
            return {
                physicalResourceId: event.ResourceProperties.UserPoolId,
            }
        }
        case 'Update': {
            const result = await deleteUserPoolDomain(cognitoIdentityServiceProvider, event.ResourceProperties.Domain, event.ResourceProperties.UserPoolId);
            // return result;
            return {
                physicalResourceId: event.PhysicalResourceId, // event.ResourceProperties.UserPoolId,
            }
        }
        case 'Delete': {
            try {
                const result = await deleteUserPoolDomain(cognitoIdentityServiceProvider, event.ResourceProperties.Domain, event.ResourceProperties.UserPoolId);
                // return result;
                return {
                    physicalResourceId: event.PhysicalResourceId, //event.ResourceProperties.UserPoolId,
                }
            } catch (e) {
                if (/No such domain/.test(e.message)) {
                    return {
                        physicalResourceId: event.PhysicalResourceId, //event.ResourceProperties.UserPoolId,
                    }
                }
                return {message: e.message};
            }
        }
        default:
            return {}
    }
};

async function deleteUserPoolDomain(cognitoIdentityServiceProvider, domain, UserPoolId) {
    if (UserPoolId) {
        return cognitoIdentityServiceProvider.deleteUserPoolDomain({
            UserPoolId: UserPoolId,
            Domain: domain
        }).promise();
    }
    var response = await cognitoIdentityServiceProvider.describeUserPoolDomain({
        Domain: domain
    }).promise();
    console.log('cognitoappclientdomain/deleteUserPoolDomain: ', stringify(response));
    if (response.DomainDescription.Domain) {
        await cognitoIdentityServiceProvider.deleteUserPoolDomain({
            UserPoolId: response.DomainDescription.UserPoolId,
            Domain: domain
        }).promise();
    }
}
