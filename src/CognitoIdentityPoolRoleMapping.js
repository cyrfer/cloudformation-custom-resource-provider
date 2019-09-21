const uuidV4 = require('uuid/v4');
const lib = require('./lib');
const stringify = JSON.stringify;


// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#createIdentityProvider-property
const schemaProps = {
    "definitions": {
        // https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_MappingRule.html
        "IdentityPoolMappingRule": {
            "type": "object",
            "required": [
                "Claim",
                "MatchType",
                "RoleARN",
                "Value"
            ],
            "properties": {
                "Claim": {"type": "string", "minLength": 1, "maxLength": 64},
                "MatchType": {"enum": ["Equals", "Contains", "StartsWith", "NotEqual"]},
                "RoleARN": {"type": "string", "minLength": 20, "maxLength": 2048},
                "Value": {"type": "string", "minLength": 1, "maxLength": 128}
            }
        },
        // https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_RoleMapping.html
        "IdentityPoolRoleMapping": {
            "type": "object",
            "required": [
                "Type",
            ],
            "properties": {
                "Type": {
                    "enum": [
                        "Token",
                        "Rules"
                    ]
                },
                "AmbiguousRoleResolution": {
                    "enum": [
                        "AuthenticatedRole",
                        "Deny"
                    ]
                },
                // https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_RulesConfigurationType.html
                "RulesConfiguration": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 25,
                    "items": {
                        "$ref": "#/definitions/IdentityPoolMappingRule"
                    }
                }
            }
        },
        "IdentityPoolRoleMappingEntry": {
            "type": "object",
            "required": [
                "Key",
                "Value"
            ],
            "properties": {
                "Key": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 128
                },
                "Value": {
                    "$ref": "#/definitions/IdentityPoolRoleMapping"
                }
            }
        }
    },
    "type": "object",
    "required": [
        "Entries"
    ],
    "properties": {
        "Entries": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/IdentityPoolRoleMappingEntry"
            }
        }
    }
};

const validateProps = lib.compile(schemaProps);

const transform = (accum, item) => {
    return {
        ...accum,
        [item.Key]: item.Value,
    };
};

module.exports = async (event) => {
    console.log('hello CognitoIdentityPoolRoleMapping');
    switch (event.RequestType) {
        case 'Create':
        case 'Update': {
            if (!validateProps(event.ResourceProperties)) {
                console.error(`invalid properties: ${stringify(validateProps.errors)}`);
                return Promise.reject({type: lib.errorsEnum.PROPS_VALIDATION, message: stringify(validateProps.errors)});
            }
            const { ServiceToken, Entries } = event.ResourceProperties;
            const mappings = Entries.reduce(transform, {});
            console.log('CognitoIdentityPoolRoleMapping, mappings:', stringify(mappings));
            return {
                physicalResourceId: event.PhysicalResourceId || `cognito-identitypool-rolemapping:${uuidV4()}`,
                mappings,
            }
        }
        case 'Delete':
        default: {
            console.log('CognitoIdentityPoolRoleMapping/delete');
            return {
                physicalResourceId: event.PhysicalResourceId,
            }
        }
    }
}