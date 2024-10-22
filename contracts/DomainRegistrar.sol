// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract DomainRegistrar {
    enum Status {
        Available,
        Bidding,
        Revealing,
        Registered
    }
    struct Bid {
        bytes32 commitment;
        uint256 deposit;
    }
    struct Auction {
        uint256 biddingEnd;
        uint256 revealEnd;
        uint256 highestBid;
        address highestBidder;
    }
    struct DomainInfo {
        string domain;
        string status;
        address owner;
    }

    string[] public domains;
    mapping(string => Auction) public auctions;
    mapping(string => mapping(address => Bid[])) bids;
    mapping(address => uint256) pendingRefunds;

    event Bidded(string domain);
    event Revealed();
    event NoMatchingBid();
    event Refunded(uint256 amount);

    constructor() {
        for (uint256 i = 0; i < 26; i++) {
            bytes memory domainNameBytes = abi.encodePacked(
                char(97 + i),
                ".ntu"
            );
            string memory domain = string(domainNameBytes);
            domains.push(domain);
        }
    }

    function getBiddableDomains() external view returns (string[] memory) {
        string[] memory biddableDomains = new string[](domains.length);
        for (uint256 i = 0; i < domains.length; i++) {
            Status status = getDomainStatus(auctions[domains[i]]);
            if (status == Status.Available || status == Status.Bidding) {
                biddableDomains[i] = domains[i];
            }
        }
        return biddableDomains;
    }

    function getRevealableDomains() external view returns (string[] memory) {
        string[] memory revealableDomains = new string[](domains.length);
        for (uint256 i = 0; i < domains.length; i++) {
            Status status = getDomainStatus(auctions[domains[i]]);
            if (status == Status.Revealing) {
                revealableDomains[i] = domains[i];
            }
        }
        return revealableDomains;
    }

    function getDomainsWithStatus()
        external
        view
        returns (DomainInfo[] memory)
    {
        DomainInfo[] memory domainInfos = new DomainInfo[](domains.length);
        for (uint256 i = 0; i < domains.length; i++) {
            Status status = getDomainStatus(auctions[domains[i]]);
            Auction memory auction = auctions[domains[i]];
            string memory statusString;
            address owner = address(0);
            if (status == Status.Available) {
                statusString = "Available";
            } else if (status == Status.Bidding) {
                statusString = "Bidding";
            } else if (status == Status.Revealing) {
                statusString = "Revealing";
            } else {
                statusString = "Registered";
                owner = auction.highestBidder;
            }
            domainInfos[i] = DomainInfo(domains[i], statusString, owner);
        }
        return domainInfos;
    }

    function bid(
        string memory _domain,
        bytes32 _commitment,
        address sender
    ) external payable {
        if (auctions[_domain].biddingEnd == 0) {
            // Start an auction for the domain
            auctions[_domain] = Auction(
                block.timestamp + 2 minutes,
                block.timestamp + 4 minutes,
                0,
                address(0)
            );
        }
        Auction memory auction = auctions[_domain];
        require(block.timestamp <= auction.biddingEnd, "Not in bidding phase");
        bids[_domain][sender].push(Bid(_commitment, msg.value));

        emit Bidded(_domain);
    }

    function reveal(
        string memory _domain,
        bytes32 _amount,
        bytes32 _secret,
        address sender
    ) external {
        Auction storage auction = auctions[_domain];
        require(auction.biddingEnd != 0, "Auction does not exist");
        require(
            block.timestamp > auction.biddingEnd &&
                block.timestamp <= auction.revealEnd,
            "Not in reveal phase"
        );

        // Check through all sender's bids
        bool validBid = false;
        for (uint256 i = 0; i < bids[_domain][sender].length; i++) {
            Bid storage currentBid = bids[_domain][sender][i];
            if (
                keccak256(abi.encodePacked(_amount, _secret)) ==
                currentBid.commitment
            ) {
                validBid = true;
                if (currentBid.deposit > auction.highestBid) {
                    if (auction.highestBidder != address(0)) {
                        // Refund previous highest bidder
                        pendingRefunds[auction.highestBidder] += auction
                            .highestBid;
                    }
                    auction.highestBid = currentBid.deposit;
                    auction.highestBidder = sender;
                    console.log(auction.highestBid);
                    console.log(auction.highestBidder);
                } else {
                    pendingRefunds[sender] += currentBid.deposit;
                }
                // Ensure that refund can only be claimed once
                currentBid.commitment = 0;
                break;
            }
        }

        if (validBid) {
            emit Revealed();
        } else {
            emit NoMatchingBid();
        }
    }

    function getAccountDomains(
        address sender
    ) external view returns (string[] memory) {
        string[] memory accountDomains = new string[](domains.length);
        for (uint256 i = 0; i < domains.length; i++) {
            Auction memory auction = auctions[domains[i]];
            Status status = getDomainStatus(auction);
            if (
                status == Status.Registered && auction.highestBidder == sender
            ) {
                accountDomains[i] = domains[i];
            }
        }
        return accountDomains;
    }

    function getPendingRefunds(address sender) external view returns (uint256) {
        return pendingRefunds[sender];
    }

    function refund(address sender) external {
        uint amount = pendingRefunds[sender];
        if (amount > 0) {
            payable(msg.sender).transfer(amount);
            pendingRefunds[sender] = 0;
        }

        emit Refunded(amount);
    }

    function getDomainStatus(
        Auction memory auction
    ) internal view returns (Status) {
        if (auction.biddingEnd == 0) {
            return Status.Available;
        } else if (block.timestamp <= auction.biddingEnd) {
            return Status.Bidding;
        } else if (
            block.timestamp > auction.biddingEnd &&
            block.timestamp <= auction.revealEnd
        ) {
            return Status.Revealing;
        }

        return Status.Registered;
    }

    function char(uint256 _ascii) internal pure returns (bytes1) {
        return bytes1(uint8(_ascii));
    }
}
