import { useState } from 'react';
import server from './server';
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { toHex, utf8ToBytes } from 'ethereum-cryptography/utils';

function Transfer({ privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const setValue = setter => evt => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const payload = {
        // sender: address,
        amount: parseInt(sendAmount),
        recipient,
      };

      const hash = keccak256(utf8ToBytes(JSON.stringify(payload)));
      const signature = secp256k1.sign(hash, privateKey);
      const recovery = signature.recovery;

      const {
        data: { balance },
      } = await server.post(`send`, {
        ...payload,
        hash: toHex(hash),
        signature: signature.toCompactHex(),
        recovery,
      });
      setBalance(balance);
    } catch (ex) {
      console.error(ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input placeholder="1, 2, 3..." value={sendAmount} onChange={setValue(setSendAmount)}></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
