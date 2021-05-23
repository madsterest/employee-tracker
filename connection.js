const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const cTable = require("console.table");

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
        viewDepartment();
      } else if (data.select === "View Roles") {
        viewRole();
      } else if (data.select === "View Employees") {
        viewEmployee();
      } else if (data.select === "Update Employee Roles") {
        updateRole();
      } else if (data.select === "Exit") {
        connection.close();
        return;
      }
    });
};

const viewEmployee = () => {
  connection.query(
    `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager 
    FROM employee 
    INNER JOIN role ON employee.role_id = role.id
    INNER JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`,
    (err, results) => {
      if (err) throw err;
      console.table(results);
      init();
    }
  );
};

const viewDepartment = () => {
  connection.query(
    `SELECT id, name AS department FROM department`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      init();
    }
  );
};

const viewRole = () => {
  connection.query(
    `SELECT role.title, role.salary, department.name AS department FROM role INNER JOIN department ON role.department_id = department.id `,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      init();
    }
  );
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
      connection.query(
        `INSERT INTO department SET ?`,
        {
          name: input.depName,
        },
        (err, res) => {
          if (err) throw err;
          console.log(`New Department has been added`);
          init();
        }
      );
    });
};

const newEmploy = () => {
  let choiceArray = [];
  let managerArray = ["None"];

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
              results[1].forEach((managerName) => {
                const manager = `${managerName.first_name} ${managerName.last_name}`;
                managerArray.push(manager);
              });
              return managerArray;
            },
            message: "What is the employees role?",
          },
        ])
        .then((answer) => {
          console.log(answer);
          let roleId = choiceArray.indexOf(answer.role) + 1;

          if (answer.manager === "None") {
            connection.query(
              `INSERT INTO employee SET ?`,
              {
                first_name: answer.first_name,
                last_name: answer.last_name,
                role_id: roleId,
              },
              (err, res) => {
                if (err) throw err;
                console.log(`Your new employee has been added`);
                init();
              }
            );
          } else {
            let managerId = managerArray.indexOf(answer.manager);
            connection.query(
              `INSERT INTO employee SET ?`,
              {
                first_name: answer.first_name,
                last_name: answer.last_name,
                role_id: roleId,
                manager_id: managerId,
              },
              (err, res) => {
                if (err) throw err;
                console.log(`Your new employee has been added`);
                init();
              }
            );
          }
        });
    }
  );
};

const newRole = () => {
  let departmentArray = [];
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
            result.forEach((departmentName) => {
              departmentArray.push(departmentName);
            });
            return departmentArray;
          },
        },
      ])
      .then((answer) => {
        let departmentId = departmentArray.indexOf(answer.department) + 1;
        connection.query(
          `INSERT INTO role SET ?`,
          {
            title: answer.roleName,
            salary: answer.salary,
            department_id: departmentId,
          },
          (err, res) => {
            console.log(`New Role has been added`);
            init();
          }
        );
      });
  });
};

const updateRole = () => {
  let employArray = [];
  let roleArray = [];

  connection.query(
    `SELECT CONCAT(first_name, " ", last_name) AS name FROM employee; SELECT title FROM role`,
    (err, result) => {
      if (err) throw err;
      console.log(result);
      inquirer
        .prompt([
          {
            name: "employeeName",
            type: "rawlist",
            choices() {
              result[0].forEach((nameOfEmployee) => {
                employArray.push(nameOfEmployee.name);
              });
              return employArray;
            },
            message: "Which employee would you like to update?",
          },
          {
            name: "roleName",
            type: "rawlist",
            choices() {
              result[1].forEach((nameOfrole) => {
                roleArray.push(nameOfrole.title);
              });
              return roleArray;
            },
            message: "What is their new role title?",
          },
        ])
        .then((answer) => {
          let employId = employArray.indexOf(answer.employeeName) + 1;
          let roleId = roleArray.indexOf(answer.roleName) + 1;

          connection.query(
            `UPDATE employee SET role_id=? WHERE id=?`,
            [roleId, employId],
            (err, res) => {
              if (err) throw err;
              console.log(`Updated Complete`);
              init();
            }
          );
        });
    }
  );
};

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connected at ${connection.threadId}`);
  init();
});
