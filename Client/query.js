const {clientApplication} = require('./client')

let FarmerClient = new clientApplication()

FarmerClient.generateAndEvaluateTxn(
    "farmer",
    "Admin",
    "agrochannel",
    "Chaincode",
    "ProduceContract",
    "readProduce",
    "001"
).then(message => {
    console.log(message.toString())
})