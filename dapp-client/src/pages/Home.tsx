import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import Web3 from 'web3';

interface HomeProps {
  web3: Web3;
  contract: any;
}

const Home: React.FC<HomeProps> = ({ web3, contract }) => {
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    const checkMetamask = async () => {
      if (!(window as any).ethereum) {
        console.log("Please install metamask extension");
        return;
      }
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      console.log(accounts);
    }
    const fetchDomains = async () => {
      const newDomains: string[] = await contract.methods.getDomains().call();
      console.log(newDomains);
      setDomains(newDomains);
    }
    checkMetamask();
    fetchDomains();
  }, [])

  // const revealBidHandler = async () => {
  //   if (!revealAmount || !revealSecret) {
  //     console.error("Invalid amount or secret.");
  //     return;
  //   };
  //
  //   const accounts = await web3.eth.getAccounts(); console.log(accounts);
  //   const account = accounts[0];
  //
  //   // Build revealBid transaction
  //   const revealBidTx = registrarContract.methods.revealBid(revealDomain, web3.utils.asciiToHex(revealAmount).padEnd(66, '0'), web3.utils.asciiToHex(revealSecret).padEnd(66, '0'));
  //
  //   const revealBid = async () => {
  //     // Sign transaction with Private Key
  //     const signedTransaction = await web3.eth.accounts.signTransaction(
  //       {
  //         from: account,
  //         to: domainRegistrarAddress,
  //         data: revealBidTx.encodeABI(),
  //         gas: '200000',
  //         gasPrice: await web3.eth.getGasPrice(),
  //         nonce: await web3.eth.getTransactionCount(account),
  //       },
  //       '<private-key>'
  //     )
  //
  //     // Generate receipt
  //     const receipt = await web3.eth.sendSignedTransaction(
  //       signedTransaction.rawTransaction
  //     )
  //
  //     console.log(`Tx successful with hash: ${receipt.transactionHash}`);
  //   }
  //   revealBid();
  // }

  return (
    <div className='absolute flex h-full w-full flex-col bg-white'>
      <Navbar />
      <div className='flex flex-col items-center justify-center px-10 pb-10'>
        <div className='flex justify-center py-6 text-xl font-bold'>Domain Name Listings</div>
        <div className='w-3/5 rounded-lg border border-gray-200 shadow-md'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-2/5'>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='w-[10%]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow>
                  <TableCell>{domain}</TableCell>
                  <TableCell>Available</TableCell>
                  <TableCell>
                    <Button type="submit">Commit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/**
      <div className='flex flex-col space-y-4 w-full items-center'>
        {domains.map((domain) => <DomainListing key={domain.name} web3={web3} domainName={domain.name} />)}
      </div>
      <div>Reveal Bid</div>
      <Input type="email" placeholder="Domain" value={revealDomain} onChange={(e) => setRevealDomain(e.target.value)} />
      <Input type="number" placeholder="Amount" value={revealAmount} onChange={(e) => setRevealAmount(e.target.value)} />
      <Input type="email" placeholder="Secret" value={revealSecret} onChange={(e) => setRevealSecret(e.target.value)} />
      <Button type="submit" onClick={() => revealBidHandler()}>Reveal</Button>
      **/}
    </div>
  );
}

export default Home;
