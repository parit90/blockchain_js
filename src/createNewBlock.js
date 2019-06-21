module.exports = {
    generateNewBlock: function(nonce, previousBlockHash, hash, _B) {
        const newBlock = {
            idx: _B.chain.length + 1,
            timestamp: new Date(),
            transactions: _B.pendingTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash
        };
    
        _B.pendingTransactions = [];
        _B.chain.push(newBlock);
    
        return newBlock;
    }
}

