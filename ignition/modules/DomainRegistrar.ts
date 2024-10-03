import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DomainRegistrarModule", (m) => {
  // Deploy DomainRegistrar contract
  const domainRegistrar = m.contract("DomainRegistrar");

  // Return deployed contracts
  return { registrar: domainRegistrar };
});
