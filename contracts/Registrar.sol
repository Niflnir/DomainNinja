// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Auction.sol";
import "hardhat/console.sol";

contract Registrar {
    string[] public domains;
    mapping(string => string) public domainToIp;
    mapping(string => address) public domainOwners;
    mapping(string => uint256) public domainExpirationTimes;
    mapping(string => Auction) public activeAuctions;

    constructor() {
        domains.push("a.ntu");
        domains.push("b.ntu");
        domains.push("c.ntu");
        domains.push("d.ntu");
        domains.push("e.ntu");
    }

    function getDomains() external view returns (string[] memory) {
        console.log("Returning a list of domains");
        return domains;
    }
}
