// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuctionManager {
    struct Bid {
        bytes32 commitment;
        bool revealed;
    }
    struct Auction {
        uint256 auctionStart;
        uint256 auctionEnd;
        uint256 revealEnd;
        uint256 highestBid;
        address highestBidder;
    }

    mapping(string => Auction) public activeAuctions;
    mapping(string => mapping(address => Bid)) public bids;

    constructor() {}

    function commitBid(string memory _domain, bytes32 _commitment) external {
        if (activeAuctions[_domain].auctionStart == 0) {
            // Start an auction for the domain
            activeAuctions[_domain] = Auction(
                block.timestamp,
                block.timestamp + 5 minutes,
                block.timestamp + 10 minutes,
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

    // function revealBid(
    //     string memory _domain,
    //     uint256 _amount,
    //     bytes32 _secret
    // ) external {
    //     Auction storage auction = activeAuctions[_domain];
    //     require(
    //         block.timestamp > auction.auctionEnd &&
    //             block.timestamp <= auction.revealEnd,
    //         "Not in reveal phase"
    //     );
    //     require(!bids[msg.sender].revealed, "Bid already revealed");
    //
    //     Bid storage bid = bids[msg.sender];
    //     require(
    //         keccak256(abi.encodePacked(msg.sender, _amount, _secret)) ==
    //             bid.commitment,
    //         "Invalid reveal"
    //     );
    //
    //     bid.revealed = true;
    //
    //     if (_amount > highestBid) {
    //         highestBidder = msg.sender;
    //         highestBid = _amount;
    //     }
    // }
}
