//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract ChuckALuck {

    event NewBet(uint8 roll0, uint8 roll1, uint8 roll2, uint256 prizeAmpunt);

    struct Bet {
        address player;
        uint8 number;
        uint256 amount;
        uint8 roll0;
        uint8 roll1;
        uint8 roll2;
        uint256 prize;

        uint256 timestamp;
    }

    Bet[] bets;

    constructor() payable {
        console.log("ChuckALuck Constructor");
    }

    function roll(uint n) private view returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, n))) % 6);
    }

    function bet(uint8 number) public payable returns (uint256) {
        console.log(
            "Wallet %s, on number %s, bet %s",
            msg.sender,
            number,
            msg.value
        );
        
        uint8 roll0 = roll(0);
        uint8 roll1 = roll(1);
        uint8 roll2 = roll(2);
        console.log("roll0 %s  roll1 %s  roll2 %s", roll0, roll1, roll2);
        

        uint256 prizeAmount = 0 ether;
        if (roll0 == number) {
            prizeAmount += msg.value;
        }
        if (roll1 == number) {
            prizeAmount += msg.value;
        }
        if (roll2 == number) {
            prizeAmount += msg.value;
        }
        if (prizeAmount != 0) {
            prizeAmount += msg.value;
            
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewBet(roll0, roll1, roll2, prizeAmount);

        bets.push(Bet(msg.sender, number, msg.value, roll0, roll1, roll2, prizeAmount, block.timestamp));

        return prizeAmount;
    }

    function getAllBets() public view returns (Bet[] memory) {
        return bets;
    }
}
