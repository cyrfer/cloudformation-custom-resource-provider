const Ajv = require('ajv');

exports.compile = (schema) => {
  return (new Ajv({allErrors: true})).compile(schema);
};

exports.errorsEnum = {
  PROPS_VALIDATION: 'PROPS_VALIDATION',
};
