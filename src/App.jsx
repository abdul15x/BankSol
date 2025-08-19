import { useState } from "react";
import { ethers } from "ethers";
import SimpleBankABI from "./contracts/SimpleBank.json";

const CONTRACT_ADDRESS = "0x5CBa5340C5FF25B820F20B2A2D06C2c1BAed2718";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [walletBalance, setWalletBalance] = useState("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [network, setNetwork] = useState(null);
  const [isSepoliaNetwork, setIsSepoliaNetwork] = useState(false);

  // Connect wallet
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        
        // Check network
        const network = await provider.getNetwork();
        setNetwork(network);
        const isSepolia = network.chainId === 11155111n; // Sepolia chainId
        setIsSepoliaNetwork(isSepolia);
        
        if (!isSepolia) {
          alert("Please switch to Sepolia testnet for this DApp to work properly!");
        }
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
      alert(
        "Please update the CONTRACT_ADDRESS in App.jsx with your deployed contract address",
      );
      return;
    }
    if (!window.ethereum) return;
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert("Please enter a valid deposit amount");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        SimpleBankABI,
        signer,
      );

      const tx = await contract.deposit({ value: ethers.parseEther(depositAmount) });
      await tx.wait();
      setDepositAmount("");
      getBalance();
      alert("Deposit successful!");
    } catch (error) {
      console.error("Error depositing:", error);
      alert("Error depositing: " + error.message);
    }
  }

  // Withdraw
  async function withdraw() {
    if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS") {
      alert(
        "Please update the CONTRACT_ADDRESS in App.jsx with your deployed contract address",
      );
      return;
    }
    if (!window.ethereum) return;
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please enter a valid withdrawal amount");
      return;
    }
    if (parseFloat(withdrawAmount) > parseFloat(balance)) {
      alert("Insufficient balance");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        SimpleBankABI,
        signer,
      );

      const tx = await contract.withdraw(ethers.parseEther(withdrawAmount));
      await tx.wait();
      setWithdrawAmount("");
      getBalance();
      alert("Withdrawal successful!");
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Error withdrawing: " + error.message);
    }
  }

  // Get contract balance
  async function getBalance() {
    if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS") {
      alert(
        "Please update the CONTRACT_ADDRESS in App.jsx with your deployed contract address",
      );
      return;
    }
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        SimpleBankABI,
        provider,
      );

      const bal = await contract.balance();
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error("Error getting contract balance:", error);
    }
  }

  // Get wallet balance
  async function getWalletBalance() {
    if (!window.ethereum || !account) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account);
      setWalletBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error getting wallet balance:", error);
    }
  }

  return (
    <div
      style={{
        padding: "24px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}
      >
        💰 SimpleBank DApp
      </h1>

      {CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS" && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#dc2626", fontWeight: "bold" }}>
            ⚠️ Contract address not set!
          </p>
          <p style={{ color: "#7f1d1d" }}>
            Please update CONTRACT_ADDRESS in App.jsx with your deployed
            contract address.
          </p>
        </div>
      )}

      {network && !isSepoliaNetwork && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#dc2626", fontWeight: "bold" }}>
            🚨 Wrong Network!
          </p>
          <p style={{ color: "#7f1d1d" }}>
            You're connected to {network.name} (Chain ID: {network.chainId.toString()}).
            Please switch to Sepolia testnet to use this DApp.
          </p>
        </div>
      )}

      {network && isSepoliaNetwork && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#16a34a", fontWeight: "bold" }}>
            ✅ Connected to Sepolia Testnet
          </p>
          <p style={{ color: "#15803d" }}>
            Chain ID: {network.chainId.toString()}
          </p>
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
          fontSize: "16px",
        }}
      >
        {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
      </button>

      <div style={{ margin: "20px 0", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
        {/* Deposit Section */}
        <div style={{ 
          marginBottom: "20px", 
          padding: "20px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "12px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#10b981" }}>💰 Deposit ETH</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="number"
              step="0.001"
              placeholder="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              style={{
                flex: "1",
                padding: "12px",
                border: "2px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
              }}
            />
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>ETH</span>
            <button
              onClick={deposit}
              disabled={!account}
              style={{
                padding: "12px 20px",
                backgroundColor: account ? "#10b981" : "#9ca3af",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: account ? "pointer" : "not-allowed",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Deposit
            </button>
          </div>
        </div>

        {/* Withdraw Section */}
        <div style={{ 
          marginBottom: "20px", 
          padding: "20px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "12px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#ef4444" }}>🏦 Withdraw ETH</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="number"
              step="0.001"
              placeholder="0.005"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              style={{
                flex: "1",
                padding: "12px",
                border: "2px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
              }}
            />
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>ETH</span>
            <button
              onClick={withdraw}
              disabled={!account}
              style={{
                padding: "12px 20px",
                backgroundColor: account ? "#ef4444" : "#9ca3af",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: account ? "pointer" : "not-allowed",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Balance Section */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={getBalance}
            style={{
              flex: "1",
              padding: "12px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            🏦 Refresh Contract Balance
          </button>
          <button
            onClick={getWalletBalance}
            style={{
              flex: "1",
              padding: "12px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            💰 Refresh Wallet Balance
          </button>
        </div>
      </div>

      {/* Wallet Balance */}
      <div style={{ 
        marginTop: "20px", 
        padding: "20px", 
        backgroundColor: "#f0fdf4", 
        borderRadius: "12px",
        border: "2px solid #10b981",
        maxWidth: "400px",
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        <h3 style={{ margin: "0 0 10px 0", color: "#059669" }}>💰 Your Wallet Balance</h3>
        <p style={{ fontSize: "1.5rem", margin: "0", fontWeight: "bold", color: "#065f46" }}>
          {parseFloat(walletBalance).toFixed(10)} SepoliaETH
        </p>
        <p style={{ fontSize: "0.9rem", margin: "5px 0 0 0", color: "#64748b" }}>
          Available in your wallet for transactions
        </p>
      </div>

      {/* Contract Balance */}
      <div style={{ 
        marginTop: "20px", 
        padding: "20px", 
        backgroundColor: "#f0f9ff", 
        borderRadius: "12px",
        border: "2px solid #0ea5e9",
        maxWidth: "400px",
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        <h3 style={{ margin: "0 0 10px 0", color: "#0369a1" }}>🏦 Your Contract Balance</h3>
        <p style={{ fontSize: "1.5rem", margin: "0", fontWeight: "bold", color: "#0c4a6e" }}>
          {parseFloat(balance).toFixed(10)} SepoliaETH
        </p>
        <p style={{ fontSize: "0.9rem", margin: "5px 0 0 0", color: "#64748b" }}>
          Deposited in the SimpleBank contract
        </p>
        {network && (
          <p style={{ fontSize: "0.9rem", margin: "5px 0 0 0", color: "#64748b" }}>
            Network: {network.name} | Chain ID: {network.chainId.toString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
