const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const cTable = require("console.table");
// const readFunction = require("./function/read");

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
        newDep();
      } else if (data.select === "Add New Role") {
        //create function(Role)
      } else if (data.select === "Add New Employee") {
        newEmploy();
      } else if (data.select === "View Departments") {
        let tableName = "department";
        viewTable(tableName);
      } else if (data.select === "View Roles") {
        let tableName = "role";
        viewTable(tableName);
      } else if (data.select === "View Employees") {
        let tableName = "employee";
        viewTable(tableName);
      } else if (data.select === "Update Employee Roles") {
        //updated function(Employees)
      }
    });
};

const viewTable = (tableName) => {
  connection.query(`SELECT * FROM ${tableName}`, (err, res) => {
    if (err) throw err;
    console.table(res);
    init();
  });
};

const newDep = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "depName",
        message: "What is the department name?",
      },
    ])
    .then((input) => {
      newDepQuery(input);
    });
};

const newEmploy = () => {
  connection.query(`SELECT title FROM role`, (err, results) => {
    if (err) throw err;
    console.log(results, typeof results);
    inquirer
      .prompt([
        {
          name: "first_name",
          type: "input",
          message: "What is the employees first name?",
        },
        {
          name: "last_name",
          type: "input",
          message: "What is the employees last name?",
        },
        {
          name: "role",
          type: "rawlist",
          choices() {
            let choiceArray = [];
            results.forEach((roleTitle) => {
              choiceArray.push(roleTitle.title);
            });
            return choiceArray;
          },
          message: "What is the employees role?",
        },
      ])
      .then((input) => {
        console.log(input);
        roleIdQuery(input);
      });
  });
};

const newDepQuery = (input) => {
  connection
    .query(`INSERT INTO department SET ?`, {
      name: input.depName,
    })
    .then((err, res) => {
      if (err) throw err;
      console.log(res);
      init();
    });
};

const employQuery = (input, response) => {
  connection.query(
    `INSERT INTO employee SET ?`,
    {
      first_name: input.first_name,
      last_name: input.last_name,
      role_id: response[0].id,
    },
    (err, res) => {
      if (err) throw err;
      console.log(res);
    }
  );
};

const roleIdQuery = (input) => {
  connection.query(
    `SELECT id FROM role WHERE ?`,
    {
      title: input.role,
    },
    (err, res) => {
      if (err) throw err;
      console.log(res);
      employQuery(input, res);
    }
  );
};

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connected at ${connection.threadId}`);
  init();
});
