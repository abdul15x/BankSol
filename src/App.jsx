
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
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [network, setNetwork] = useState(null);
  const [isSepoliaNetwork, setIsSepoliaNetwork] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

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

        // Auto-refresh balances
        await getBalance();
        await getWalletBalance();
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  // Deposit (to contract)
  async function deposit() {
    if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS") {
      alert("Please update the CONTRACT_ADDRESS in App.jsx with your deployed contract address");
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
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SimpleBankABI, signer);

      const tx = await contract.deposit({ value: ethers.parseEther(depositAmount) });
      await tx.wait();
      setDepositAmount("");
      setShowDepositModal(false);
      await getBalance();
      await getWalletBalance();
      alert("Deposit successful!");
    } catch (error) {
      console.error("Error depositing:", error);
      alert("Error depositing: " + error.message);
    }
  }

  // Withdraw (send to external address)
  async function withdraw() {
    if (!window.ethereum) return;
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please enter a valid withdrawal amount");
      return;
    }
    if (!withdrawAddress || !ethers.isAddress(withdrawAddress)) {
      alert("Please enter a valid Ethereum address");
      return;
    }
    if (parseFloat(withdrawAmount) > parseFloat(walletBalance)) {
      alert("Insufficient wallet balance");
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Send ETH directly to the specified address
      const tx = await signer.sendTransaction({
        to: withdrawAddress,
        value: ethers.parseEther(withdrawAmount)
      });
      
      await tx.wait();
      setWithdrawAmount("");
      setWithdrawAddress("");
      setShowWithdrawModal(false);
      await getWalletBalance();
      alert(`Successfully sent ${withdrawAmount} ETH to ${withdrawAddress}`);
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Error withdrawing: " + error.message);
    }
  }

  // Get contract balance
  async function getBalance() {
    if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS") return;
    if (!window.ethereum || !account) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SimpleBankABI, provider);
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

  // Copy address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Address copied to clipboard!");
  };

  return (
    <div style={{ padding: "24px", textAlign: "center", fontFamily: "Arial, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "30px", color: "#1e293b" }}>
        🏦 SepoliaBank
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: "30px" }}>
        Your secure Sepolia testnet banking application
      </p>

      {CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS" && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", marginBottom: "20px" }}>
          <p style={{ color: "#dc2626", fontWeight: "bold" }}>⚠️ Contract address not set!</p>
          <p style={{ color: "#7f1d1d" }}>Please update CONTRACT_ADDRESS in App.jsx with your deployed contract address.</p>
        </div>
      )}

      {network && !isSepoliaNetwork && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", marginBottom: "20px" }}>
          <p style={{ color: "#dc2626", fontWeight: "bold" }}>🚨 Wrong Network!</p>
          <p style={{ color: "#7f1d1d" }}>
            You're connected to {network.name} (Chain ID: {network.chainId.toString()}).
            Please switch to Sepolia testnet to use this DApp.
          </p>
        </div>
      )}

      {network && isSepoliaNetwork && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "16px", marginBottom: "20px" }}>
          <p style={{ color: "#16a34a", fontWeight: "bold" }}>✅ Connected to Sepolia Testnet</p>
          <p style={{ color: "#15803d" }}>Chain ID: {network.chainId.toString()}</p>
        </div>
      )}

      <button
        onClick={connectWallet}
        style={{
          margin: "8px",
          padding: "15px 30px",
          backgroundColor: account ? "#10b981" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "bold",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}
      >
        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button>

      {account && (
        <div style={{ maxWidth: "600px", margin: "40px auto", display: "grid", gap: "20px" }}>
          
          {/* Account Balance Card */}
          <div style={{ 
            padding: "25px", 
            backgroundColor: "white", 
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
          }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#1e293b", fontSize: "1.3rem" }}>💰 Account Balance</h3>
            <p style={{ fontSize: "2rem", margin: "10px 0", fontWeight: "bold", color: "#0f172a" }}>
              {parseFloat(walletBalance).toFixed(6)} SepoliaETH
            </p>
            <button
              onClick={getWalletBalance}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                marginTop: "10px"
              }}
            >
              🔄 Refresh Balance
            </button>
          </div>

          {/* Receiving Address Card */}
          <div style={{ 
            padding: "25px", 
            backgroundColor: "white", 
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
          }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#059669", fontSize: "1.3rem" }}>📥 Your Receiving Address</h3>
            <div style={{ 
              backgroundColor: "#f0fdf4", 
              padding: "15px", 
              borderRadius: "8px", 
              border: "1px solid #bbf7d0",
              wordBreak: "break-all",
              fontSize: "14px",
              fontFamily: "monospace"
            }}>
              {account}
            </div>
            <button
              onClick={() => copyToClipboard(account)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                marginTop: "15px",
                fontWeight: "bold"
              }}
            >
              📋 Copy Address
            </button>
            <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "10px" }}>
              Share this address to receive SepoliaETH deposits
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "20px" }}>
            <button
              onClick={() => setShowDepositModal(true)}
              style={{
                padding: "20px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}
            >
              💰 Deposit to Savings
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              style={{
                padding: "20px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}
            >
              📤 Send Money
            </button>
          </div>

          {/* Contract Savings Balance */}
          <div style={{ 
            padding: "25px", 
            backgroundColor: "white", 
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
          }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#0369a1", fontSize: "1.3rem" }}>🏦 Savings Account</h3>
            <p style={{ fontSize: "1.8rem", margin: "10px 0", fontWeight: "bold", color: "#0c4a6e" }}>
              {parseFloat(balance).toFixed(6)} SepoliaETH
            </p>
            <button
              onClick={getBalance}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                marginTop: "10px"
              }}
            >
              🔄 Refresh Savings
            </button>
            <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "10px" }}>
              ETH deposited in your savings contract
            </p>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "1000"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "400px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#10b981", fontSize: "1.5rem" }}>💰 Deposit to Savings</h3>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              Move ETH from your wallet to your savings account
            </p>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>
                Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                placeholder="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowDepositModal(false)}
                style={{
                  flex: "1",
                  padding: "12px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Cancel
              </button>
              <button
                onClick={deposit}
                style={{
                  flex: "1",
                  padding: "12px",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "1000"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "400px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#ef4444", fontSize: "1.5rem" }}>📤 Send Money</h3>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              Send ETH from your wallet to another address
            </p>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>
                Recipient Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "monospace"
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>
                Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                placeholder="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowWithdrawModal(false)}
                style={{
                  flex: "1",
                  padding: "12px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Cancel
              </button>
              <button
                onClick={withdraw}
                style={{
                  flex: "1",
                  padding: "12px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
