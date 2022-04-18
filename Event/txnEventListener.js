const { EventListener } = require('./events')

let FarmerEvent = new EventListener();
FarmerEvent.txnEventListener("farmer", "Admin", "agrochannel",
    "Chaincode", "ProduceContract", "createProduce",
    "010", "Mango", "12/4/2022", "22/4/2022", "Thottathil Farm", "10 Kg");