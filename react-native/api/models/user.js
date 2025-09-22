const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.role = data.role || 'user';
    this.credentials = data.credentials; // { password: hashed, tokens: [] }
  }

  static validate(data) {
    const schema = Joi.object({
      id: Joi.string().uuid().optional(),
      role: Joi.string().valid('user', 'admin').optional(),
      credentials: Joi.object().required()
    });
    return schema.validate(data);
  }
}

module.exports = User;