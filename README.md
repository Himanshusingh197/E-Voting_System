# SecureVote - Blockchain Integrated E-Voting System

## 1. Introduction
SecureVote is a full-stack, distributed web-based application designed to securely manage elections for college projects and small-to-medium organizations. It leverages modern web technologies along with custom blockchain architecture to ensure that every vote cast is transparent, immutable, and verifiable.

## 2. Problem Statement
Traditional voting systems—both paper-based and digital—suffer from vulnerabilities such as tampering, double voting, and lack of transparency. Voters often lack a verifiable method to confirm if their vote was securely recorded and counted without manipulation. 

## 3. Objective
To build a secure, intuitive, and transparent online voting platform where eligible users can register, view candidates, and cast exactly one vote. A core objective is to integrate an immutable blockchain structure as the ultimate source of truth, ensuring that once a vote is cast, its integrity is cryptographically guaranteed.

## 4. Features List
- **Voter Panel**:
  - Secure registration and login.
  - View real-time election status and verified candidates.
  - Cast a single secure vote (double-voting prevention).
- **Admin Panel**:
  - Centralized dashboard to start, stop, and reset elections.
  - Adding and managing election candidates.
  - Real-time global statistics.
- **Blockchain View / Ledger**:
  - A publicly accessible interface showing all recorded blocks, hashes, and chain integrity status.
- **Result Dashboard**:
  - Live provisional results during the election.
  - Final, unalterable verified results upon election closure.
- **Security**: JWT-based session security and bcrypt password hashing.

## 5. Tools and Technologies Used
- **Frontend**: React.js (Vite), React Router, Vanilla CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Local or Atlas via Mongoose)
- **Security**: JSON Web Tokens (JWT), bcryptjs
- **Blockchain Logic**: Custom implementation using Node.js and `crypto-js` (SHA-256)

## 6. Working Methodology
1. The **Admin** configures the system by dynamically adding candidates and updating the state of the Election to `RUNNING`.
2. A **Voter** authenticates to the system and is presented with a dashboard interface listing valid choices.
3. The Voter casts a vote targeting a candidate. The backend ensures the user has not voted previously and the election is active.
4. The Backend updates the MongoDB documents and simultaneously generates a new **Blockchain Block** containing target information (timestamp, candidate, voter ID, previous hash). 
5. The block is hashed using SHA-256 and appended to the chain. 
6. Anyone can navigate to the `Ledger` to inspect cryptographic proofs. 

## 7. Conclusion
This project successfully demonstrates the viability of utilizing blockchain constraints to establish trustless voting systems. Combining it with a modern MERN-stack environment ensures scalability, speed, and usability without compromising security.

## 8. Future Scope
- Integration of actual Peer-to-Peer (P2P) nodes using WebSockets to distribute the ledger across multiple servers.
- Identity verification mechanisms (like OTPs or biometrics) for voter registration.
- Transitioning the custom monolithic blockchain to a recognized smart-contract network (like Ethereum/Polygon).

---

## Technical Setup Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally on `localhost:27017` or via a remote cluster URI.

### Environment Setup
Create a `.env` file in the `backend/` folder and populate it:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/evoting
JWT_SECRET=supersecretkey_for_evoting_system
```

## Module Explanations
- **Backend Components**: `models` handle the schema for MongoDB. `controllers` parse incoming connections and manage application business logic. The `blockchain` module operates statelessly, maintaining an in-memory linked-list secured by SHA-256. 
- **Frontend Components**: All dynamic actions invoke an API utilizing `axios` wrapped loosely with a React `useContext` for centralized global Session Management.

### Running the Application (Localhost)

**Step 1: Start the Backend & Seed Database**
Open a terminal in the `backend/` folder.
```bash
cd backend
npm install
node utils/seed.js   # Generates the default admin user (admin@evoting.com / admin123)
node server.js       # Starts the REST API on port 5000
```

**Step 2: Start the Frontend**
Open a new terminal session in the `frontend/` folder.
```bash
cd frontend
npm install
npm run dev          # Starts the React application using Vite
```

**Step 3: Usage Flow**
1. Browse to `http://localhost:5173`.
2. Login as Admin using:
   - Email: `admin@evoting.com`
   - Password: `admin123`
3. Add a few candidates from the dashboard.
4. Start the Election.
5. In a new or incognito window, Register a new simple Voter and cast your vote!
