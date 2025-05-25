// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    IERC20 public lpToken;
    IERC20 public rewardToken;
    uint256 public rewardRate; // Tokens par seconde
    uint256 public totalStaked;
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public lastUpdateTime;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _lpToken, address _rewardToken, uint256 _rewardRate) {
        lpToken = IERC20(_lpToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
    }

    function stake(uint256 amount) external {
        updateReward(msg.sender);
        require(amount > 0, unicode"Impossible de staker 0");
        stakedBalance[msg.sender] = stakedBalance[msg.sender] + amount;
        totalStaked = totalStaked + amount;
        lpToken.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        updateReward(msg.sender);
        require(
            amount > 0 && amount <= stakedBalance[msg.sender],
            unicode"Montant invalide"
        );
        stakedBalance[msg.sender] = stakedBalance[msg.sender] - amount;
        totalStaked = totalStaked - amount;
        lpToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() external {
        updateReward(msg.sender);
        uint256 reward = rewards[msg.sender];
        require(reward > 0, unicode"Aucune récompense");
        rewards[msg.sender] = 0;
        rewardToken.transfer(msg.sender, reward);
        emit RewardPaid(msg.sender, reward);
    }

    function updateReward(address user) internal {
        uint256 timeDiff = block.timestamp - lastUpdateTime[user];
        rewards[user] =
            rewards[user] +
            ((stakedBalance[user] * timeDiff * rewardRate) / 1e18);
        lastUpdateTime[user] = block.timestamp;
    }
}
