const {
    ethers
} = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Déploiement des contrats avec :", deployer.address);

    // Déployer le Token de Récompense
    const RewardToken = await ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy(ethers.parseEther("1000000")); // Attendre directement
    await rewardToken.waitForDeployment(); // Nouvelle méthode pour attendre la confirmation
    console.log("RewardToken déployé à :", await rewardToken.getAddress());

    // Déployer la Factory
    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();
    console.log("Factory déployée à :", await factory.getAddress());

    // Déployer le Router
    const Router = await ethers.getContractFactory("Router");
    const router = await Router.deploy(await factory.getAddress());
    await router.waitForDeployment();
    console.log("Router déployé à :", await router.getAddress());

    // Déployer le Staking
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(await rewardToken.getAddress(), await rewardToken.getAddress(), ethers.parseEther("0.1"));
    await staking.waitForDeployment();
    console.log("Staking déployé à :", await staking.getAddress());

    // Déployer le contrat Lock
    const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 heure à partir de maintenant
    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, {
        value: ethers.parseEther("1")
    });
    await lock.waitForDeployment();
    console.log("Lock déployé à :", await lock.getAddress());
}

main().catch(console.error);