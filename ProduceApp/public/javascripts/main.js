function swalBasic(data) {
    swal.fire({
        // toast: true,
        icon: `${data.icon}`,
        title: `${data.title}`,
        animation: true,
        position: 'center',
        showConfirmButton: true,
        footer: `${data.footer}`,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', swal.stopTimer)
            toast.addEventListener('mouseleave', swal.resumeTimer)
        }
    })
}

function reloadWindow() {
    window.location.reload();
}

function FarmerWriteData(){
    event.preventDefault();
    const produceId = document.getElementById('produceId').value;
    const produceName = document.getElementById('produceName').value;
    const harvestDate = document.getElementById('harvestDate').value;
    const bestBefore = document.getElementById('bestBefore').value;
    const farmName = document.getElementById('farmName').value;
    const quantity = document.getElementById('quantity').value;
    
    // console.log(vin+make+model+color+dom+flag);

    if (produceId.length==0||produceName.length==0||harvestDate.length==0||bestBefore.length==0||farmName.length==0||quantity.length==0) {
        const data = {
            title: "You might have missed something",
            footer: "Enter all mandatory fields!",
            icon: "warning"
        }
        swalBasic(data);
        }
    else{
        fetch('/farmerwrite',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',              
            },
            body: JSON.stringify({ProductId : produceId, ProductName : produceName, HarvestDate: harvestDate, BestBefore: bestBefore, Owner: farmName, Quantity: quantity})
        })
        .then(function(response){
            if(response.status == 200) {
                const data = {
                    title: "Success",
                    footer: "Added a new product",
                    icon: "success"
                }
                swalBasic(data);
                // window.location.href = '/farmer'
                location.reload(); 
            } else {
                const data = {
                    title: `Product with ID ${produceId} already exists`,
                    footer: "Product ID must be unique",
                    icon: "error"
                }
                swalBasic(data);
            }

        })
        .catch(function(error){
            const data = {
                title: "Error in processing Request",
                footer: "Something went wrong !",
                icon: "error"
            }
            swalBasic(data);
        })    
    }
}


function FarmQueryData(){

    event.preventDefault();
    const Id = document.getElementById('productId').value;
    
     console.log(Id);

    if (Id.length==0) {
        console.log("id idade")
        const data = {
            title: "Enter a Valid product Id",
            footer: "This is a mandatory field",
            icon: "warning"
        }
        swalBasic(data)  
    }
    else{
        fetch('/farmread',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',              
            },
            body: JSON.stringify({Id: Id})
        })
        .then(function(response){
            console.log(response);
            return response.json();
        })
        .then(function (ProductData){
            dataBuf = ProductData["Producedata"]
            console.log(dataBuf);
            swal.fire({
                // toast: true,
                icon: `success`,
                title: `Product Details ${Id} :`,
                animation: false,
                position: 'center',
                html: `<h3>${dataBuf}</h3>`,
                showConfirmButton: true,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', swal.stopTimer)
                    toast.addEventListener('mouseleave', swal.resumeTimer)
                }
            }) 
        })
        .catch(function(error){
            const data = {
                title: "Error in processing Request",
                footer: "Something went wrong !",
                icon: "error"
            }
            swalBasic(data);        
        })    
    }
}

function getMatchingOrders(productId) {
    // console.log("productId",productId)
    window.location.href = 'matchOrder?productId=' + productId;
}

function createOrder() {
    // alert("Entered the order function")
    event.preventDefault();
    const orderNumber = document.getElementById('orderNumber').value;
    const produceName = document.getElementById('product').value;
    const quantity = document.getElementById('quantity').value;
    const buyerName = document.getElementById('buyerName').value;

    if (orderNumber.length == 0 || produceName.length == 0 || quantity.length == 0 
        || buyerName.length == 0) {
            const data = {
                title: "You have missed something",
                footer: "All fields are mandatory",
                icon: "warning"
            }
            swalBasic(data)  
    }
    else {
        fetch('/createOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderNumber: orderNumber, produceName: produceName, quantity: quantity,buyerName: buyerName })
        })
            .then(function (response) {
                if (response.status === 200) {
                    const data = {
                        title: `Order is created`,
                        footer: "Raised Order",
                        icon: "success"
                    }
                    swalBasic(data)
                    location.reload(); 
                    // window.location.href = '/farmer'

                } else {
                    const data = {
                        title: `Failed to create order`,
                        footer: "Please try again !!",
                        icon: "error"
                    }
                    swalBasic(data)                  }
            })
            .catch(function (err) {
                const data = {
                    title: "Error in processing Request",
                    footer: "Something went wrong !",
                    icon: "error"
                }
                swalBasic(data);               
            })
    }
}

