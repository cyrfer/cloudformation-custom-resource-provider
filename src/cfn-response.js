var https = require("https");
var url = require("url");


//// adapted from
//// https://github.com/rosberglinhares/CloudFormationCognitoCustomResources/blob/master/CloudFormationSendResponse/index.js
// const axis = require('axios');
// const sendResponse = async (event, context, status, result) => {
//     console.log('sendResponse: result:', result);
//     const response = {
//         Status: status,
//         // Reason: result.message,
//         PhysicalResourceId: context.logStreamName, //event.PhysicalResourceId || result.PhysicalResourceId,
//         StackId: event.StackId,
//         RequestId: event.RequestId,
//         LogicalResourceId: event.LogicalResourceId,
//         // Data: result.ResponseData,
//     };
//     if (result.message) {
//         response.Reason = result.message;
//     }
//     console.log('sendResponse', response);
//     const responseBody = stringify(response);

//     const responseOptions = {
//         headers: {
//             'content-type': '',
//             'content-length': responseBody.length
//         }
//     };

//     return axios.put(event.ResponseURL, responseBody, responseOptions)
//         .then(response => {
//             console.log('sendResonse success:', stringify(response.data || {missing: 'data'}));
//         }).catch(e => {
//             console.error('sendResponse error:', stringify(e));
//         });
// };

/* Copyright 2015 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
   This file is licensed to you under the AWS Customer Agreement (the "License").
   You may not use this file except in compliance with the License.
   A copy of the License is located at http://aws.amazon.com/agreement/ .
   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied.
   See the License for the specific language governing permissions and limitations under the License. */

// adapted from
// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-lambda-function-code-cfnresponsemodule.html#w2ab1c17c25c14b9c15
exports.sendResponse = async (event, context, responseStatus, responseData, physicalResourceId, noEcho) => {
    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: responseData.message || "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: physicalResourceId || context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        NoEcho: noEcho || false,
        Data: responseData
    });

    console.log("Response body:\n", responseBody);

    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };

    return new Promise((resolve, reject) => {
        var request = https.request(options, function (response) {
            console.log("Status code: " + response.statusCode);
            console.log("Status message: " + response.statusMessage);
            return resolve(response);
        });

        request.on("error", function (error) {
            console.log("send(..) failed executing https.request(..): " + error);
            return reject(error);
        });

        request.write(responseBody);
        request.end();
    });
}

exports.StatusEnum = {
    CFN_FAILED: 'FAILED',
    CFG_SUCCESS: 'SUCCESS',
};
