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
          alert(
            "Please switch to Sepolia testnet for this DApp to work properly!",
          );
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

      const tx = await contract.deposit({
        value: ethers.parseEther(depositAmount),
      });
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
        value: ethers.parseEther(withdrawAmount),
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

  // Copy address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Address copied to clipboard!");
  };

  // Landing page when wallet is not connected
  if (!account) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fff7ed 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        {/* Header */}
        <div style={{
          background: "white",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          borderBottom: "1px solid #f3f4f6"
        }}>
          <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #009fff, #0984e3)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px"
              }}>
                <span style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}>🏦</span>
              </div>
              <span style={{ fontSize: "28px", fontWeight: "bold", color: "#111827" }}>SepoliaBank</span>
            </div>
            <button
              onClick={connectWallet}
              style={{
                background: "#009fff",
                color: "white",
                padding: "12px 24px",
                borderRadius: "25px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "#0984e3"}
              onMouseLeave={(e) => e.target.style.background = "#009fff"}
            >
              Connect Wallet
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 24px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "48px",
            alignItems: "center"
          }}>
            {/* Left Content */}
            <div>
              <p style={{
                color: "#009fff",
                fontWeight: "600",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "16px"
              }}>
                WELCOME TO OUR BANK
              </p>
              <h1 style={{
                fontSize: "clamp(32px, 5vw, 64px)",
                fontWeight: "bold",
                color: "#111827",
                lineHeight: "1.1",
                marginBottom: "24px"
              }}>
                Professional Digital Banking
                <br />
                <span style={{ color: "#009fff" }}>on Sepolia Testnet</span>
              </h1>
              <p style={{
                fontSize: "18px",
                color: "#6b7280",
                marginBottom: "32px",
                lineHeight: "1.6"
              }}>
                SepoliaBank takes pride in providing you with cutting-edge digital banking solutions that cater to your financial needs on the Sepolia testnet.
              </p>
              <button
                onClick={connectWallet}
                style={{
                  background: "#009fff",
                  color: "white",
                  padding: "16px 32px",
                  borderRadius: "25px",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 10px 25px rgba(0, 159, 255, 0.3)",
                  transition: "all 0.3s ease",
                  transform: "scale(1)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#0984e3";
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 15px 35px rgba(0, 159, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#009fff";
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 10px 25px rgba(0, 159, 255, 0.3)";
                }}
              >
                Get Started
              </button>

              {/* Stats */}
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginTop: "48px", 
                gap: "32px",
                flexWrap: "wrap"
              }}>
                <div style={{ display: "flex", alignItems: "center", minWidth: "150px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    background: "#2563eb",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px"
                  }}>
                    <span style={{ fontSize: "24px" }}>🛡️</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", margin: "0" }}>PKR 1M+</p>
                    <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Secured</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", minWidth: "150px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    background: "#059669",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px"
                  }}>
                    <span style={{ fontSize: "24px" }}>👥</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", margin: "0" }}>100+</p>
                    <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Banking Visual */}
            <div style={{ position: "relative", textAlign: "center" }}>
              <div style={{
                position: "relative",
                zIndex: "10",
                maxWidth: "400px",
                margin: "0 auto"
              }}>
                <div style={{
                  width: "100%",
                  height: "500px",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, #009fff 0%, #0984e3 100%)",
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "600",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <span style={{ fontSize: "64px" }}>🏦</span>
                  <span>SepoliaBank</span>
                </div>
              </div>
              <div style={{
                position: "absolute",
                top: "32px",
                right: "-16px",
                width: "256px",
                height: "384px",
                background: "linear-gradient(135deg, #bfdbfe, #93c5fd)",
                borderRadius: "50%",
                opacity: "0.2",
                zIndex: "1",
                pointerEvents: "none"
              }}></div>
              <div style={{
                position: "absolute",
                bottom: "-16px",
                left: "-16px",
                width: "192px",
                height: "192px",
                background: "linear-gradient(135deg, #fed7aa, #fdba74)",
                borderRadius: "50%",
                opacity: "0.3",
                zIndex: "1",
                pointerEvents: "none"
              }}></div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div style={{
          background: "#f9fafb",
          padding: "80px 0"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <p style={{
                color: "#009fff",
                fontWeight: "600",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "16px"
              }}>
                — PROCESS
              </p>
              <h2 style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: "bold",
                color: "#111827",
                margin: "0"
              }}>
                How it works
              </h2>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "32px"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  background: "#009fff",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: "bold",
                  margin: "0 auto 24px auto"
                }}>
                  1
                </div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "16px"
                }}>
                  Connect MetaMask
                </h3>
                <p style={{ color: "#6b7280", fontSize: "16px", lineHeight: "1.5" }}>
                  Connect your MetaMask wallet to get started with SepoliaBank
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  background: "#009fff",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: "bold",
                  margin: "0 auto 24px auto"
                }}>
                  2
                </div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "16px"
                }}>
                  Deposit Funds
                </h3>
                <p style={{ color: "#6b7280", fontSize: "16px", lineHeight: "1.5" }}>
                  Transfer SepoliaETH to your savings account for secure storage
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  background: "#009fff",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: "bold",
                  margin: "0 auto 24px auto"
                }}>
                  3
                </div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "16px"
                }}>
                  Send & Manage
                </h3>
                <p style={{ color: "#6b7280", fontSize: "16px", lineHeight: "1.5" }}>
                  Send money and manage your crypto assets with our banking interface
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: "bold",
              color: "#111827",
              marginBottom: "16px"
            }}>
              Banking Features
            </h2>
            <p style={{ fontSize: "18px", color: "#6b7280" }}>
              Everything you need for digital banking on Sepolia
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px"
          }}>
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              textAlign: "center"
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                background: "linear-gradient(135deg, #009fff, #0984e3)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto"
              }}>
                <span style={{ fontSize: "32px" }}>💰</span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
                Secure Savings
              </h3>
              <p style={{ color: "#6b7280", lineHeight: "1.5" }}>
                Store your SepoliaETH safely in our smart contract-based savings account
              </p>
            </div>

            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              textAlign: "center"
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                background: "linear-gradient(135deg, #00b894, #00cec9)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto"
              }}>
                <span style={{ fontSize: "32px" }}>📤</span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
                Instant Transfers
              </h3>
              <p style={{ color: "#6b7280", lineHeight: "1.5" }}>
                Send SepoliaETH to any address instantly with low fees
              </p>
            </div>

            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              textAlign: "center"
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                background: "linear-gradient(135deg, #fdcb6e, #e17055)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto"
              }}>
                <span style={{ fontSize: "32px" }}>📊</span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
                Real-time Balance
              </h3>
              <p style={{ color: "#6b7280", lineHeight: "1.5" }}>
                Monitor your wallet and savings balance in real-time
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#009fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "20px 0",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "700",
              margin: "0",
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              letterSpacing: "-0.02em",
            }}
          >
            🏦 SepoliaBank
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "rgba(255, 255, 255, 0.9)",
              margin: "8px 0 0 0",
              fontWeight: "300",
            }}
          >
            Professional Digital Banking on Sepolia Testnet
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Alerts */}
        {CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS" && (
          <div
            style={{
              background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
              border: "none",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(255, 107, 107, 0.3)",
            }}
          >
            <p
              style={{
                color: "white",
                fontWeight: "600",
                margin: "0 0 8px 0",
                fontSize: "1.1rem",
              }}
            >
              ⚠️ Contract Configuration Required
            </p>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                margin: "0",
                lineHeight: "1.5",
              }}
            >
              Please update CONTRACT_ADDRESS in App.jsx with your deployed
              contract address.
            </p>
          </div>
        )}

        {network && !isSepoliaNetwork && (
          <div
            style={{
              background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
              border: "none",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(255, 107, 107, 0.3)",
            }}
          >
            <p
              style={{
                color: "white",
                fontWeight: "600",
                margin: "0 0 8px 0",
                fontSize: "1.1rem",
              }}
            >
              🚨 Network Mismatch
            </p>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                margin: "0",
                lineHeight: "1.5",
              }}
            >
              Connected to {network.name} (Chain ID:{" "}
              {network.chainId.toString()}). Please switch to Sepolia testnet.
            </p>
          </div>
        )}

        {network && isSepoliaNetwork && (
          <div
            style={{
              background: "linear-gradient(135deg, #00b894, #00cec9)",
              border: "none",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(0, 184, 148, 0.3)",
            }}
          >
            <p
              style={{
                color: "white",
                fontWeight: "600",
                margin: "0 0 4px 0",
                fontSize: "1.1rem",
              }}
            >
              ✅ Connected to Sepolia Testnet
            </p>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                margin: "0",
                fontSize: "0.95rem",
              }}
            >
              Chain ID: {network.chainId.toString()}
            </p>
          </div>
        )}

        {/* Connect Wallet Button */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <button
            onClick={connectWallet}
            style={{
              padding: "16px 32px",
              background: account
                ? "linear-gradient(135deg, #00b894, #00cec9)"
                : "linear-gradient(135deg, #74b9ff, #0984e3)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "1.1rem",
              fontWeight: "600",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
              minWidth: "280px",
            }}
          >
            {account
              ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
              : "Connect MetaMask Wallet"}
          </button>
        </div>

        {account && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            {/* Account Balance Card */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #74b9ff, #0984e3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "16px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>💰</span>
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0",
                      color: "#2d3436",
                      fontSize: "1.25rem",
                      fontWeight: "600",
                    }}
                  >
                    Wallet Balance
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#636e72",
                      fontSize: "0.9rem",
                    }}
                  >
                    Available funds
                  </p>
                </div>
              </div>
              <p
                style={{
                  fontSize: "2.5rem",
                  margin: "0",
                  fontWeight: "700",
                  color: "#2d3436",
                  lineHeight: "1.2",
                }}
              >
                {parseFloat(walletBalance).toFixed(6)}
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  margin: "8px 0 20px 0",
                  color: "#74b9ff",
                  fontWeight: "500",
                }}
              >
                SepoliaETH
              </p>
              <button
                onClick={getWalletBalance}
                style={{
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
              >
                🔄 Refresh Balance
              </button>
            </div>

            {/* Savings Account Card */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #00b894, #00cec9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "16px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>🏦</span>
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0",
                      color: "#2d3436",
                      fontSize: "1.25rem",
                      fontWeight: "600",
                    }}
                  >
                    Savings Account
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#636e72",
                      fontSize: "0.9rem",
                    }}
                  >
                    Contract deposits
                  </p>
                </div>
              </div>
              <p
                style={{
                  fontSize: "2.5rem",
                  margin: "0",
                  fontWeight: "700",
                  color: "#2d3436",
                  lineHeight: "1.2",
                }}
              >
                {parseFloat(balance).toFixed(6)}
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  margin: "8px 0 20px 0",
                  color: "#00b894",
                  fontWeight: "500",
                }}
              >
                SepoliaETH
              </p>
              <button
                onClick={getBalance}
                style={{
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
              >
                🔄 Refresh Savings
              </button>
            </div>
          </div>
        )}

        {account && (
          <>
            {/* Receiving Address Card */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                padding: "32px",
                marginBottom: "32px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #fdcb6e, #e17055)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "16px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>📥</span>
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0",
                      color: "#2d3436",
                      fontSize: "1.25rem",
                      fontWeight: "600",
                    }}
                  >
                    Your Receiving Address
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#636e72",
                      fontSize: "0.9rem",
                    }}
                  >
                    Share this address to receive payments
                  </p>
                </div>
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #e9ecef",
                  wordBreak: "break-all",
                  fontSize: "1rem",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  color: "#495057",
                  marginBottom: "20px",
                }}
              >
                {account}
              </div>
              <button
                onClick={() => copyToClipboard(account)}
                style={{
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #fdcb6e, #e17055)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 16px rgba(253, 203, 110, 0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                📋 Copy Address
              </button>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "40px",
              }}
            >
              <button
                onClick={() => setShowDepositModal(true)}
                style={{
                  padding: "24px",
                  background: "linear-gradient(135deg, #00b894, #00cec9)",
                  color: "white",
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  boxShadow: "0 8px 32px rgba(0, 184, 148, 0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                💰 Deposit to Savings
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                style={{
                  padding: "24px",
                  background: "linear-gradient(135deg, #ff7675, #e84393)",
                  color: "white",
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  boxShadow: "0 8px 32px rgba(255, 118, 117, 0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                📤 Send Money
              </button>
            </div>
          </>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(10px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "1000",
            padding: "20px",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))",
              padding: "48px",
              borderRadius: "28px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #00b894, #00cec9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "16px",
                }}
              >
                <span style={{ fontSize: "28px" }}>💰</span>
              </div>
              <div>
                <h3
                  style={{
                    margin: "0",
                    color: "#e2e8f0",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                  }}
                >
                  Deposit to Savings
                </h3>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#94a3b8",
                    fontSize: "1rem",
                  }}
                >
                  Move ETH to your savings account
                </p>
              </div>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontWeight: "600",
                  color: "#e2e8f0",
                  fontSize: "1rem",
                }}
              >
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
                  padding: "16px",
                  border: "2px solid rgba(31, 41, 55, 0.5)",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s ease",
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "rgba(0, 0, 0, 0.2)",
                  color: "#e2e8f0",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <button
                onClick={() => setShowDepositModal(false)}
                style={{
                  flex: "1",
                  padding: "16px",
                  background: "#475569",
                  color: "#cbd5e1",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
              >
                Cancel
              </button>
              <button
                onClick={deposit}
                style={{
                  flex: "1",
                  padding: "16px",
                  background: "linear-gradient(135deg, #00b894, #00cec9)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 16px rgba(0, 184, 148, 0.3)",
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
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(10px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "1000",
            padding: "20px",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))",
              padding: "48px",
              borderRadius: "28px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #ff7675, #e84393)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "16px",
                }}
              >
                <span style={{ fontSize: "28px" }}>📤</span>
              </div>
              <div>
                <h3
                  style={{
                    margin: "0",
                    color: "#e2e8f0",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                  }}
                >
                  Send Money
                </h3>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#94a3b8",
                    fontSize: "1rem",
                  }}
                >
                  Transfer ETH to another address
                </p>
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontWeight: "600",
                  color: "#e2e8f0",
                  fontSize: "1rem",
                }}
              >
                Recipient Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "2px solid rgba(31, 41, 55, 0.5)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "border-color 0.2s ease",
                  background: "rgba(0, 0, 0, 0.2)",
                  color: "#e2e8f0",
                }}
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontWeight: "600",
                  color: "#e2e8f0",
                  fontSize: "1rem",
                }}
              >
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
                  padding: "16px",
                  border: "2px solid rgba(31, 41, 55, 0.5)",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "border-color 0.2s ease",
                  background: "rgba(0, 0, 0, 0.2)",
                  color: "#e2e8f0",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <button
                onClick={() => setShowWithdrawModal(false)}
                style={{
                  flex: "1",
                  padding: "16px",
                  background: "#475569",
                  color: "#cbd5e1",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
              <button
                onClick={withdraw}
                style={{
                  flex: "1",
                  padding: "16px",
                  background: "linear-gradient(135deg, #ff7675, #e84393)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 16px rgba(255, 118, 117, 0.3)",
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
