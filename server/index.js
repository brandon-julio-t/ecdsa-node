const express = require('express');
const app = express();
const cors = require('cors');
const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  // private key: 0f50c70d6986d6018aa564e0c24b92cb27fc5c86c545b9a89805e96582a7271a
  '03f9b98853c5537edca59e766a762ba62b027ba4d5433b2b22db4cdc8e06e30ace': 100,
  // private key: 2714b6b153a8327f70eb83cd720817e83696be5edca7092023d36b0e46fd661d
  '031ba39a0b58b7512d0fb486a994bf0b2d96546ddff285f809c5f3df354df467ff': 50,
  // private key: e8c5f3aa9f7f29949dd35f3b561eb2a6c823bf2a0c27205bca60a0c27b1936e9
  '03b6592297781d29114234aa95c2a89368eac9a4e720e32e40a1952d016cda30a9': 75,
};

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {
    //sender,
    signature,
    recovery,
    hash,
    recipient,
    amount,
  } = req.body;

  const completeSignature = secp256k1.Signature.fromCompact(signature).addRecoveryBit(recovery);
  const sender = completeSignature.recoverPublicKey(hash).toHex();
  const isSigned = secp256k1.verify(completeSignature, hash, sender);

  if (!isSigned) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: 'Not enough funds!' });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
