//react-native/api/models/shipment.js


const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

class Shipment {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.destination = data.destination;
    this.devices = data.devices || [];
  }

  static validate(data) {
    const schema = Joi.object({
      id: Joi.string().uuid().optional(),
      destination: Joi.string().required(),
      devices: Joi.array().items(Joi.string()).optional()
    });
    return schema.validate(data);
  }
}

module.exports = Shipment;