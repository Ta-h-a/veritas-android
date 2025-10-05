// backend/generateKeys.js
// Script to generate all required encryption keys for Veritas backend

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║         Veritas Encryption Keys Generator                 ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Generate encryption keys with correct sizes
const encryptionKey = crypto.randomBytes(32).toString('base64');     // 32 bytes for AES-256
const signingKey = crypto.randomBytes(64).toString('base64');        // 64 bytes for HMAC signing
const clientEncryptionKey = crypto.randomBytes(32).toString('base64'); // 32 bytes for AES-256-GCM

console.log('✓ Generated encryption keys (32 bytes for AES, 64 bytes for signing)\n');

// Create .env content
const envContent = `# Server Configuration
PORT=8080

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/veritas
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/veritas?retryWrites=true&w=majority

# MEGA Storage Configuration
MEGA_EMAIL=your-mega-email@example.com
MEGA_PASSWORD=your-mega-password

# Mongoose Encryption Keys (Database-level encryption - Second layer)
# DO NOT SHARE THESE KEYS - Generated on ${new Date().toISOString()}
ENCRYPTION_KEY=${encryptionKey}
SIGNING_KEY=${signingKey}

# Client-Side Encryption Key (First layer - must match frontend)
# COPY THIS KEY TO YOUR REACT NATIVE .env FILE
CLIENT_ENCRYPTION_KEY=${clientEncryptionKey}

# Environment
NODE_ENV=development
`;

const frontendEnvContent = `# API Configuration
# For local development on physical device, use your computer's local IP
# For Android emulator, use 10.0.2.2
# For iOS simulator, use localhost
EXPO_PUBLIC_API_URL=http://192.168.1.100:8080

# Client-Side Encryption Key (Must match backend CLIENT_ENCRYPTION_KEY)
# This is the first layer of encryption before data reaches the server
EXPO_PUBLIC_CLIENT_ENCRYPTION_KEY=${clientEncryptionKey}

# Development Settings
EXPO_PUBLIC_ENV=development
`;

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
const frontendEnvPath = path.join(__dirname, '..', 'react-native', '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  WARNING: .env file already exists!');
  console.log('   Creating .env.new instead to prevent overwriting.\n');
  fs.writeFileSync(path.join(__dirname, '.env.new'), envContent);
  console.log('✓ Created: backend/.env.new');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✓ Created: backend/.env');
}

// Try to create frontend .env
try {
  if (fs.existsSync(frontendEnvPath)) {
    console.log('⚠️  Frontend .env already exists!');
    console.log('   Creating .env.new in react-native folder.\n');
    fs.writeFileSync(
      path.join(__dirname, '..', 'react-native', '.env.new'),
      frontendEnvContent
    );
    console.log('✓ Created: react-native/.env.new');
  } else {
    fs.mkdirSync(path.join(__dirname, '..', 'react-native'), { recursive: true });
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✓ Created: react-native/.env');
  }
} catch (error) {
  console.log('\n⚠️  Could not create frontend .env automatically.');
  console.log('   Please create react-native/.env manually with the CLIENT_ENCRYPTION_KEY shown below.\n');
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                   IMPORTANT INFORMATION                    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📋 Your Encryption Keys:\n');
console.log('BACKEND Keys (mongoose encryption):');
console.log('-----------------------------------');
console.log('ENCRYPTION_KEY=', encryptionKey);
console.log('SIGNING_KEY=', signingKey);
console.log('\nCLIENT Key (shared between backend and frontend):');
console.log('---------------------------------------------------');
console.log('CLIENT_ENCRYPTION_KEY=', clientEncryptionKey);

console.log('\n\n⚠️  SECURITY WARNINGS:');
console.log('   1. Store these keys securely - DO NOT commit to git');
console.log('   2. Use different keys for development and production');
console.log('   3. Rotate keys periodically for enhanced security');
console.log('   4. The CLIENT_ENCRYPTION_KEY must be identical in:');
console.log('      - backend/.env');
console.log('      - react-native/.env\n');

console.log('📝 Next Steps:');
console.log('   1. Edit backend/.env and add your MEGA credentials');
console.log('   2. Edit backend/.env and add your MongoDB URI');
console.log('   3. Verify CLIENT_ENCRYPTION_KEY is in react-native/.env');
console.log('   4. Update EXPO_PUBLIC_API_URL in react-native/.env');
console.log('   5. Start MongoDB: mongod --dbpath /path/to/data');
console.log('   6. Start backend: node index.js');
console.log('   7. Start React Native: npx expo start\n');

console.log('✅ Setup complete!\n');