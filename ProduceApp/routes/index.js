var express = require('express');
var router = express.Router();
const {clientApplication} = require('./client');
const {Events} = require('./events')
let eventClient = new Events()
eventClient.contractEventListner("farmer", "Admin", "agrochannel",
"Chaincode", "ProduceContract", "addProduceEvent")

/* GET home page. */
router.get('/', function(req, res, next) {
  farmerClient = new clientApplication();
 
  farmerClient.generatedAndEvaluateTxn(
      "farmer",
      "Admin",
      "agrochannel", 
      "Chaincode",
      "ProduceContract",
      "queryAllProduces"
  )
  .then(produces => {
    const dataBuffer = produces.toString();
    // console.log("produces are ", produces.toString())
    const value = JSON.parse(dataBuffer)
    // console.log("History DataBuffer is",value)
    res.render('index', { title: 'Agricultural Consortium', itemList: value});
  }).catch(err => {
    res.render("error", {
      message: `Some error occured`,
      callingScreen: "error",
    })
  })
});

router.get('/event', function(req, res, next) {
  console.log("Event Response %%%$$^^$%%$",eventClient.getEvents().toString())
  var event = eventClient.getEvents().toString()
  res.send({carEvent: event})
  // .then(array => {
  //   console.log("Value is #####", array)
  //   res.send(array);
  // }).catch(err => {
  //   console.log("errors are ", err)
  //   res.send(err)
  // })
  // res.render('index', { title: 'Dealer Dashboard' });
});

router.get('/farmer', function(req, res, next) {
  let farmerClient = new clientApplication();
 
  farmerClient.generatedAndEvaluateTxn(
      "farmer",
      "Admin",
      "agrochannel", 
      "Chaincode",
      "ProduceContract",
      "queryAllProduces"
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

  const produceId = req.body.ProductId;
  const produceName = req.body.ProductName;
  const harvestDate = req.body.HarvestDate;
  const bestBefore = req.body.BestBefore;
  const farmName = req.body.Owner;
  const quantity = req.body.Quantity;

  // console.log("Request Object",req)
  let FarmerClient = new clientApplication();
  
  FarmerClient.generatedAndSubmitTxn(
      "farmer",
      "Admin",
      "agrochannel", 
      "Chaincode",
      "ProduceContract",
      "createProduce",
      produceId,produceName,harvestDate,bestBefore,farmName,quantity
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

router.post('/farmread',async function(req,res){
  const Id = req.body.Id;
  console.log(Id)
  let FarmerClient = new clientApplication();
  
  FarmerClient.generatedAndEvaluateTxn( 
    "farmer",
    "Admin",
    "agrochannel", 
    "Chaincode",
    "ProduceContract",
    "readProduce", Id)
    .then(message => {
      
      console.log(message.toString())
      res.status(200).send({ Producedata : message.toString() });
    }).catch(error =>{
     
      res.status(500).send({error:`Failed to Show`,message:`${error}`})
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



 router.get('/addCarEvent', async function(req, res, next) {
  let mvdClient = new clientApplication();
  const result = await mvdClient.contractEventListner("manufacturer", "Admin", "autochannel", 
  "KBA-Automobile", "addCarEvent")
  console.log("The result is ####$$$$",result)
  res.render('manufacturer', {view: "carEvents", results: result })
})

 //Find matching orders
 router.get('/matchOrder',async function(req,res){
  const productId = req.query.productId;
 
  let farmerClient = new clientApplication();
  
  farmerClient.generatedAndEvaluateTxn( 
    "farmer",
    "Admin",
    "agrochannel", 
    "Chaincode",
    "ProduceContract",
    "checkMatchingOrders", productId).then(message => {
    console.log("Message response",message)
    var dataBuffer = message.toString();
    console.log(dataBuffer)
    var data =[];
    data.push(dataBuffer,productId)
    console.log("checkMatchingOrders",data)
    const value = JSON.parse(dataBuffer)
    let array = [];
    if(value.length) {
        for (i = 0; i < value.length; i++) {
            array.push({
               "orderId": `${value[i].Key}`,"productId":`${productId}`,
                "productName": `${value[i].Record.productName}`, "quantity":`${value[i].Record.quantity}`, 
                "buyerName": `${value[i].Record.buyerName}`,"assetType": `${value[i].Record.assetType}`
            })
        }
    }
    console.log("Array value is ", array)
    console.log("Car id sent",productId)
    res.render('matchOrder', { itemList: array , title: "Matching Orders"})

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
    "farmer",
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
