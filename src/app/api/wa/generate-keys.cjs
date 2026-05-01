const crypto = require('crypto');
const fs = require('fs');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('--- PUBLIC KEY ---');
console.log(publicKey);
console.log('--- PRIVATE KEY ---');
console.log(privateKey);

fs.writeFileSync('wa_public.pem', publicKey);
fs.writeFileSync('wa_private.pem', privateKey);
