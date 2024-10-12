import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { domainRegistrarAbi, domainRegistrarAddress } from "@/utils/constants";
import { generateCommitment, generateSecret } from "@/utils/helper";
import { ethers } from "ethers";
import { memo, useEffect, useState } from "react"

interface BidProps {
  web3: any;
}

const Bid: React.FC<BidProps> = ({ web3 }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [domain, setDomain] = useState('');
  const [secret, setSecret] = useState('');
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    const fetchAvailableDomains = async () => {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(domainRegistrarAddress, domainRegistrarAbi, provider);
      const domains: string[] = await contract.getDomains();
      setDomains(domains);
    }
    fetchAvailableDomains();
  }, [])

  const commitHandler = async () => {
    try {
      if (!(window as any).ethereum) {
        console.log("Please install metamask extension");
        return;
      }

      const commitment = generateCommitment(web3, amount, secret);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(domainRegistrarAddress, domainRegistrarAbi, signer);
      contract.on("Committed", (from, domain, value) => {
        console.log(`Committed event triggered!`);
        console.log(`From: ${from}`);
        console.log(`Domain: ${domain}`);
        console.log(`Value: ${value}`);
        window.location.reload();
      });

      const tx = await contract.commit(domain, commitment, {
        value: ethers.parseEther(amount),
      })
      await tx.wait();
    } catch (error) {
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
        <div className="text-xl font-bold py-20">Auction Commit</div>
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
          <div className="flex gap-x-2">
            <Input type="email" readOnly placeholder="Secret" value={secret} onChange={(e) => setSecret(e.target.value)} />
            <Button type="submit" onClick={() => setSecret(generateSecret(web3))}>Generate</Button>
          </div>
          <Button type="submit" onClick={() => commitHandler()}>Commit</Button>
        </div>
      </div>
    </div>
  )
}

export default memo(Bid);
