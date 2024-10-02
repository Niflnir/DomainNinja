import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DomainRegistrarModule", (m) => {
  // Deploy Registrar contract
  const registrar = m.contract("Registrar");

  // Deploy Auction contract
  const auction = m.contract("Auction");

  // Return deployed contracts
  return { registrar, auction };
});
