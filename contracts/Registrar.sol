// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AuctionManager.sol";
import "hardhat/console.sol";

contract Registrar {
    AuctionManager public auctionManager;

    string[] public domains;
    mapping(string => address) public domainOwners;

    event BidCommitted(
        string indexed domain,
        address indexed bidder,
        bytes32 commitment
    );

    constructor(address _contractAddress) {
        auctionManager = AuctionManager(_contractAddress);
        domains.push("a.ntu");
        domains.push("b.ntu");
        domains.push("c.ntu");
        domains.push("d.ntu");
        domains.push("e.ntu");
    }

    function getDomains() external view returns (string[] memory) {
        return domains;
    }

    function commitBid(
        string memory _domain,
        bytes32 commitment
    ) external payable {
        console.log("commiting bid");
        require(
            domainOwners[_domain] == address(0),
            "Domain is currently registered"
        );
        auctionManager.commitBid(_domain, commitment);
        // Auction auction = activeAuctions[_domain];
        // auction.commitBid(commitment);

        // emit BidCommitted(_domain, msg.sender, commitment);
    }
}
