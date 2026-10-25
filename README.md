# BankSol

A React + Vite dApp for a simple Ethereum banking flow on the Sepolia test network. The project connects to a wallet, checks balances, deposits ETH into a smart contract-based savings account, and sends ETH to another address.

## Overview

BankSol is a frontend prototype for digital banking interactions on Ethereum. It uses MetaMask (or a compatible wallet) to connect to a wallet, detect the active network, and call a deployed `SimpleBank` smart contract through `ethers.js`.

This project is a demonstration app rather than a production-grade banking platform. It focuses on the client-side interaction layer and the end-user flow for wallet connection, balance display, deposit, and withdrawal operations.

## Features

- Connect wallet with MetaMask
- Detect and validate Sepolia network usage
- Display connected wallet balance
- Display contract savings balance
- Deposit ETH into the smart contract account
- Withdraw ETH to a recipient address
- Simple responsive banking-style UI
- Vite-based frontend setup with React
- GitHub Pages deployment support

## Tech Stack

- React
- Vite
- JavaScript
- ethers.js
- Ethereum smart contract ABI
- MetaMask wallet integration
- GitHub Pages deployment via `gh-pages`

## Prerequisites

Before running the project, make sure you have:

- Node.js 18 or later
- npm
- MetaMask or a compatible browser wallet
- A deployed Solidity smart contract compatible with the app ABI
- Sepolia testnet configured in your wallet

## Project Structure

```text
BankSol/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── App.jsx
│   ├── contracts/
│   │   └── SimpleBank.json
│   ├── index.css
│   ├── main.jsx
│   └── ...
├── .gitignore
├── .replit
├── package-lock.json
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/abdul15x/BankSol.git
cd BankSol
```

Install dependencies:

```bash
npm install
```

## Running the App

Start the development server:

```bash
npm run dev
```

Then open the local Vite URL in the browser, typically:

```text
http://localhost:5173
```

## Build

Create a production build:

```bash
npm run build
```

Preview the build locally:

```bash
npm run preview
```

## Deployment

The project includes a deployment script for GitHub Pages:

```bash
npm run deploy
```

This uses `gh-pages` to publish the built app from the `dist` directory.

## Smart Contract Integration

The application imports the contract ABI from:

```text
src/contracts/SimpleBank.json
```

and interacts with a deployed contract address defined in `src/App.jsx`:

```js
const CONTRACT_ADDRESS = "0x5CBa5340C5FF25B820F20B2A2D06C2c1BAed2718";
```

The app calls methods such as:

- `deposit()`
- `balance()`
- wallet transfer via signer transaction flow

## How It Works

1. User connects MetaMask.
2. The app checks the active network and warns if it is not Sepolia.
3. The wallet balance is fetched from the connected account.
4. The user deposits ETH into the contract through a deposit modal.
5. The UI refreshes the savings balance after confirmation.
6. The user can send ETH to another wallet address.

## Important Notes

- This app is designed for the Sepolia test network.
- The smart contract address must match a valid deployed contract for the app to work correctly.
- It is a front-end prototype and not a complete financial system with production-grade security, custody, or compliance controls.
- Do not use real funds in this app.

## License

No explicit license file was found in the repository. If you intend to distribute the project publicly, consider adding a proper license file.

## Contributing

Pull requests and improvements are welcome, especially around:

- contract integration cleanup
- wallet/network validation improvements
- UX refinements
- error handling
- deployment setup
