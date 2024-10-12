import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { domainRegistrarAbi, domainRegistrarAddress } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';

interface DomainWithStatus {
  domain: string;
  status: string;
}

interface HomeProps {
  web3: Web3;
}

const Home: React.FC<HomeProps> = () => {
  const navigate = useNavigate();
  const [domainsWithStatus, setDomainsWithStatus] = useState<DomainWithStatus[]>([]);

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
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(domainRegistrarAddress, domainRegistrarAbi, provider);
      const domainsWithStatus: DomainWithStatus[] = await contract.getDomainsWithStatus();
      console.log(domainsWithStatus);
      setDomainsWithStatus(domainsWithStatus);
    }
    checkMetamask();
    fetchDomains();
  }, [])

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
              {domainsWithStatus.map((item) => (
                <TableRow key={item.domain}>
                  <TableCell>{item.domain}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  {
                    (item.status === "Commit" || item.status === "Available")
                    &&
                    <TableCell>
                      <Button type="submit" onClick={() => navigate("/bid")}>Bid</Button>
                    </TableCell>
                  }
                  {
                    item.status === "Reveal"
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
