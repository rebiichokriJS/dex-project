const {
    expect
} = require("chai");
const {
    ethers
} = require("hardhat");

describe("DEX", function () {
    let factory, pair, tokenA, tokenB, router, staking, rewardToken;
    let owner, user;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        // Deploy mock ERC20 tokens
        const Token = await ethers.getContractFactory("RewardToken");
        tokenA = await Token.deploy(ethers.utils.parseEther("1000"));
        tokenB = await Token.deploy(ethers.utils.parseEther("1000"));
        rewardToken = await Token.deploy(ethers.utils.parseEther("1000"));

        // Deploy Factory
        const Factory = await ethers.getContractFactory("Factory");
        factory = await Factory.deploy();

        // Deploy Router
        const Router = await ethers.getContractFactory("Router");
        router = await Router.deploy(factory.address);

        // Deploy Staking
        const Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(tokenA.address, rewardToken.address, ethers.utils.parseEther("0.1"));

        // Create pair
        await factory.createPair(tokenA.address, tokenB.address);
        const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
        pair = await ethers.getContractAt("DEXPair", pairAddress);
    });

    it("should add liquidity", async function () {
        await tokenA.approve(router.address, ethers.utils.parseEther("100"));
        await tokenB.approve(router.address, ethers.utils.parseEther("100"));
        await router.addLiquidity(
            tokenA.address,
            tokenB.address,
            ethers.utils.parseEther("100"),
            ethers.utils.parseEther("100"),
            owner.address
        );

        expect(await pair.balanceOf(owner.address)).to.be.gt(0);
    });

    it("should swap tokens", async function () {
        // Add liquidity first
        await tokenA.approve(router.address, ethers.utils.parseEther("100"));
        await tokenB.approve(router.address, ethers.utils.parseEther("100"));
        await router.addLiquidity(
            tokenA.address,
            tokenB.address,
            ethers.utils.parseEther("100"),
            ethers.utils.parseEther("100"),
            owner.address
        );

        await tokenA.connect(user).approve(router.address, ethers.utils.parseEther("10"));
        await router.connect(user).swapExactTokensForTokens(
            ethers.utils.parseEther("10"),
            0,
            [tokenA.address, tokenB.address],
            user.address
        );

        expect(await tokenB.balanceOf(user.address)).to.be.gt(0);
    });

    it("should stake and reward", async function () {
        await tokenA.approve(staking.address, ethers.utils.parseEther("10"));
        await staking.stake(ethers.utils.parseEther("10"));
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for rewards
        await staking.claimReward();
        expect(await rewardToken.balanceOf(owner.address)).to.be.gt(0);
    });
});