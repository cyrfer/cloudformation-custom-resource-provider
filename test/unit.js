// const lambda = require('../index').handler;
const { testSetup, loadInput, loadApp } = require('./framework');

const sinon = require('sinon');

const isIntegration = false;

// TODO: allow this to be registered with a factory
const mockAwsResponse = (stub) => () => {
    return {
        promise: stub,
    };
};

// TODO: allow this to be tracked and controlled during the lifecycle
// of the test OR even an outer describe context.
const resultArgsCognitoCreateUserPool = sinon.stub();
const cognitoCreateUserPool = sinon.stub();

const mocksCreateCognitoDomain = [
    {httpResponseStatusCode: 200, httpResponseBody: {}, httpMethod: 'get', path: '.*', hostname: 'https://cloudformation-custom-resource-response-uswest2.s3-us-west-2.amazonaws.com'},
    {mock: cognitoCreateUserPool, moduleName: 'aws-sdk', method: 'createUserPool', className: 'CognitoIdentityServiceProvider', resultMethod: 'returns', resultArgs: [mockAwsResponse(resultArgsCognitoCreateUserPool)]},
];

const expectsCreateCognitoDomain = [
    {value: '', moduleName: 'axios', method: 'put', spy: null, compare: 'equal', spyKey: 'args.0.0'.split('.')},
];

const mocksDeleteCognitoDomain = [
    {httpResponseStatusCode: 200, httpResponseBody: {}, httpMethod: 'get', path: '.*', hostname: 'https://cloudformation-custom-resource-response-uswest2.s3-us-west-2.amazonaws.com'},
    {mock: cognitoCreateUserPool, moduleName: 'aws-sdk', method: 'deleteUserPoolDomain', className: 'CognitoIdentityServiceProvider', resultMethod: 'returns', resultArgs: [mockAwsResponse(resultArgsCognitoCreateUserPool)]},
];

const expectsDeleteCognitoDomain = [
    {value: '', moduleName: 'axios', method: 'put', spy: null, compare: 'equal', spyKey: 'args.0.0'.split('.')},
];

const mocksDeleteCognitoAppSettings = [];
const expectsDeleteCognitoAppSettings = [];

const mocksCreateCognitoAppSettings = [];
const expectsCreateCognitoAppSettings = [];

const mocksCreateCognitoUserPoolIdP = [];
const expectsCreateCognitoUserPoolIdP = [];

describe('lambda', () => {
    describe('CognitoUserPoolIdP', () => {
        describe('create', () => {
            describe('apply custom resource', testSetup({
                app: loadApp({path: '../src/index', key: 'handler'}),
                test: {
                    name: 'should report success',
                    args: loadInput([{__filepath: './data/event-create-userpool-idp.json'}, {}]),
                    mocks: isIntegration ? [] : mocksCreateCognitoUserPoolIdP,
                    expects: expectsCreateCognitoUserPoolIdP,
                    networkEnabled: isIntegration,
                    only: true,
                }
            }))
        })
    });
    // describe('CognitoAppClientSettings', () => {
        // describe('create', () => {
        //     describe('apply custom resource', testSetup({
        //         app: loadApp({path: '../src/index', key: 'handler'}),
        //         test: {
        //             name: 'should report success',
        //             args: loadInput([{__filepath: './data/event-create-app-settings.json'}, {}]),
        //             mocks: isIntegration ? [] : mocksCreateCognitoAppSettings,
        //             expects: expectsCreateCognitoAppSettings,
        //             networkEnabled: isIntegration,
        //             only: true,
        //         }
        //     }))
        // });
        // describe('delete', () => {
        //     describe('nothing to do', testSetup({
        //         app: loadApp({path: '../src/index', key: 'handler'}),
        //         test: {
        //             name: 'should report success',
        //             args: loadInput([{__filepath: './data/event-delete-app-settings.json'}, {}]),
        //             mocks: isIntegration ? [] : mocksDeleteCognitoAppSettings,
        //             expects: expectsDeleteCognitoAppSettings,
        //             networkEnabled: isIntegration,
        //             only: true,
        //         }
        //     }))
        // });
    // });
    // describe('CognitoDomain', () => {
    //     describe('delete', () => {
    //         describe('missing resource', testSetup({
    //             app: loadApp({path: '../src/index', key: 'handler'}),
    //             test: {
    //                 name: 'should report success',
    //                 args: loadInput([{__filepath: './data/event-delete-domain.json'}, {}]),
    //                 mocks: isIntegration ? [] : mocksDeleteCognitoDomain,
    //                 expects: expectsDeleteCognitoDomain,
    //                 networkEnabled: isIntegration,
    //                 only: true,
    //             }
    //         }))
            // describe('successes', testSetup({
            //     app: loadApp({path: '../src/index', key: 'handler'}),
            //     test: {
            //         name: 'should report success',
            //         args: loadInput([{__filepath: './data/event-delete-domain.json'}, {}]),
            //         mocks: mocksDeleteCognitoDomain,
            //         networkEnabled: false,
            //         only: true,
            //     }
            // }))
        // });
        // describe('create', () => {
        //     describe('failures', testSetup({
        //         app: loadApp({path: '../src/index', key: 'handler'}),
        //         test: {
        //             name: 'should report failure',
        //             args: loadInput([{__filepath: './data/event-create-domain-bad-props.json'}, {}]),
        //             mocks: mocksCreateCognitoDomain,
        //             expects: expectsCreateCognitoDomain,
        //             networkEnabled: false,
        //         },
        //     }));
        // });
    // });
});
