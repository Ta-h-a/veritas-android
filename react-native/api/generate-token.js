// api/generate-token.js
const jwt = require('jsonwebtoken');

// Generate a valid JWT token for testing
const testUser = {
  id: 'test-user-123',
  role: 'user'
};

const token = jwt.sign(testUser, 'secret_key', { expiresIn: '24h' });

console.log('Generated JWT Token:');
console.log(token);
console.log('\nCopy this token and paste it into your apiService.js Authorization header');