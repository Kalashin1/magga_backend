const {generateKeyPairSync} = require('crypto');
const path = require('path');
const {createWriteStream} = require('fs');

const {
  publicKey,
  privateKey,
} = generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'top secret',
  },
});

const pubKeyStream = createWriteStream(`${path.join(`${__dirname}/public-key.txt`)}`)
const privateKeyStream = createWriteStream(`${path.join(`${__dirname}/private-key.txt`)}`)

pubKeyStream.write(publicKey, (err) => {
  if (err) throw err
})

privateKeyStream.write(privateKey, (err) => {
  if (err) throw err
})

setTimeout(() => console.log('completed'), 0)