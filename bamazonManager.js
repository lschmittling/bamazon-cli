// Require the MySQL database, inquirer, cli-table
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

// Make the database connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  console.log("Connected as id: " + connection.threadId + "\n");
  managerPrompt();
});

function managerPrompt() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "managerOptions",
        message: "What do you need to do?",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ]
      }
    ])
    .then(function(answers) {
      if (answers.managerOptions === "View Products for Sale") {
        viewProducts();
      }
      if (answers.managerOptions === "View Low Inventory") {
        console.log("View Low Inventory");
        connection.end();
      }
      if (answers.managerOptions === "Add to Inventory") {
        addInventory();
      }
      if (answers.managerOptions === "Add New Product") {
        addProduct();
      }
    });
}

// View the products from the MySQL database
function viewProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    // Using npm cli-table for table layout in console
    var table = new Table({
      head: ["Item ID", "Product", "Department", "Price", "Quantity"],
      colWidths: [10, 20, 20, 10, 10]
    });

    // Loop through results and push them to the cli-table
    for (var i = 0; i < res.length; i++) {
      table.push([
        res[i].item_id,
        res[i].product_name,
        res[i].department_name,
        res[i].price,
        res[i].stock_quantity
      ]);
    }
    console.log(table.toString() + "\n");
    managerPrompt();
  });
}

// function lowInventory() {}

function addInventory() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "itemID",
        message: "What's the ID of the product you'd like to add inventory to?"
      },
      {
        type: "input",
        name: "quantity",
        message: "How many would you like to add?"
      }
    ])
    .then(function(answers) {
      connection.query(
        "SELECT * FROM products WHERE item_id= " + answers.itemID,
        function(err, res) {
          if (err) throw err;
          // Calculates new quantity from users input
          var newQuantity =
            parseInt(answers.quantity) + parseInt(res[0].stock_quantity);
          // console.log(newQuantity);

          // Updates MySQL database with users quantities
          connection.query(
            "UPDATE products SET stock_quantity=? WHERE item_id=?",
            [newQuantity, answers.itemID]
          );
          console.log("\n--------------------------------------------");
          console.log(
            "\nSUCCESS!\nYour quantity of " +
              answers.quantity +
              " for product item ID " +
              answers.itemID +
              " \nhas been updated to " +
              newQuantity +
              ". Please see updated table below!\n"
          );
          console.log("--------------------------------------------\n");
          viewProducts();
        }
      );
    });
}

function addProduct() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "itemID",
        message: "What is the 4-digit item ID?"
      },
      {
        type: "input",
        name: "productName",
        message: "What is the product name?"
      },
      {
        type: "input",
        name: "deptName",
        message: "What department should this product be in?"
      },
      {
        type: "input",
        name: "price",
        message: "How much is your product?"
      },
      {
        type: "input",
        name: "quantity",
        message: "How many do you have?"
      }
    ])
    .then(function(answers) {
      connection.query(
        "INSERT INTO products (item_id, product_name, department_name, price, stock_quantity) VALUES=?",
        [
          answers.itemID,
          answers.productName,
          answers.deptName,
          answers.price,
          answers.quantity
        ]
      );
    });
}
