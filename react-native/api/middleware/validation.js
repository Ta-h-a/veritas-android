const Joi = require('joi');

const validateDeviceRegistration = (req, res, next) => {
  const schema = Joi.object({
    encryptedData: Joi.string().required(),
    signature: Joi.string().required(),
    userId: Joi.string().uuid().required()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateShipmentCreation = (req, res, next) => {
  const schema = Joi.object({
    destination: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateDeviceRegistration, validateShipmentCreation };