# LifeGrid - Hospital Bed & Blood Management

LifeGrid is a full-stack application that provides real-time tracking of hospital beds and blood inventory across a network of registered hospitals. It leverages WebSockets for live dashboard updates and writes critical transactions (bed changes, blood issued, hospital approvals) to a local Ethereum blockchain (Hardhat) to maintain a tamper-proof audit ledger.

## Tech Stack
- **Frontend**: React Native (Expo) with custom UI mapped from HTML/CSS prototype.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO.
- **Blockchain**: Solidity, Hardhat, Ethers.js.

## Getting Started

### 1. Database Setup
Ensure you have MongoDB running locally on `mongodb://localhost:27017` or provide a `MONGODB_URI` in `backend/.env`.

### 2. Start the Blockchain (Hardhat Node)
Open a terminal and run:
```bash
cd blockchain
npx hardhat node
```
*Note: The backend is configured with a fallback to MongoDB for the Ledger if the Hardhat node isn't running.*

*(Optional) To deploy the smart contract to your local node, run in another terminal:*
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```
*Take the deployed contract address and update `CONTRACT_ADDRESS` in `backend/src/services/blockchainService.ts` if needed.*

### 3. Start the Backend server
Open a new terminal and run:
```bash
cd backend
npm install
# Seed the database with mock users and hospital data
npm run seed
# Start the backend server
npm run dev
```

### 4. Start the Mobile App (React Native/Expo)
Open a new terminal and run:
```bash
cd mobile
npm install
npm start
```
Use the Expo Go app on your phone, or run on an emulator by pressing `a` (Android) or `i` (iOS) in the terminal.

## Roles & Test Accounts
The database seed script (`npm run seed`) creates the following test accounts (all passwords are `password123`):

- **Super Admin**: `admin@lifegrid.in`
- **Hospital Admin**: `hospital@sahyadri.in`
- **Blood Bank Staff**: `blood@sahyadri.in`
- **Patient**: `patient@lifegrid.in`

Select the correct role tab on the Login Screen before entering credentials!
