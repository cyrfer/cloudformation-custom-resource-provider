const stringify = JSON.stringify;
const types = require('./registry');
const resourceRegex = /Custom::(.+)/;
const { sendResponse, StatusEnum } = require('./cfn-response');

const writeError = async (event, context, e) => {
    console.log('writeError', e);
    return sendResponse(event, context, StatusEnum.CFN_FAILED, e);
}

const writeSuccess = async (event, context, r) => {
    console.log('writeSuccess', r);
    const { physicalResourceId, ...resultValues } = r;
    return sendResponse(event, context, StatusEnum.CFG_SUCCESS, resultValues, physicalResourceId);
};

exports.handler = async (event, context) => {
    try {
        console.log('event:', stringify(event));
        const matchResourceType = resourceRegex.exec(event.ResourceType || '');
        // console.log(matchResourceType);
        if (!matchResourceType || matchResourceType.length < 2) {
            throw {message: `could not parse resource type: ${event.ResourceType}`}
        }
        const resourceType = matchResourceType[1];
        if (!types[resourceType]) {
            throw {message: `registry missing custom resource type [${resourceType}]`}
        }
        const result = await types[resourceType](event);
        return writeSuccess(event, context, result);
    } catch (e) {
        return writeError(event, context, e);
    }
};
