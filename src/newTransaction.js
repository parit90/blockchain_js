const crypto = require("crypto");

module.exports = {
    generateNewTransaction: function(amount, sender, recipient){
        const newTx = {
		    amount: amount,
		    sender: sender,
		    recipient: recipient,
		    txId: crypto.randomBytes(20).toString('hex')
        };
        return newTx;
    }
}