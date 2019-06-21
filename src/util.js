const sha256 = require('sha256')

module.exports = {
    
    ProofOfWork: function(previousBlockHash, currentBlockData){
        let nonce = 0;
	    let hash = HashOfBlock(previousBlockHash, currentBlockData, nonce);
	    while (hash.substring(0, 4) !== process.env.COMPLEXITY) {
		    nonce++;
            hash = HashOfBlock(previousBlockHash, currentBlockData, nonce);
            console.log(hash)
	    }
	    return nonce;
    },
    blockHash: function(previousBlockHash,currentBlock,nonce){
       return HashOfBlock(previousBlockHash,currentBlock,nonce)
    }
}

/**
 * Date: 14/12/2018
 * This is utility function for generating the hash of the block
 * Hash is a one way function and its unique for every data
 * @param previousBlockHash is the hash of previous block
 * @param currentBlock is the data of current blokc
 * @param nonce implies a pseduo-nonRepetable-complex number
 */
const HashOfBlock = function(previousBlockHash,currentBlock,nonce){  
    const dataAsString = previousBlockHash+ nonce+ JSON.stringify(currentBlock)
    return sha256(dataAsString)
}