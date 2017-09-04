var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "test",
    database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
})

function displayItems() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            console.log(results[i].item_id + " | " + results[i].product_name + " | " + results[i].department_name + " | " + results[i].price + " | " + results[i].stock_quantity);   
        }
        console.log("\n");
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
        var id = item.item_id;
        inquirer.prompt([
              {
                type: "input",
                name: "quantity",
                message: "How many would you like to purchase?"
              }
            ]).then(function(quantity) {
                var purchaseAmount =  quantity.quantity;
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
                                    // console.log("new instock: " + inStock);
                                    console.log("\nThank you for your purchase. We will let you know when your order has shipped.");
                                    var query = connection.query(
                                        "UPDATE products SET ? WHERE ?",
                                        [
                                          {
                                            stock_quantity: inStock
                                          },
                                          {
                                            item_id: id
                                          }
                                        ],
                                        function(err, res) {
                                        //   console.log("products updated!\n");
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
            })
        })
};



displayItems();