const fs = require("fs");
const path = require("path");
const fetchTransactions = require("./fetchTransactions");
const { formatTransactionData } = require("./formatData");
const { exec } = require("child_process");

// Path to the JSON file for saving transactions
const dataDir = path.join(__dirname, "data");
const dataFilePath = path.join(dataDir, "transactions.json");

// Ensure the directory and file exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log("Created 'data' directory.");
}
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([]), "utf8");
  console.log("Initialized 'transactions.json' as an empty array.");
}

// Function to save transactions to JSON file
const saveTransactions = (transactions) => {
  let existingData = [];
  try {
    const fileContent = fs.readFileSync(dataFilePath, "utf8");
    existingData = JSON.parse(fileContent); // Parse existing data
  } catch (error) {
    console.warn("File is empty or invalid. Starting with a new array.");
    existingData = []; // Start with an empty array if parsing fails
  }

  const updatedData = [...existingData, ...transactions];
  fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2), "utf8");
  console.log("Data saved successfully.");
};

// Function to send data to Python script
const sendToPython = (data) => {
  const jsonData = JSON.stringify(data);
  exec(
    `python3 processGraph.py '${jsonData}'`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    }
  );
};

const main = async () => {
  try {
    console.log("Fetching Ethereum Transactions...");
    const transactions = await fetchTransactions(5); // Fetch the last 5 blocks
    const formattedData = formatTransactionData(transactions);

    console.log("Saving Transaction Data...");
    saveTransactions(formattedData);
    console.log("Data saved successfully in 'data/transactions.json'.");

    // Send the formatted transaction data to the Python script for graph processing
    console.log("Sending data to Python script...");
    sendToPython(formattedData);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
