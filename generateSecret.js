const crypto = require('crypto');

// Generate a random string of 64 characters
const refreshTokenSecret = crypto.randomBytes(64).toString('hex');

console.log('Your refresh token secret is:', refreshTokenSecret);
