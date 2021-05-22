const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();

const readFunction = require("./function/read");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const init = () => {
  inquirer
    .prompt([
      {
        name: "select",
        type: "rawlist",
        message: "What would you like to do today?",
        choices: [
          "Add New Department",
          "Add New Role",
          "Add New Employee",
          "View Departments",
          "View Roles",
          "View Employees",
          "Update Employee Roles",
        ],
      },
    ])
    .then((data) => {
      if (data.select === "Add New Department") {
        //create function(Department)
      } else if (data.select === "Add New Role") {
        //create function(Role)
      } else if (data.select === "Add New Employee") {
        //create function(Employee)
      } else if (data.select === "View Departments") {
        readFunction(department);
      } else if (data.select === "View Roles") {
        readFunction(role);
      } else if (data.select === "View Employees") {
        readFunction(employee);
      } else if (data.select === "Update Employee Roles") {
        //updated function(Employees)
      }
    });
};

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connected at ${connection.threadId}`);
});
