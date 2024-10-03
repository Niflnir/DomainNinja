import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { domainRegistrarAbi, domainRegistrarAddress } from './utils/constants';
import DomainListing from './components/domainListing';

function App(): React.ReactElement {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return <></>;
  }

  return (
    <div className='absolute bg-blue-200 flex flex-col w-full h-full'>
      <div className='text-center w-full p-10 font-bold text-xl'>Domain Name Registrar</div>
      <div className='flex flex-col space-y-4 w-full items-center'>
        {domains.map((domain) => <DomainListing key={domain} web3={web3} domain={domain} />)}
      </div>
    </div>
  );
}

export default App;
