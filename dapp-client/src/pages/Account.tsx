import Navbar from "@/components/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { domainRegistrarAbi, domainRegistrarAddress } from "@/utils/constants";
import { ethers } from "ethers";
import { memo, useEffect, useState } from "react"
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isMetamaskConnected } from "@/utils/helper";

interface AccountProps {
  web3: any;
}

const Account: React.FC<AccountProps> = () => {
  const { toast } = useToast();
  const [domains, setDomains] = useState<string[]>([]);
  const [pendingRefunds, setPendingRefunds] = useState<number>(0);

  useEffect(() => {
    const fetchDomains = async () => {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(domainRegistrarAddress, domainRegistrarAbi, provider);
      const accounts = await provider.listAccounts();

      // Get list of domains owned by account;
      const domains = await contract.getAccountDomains(accounts[0]);
      setDomains(domains);

      // Get pending refunds from reveal phase
      const pendingRefunds = await contract.getPendingRefunds(accounts[0]);
      setPendingRefunds(Number(pendingRefunds));
    }
    fetchDomains();
  }, [])

  const withdrawRefundHandler = async () => {
    if (!isMetamaskConnected) {
      return;
    }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const accounts = await provider.listAccounts();

      const contract = new ethers.Contract(domainRegistrarAddress, domainRegistrarAbi, signer);
      contract.on("Refunded", (amount) => {
        console.log(`Refunded event triggered!`);
        setPendingRefunds(0);
        toast({
          title: `Successfully refunded ${Number(amount) / Math.pow(10, 18)} ETH`,
        })
      });

      const tx = await contract.refund(accounts[0]);
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
      <div className='flex flex-col items-center justify-center px-10 pb-10'>
        <div className='flex justify-center py-10 text-xl font-bold'>My Registered Domains</div>
        <div className='w-2/5 rounded-lg border border-gray-200 shadow-md'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-2/5'>Domain</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.filter(Boolean).map((domain) => (
                <TableRow key={domain}>
                  <TableCell>{domain}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col justify-center gap-y-4 py-52">
          <div>Pending refunds: ${pendingRefunds / Math.pow(10, 18)} ETH</div>
          <Button disabled={!pendingRefunds} type="submit" onClick={() => withdrawRefundHandler()}>Withdraw Refund</Button>
        </div>
      </div>
    </div>
  );
}

export default memo(Account);
