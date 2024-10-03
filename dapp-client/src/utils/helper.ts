import Web3 from "web3";

const generateSalt = (web3: Web3) => {
  const hexSalt = web3.utils.randomHex(length);
  return hexSalt.slice(2);
}

const generateCommitment = (web3: Web3, value: string, salt: string) => {
  // Convert inputs to bytes
  const valueBytes = Web3.utils.utf8ToHex(value);
  const saltBytes = Web3.utils.utf8ToHex(salt);

  // Perform keccak256 hashing
  const hash = Web3.utils.keccak256(web3.eth.abi.encodeParameters(['bytes32', 'bytes32'], [valueBytes, saltBytes]));
  return hash;
}

export { generateSalt, generateCommitment };
