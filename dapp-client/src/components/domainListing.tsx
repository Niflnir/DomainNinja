import { memo, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Web3 from "web3";
import { generateCommitment, generateSalt } from "@/utils/helper";
import { domainRegistrarAbi, domainRegistrarAddress } from "@/utils/constants";

interface DomainListingProps {
  web3: Web3
  domain: string
}

const DomainListing: React.FC<DomainListingProps> = ({ web3, domain: domainName }) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const registrarContract = new web3.eth.Contract(domainRegistrarAbi, domainRegistrarAddress);

  const commitBidHandler = async (domain: string) => {
    console.log("bid amount: ", bidAmount);
    if (!bidAmount) {
      console.error("Invalid bid amount: ", bidAmount);
      return;
    };
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    const salt = generateSalt(web3);
    const commitment = generateCommitment(web3, bidAmount, salt);

    const balanceBefore = web3.utils.fromWei(
      await web3.eth.getBalance(accounts[0]),
      'ether'
    );
    console.log(balanceBefore);

    // Build commitBid transaction
    const commitBidTx = registrarContract.methods.commitBid(domain, commitment);

    const commitBid = async () => {
      // Sign transaction with Private Key
      const signedTransaction = await web3.eth.accounts.signTransaction(
        {
          from: account,
          to: domainRegistrarAddress,
          data: commitBidTx.encodeABI(),
          value: web3.utils.toWei(bidAmount.toString(), 'ether'),
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
    commitBid();
    console.log("Salt: ", salt);
    alert(salt);
  }

  return (
    <div className="w-full flex flex-row space-x-5 items-center justify-center">
      <div>{domainName}</div>
      <div className="flex w-3/5 space-x-5">
        <Input type="number" placeholder="Amount" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
        <Button type="submit" onClick={() => commitBidHandler(domainName)}>Bid</Button>
      </div>
    </div>
  )
}

export default memo(DomainListing);
