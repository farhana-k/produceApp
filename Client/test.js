const {clientApplication} = require('./client')

let FarmerClient = new clientApplication();

FarmerClient.generateAndSubmitTxn(
    "farmer",
    "Admin",
    "agrochannel",
    "Chaincode",
    "ProduceContract",
    "createProduce",
    "001",
    "Apple",
    "10/04/2022",
    "10/05/2022",
    "Agri Corp",
    "2 kg"
).then(message => {
    console.log(message.toString());
})