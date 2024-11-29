const { ethers } = require("ethers");
require("dotenv").config();

// Initialize provider with an Ethereum RPC URL from the .env file
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

module.exports = provider;
