var express = require('express');
var router = express.Router();
const {clientApplication} = require('./client');
//const {Events} = require('./events')
//let eventClient = new Events()
//eventClient.contractEventListner("manufacturer", "Admin", "autochannel",
//"KBA-Automobile", "CarContract", "addCarEvent")



/* GET home page. */
router.get('/', function(req, res, next) {
  let govtClient = new clientApplication();
 
  govtClient.generatedAndEvaluateTxn(
      "govt",
      "Admin",
      "agrochannel", 
      "Chaincode",
      "ProduceContract",
      "queryAllProduce"
  )
  .then(produces => {
    const dataBuffer = produces.toString();
    console.log("produces are ", produces.toString())
    const value = JSON.parse(dataBuffer)
    console.log("History DataBuffer is",value)
    res.render('index', { title: 'Agricultural Consortium', itemList: value});
  }).catch(err => {
    res.render("error", {
      message: `Some error occured`,
      callingScreen: "error",
    })
  })
});

router.get('/farmer', function(req, res, next) {
  let farmerClient = new clientApplication();
 
  farmerClient.generatedAndEvaluateTxn(
      "farmer",
      "Admin",
      "agrochannel", 
      "Chaincode",
      "ProduceContract",
      "queryAllProduce"
  )
  .then(produces => {
    const dataBuffer = produces.toString();
    console.log("produces are ", produces.toString())
    const value = JSON.parse(dataBuffer)
    console.log("History DataBuffer is",value)
    res.render('farmer', { title: 'Farmer Dashboard', itemList: value});
  }).catch(err => {
    res.render("error", {
      message: `Some error occured`,
      callingScreen: "error",
    })
  })
});

router.get('/buyer', function(req, res, next) {
  res.render('buyer', { title: 'Buyer Dashboard' });
});

router.post('/farmerwrite',function(req,res){

  const vin = req.body.VinNumb;
  const produceName = req.body.ProduceName;
  const harvestDate = req.body.ProduceHarvestDate;
  const bestBefore = req.body.ProduceBestBefore;
  const quantity = req.body.Quantity;
  const flag = req.body.ProduceFlag;

  // console.log("Request Object",req)
  let FarmerClient = new clientApplication();
  
  FarmerClient.generatedAndSubmitTxn(
      "farmer",
      "Admin",
      "agrochannel", 
      "Chaincode",
      "ProduceContract",
      "createProduce",
      vin,produceName,harvestDate,bestBefore,quantity,flag
    ).then(message => {
        console.log("Message is $$$$",message)
        res.status(200).send({message: "Added Product"})
      }
    )
    .catch(error =>{
      console.log("Some error Occured $$$$###", error)
      res.status(500).send({error:`Failed to Add`,message:`${error}`})
    });
});

router.post('/farmerread',async function(req,res){
  const Qvin = req.body.QVinNumb;
  let FarmerClient = new clientApplication();
  
  FarmerClient.generatedAndEvaluateTxn( 
    "farmer",
    "Admin",
    "agrochannel", 
    "Chaincode",
    "ProduceContract",
    "readProduce", Qvin)
    .then(message => {
      
      res.status(200).send({ Producedata : message.toString() });
    }).catch(error =>{
     
      res.status(500).send({error:`Failed to Show`,message:`${error}`})
    });

 })

  //  Get History of a product
 router.get('/itemhistory',async function(req,res){
  const produceId = req.query.produceId;
 
  let buyerClient = new clientApplication();
  
  buyerClient.generatedAndEvaluateTxn( 
    "buyer",
    "Admin",
    "agroochannel", 
    "Chaincode",
    "ProduceContract",
    "getProducesHistory", produceId).then(message => {
    const dataBuffer = message.toString();
    
    const value = JSON.parse(dataBuffer)
    res.render('history', { itemList: value , title: "Product History"})

  });

 })

// Create order
router.post('/createOrder',async function(req,res){
  const orderNumber = req.body.orderNumber;
  const produceName = req.body.produceName;
  const harvestDate = req.body.harvestDate;
  const bestBefore = req.body.bestBefore;
  const quantity = req.body.quantity;
  const buyerName = req.body.buyerName;
  let BuyerClient = new clientApplication();

  const transientData = {
    produceName: Buffer.from(produceName),
    harvestDate: Buffer.from(harvestDate),
    bestBefore: Buffer.from(bestBefore),
    quantity: Buffer.from(quantity),
    buyerName: Buffer.from(buyerName)
  }
  
  BuyerClient.generatedAndSubmitPDC( 
    "buyer",
    "Admin",
    "agrochannel", 
    "Chaincode",
    "OrderContract",
    "createOrder", orderNumber,transientData)
    .then(message => {
      
      res.status(200).send("Successfully created")
    }).catch(error =>{
     
      res.status(500).send({error:`Failed to create`,message:`${error}`})
    });

 })

 router.post('/readOrder',async function(req,res){
  const orderNumber = req.body.orderNumber;
  let BuyerClient = new clientApplication();
  BuyerClient.generatedAndEvaluateTxn( 
    "buyer",
    "Admin",
    "agrochannel", 
    "Chaincode",
    "OrderContract",
    "readOrder", orderNumber).then(message => {
   
    res.send({orderData : message.toString()});
  }).catch(error => {
    alert('Error occured')
  })

 })

  //Get all orders
 router.get('/allOrders',async function(req,res){
  let BuyerClient = new clientApplication();
  BuyerClient.generatedAndEvaluateTxn( 
    "buyer",
    "Admin",
    "agrochannel", 
    "Chaincode",
    "OrderContract",
    "queryAllOrders","").then(message => {
    const dataBuffer = message.toString();
    const value = JSON.parse(dataBuffer);
    res.render('orders', { itemList: value , title: "All Orders"})
    }).catch(error => {
    //alert('Error occured')
    console.log(error)
  })
})



module.exports = router;
