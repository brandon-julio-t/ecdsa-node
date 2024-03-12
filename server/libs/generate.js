const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { utf8ToBytes, toHex } = require('ethereum-cryptography/utils');

const privateKey = secp256k1.utils.randomPrivateKey();

const publicKey = secp256k1.getPublicKey(privateKey);

console.log('[privateKey]', toHex(privateKey));

console.log('[publicKey]', toHex(publicKey));

const messageHash = keccak256(
  utf8ToBytes(
    JSON.stringify({
      data: {
        hello: 'world',
      },
    })
  )
);

console.log('[messageHash]', messageHash);

const _signature = secp256k1.sign(messageHash, privateKey);
const signature = secp256k1.Signature.fromCompact(_signature.toCompactHex()).addRecoveryBit(_signature.recovery);
const recoveredPublicKey = signature.recoverPublicKey(messageHash).toRawBytes();
const isSigned = secp256k1.verify(signature, messageHash, recoveredPublicKey);

console.log('[_signature]', _signature.recovery);
console.log('[signature]', signature.recovery);
console.log('[signature.recoverPublicKey]', toHex(recoveredPublicKey));
console.log('[isSigned]', isSigned);
