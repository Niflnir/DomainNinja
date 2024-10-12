// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract DomainRegistrar {
    enum Status {
        AVAILABLE,
        REGISTERED,
        COMMIT,
        REVEAL
    }
    struct Bid {
        bytes32 commitment;
        uint256 deposit;
    }
    struct Auction {
        uint256 commitEnd;
        uint256 revealEnd;
        uint256 highestBid;
        address highestBidder;
    }
    struct DomainWithStatus {
        string domain;
        string status;
    }

    string[] public domains;
    mapping(string => address) domainOwner;
    mapping(string => Auction) public activeAuctions;
    mapping(string => mapping(address => Bid[])) bids;
    mapping(address => uint256) pendingRefunds;

    event Committed(address indexed from, string domain, uint256 amount);
    event Revealed(address indexed from, string domain);

    constructor() {
        for (uint256 i = 0; i < 26; i++) {
            bytes memory domainNameBytes = abi.encodePacked(
                char(97 + i),
                ".ntu"
            );
            string memory domain = string(domainNameBytes);
            domains.push(domain);
            domainOwner[domain] = address(0);
        }
    }

    function getDomains() external view returns (string[] memory) {
        return domains;
    }

    function getDomainsWithStatus()
        external
        view
        returns (DomainWithStatus[] memory)
    {
        DomainWithStatus[] memory domainsWithStatus = new DomainWithStatus[](
            domains.length
        );
        for (uint256 i = 0; i < domains.length; i++) {
            Auction memory auction = activeAuctions[domains[i]];
            string memory status;
            if (auction.commitEnd == 0) {
                status = "Available";
            } else if (block.timestamp <= auction.commitEnd) {
                status = "Commit";
            } else if (
                block.timestamp > auction.commitEnd &&
                block.timestamp <= auction.revealEnd
            ) {
                status = "Reveal";
            } else {
                status = "Registered";
            }
            domainsWithStatus[i] = DomainWithStatus(domains[i], status);
        }
        return domainsWithStatus;
    }

    function commit(
        string memory _domain,
        bytes32 _commitment
    ) external payable {
        if (activeAuctions[_domain].commitEnd == 0) {
            // Start an auction for the domain
            activeAuctions[_domain] = Auction(
                block.timestamp + 1 minutes,
                block.timestamp + 2 minutes,
                0,
                address(0)
            );
        }
        Auction memory auction = activeAuctions[_domain];
        require(block.timestamp <= auction.commitEnd, "Not in commit phase");
        bids[_domain][msg.sender].push(Bid(_commitment, msg.value));

        emit Committed(msg.sender, _domain, msg.value);
    }

    function reveal(
        string memory _domain,
        bytes32 _amount,
        bytes32 _secret
    ) external {
        Auction memory auction = activeAuctions[_domain];
        require(auction.commitEnd != 0, "Auction does not exist");
        require(
            block.timestamp > auction.commitEnd &&
                block.timestamp <= auction.revealEnd,
            "Not in reveal phase"
        );

        // Check through all sender's bids
        for (uint256 i = 0; i < bids[_domain][msg.sender].length; i++) {
            Bid storage currentBid = bids[_domain][msg.sender][i];
            if (
                keccak256(abi.encodePacked(_amount, _secret)) ==
                currentBid.commitment
            ) {
                if (currentBid.deposit > auction.highestBid) {
                    if (auction.highestBidder != address(0)) {
                        // Refund previous highest bidder
                        pendingRefunds[auction.highestBidder] += auction
                            .highestBid;
                    }
                    auction.highestBid = currentBid.deposit;
                    auction.highestBidder = msg.sender;
                }
                break;
            }
        }

        emit Revealed(msg.sender, _domain);
    }

    function withdraw() external {
        uint amount = pendingRefunds[msg.sender];
        if (amount > 0) {
            payable(msg.sender).transfer(amount);
            pendingRefunds[msg.sender] = 0;
        }
    }

    function getDomainOwner(
        string memory _domain
    ) external view returns (address) {
        Auction storage auction = activeAuctions[_domain];
        require(auction.commitEnd != 0, "Auction does not exist");
        require(block.timestamp > auction.commitEnd, "Auction still ongoing");
        return auction.highestBidder;
    }

    // function updateDomains() internal {
    //     for (uint256 i = 0; i < domains.length; i++) {
    //         string memory domain = domains[i];
    //         Auction memory auction = activeAuctions[domain];
    //         if (auction.commitEnd == 0) continue;
    //         if (
    //             block.timestamp > auction.commitEnd &&
    //             block.timestamp <= auction.revealEnd
    //         ) {
    //             console.log("reveal", domain);
    //             domainStatus[domain] = Status.REVEAL;
    //         } else if (block.timestamp > auction.revealEnd) {
    //             console.log("registered", domain);
    //             domainStatus[domain] = Status.REGISTERED;
    //             if (domainOwner[domain] == address(0)) {
    //                 domainOwner[domain] = activeAuctions[domain].highestBidder;
    //                 delete activeAuctions[domain];
    //             }
    //         }
    //     }
    // }

    function char(uint256 _ascii) internal pure returns (bytes1) {
        return bytes1(uint8(_ascii));
    }
}
