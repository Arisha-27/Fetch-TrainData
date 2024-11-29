const { ethers } = require("ethers");
const provider = require("./provider");

// Helper function to add a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to fetch a transaction with retries
const fetchWithRetries = async (fetchFn, retries = 3, delayMs = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Retrying (${attempt}/${retries}) due to error:`, error.message);
        await delay(delayMs);
      } else {
        console.error("Max retries reached. Skipping transaction.");
        throw error; // Rethrow the error if all retries fail
      }
    }
  }
};

// Main function to fetch transactions
const fetchTransactions = async (blockCount = 1) => {
  try {
    const latestBlockNumber = await provider.getBlockNumber();
    const transactions = [];

    for (let i = 0; i < blockCount; i++) {
      const blockNumber = latestBlockNumber - i;
      console.log(`Fetching Block ${blockNumber}...`);

      const block = await fetchWithRetries(() => provider.getBlock(blockNumber));

      if (block && block.transactions.length > 0) {
        console.log(`Block ${blockNumber} has ${block.transactions.length} transactions`);

        for (const txHash of block.transactions) {
          try {
            const tx = await fetchWithRetries(() => provider.getTransaction(txHash));

            if (tx && tx.from && tx.to && tx.value) {
              const etherValue = ethers.formatEther(tx.value);

              transactions.push({
                from: tx.from,
                to: tx.to,
                value: etherValue,
                hash: tx.hash,
              });

              console.log(`Transaction: ${tx.hash}`);
              console.log(`From: ${tx.from}`);
              console.log(`To: ${tx.to}`);
              console.log(`Value: ${etherValue} ETH`);
            } else {
              console.log(`Transaction ${txHash} does not have complete details.`);
            }
          } catch (txError) {
            console.error(`Error fetching transaction ${txHash}:`, txError.message);
          }
        }
      } else {
        console.log(`No transactions found in block ${blockNumber}`);
      }

      // Add a delay between blocks to avoid overwhelming the provider
      await delay(1000); // 1-second delay
    }

    console.log("Filtered Transactions:", transactions); // Valid transactions
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

module.exports = fetchTransactions;
