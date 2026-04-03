function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { value, error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => d.message)
      });
    }

    req[property] = value;
    return next();
  };
}

module.exports = { validate };
