const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

class Submission {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.deviceId = data.deviceId;
    this.userId = data.userId;
    this.encryptedData = data.encryptedData;
    this.signature = data.signature;
    this.timestamp = data.timestamp || new Date();
    this.status = data.status || 'pending';
  }

  static validate(data) {
    const schema = Joi.object({
      id: Joi.string().uuid().optional(),
      deviceId: Joi.string().uuid().required(),
      userId: Joi.string().uuid().required(),
      encryptedData: Joi.string().required(),
      signature: Joi.string().required(),
      timestamp: Joi.date().optional(),
      status: Joi.string().valid('pending', 'verified', 'rejected').optional()
    });
    return schema.validate(data);
  }
}

module.exports = Submission;