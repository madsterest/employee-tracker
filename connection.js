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
  multipleStatements: true,
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
          "Exit",
        ],
      },
    ])
    .then((data) => {
      if (data.select === "Add New Department") {
        newDep();
      } else if (data.select === "Add New Role") {
        newRole();
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
        //
        viewEmployee();
      } else if (data.select === "Update Employee Roles") {
        //updated function(Employees)
      } else if (data.select === "Exit") {
        return;
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

// const viewEmployee = () => {
//   connection.query(
//     `SELECT first_name, last_name, title, manager_id FROM employee INNER JOIN `,
//     (err, results) => {
//       if (err) throw err;
//       console.log(results);
//     }
//   );
// };

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
  connection.query(
    `SELECT title FROM role; SELECT first_name, last_name FROM employee`,
    (err, results) => {
      if (err) throw err;
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
              results[0].forEach((roleTitle) => {
                choiceArray.push(roleTitle.title);
              });
              return choiceArray;
            },
            message: "What is the employees role?",
          },
          {
            name: "manager",
            type: "rawlist",
            choices() {
              let managerArray = ["None"];
              results[1].forEach((managerName) => {
                const manager = `${managerName.first_name} ${managerName.last_name}`;
                managerArray.push(manager);
              });
              return managerArray;
            },
            message: "What is the employees role?",
          },
        ])
        .then((input) => {
          console.log(input);
          IdQuery(input);
        });
    }
  );
};

const newRole = () => {
  connection.query(`SELECT name FROM department`, (err, result) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "roleName",
          type: "input",
          message: "What is the role title?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary?",
        },
        {
          name: "department",
          type: "rawlist",
          choices() {
            let departmentArray = [];
            result.forEach((departmentName) => {
              departmentArray.push(departmentName);
            });
            return departmentArray;
          },
        },
      ])
      .then((answers) => {
        departmentIDQuery(answers);
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
      console.log(`New Department has been added`);
      init();
    });
};

const employQuery = (input, response) => {
  connection.query(
    `INSERT INTO employee SET ?`,
    {
      first_name: input.first_name,
      last_name: input.last_name,
      role_id: response[0][0].id,
      manager_id: response[1][0].id || 0,
    },
    (err, res) => {
      if (err) throw err;
      console.log(`Your new employee has been added`);
      init();
    }
  );
};
const employManagerQuery = (input, response) => {
  connection.query(
    `INSERT INTO employee SET ?`,
    {
      first_name: input.first_name,
      last_name: input.last_name,
      role_id: response[0][0].id,
    },
    (err, res) => {
      if (err) throw err;
      console.log(`Your new employee has been added`);
      init();
    }
  );
};

const IdQuery = (input) => {
  const managerName = input.manager.split(" ");

  connection.query(
    `SELECT id FROM role WHERE title = ?; SELECT id FROM employee WHERE first_name = ?`,
    [input.role, managerName[0]],
    (err, res) => {
      if (err) throw err;
      console.log(res[0][0], res[1][0]);
      if (res[1][0]) {
        employQuery(input, res);
      } else {
        employManagerQuery(input, res);
      }
    }
  );
};

const departmentIDQuery = (input) => {
  connection.query(
    `SELECT id FROM department WHERE ?`,
    {
      name: input.department,
    },
    (err, res) => {
      if (err) throw err;
      roleQuery(input, res);
    }
  );
};

const roleQuery = (input, results) => {
  connection.query(
    `INSERT INTO role SET ?`,
    {
      title: input.roleName,
      salary: input.salary,
      department_id: results[0].id,
    },
    (err, res) => {
      console.log(`New Role has been added`);
      init();
    }
  );
};

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connected at ${connection.threadId}`);
  init();
});
