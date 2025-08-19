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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    }
  }

  // Deposit
  async function deposit() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SimpleBankABI, signer);

    const tx = await contract.deposit({ value: ethers.parseEther("0.01") });
    await tx.wait();
    getBalance();
  }

  // Withdraw
  async function withdraw() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SimpleBankABI, signer);

    const tx = await contract.withdraw(ethers.parseEther("0.005"));
    await tx.wait();
    getBalance();
  }

  // Get balance
  async function getBalance() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SimpleBankABI, provider);

    const bal = await contract.balance();
    setBalance(ethers.formatEther(bal));
  }

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold">💰 SimpleBank DApp</h1>
      <button onClick={connectWallet} className="m-2 p-2 bg-blue-500 text-white rounded">
        {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
      </button>
      <div className="m-4">
        <button onClick={deposit} className="m-2 p-2 bg-green-500 text-white rounded">Deposit 0.01 ETH</button>
        <button onClick={withdraw} className="m-2 p-2 bg-red-500 text-white rounded">Withdraw 0.005 ETH</button>
        <button onClick={getBalance} className="m-2 p-2 bg-gray-500 text-white rounded">Check Balance</button>
      </div>
      <p className="text-lg">Balance: {balance} ETH</p>
    </div>
  );
}

export default App;
