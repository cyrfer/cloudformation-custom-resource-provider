const Ajv = require('ajv');

const compile = (schema) => {
  return (new Ajv({allErrors: true})).compile(schema);
};

const schema = {
  "type": "object",
  "required": [
    "Input",
    "Pattern"
  ],
  "properties": {
    "Input": {
      "type": "string",
      "minLength": 1
    },
    "Pattern": {
      "type": "string",
      "minLength": 1
    },
    "Flags": {
      "type": "string"
    },
    "Substitute": {
      "type": "string"
    }
  }
}

const validateProps = compile(schema)

module.exports = async (event) => {
  console.log('hello StringFilter')

  if (!validateProps(event.ResourceProperties)) {
    console.error(`invalid properties: ${stringify(validateProps.errors)}`);
    return Promise.reject({type: lib.errorsEnum.PROPS_VALIDATION, message: JSON.stringify(validateProps.errors)});
  }

  const { Input, Pattern, Flags, Substitute } = event.ResourceProperties;
  const result = Input.replace(new RegExp(Pattern, Flags || ''), Substitute || '');

  switch (event.RequestType) {
    case 'Create': {
      return {
        physicalResourceId: Input,
        Result: result,
      }
    }
    case 'Update': {
      return {
        physicalResourceId: event.PhysicalResourceId,
        Result: result,
      }
    }
    case 'Delete': {
      return {
        physicalResourceId: event.PhysicalResourceId,
      }
    }
  }
}