function readOrder() {
    // alert("Entered the order function")
    event.preventDefault();
    const orderNumber = document.getElementById('ordNum').value;
    
    console.log(orderNumber );

    if (orderNumber.length == 0) {
        const data = {
            title: "Enter a order number",
            footer: "Order Number is mandatory",
            icon: "warning"
        }
        swalBasic(data)     
    }
    else {
        fetch('/readOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderNumber: orderNumber})
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (orderData){
                dataBuf = orderData["orderData"]
                swal.fire({
                    // toast: true,
                    icon: `success`,
                    title: `Current status of Order : `,
                    animation: false,
                    position: 'center',
                    html: `<h3>${dataBuf}</h3>`,
                    showConfirmButton: true,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', swal.stopTimer)
                        toast.addEventListener('mouseleave', swal.resumeTimer)
                    }
                })           
            })
            .catch(function (err) {
                const data = {
                    title: "Error in processing Request",
                    footer: "Something went wrong !",
                    icon: "error"
                }
                swalBasic(data);              
            })
    }
}

function deleteOrder(orderNumber){
    if ( !orderNumber) {
        const data = {
            title: "Select an order to delete",
            footer: "Order number is mandatory",
            icon: "warning"
        }
        swalBasic(data)   
    } else {
        fetch('/deleteOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderNumber : orderNumber})
        })
            .then(function (response) {
                if (response.status === 200) {
                    const data = {
                        title: `Order Deleted successfully!!`,
                        footer: "Success",
                        icon: "success"
                    }
                    swalBasic(data)
                    location.reload(); 
                } else {
                    const data = {
                        title: `Failed to delete Order!!`,
                        footer: "Please try again !!",
                        icon: "error"
                    }
                    swalBasic(data)                 }
            })
            
            .catch(function (err) {
                const data = {
                    title: "Error in processing Request",
                    footer: "Something went wrong !",
                    icon: "error"
                }
                swalBasic(data);  
            })
    }
}


function matchOrder(orderId,productId) {
    if (!orderId || !productId) {
        const data = {
            title: "Enter a order number",
            footer: "Order Number is mandatory",
            icon: "warning"
        }
        swalBasic(data)   
    } else {
        fetch('/match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId,productId})
        })
            .then(function (response) {
                if (response.status === 200) {
                    const data = {
                        title: `Order matched successfully`,
                        footer: "Order matched",
                        icon: "success"
                    }
                    swalBasic(data)
                    window.location.href = '/farmer'
                } else {
                    const data = {
                        title: `Failed to match order`,
                        footer: "Please try again !!",
                        icon: "error"
                    }
                    swalBasic(data)                 }
            })
            
            .catch(function (err) {
                const data = {
                    title: "Error in processing Request",
                    footer: "Something went wrong !",
                    icon: "error"
                }
                swalBasic(data);  
            })
    }
}


function allOrders() {
    window.location.href='/allOrders';
}

function DeleteItem(productId){
    if ( !productId) {
        const data = {
            title: "Select a product to delete",
            footer: "Product Id is mandatory",
            icon: "warning"
        }
        swalBasic(data)   
    } else {
        fetch('/deleteItem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId})
        })
            .then(function (response) {
                if (response.status === 200) {
                    const data = {
                        title: `Item Deleted successfully`,
                        footer: "Success",
                        icon: "success"
                    }
                    swalBasic(data)
                    location.reload(); 
                } else {
                    const data = {
                        title: `Failed to delete product!!`,
                        footer: "Please try again !!",
                        icon: "error"
                    }
                    swalBasic(data)                 }
            })
            
            .catch(function (err) {
                const data = {
                    title: "Error in processing Request",
                    footer: "Something went wrong !",
                    icon: "error"
                }
                swalBasic(data);  
            })
    }
}

function getEvent() {
    fetch('/event', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(function (response) {
            console.log("Response is ###",response)
            return response.json()
        })
        .then(function (event) {
            dataBuf = event["carEvent"]
            swal.fire({
                toast: true,
                // icon: `${data.icon}`,
                title: `Event : `,
                animation: false,
                position: 'top-right',
                html: `<h5>${dataBuf}</h5>`,
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', swal.stopTimer)
                    toast.addEventListener('mouseleave', swal.resumeTimer)
                }
            }) 
        })
        .catch(function (err) {
            swal.fire({
                toast: true,
                icon: `error`,
                title: `Error`,
                animation: false,
                position: 'top-right',
                showConfirmButton: true,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', swal.stopTimer)
                    toast.addEventListener('mouseleave', swal.resumeTimer)
                }
            })        
        })
}