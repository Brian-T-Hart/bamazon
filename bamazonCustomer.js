var mysql = require("mysql");
var inquirer = require("inquirer");
var numOfProducts = 0;
var id = 0;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "test",
    database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
})

function displayItems() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            console.log(results[i].item_id + " | " + results[i].product_name + " | " + results[i].department_name + " | " + results[i].price + " | " + results[i].stock_quantity);   
        }
        console.log("\n");
        numOfProducts = results.length;
        getItem();
    });
}

function getItem() {
    inquirer.prompt([
        {
        type: "input",
        name: "item_id",
        message: "Type the id number of the item you wish to purchase"
        }
    ]).then(function(item) {
        id = item.item_id;
        if (isNaN(id) || id < 1 || id > numOfProducts) {
            console.log("\nInvalid Input. Please choose a number betweet 1 and " + numOfProducts + ".\n");
            getItem();
        }
        else {
            inquirer.prompt([
                {
                type: "input",
                name: "quantity",
                message: "How many would you like to purchase?"
                }
            ]).then(function(quantity) {
                var purchaseAmount = quantity.quantity;
                console.log(purchaseAmount);
                    if (isNaN(purchaseAmount) || purchaseAmount < 1) {
                        console.log("\nInvalid Input. Please try again.\n");
                        getItem();
                    }
                    else {
                        connection.query("SELECT * FROM products", function(err, results) {
                            if (err) throw err;
                            var resId = id - 1;
                            var inStock = results[resId].stock_quantity;
                                if (inStock >= purchaseAmount) {
                                    var product = results[resId].product_name;
                                    var totalPrice = results[resId].price * purchaseAmount;
                                    totalPrice = totalPrice.toFixed(2);
                                    console.log("\nYour order: " + product);
                                    console.log("Quantity: " + purchaseAmount);
                                    console.log("price per unit: $" + results[resId].price);
                                    console.log("Total Price: $" + totalPrice + "\n");
                                    inquirer.prompt([
                                        {
                                        type: "confirm",
                                        name: "confirmpurchase",
                                        message: "Confirm purchase"
                                        }
                                    ]).then(function(quantity) {
                                        if (quantity.confirmpurchase === true) {
                                            inStock = inStock - purchaseAmount;
                                            console.log("\nThank you for your purchase. We will let you know when your order has shipped.");
                                            var query = connection.query(
                                            "UPDATE products SET ? WHERE ?",[
                                                {
                                                stock_quantity: inStock
                                                },
                                                {
                                                item_id: id
                                                }
                                            ],function(err, res) {
                                                connection.end();
                                            }
                                            );
                                        }
                                        else {
                                            console.log("Please come again!");
                                            connection.end();
                                        }
                                    })
                                }
                            else {
                                console.log("Bamazon only has " + inStock + " in stock at this time.");
                                inquirer.prompt([
                                    {
                                    type: "confirm",
                                    name: "tryagain",
                                    message: "Would you like to try again?"
                                    }
                                ]).then(function(reStart) {
                                    console.log(reStart.tryagain);
                                    if (reStart.tryagain === true) {   
                                        displayItems();
                                    }
                                    else {
                                        console.log("Thank you for visiting Bamazon.com");
                                        connection.end();
                                    }                                      
                                })
                            }
                        })
                    }
            })
        }
    })
};

displayItems();