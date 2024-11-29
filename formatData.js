const formatTransactionData = (transactions) => {
  return transactions.map((tx) => ({
    sender: tx.from,
    recipient: tx.to,
    amount: tx.value,
    transactionHash: tx.hash,
  }));
};

module.exports = { formatTransactionData };
