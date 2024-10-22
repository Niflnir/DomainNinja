import Web3 from "web3";

const generateSecret = (web3: Web3) => {
  const hexSalt = web3.utils.randomHex(16);
  return hexSalt.slice(2);
}

const generateCommitment = (web3: Web3, amount: string, secret: string) => {
  // Convert to bytes
  const amountBytes = web3.utils.asciiToHex(amount);
  const secretBytes = web3.utils.asciiToHex(secret);

  // Perform keccak256 hashing
  const commitment = web3.utils.soliditySha3(
    { t: 'bytes32', v: amountBytes },
    { t: 'bytes32', v: secretBytes }
  );
  return commitment;
}

const isMetamaskConnected = () => {
  if (!(window as any).ethereum) {
    console.log("Please install metamask extension");
    return false;
  }
  return true;
}

export { generateSecret, generateCommitment, isMetamaskConnected };
