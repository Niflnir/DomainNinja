import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { domainRegistrarAbi, domainRegistrarAddress } from './utils/constants';
import DomainListing from './components/domainListing';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

function App(): React.ReactElement {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealDomain, setRevealDomain] = useState<string>('');
  const [revealAmount, setRevealAmount] = useState<string>('');
  const [revealSecret, setRevealSecret] = useState<string>('');
  const web3: Web3 = new Web3("ws://localhost:8545");
  const registrarContract = new web3.eth.Contract(domainRegistrarAbi, domainRegistrarAddress);

  useEffect(() => {
    const fetchDomains = async () => {
      const newDomains: string[] = await registrarContract.methods.getDomains().call();
      console.log(newDomains);
      setDomains(newDomains);
      setLoading(false);
    }
    fetchDomains();
  }, [])

  const revealBidHandler = async () => {
    if (!revealAmount || !revealSecret) {
      console.error("Invalid amount or secret.");
      return;
    };

    const accounts = await web3.eth.getAccounts(); console.log(accounts);
    const account = accounts[0];

    const balanceBefore = web3.utils.fromWei(
      await web3.eth.getBalance(accounts[0]),
      'ether'
    );
    console.log(balanceBefore);

    // Build revealBid transaction
    const revealBidTx = registrarContract.methods.revealBid(revealDomain, web3.utils.asciiToHex(revealAmount).padEnd(66, '0'), web3.utils.asciiToHex(revealSecret).padEnd(66, '0'));

    const revealBid = async () => {
      // Sign transaction with Private Key
      const signedTransaction = await web3.eth.accounts.signTransaction(
        {
          from: account,
          to: domainRegistrarAddress,
          data: revealBidTx.encodeABI(),
          gas: '200000',
          gasPrice: await web3.eth.getGasPrice(),
          nonce: await web3.eth.getTransactionCount(account),
        },
        '<private-key>'
      )

      // Generate receipt
      const receipt = await web3.eth.sendSignedTransaction(
        signedTransaction.rawTransaction
      )

      console.log(`Tx successful with hash: ${receipt.transactionHash}`);
    }
    revealBid();
  }

  if (loading) {
    return <></>;
  }

  return (
    <div className='absolute bg-blue-200 flex flex-col w-full h-full'>
      <div className='text-center w-full p-10 font-bold text-xl'>Domain Name Registrar</div>
      <div className='flex flex-col space-y-4 w-full items-center'>
        {domains.map((domain) => <DomainListing key={domain} web3={web3} domain={domain} />)}
      </div>
      <div>Reveal Bid</div>
      <Input type="email" placeholder="Domain" value={revealDomain} onChange={(e) => setRevealDomain(e.target.value)} />
      <Input type="number" placeholder="Amount" value={revealAmount} onChange={(e) => setRevealAmount(e.target.value)} />
      <Input type="email" placeholder="Secret" value={revealSecret} onChange={(e) => setRevealSecret(e.target.value)} />
      <Button type="submit" onClick={() => revealBidHandler()}>Reveal</Button>
    </div>
  );
}

export default App;
