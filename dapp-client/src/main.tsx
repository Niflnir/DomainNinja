import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from '@/components/ui/toaster'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Bid from './pages/Bid.tsx'
import Reveal from './pages/Reveal.tsx'
import Home from './pages/Home.tsx'
import Web3 from 'web3'
import './index.css'
import Account from './pages/Account.tsx'

const web3 = new Web3("ws://localhost:8545");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home web3={web3} />}></Route>
        <Route path="/bid" element={<Bid web3={web3} />}></Route>
        <Route path="/reveal" element={<Reveal web3={web3} />}></Route>
        <Route path="/account" element={<Account web3={web3} />}></Route>
      </Routes>
    </Router>
    <Toaster />
  </StrictMode>,
)
