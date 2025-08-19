import { useState } from "react";
import { ethers } from "ethers";
import SimpleBankABI from "./contracts/SimpleBank.json";

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");

  // Connect wallet
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  // Deposit
  async function deposit() {
    if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS") {
      alert("Please update the CONTRACT_ADDRESS in App.jsx with your deployed contract address");
      return;
    }
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SimpleBankABI, signer);

      const tx = await contract.deposit({ value: ethers.parseEther("0.01") });
      await tx.wait();
      getBalance();
    } catch (error) {
      console.error("Error depositing:", error);
    }
  }

  // Withdraw
  async function withdraw() {
    if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS") {
      alert("Please update the CONTRACT_ADDRESS in App.jsx with your deployed contract address");
      return;
    }
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SimpleBankABI, signer);

      const tx = await contract.withdraw(ethers.parseEther("0.005"));
      await tx.wait();
      getBalance();
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  }

  // Get balance
  async function getBalance() {
    if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS") {
      alert("Please update the CONTRACT_ADDRESS in App.jsx with your deployed contract address");
      return;
    }
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SimpleBankABI, provider);

      const bal = await contract.balance();
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  }

  return (
    <div style={{ padding: "24px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>💰 SimpleBank DApp</h1>
      
      {CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS" && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", marginBottom: "20px" }}>
          <p style={{ color: "#dc2626", fontWeight: "bold" }}>⚠️ Contract address not set!</p>
          <p style={{ color: "#7f1d1d" }}>Please update CONTRACT_ADDRESS in App.jsx with your deployed contract address.</p>
        </div>
      )}
      
      <button 
        onClick={connectWallet} 
        style={{ 
          margin: "8px", 
          padding: "12px 24px", 
          backgroundColor: "#3b82f6", 
          color: "white", 
          border: "none", 
          borderRadius: "8px", 
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
      </button>
      
      <div style={{ margin: "20px 0" }}>
        <button 
          onClick={deposit} 
          style={{ 
            margin: "8px", 
            padding: "12px 24px", 
            backgroundColor: "#10b981", 
            color: "white", 
            border: "none", 
            borderRadius: "8px", 
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Deposit 0.01 ETH
        </button>
        <button 
          onClick={withdraw} 
          style={{ 
            margin: "8px", 
            padding: "12px 24px", 
            backgroundColor: "#ef4444", 
            color: "white", 
            border: "none", 
            borderRadius: "8px", 
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Withdraw 0.005 ETH
        </button>
        <button 
          onClick={getBalance} 
          style={{ 
            margin: "8px", 
            padding: "12px 24px", 
            backgroundColor: "#6b7280", 
            color: "white", 
            border: "none", 
            borderRadius: "8px", 
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Check Balance
        </button>
      </div>
      
      <p style={{ fontSize: "1.25rem", marginTop: "20px" }}>Balance: {balance} ETH</p>
    </div>
  );
}

export default App;
