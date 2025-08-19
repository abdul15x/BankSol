import { useState } from "react";
import { ethers } from "ethers";
import SimpleBankABI from "./SimpleBank.json"; // ABI file

// Replace with your deployed contract address
const contractAddress = "0x5CBa5340C5FF25B820F20B2A2D06C2c1BAed2718";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // connect MetaMask
  async function connectWallet() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } else {
      alert("MetaMask not found. Please install it!");
    }
  }

  // helper: get contract
  function getContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, SimpleBankABI, signer);
  }

  // deposit ETH
  async function deposit() {
    try {
      const contract = getContract();
      const tx = await contract.deposit({ value: ethers.utils.parseEther(depositAmount) });
      await tx.wait();
      alert("Deposit successful!");
      getBalance();
    } catch (err) {
      console.error(err);
      alert("Deposit failed");
    }
  }

  // withdraw ETH
  async function withdraw() {
    try {
      const contract = getContract();
      const tx = await contract.withdraw(ethers.utils.parseEther(withdrawAmount));
      await tx.wait();
      alert("Withdraw successful!");
      getBalance();
    } catch (err) {
      console.error(err);
      alert("Withdraw failed");
    }
  }

  // check balance
  async function getBalance() {
    const contract = getContract();
    const bal = await contract.balance();
    setBalance(ethers.utils.formatEther(bal));
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">💰 SimpleBank DApp</h1>

      {account ? (
        <p className="mb-4">Connected: {account}</p>
      ) : (
        <button
          onClick={connectWallet}
          className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 mb-4"
        >
          Connect MetaMask
        </button>
      )}

      <h2 className="text-2xl mb-4">Your Balance: {balance} ETH</h2>
      <button
        onClick={getBalance}
        className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 mb-6"
      >
        Refresh Balance
      </button>

      {/* Deposit Section */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Amount in ETH"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          className="px-4 py-2 text-black rounded-lg mr-2"
        />
        <button
          onClick={deposit}
          className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600"
        >
          Deposit
        </button>
      </div>

      {/* Withdraw Section */}
      <div>
        <input
          type="text"
          placeholder="Amount in ETH"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="px-4 py-2 text-black rounded-lg mr-2"
        />
        <button
          onClick={withdraw}
          className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

export default App;
