#!/bin/bash

_stack_exists () {
    aws cloudformation describe-stacks --stack-name $1 --profile $2 > /dev/null 2>&1
    # if this causes problems, consider:
    # https://docs.aws.amazon.com/cli/latest/reference/cloudformation/wait/stack-exists.html
}

_create_stack () {
    local stackName="$1"
    local awsProfile="$2"
    local templateUrl="$3"
    local allParams="$4"
    local capabilities="$5"
    local sleepSeconds=5
    local out=0

    echo aws cloudformation create-stack --stack-name $stackName \
    --profile $awsProfile \
    --template-url $templateUrl \
    $allParams \
    $capabilities

    aws cloudformation create-stack --stack-name $stackName \
    --profile $awsProfile \
    --template-url $templateUrl \
    $allParams \
    $capabilities

    out=$?

    if [ $out -ne 0 ]; then
        return $out
    fi

    date
    echo "sleeping $sleepSeconds seconds to give aws a chance to register the new stack"
    sleep $sleepSeconds
    date

    aws cloudformation wait stack-create-complete --stack-name $stackName --profile $awsProfile
}

make_uuid () {
    cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z' | fold -w 32 | head -n 1
}

contains() {
    string="$1"
    substring="$2"
    echo "$string" | grep "$substring"
}

_update_stack () {
    local stackName="$1"
    local awsProfile="$2"
    local templateUrl="$3"
    local allParams="$4"
    local capabilities="$5"
    local changeSetName=$(make_uuid)
    local out=0
    local cmdStr=0
    local errorDescribe=''
    local errorReason=''
    local errorNoChanges="didn't contain changes"
    local errorNoUpdates="No updates are to be performed"
    local returnCode=0
    local tempOut=0

    echo "creating change set with name: $changeSetName"
    cmdStr=$(echo aws cloudformation create-change-set --stack-name $stackName \
        --profile $awsProfile \
        --template-url $templateUrl \
        $allParams \
        $capabilities \
        --change-set-name $changeSetName)
    echo "running: $cmdStr"
    local changeSetResponse=$(aws cloudformation create-change-set --stack-name $stackName \
        --profile $awsProfile \
        --template-url $templateUrl \
        $allParams \
        $capabilities \
        --change-set-name $changeSetName)

    out=$?
    if [ $out -gt 0 ]; then
        return $out
    fi

    local changeSetId=$(python getJsonKey.py "$changeSetResponse" "Id")
    out=$?
    if [ $out -gt 0 ]; then
        return $out
    fi

    echo "waiting to finish creating change set with id: $changeSetId"
    aws cloudformation wait change-set-create-complete --change-set-name "$changeSetId" --stack-name $stackName --profile $awsProfile
    out=$?

    # found '255' here: https://docs.aws.amazon.com/cli/latest/reference/cloudformation/wait/change-set-create-complete.html
    if [ $out -eq 255 ]; then
        errorDescribe=$(aws cloudformation describe-change-set --change-set-name $changeSetId --profile $awsProfile)
        # check if change-set was actually created
        if [ $? -eq 0 ]; then
            returnCode=$out
            # check if description has an error reason
            errorReason=$(python getJsonKey.py "$errorDescribe" "StatusReason")
            if [ $? -eq 0 ]; then
                # print for user
                echo "the change-set was actually created but 'wait' returned 255 for reason: $errorReason"
                # check if reason contains substring
                contains "$errorReason" "$errorNoChanges"
                tempOut=$?
                contains "$errorReason" "$errorNoUpdates"
                if [ $? -eq 0 ] || [ $tempOut -eq 0 ]; then
                    echo "no changes in changeSet: $changeSetId"
                    # no changes should not be an error
                    returnCode=0
                fi
            fi

            # try to clean up the change set that was created by 'wait'
            echo "delete-change-set $changeSetId"
            aws cloudformation delete-change-set --change-set-name $changeSetId --profile $awsProfile
            if [ $? -gt 0 ]; then
                echo "error when trying to delete-change-set $changeSetId"
            fi
            return $returnCode
        fi
    fi

    if [ $out -gt 0 ]; then
        return $out
    fi

    echo "executing change set with id: $changeSetId"
    aws cloudformation execute-change-set --change-set-name "$changeSetId" --profile $awsProfile
    out=$?
    if [ $out -gt 0 ]; then
        return $out
    fi

    echo "waiting to finish execution of change set with id: $changeSetId"
    aws cloudformation wait stack-update-complete --stack-name $stackName --profile $awsProfile
    out=$?
    if [ $out -gt 0 ]; then
        return $out
    fi
}

doDeploy () {
    local stackName="$1"
    local awsProfile="$2"
    local templateUrl="$3"
    local allParams="$4"
    local capabilities="$5"
    local out=0


    export AWS_DEFAULT_REGION="us-west-2"
    _stack_exists $stackName $awsProfile
    if [ $? -eq 0 ]; then
        echo "---- stack $stackName exists, will update it ----"
        _update_stack "$stackName" "$awsProfile" "$templateUrl" "$allParams" "$capabilities"
    else
        echo "---- stack $stackName does not exist, will create it ----"
        _create_stack "$stackName" "$awsProfile" "$templateUrl" "$allParams" "$capabilities"
    fi

    return $?
}

doDeploy "$1" "$2" "$3" "$4" "$5"
