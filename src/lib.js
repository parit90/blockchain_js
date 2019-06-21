/**
 * This program mimics `Blockchain Data-Structure` 
 */

"use strict";
const {ProofOfWork, HashOfBlock} = require('./util')
const genesisBlock = require('./genesis.block.json')
const newBlock = require('./createNewBlock')
const newTransaction = require('./newTransaction')

/**
 * Date: 10/12/2018
 * Author: psha
 * This is a constructore method of Blockchain
 * @param chain implies the main linked-list of blocks
 * @param pendingTransactions implies those transaction that are not commited to block
 */
function Blockchain() {
	this.chain = [];
	this.pendingTransactions = [];
	this.Genesis(genesisBlock);
	this.localInstanceURI = process.argv[3];
	this.foreignInstanceURI = [];
};

/**
 * Date: 10/12/2018
 * @param genesisBlock is a json describe in `genesis.block.json` file
 */
Blockchain.prototype.Genesis = function(genesis){
	this.chain.push({
		idx: this.chain.length + 1,
		blockGenerationTime: new Date(),
		transactions: this.pendingTransactions,
		nonce: genesis.nonce,
		hash: genesis.hash,
		previousBlockHash: genesis.genesisBlockHash
	});
}

/**
 * Date: 10/12/2018
 * Author: psha
 * This is inherited method from constructor for creating new block of blockchain
 * @param nonce implies a pseduo-nonRepetable-complex number
 * @param previousBlockHash implies hashed value of (n-1)th block
 * @param hash implies hash value of current block 
 */
Blockchain.prototype.generateNewBlock = function(nonce, previousBlockHash, hash) {
	//return newBlock.createNewBlock(nonce, previousBlockHash, hash, new Blockchain())	
	//createNewBlock: function(nonce, previousBlockHash, hash, _B) {
        const newBlock = {
            idx: this.chain.length + 1,
            blockGenerationTime: new Date(),
            transactions: this.pendingTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash
        };
    
        this.pendingTransactions = [];
        this.chain.push(newBlock);
    
        return newBlock;
   // }
};

/**
 * Date: 12/12/2018
 * This method is used to create new Transaction into the blockchain
 * @param amount you want to send
 * @param sender is the information of sender `address`
 * @param recipient is the information of recipient `recipient`
 * This new transaction will be push in to the array of pending transaction, from there only block will be mined and added to the blockchain 
 */
Blockchain.prototype.generateNewTransaction = function(amount, sender, recipient) {
	return newTransaction.generateNewTransaction(amount, sender, recipient)
};


/**
 * Date: 12/12/2018
 * This is a utility function for querying the last block of the blockchain
 */
Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length - 1];
};

///////////////////////////////////////////
// 				HashBlock              				 //
//////////////////////////////////////////

/**
 * Date 15/12/2018
 * This is util function used for proof of work
 * Mechanism of this function goes like this:
   - this funciton generate hash by calling _proto_ function of Blockchain by passing necessary @params mentioned
   - we are checking that first four `chars` should be `0000` then only that generated hash is valid and the nonce 
   - corresponding to that hash is valid hash, we keep on incrementing the `nonce` until we find the correct hash
   - for time-being the complexity of the hash would be just `0000`, this could be dyanamic  
 */
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	return ProofOfWork(previousBlockHash, currentBlockData)	
};


Blockchain.prototype.addTransactionToPendingTransaction = function(transactionObj){
	this.pendingTransactions.push(transactionObj);
	this.getLastBlock()['idx'] + 1;
}

module.exports = Blockchain;