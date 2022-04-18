const { EventListener } = require('./events')

let FarmerEvent = new EventListener();
FarmerEvent.contractEventListener("farmer", "Admin", "agrochannel",
    "Chaincode", "ProduceContract", "addProduceEvent");