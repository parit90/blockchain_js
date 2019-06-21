require('dotenv').config()
const express = require('express')
const crypto = require("crypto");
const bodyParser = require('body-parser')
const blockChain = require('./lib')
const {blockHash} = require('./util')
const fetch = require('node-fetch');
const cron = require('node-cron');

const _B = new blockChain()
var nodeKey = crypto.randomBytes(20).toString('hex');

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))



///////////////////////////////////////////////////
//              Transaction-Mining API          //
/////////////////////////////////////////////////
/**
 * Date: 27/12/2018
 * This API exposes the blockchain data to client
 */
app.get('/listing/bchain',function(req,res){
    res.send(_B)
})

/**
 * Date: 27/12/2018
 * This API generate new transaction in the blockchain
 * @param amount to be sent to receiver
 * @param sender address or information `string`
 * @param recipient address or information `string`
 * @param output would be the added transaction index
 */
app.post('/initiate/tx',function(req,res){
    const BIndx = _B.addTransactionToPendingTransaction(req.body)
    res.json({msg:`Transaction will be added in block  ${BIndx}`});
})

/**
 * Date 24/02/2019
 * This API adds the transaction to pending transaction
 */
app.post('/broadcast/transaction', function(req,res){
    let newTransx = _B.generateNewTransaction(req.body.amount, req.body.sender, req.body.recipient)
    _B.addTransactionToPendingTransaction(newTransx);
    let allTransxReq = []
    _B.foreignInstanceURI.forEach(NN => {
        const options = {
            method: 'POST',
            body: JSON.stringify(newTransx),
            headers: { 'Content-Type': 'application/json' },
            json: true 
        }
        allTransxReq.push(fetch(NN+'/initiate/tx', options))
    })
    Promise.all(allTransxReq)
    .then(data =>{
        res.json({"note": "Transaction created and boradcasted successfully"})
    })
})

/**
 * Date: 29/12/2018
 * This API is used fo mining of the block and send some rewards `1 unit` to sender
 * @output would be the new generated block
 */
app.get('/block/mining',function(req,res){
    const previousBlockHash = _B.getLastBlock()['hash'];
    const currentBlockData = {
        transaction: _B.pendingTransactions,
        index: _B.getLastBlock()['hash']+1
    }
    const nonce = _B.proofOfWork(previousBlockHash, currentBlockData)
    const hash = blockHash(previousBlockHash, currentBlockData, nonce)
    
    const newBlock = _B.generateNewBlock(nonce,previousBlockHash,hash)
    //broadcast the newBlock to the other instances in the network
    let requestArr = []
    _B.foreignInstanceURI.forEach(NN=>{
        const option = {
            method: 'POST',
            body: JSON.stringify(newBlock),
            headers: { 'Content-Type': 'application/json' },
            json: true 
        }
        requestArr.push(fetch(NN+'/block/receive', option))
    })

    Promise.all(requestArr)
    .then(data=>{
        // this is reward transaction sent from `sender` -> `owner` of mining node. Here reward is 1 unit
        const senderData = {
            amount: 1, 
            sender:process.env.sender, 
            recipient:nodeKey
        }
        const option = {
            method: 'POST',
            body: JSON.stringify(senderData),
            headers: { 'Content-Type': 'application/json' },
            json: true
        }
       return fetch(_B.localInstanceURI+'/broadcast/transaction', option)
    }).then(data=>{    
        res.json({newBlock: newBlock})
    })
})

/**
 * receive new block
 */
app.post('/block/receive',function(req,res){
    const block = req.body.newBlock
    const previousBlock = _B.getLastBlock()
    const isRightHash = previousBlock.hash === block.previousBlockHash
    
})


///////////////////////////////////////////////////
//              Blockchain-Network               //
//          Replace these API with Kafka        //
/////////////////////////////////////////////////


/**
 * This APi used to form blockchain network
 * register new instance with the running instance
 * @param instanceURI is the IP of newly added instance eg: `http://localhost:8002`
 */
app.post('/register/instance',function(req,res){
    if(_B.localInstanceURI !==  req.body.instanceURI){
        if(!_B.foreignInstanceURI.includes(req.body.instanceURI)){
            _B.foreignInstanceURI.push(req.body.instanceURI)
        }
    }
    res.send('Success Instance Added')
})

/**
 * This API is used to broadcast newly added instance to each other instance in the network
 * Mechanism would be: First send the incoming request URI to each other instances using `fetch-API` and the 
 * other instances register those intanceURI to their network basically in `foreignInstanceURI`
 * Next register all other instance URI with the new instance using `/register/otherInstance/newInstance`
 */
app.post('/register/broadcast/instance',function(req,res){
    try{
        const body = {
            instanceURI: req.body.instanceURI
        }
        /**
         * check if newly instanceURI is already present or not
         */
        if(!_B.foreignInstanceURI.includes(req.body.instanceURI)){
            _B.foreignInstanceURI.push(req.body.instanceURI)
        }
        let allRequest = []
        /**
         * Broadcast each and every other instance in the network that new instance is invoked
         * so that they can copy this newly instantiated instance by using `/register/instance` API 
         */
        _B.foreignInstanceURI.forEach(instanceURI=>{
            const options = {
                method: 'POST',
                body:    JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
                json: true
            }
            //fetch(instanceURI+'/register/instance', options);
            allRequest.push(fetch(instanceURI+'/register/instance', options))
        })
        /**
         * Register all other instance IP to newly Intantiated instance
         * Copy all the `foreignInstanceURI` and take `localInstanceURI` and send it to the new instance 
         * so that it can link with every other instance 
         */
        Promise.all(allRequest).then(data=>{
            const option = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({allIntantiatedInstances: [..._B.foreignInstanceURI, _B.localInstanceURI]}),
                json: true
            }
            return fetch(req.body.instanceURI+ '/register/otherInstance/newInstance', option)
        })
        .then(data=>{
            res.send('Success')
        })
    }catch(err){
        throw err;
    }
    
})

/**
 * This API will push other instanceURI to current instance `foreignInstanceURI`
 */
app.post('/register/otherInstance/newInstance',function(req,res){
    let data = req.body.allIntantiatedInstances
    for(let i=0; i<data.length; i++){
        if(!_B.foreignInstanceURI.includes(data[i]) && _B.localInstanceURI !== data[i]){
            _B.foreignInstanceURI.push(data[i])
        }
    }
    res.send('register otherInstance success')
})


app.listen(process.argv[2], function(){
    console.log(`BlockchainServer listening on port...${process.argv[2]}`)
})


cron.schedule('*/2 * * * *', () => {
    console.log('running a task every minute');
});