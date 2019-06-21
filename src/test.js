const Blockchain = require('./lib');

const bc = new Blockchain()

const previousBlockHash = "asdsafsafa!!@2";
const currentBlockData = [
    {
        amount:100,
        sender: "sender",
		recipient: "recipient",
    },
    {
        amount:200,
        sender: "sender1",
		recipient: "recipient2",
    }
]
let data = bc.proofOfWork(previousBlockHash,currentBlockData)

console.log(data)