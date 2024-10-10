import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { domainRegistrarAbi, domainRegistrarAddress } from './utils/constants.ts'
import Commit from './pages/Commit.tsx'
import Home from './pages/Home.tsx'
import Web3 from 'web3'
import './index.css'

const web3 = new Web3("ws://localhost:8545");
const domainRegistrarContract = new web3.eth.Contract(domainRegistrarAbi, domainRegistrarAddress);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home web3={web3} contract={domainRegistrarContract} />}></Route>
        <Route path="/commit" element={<Commit web3={web3} contract={domainRegistrarContract} />}></Route>
      </Routes>
    </Router>
  </StrictMode>,
)
