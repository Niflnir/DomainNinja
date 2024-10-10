import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { memo, useEffect, useState } from "react"

interface CommitProps {
  web3: any;
  contract: any;
}

const Commit: React.FC<CommitProps> = ({ web3, contract }) => {
  const [amount, setAmount] = useState('');
  const [domain, setDomain] = useState('');
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);

  useEffect(() => {
    const checkMetamask = async () => {
      if (!(window as any).ethereum) {
        console.log("Please install metamask extension");
        return;
      }
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      console.log(accounts);
    }
    const fetchAvailableDomains = async () => {
      const domains: string[] = await contract.methods.getAvailableDomains().call();
      console.log(domains);
      setAvailableDomains(domains);
    }
    checkMetamask();
    fetchAvailableDomains();
  }, [])

  const commitHandler = () => {
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
                {availableDomains.filter(Boolean).map((domain) => (
                  <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input type="number" min={0} placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button type="submit" onClick={() => commitHandler()}>Commit</Button>
        </div>

      </div>
    </div>
  )
}

export default memo(Commit);
