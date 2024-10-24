<img src="logo.png" alt="Domain Ninja Logo" width="500"/>

My Decentralized Domain Name Registrar

---

### Setup local Ethereum blockchain with hardhat
Export seed phrase and start blockchain
```zsh
export SEED_PHRASE="your-12-word-seed-phrase" && npx hardhat node
```
Compile and deploy smart contract. Copy ABI to frontend folder.
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
