
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { domainRegistrarAbi, domainRegistrarAddress } from "@/utils/constants";
import { isMetamaskConnected } from "@/utils/helper";
import { ethers } from "ethers";
import { memo, useEffect, useState } from "react"

interface RevealProps {
  web3: any;
}

const Reveal: React.FC<RevealProps> = ({ web3 }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [domain, setDomain] = useState('');
  const [secret, setSecret] = useState('');
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    const fetchDomains = async () => {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(domainRegistrarAddress, domainRegistrarAbi, provider);
      const domains: string[] = await contract.getRevealableDomains();
      setDomains(domains);
    }
    fetchDomains();
  }, [])

  const revealHandler = async () => {
    if (!isMetamaskConnected) {
      return;
    }

    try {
      const amountBytes = web3.utils.asciiToHex(amount).padEnd(66, '0');
      const secretBytes = web3.utils.asciiToHex(secret).padEnd(66, '0');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const accounts = await provider.listAccounts();
      console.log(accounts[0]);

      const contract = new ethers.Contract(domainRegistrarAddress, domainRegistrarAbi, signer);
      contract.on("NoMatchingBid", () => {
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: "No matching bid, please ensure that the amount and secret are correct"
        })
      });
      contract.on("Revealed", () => {
        console.log(`Revealed event triggered!`);
        window.location.reload();
      });

      const tx = await contract.reveal(domain, amountBytes, secretBytes, accounts[0]);
      await tx.wait();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Transaction failed, please try again",
      })
    }
  }

  return (
    <div className='absolute flex h-full w-full flex-col bg-white'>
      <Navbar />
      <div className="flex flex-col items-center">
        <div className="text-xl font-bold py-20">Auction Reveal</div>
        <div className="flex flex-col gap-y-4 w-2/5">
          <Select onValueChange={(value) => setDomain(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {domains.filter(Boolean).map((domain) => (
                  <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input type="number" min={0} placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input type="email" placeholder="Secret" value={secret} onChange={(e) => setSecret(e.target.value)} />
          <Button type="submit" onClick={() => revealHandler()}>Reveal</Button>
        </div>
      </div>
    </div>
  )
}

export default memo(Reveal);
