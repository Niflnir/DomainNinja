// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract DomainRegistrar {
    struct Bid {
        bytes32 commitment;
        bool revealed;
    }
    struct Auction {
        uint256 biddingStart;
        uint256 biddingEnd;
        uint256 revealEnd;
        uint256 highestBid;
        address highestBidder;
    }

    string[] public domains;
    mapping(string => Auction) public activeAuctions;
    mapping(string => mapping(address => Bid)) public bids;

    constructor() {
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
        bytes32 _commitment
    ) external payable {
        if (activeAuctions[_domain].biddingStart == 0) {
            // Start an auction for the domain
            activeAuctions[_domain] = Auction(
                block.timestamp,
                block.timestamp + 10 seconds,
                block.timestamp + 30 seconds,
                0,
                address(0)
            );
        }
        require(
            bids[_domain][msg.sender].commitment == bytes32(0),
            "Account already bidded for this address"
        );
        bids[_domain][msg.sender] = Bid(_commitment, false);
    }

    function revealBid(
        string memory _domain,
        bytes32 _amount,
        bytes32 _secret
    ) external {
        Auction storage auction = activeAuctions[_domain];
        require(auction.biddingStart != 0, "Auction does not exist");
        require(
            block.timestamp > auction.biddingEnd &&
                block.timestamp <= auction.revealEnd,
            "Not in reveal phase"
        );

        Bid storage bid = bids[_domain][msg.sender];
        require(!bid.revealed, "Bid already revealed");

        // Check if hashed amount and secret is equal to commitment in bidding phase
        require(
            keccak256(abi.encodePacked(_amount, _secret)) == bid.commitment,
            "Invalid reveal"
        );

        bid.revealed = true;
        if (uint256(_amount) > auction.highestBid) {
            auction.highestBid = uint256(_amount);
            auction.highestBidder = msg.sender;
        }
    }

    function getDomainOwner(
        string memory _domain
    ) external view returns (address) {
        Auction storage auction = activeAuctions[_domain];
        require(auction.biddingStart != 0, "Auction does not exist");
        require(block.timestamp > auction.biddingEnd, "Auction still ongoing");
        return auction.highestBidder;
    }
}
