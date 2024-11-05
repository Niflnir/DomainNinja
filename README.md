<img src="logo.png" alt="Domain Ninja Logo" width="500"/>

My Decentralized Domain Name Registrar

---

### Setup local Ethereum blockchain with hardhat
Export seed phrase and start blockchain
```zsh
export SEED_PHRASE="your-12-word-seed-phrase" && npx hardhat node
```
### Configure and deploy smart contract
By default both the commit and reveal phase duration is set to 2 minutes

Go to contracts/DomainRegistar.sol (lines 106 and 107) to configure commit and reveal phase duration
```zsh
block.timestamp + 2 minutes, // Update value to change commit phase duration
block.timestamp + 4 minutes, // Update value to change reveal phase duration
```
Compile and deploy smart contract to blockchain and copy ABI to frontend folder
```zsh
npx hardhat compile \
&& rm -rf ./ignition/deployments \
&& (yes | npx hardhat ignition deploy ./ignition/modules/DomainRegistrar.ts --network localhost) \
&& cp ignition/deployments/chain-1337/artifacts/DomainRegistrarModule\#DomainRegistrar.json dapp-client/src/abi/DomainRegistrar.json
```
### Run dApp client
```zsh
cd dapp-client && yarn run dev
```
