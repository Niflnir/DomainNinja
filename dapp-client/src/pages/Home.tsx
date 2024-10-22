import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { domainRegistrarAbi, domainRegistrarAddress } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import { isMetamaskConnected } from '@/utils/helper';

interface DomainInfo {
  domain: string;
  status: string;
  owner: any;
}

interface HomeProps {
  web3: Web3;
}

const Home: React.FC<HomeProps> = () => {
  const navigate = useNavigate();
  const [domainInfos, setDomainInfos] = useState<DomainInfo[]>([]);

  useEffect(() => {
    const fetchDomains = async () => {
      if (!isMetamaskConnected) {
        return;
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(domainRegistrarAddress, domainRegistrarAbi, provider);
      const domainInfos: DomainInfo[] = await contract.getDomainsWithStatus();
      domainInfos.forEach((domainInfo) => console.log(domainInfo));
      setDomainInfos(domainInfos);
    }
    fetchDomains();
  }, [])

  return (
    <div className='absolute flex h-full w-full flex-col bg-white'>
      <Navbar />
      <div className='flex flex-col items-center justify-center px-10 pb-10'>
        <div className='flex justify-center py-6 text-xl font-bold'>Domain Name Listings</div>
        <div className='w-[60%] rounded-lg border border-gray-200 shadow-md'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[15%]'>Domain</TableHead>
                <TableHead className='w-[20%]'>Status</TableHead>
                <TableHead>Owned By</TableHead>
                <TableHead className='w-[10%]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domainInfos.map((item) => (
                <TableRow key={item.domain}>
                  <TableCell>{item.domain}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.owner}</TableCell>
                  {
                    (item.status === "Available" || item.status === "Bidding")
                    &&
                    <TableCell>
                      <Button type="submit" onClick={() => navigate("/bid")}>Bid</Button>
                    </TableCell>
                  }
                  {
                    item.status === "Revealing"
                    &&
                    <TableCell>
                      <Button type="submit" onClick={() => navigate("/reveal")}>Reveal</Button>
                    </TableCell>
                  }
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Home;
