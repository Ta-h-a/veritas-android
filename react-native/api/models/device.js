const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

class Device {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.barcode = data.barcode;
    this.model = data.model;
    this.serialNumber = data.serialNumber;
    this.description = data.description || '';
    this.images = data.images || [];
    this.status = data.status || 'registered';
  }

  static validate(data) {
    const schema = Joi.object({
      id: Joi.string().uuid().optional(),
      barcode: Joi.string().required(),
      model: Joi.string().required(),
      serialNumber: Joi.string().required(),
      description: Joi.string().optional(),
      images: Joi.array().items(Joi.string()).optional(),
      status: Joi.string().valid('registered', 'verified', 'mapped').optional()
    });
    return schema.validate(data);
  }
}

module.exports = Device;