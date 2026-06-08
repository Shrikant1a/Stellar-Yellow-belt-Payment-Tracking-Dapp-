🚀 Payment Tracker DApp

A decentralized application (DApp) for sending and tracking blockchain payments with real-time status updates, balance checks, and detailed transaction history.

Built to demonstrate wallet integration, transaction handling, and user-friendly payment tracking on the blockchain.

✨ Features

✅ Connect Wallet
✅ Check Account Balance
✅ Send Payments
✅ Add Optional Memo
✅ Real-Time Transaction Status
✅ Transaction History Feed
✅ Detailed Transaction View
✅ Error Handling (Rejected / Failed / Insufficient Balance)

🧱 Tech Stack

Frontend

    React / Next.js
    TypeScript / JavaScript
    Tailwind / CSS (if applicable)

Blockchain / SDK

    Stellar SDK (@stellar/stellar-sdk)
    Freighter Wallet Integration (@stellar/freighter-api)
    Stellar Wallets Kit (if used)


📸 Application Overview

Wallet & Balance
      Connect blockchain wallet
      Display public address
      Fetch live balance

Send Payment
    Enter destination address
    Enter payment amount
    Add optional memo
    Submit transaction

Transactions Feed
    View previous payments
    Monitor statuses
    Inspect transaction details

⚙️ Installation & Setup
1️⃣ Clone Repository

                git clone https://github.com/your-username/your-repo-name.git
                cd your-repo-name

2️⃣ Install Dependencies

                npm install
or

                yarn install

3️⃣ Run Development Server

                npm run dev


🔑 Wallet Requirements

This application requires a compatible Stellar wallet:

  Freighter Wallet (Recommended)

Install Freighter:

https://freighter.app


🌐 Network Configuration

Ensure the app is configured for the correct network:
Stellar Testnet (Recommended for development)

Example configuration:
    Network: TESTNET
   Horizon Server: https://horizon-testnet.stellar.org


🚨 Error Handling

The DApp gracefully handles:
Wallet not installed
Wallet access denied
Insufficient balance
Transaction rejection
Network failures

📂 Project Structure (Example)

/src
  /components
  /lib
  /utils
/app
/public


🎯 Learning Objectives

This project demonstrates:

✅ Wallet Integration
✅ Blockchain Transactions
✅ State Management
✅ Real-Time UI Updates
✅ Error Handling Patterns
✅ Clean UI/UX Design


📜 License

MIT License – Free to use and modify


👨‍💻 Author

Your Name
GitHub: https://github.com/Shrikant1a







