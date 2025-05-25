import React, { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import RouterABI from "./Router.json";
import StakingABI from "./Staking.json";
import LockABI from "./Lock.json";
import Footer from "./components/Footer";

const App = () => {
  const [account, setAccount] = useState(null);
  const routerAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const stakingAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const lockAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const tokenAAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const tokenBAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Veuillez installer MetaMask !");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      console.log("Compte connecté :", address);
    } catch (error) {
      console.error("Erreur lors de la connexion du portefeuille :", error);
    }
  };

  const addLiquidity = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const router = new ethers.Contract(routerAddress, RouterABI.abi, signer);
      const tx = await router.addLiquidity(
        tokenAAddress,
        tokenBAddress,
        ethers.parseEther("100"),
        ethers.parseEther("100")
      );
      await tx.wait();
      console.log("Liquidité ajoutée :", tx.hash);
    } catch (error) {
      console.error("Erreur lors de l'ajout de liquidité :", error);
    }
  };

  const swapTokens = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const router = new ethers.Contract(routerAddress, RouterABI.abi, signer);
      const tx = await router.swapExactTokensForTokens(
        ethers.parseEther("10"),
        0,
        [tokenAAddress, tokenBAddress],
        account
      );
      await tx.wait();
      console.log("Swap effectué :", tx.hash);
    } catch (error) {
      console.error("Erreur lors du swap de tokens :", error);
    }
  };

  const stakeTokens = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const staking = new ethers.Contract(stakingAddress, StakingABI.abi, signer);
      const tx = await staking.stake(ethers.parseEther("10"));
      await tx.wait();
      console.log("Tokens stakés :", tx.hash);
    } catch (error) {
      console.error("Erreur lors du staking des tokens :", error);
    }
  };

  const withdrawFromLock = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const lock = new ethers.Contract(lockAddress, LockABI.abi, signer);
      const tx = await lock.withdraw();
      await tx.wait();
      console.log("Retrait effectué du contrat Lock :", tx.hash);
    } catch (error) {
      console.error("Erreur lors du retrait du contrat Lock :", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #1e1e1e, #121212)",
        color: "#ffffff",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        marginTop: "50px",
      }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#2c2c2c",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        }}
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "1rem" }}
        >
          Interface DEX
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ textAlign: "center", marginBottom: "2rem" }}
        >
          Compte connecté : {account || "Non connecté"}
        </motion.p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectWallet}
            style={{
              padding: "0.75rem",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Connecter le portefeuille
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addLiquidity}
            disabled={!account}
            style={{
              padding: "0.75rem",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: account ? "pointer" : "not-allowed",
              opacity: account ? 1 : 0.6,
            }}
          >
            Ajouter de la liquidité
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={swapTokens}
            disabled={!account}
            style={{
              padding: "0.75rem",
              backgroundColor: "#ffc107",
              color: "#212529",
              border: "none",
              borderRadius: "4px",
              cursor: account ? "pointer" : "not-allowed",
              opacity: account ? 1 : 0.6,
            }}
          >
            Swapper des tokens
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stakeTokens}
            disabled={!account}
            style={{
              padding: "0.75rem",
              backgroundColor: "#6f42c1",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: account ? "pointer" : "not-allowed",
              opacity: account ? 1 : 0.6,
            }}
          >
            Staker des tokens LP
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={withdrawFromLock}
            disabled={!account}
            style={{
              padding: "0.75rem",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: account ? "pointer" : "not-allowed",
              opacity: account ? 1 : 0.6,
            }}
          >
            Retirer du contrat Lock
          </motion.button>
        </div>
      </motion.div>
      <Footer />
    </motion.div>
  );
};

export default App;
