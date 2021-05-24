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
          "Update Employee Role",
          "Update Employee Manager",
          "Delete Department",
          "Delete Role",
          "Delete Employee",
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
      } else if (data.select === "Update Employee Role") {
        updateRole();
      } else if (data.select === "Update Employee Manager") {
        updateManager();
      } else if (data.select === "Delete Department") {
        deleteDepartment();
      } else if (data.select === "Delete Role") {
        deleteRole();
      } else if (data.select === "Delete Employee") {
        deleteEmploy();
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
    `SELECT id, title FROM role; SELECT id, CONCAT(first_name, " ", last_name ) AS name FROM employee`,
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
                managerArray.push(managerName.name);
              });
              return managerArray;
            },
            message: "What is the employees role?",
          },
        ])
        .then((answer) => {
          let roleId;

          results[0].forEach((roleTitle) => {
            if (roleTitle.title === answer.role) {
              roleId = roleTitle;
            }
          });

          if (answer.manager === "None") {
            connection.query(
              `INSERT INTO employee SET ?`,
              {
                first_name: answer.first_name,
                last_name: answer.last_name,
                role_id: roleId.id,
              },
              (err, res) => {
                if (err) throw err;
                console.log(`Your new employee has been added`);
                init();
              }
            );
          } else {
            let managerId;
            results[1].forEach((managerName) => {
              if (managerName.name === answer.manager) {
                managerId = managerName;
              }
            });

            connection.query(
              `INSERT INTO employee SET ?`,
              {
                first_name: answer.first_name,
                last_name: answer.last_name,
                role_id: roleId.id,
                manager_id: managerId.id,
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
  connection.query(`SELECT id, name FROM department`, (err, result) => {
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
              departmentArray.push(departmentName.name);
            });
            return departmentArray;
          },
        },
      ])
      .then((answer) => {
        let departmentId;
        result.forEach((department) => {
          if (department.name === answer.department) {
            departmentId = department;
          }
        });

        connection.query(
          `INSERT INTO role SET ?`,
          {
            title: answer.roleName,
            salary: answer.salary,
            department_id: departmentId.id,
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
    `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee; SELECT id, title FROM role`,
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
          let employee;
          let role;

          result[0].forEach((employName) => {
            if (employName.name === answer.employeeName) {
              employee = employName;
            }
          });
          result[1].forEach((roleName) => {
            if (roleName.title === answer.roleName) {
              role = roleName;
            }
          });

          connection.query(
            `UPDATE employee SET role_id=? WHERE id=?`,
            [role.id, employee.id],
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

const updateManager = () => {
  let nameArray = [];
  let managerArray = [];

  connection.query(
    `SELECT id, CONCAT(first_name," ",last_name) AS name FROM employee`,
    (err, res) => {
      if (err) throw err;

      inquirer
        .prompt([
          {
            name: "employList",
            type: "rawlist",
            choices() {
              res.forEach((employName) => {
                nameArray.push(employName.name);
              });
              return nameArray;
            },
            message: "Which employee would you like to update?",
          },
          {
            name: "managerList",
            type: "rawlist",
            choices() {
              res.forEach((managerName) => {
                managerArray.push(managerName.name);
              });
              return managerArray;
            },
            message: "Who is their new manager?",
          },
        ])
        .then((answer) => {
          let employee;
          let manager;

          res.forEach((employName) => {
            if (employName.name === answer.employList) {
              employee = employName;
            }
          });
          res.forEach((managerName) => {
            if (managerName.name === answer.managerList) {
              manager = managerName;
            }
          });

          connection.query(
            `UPDATE employee SET manager_id =? WHERE id = ?`,
            [manager.id, employee.id],
            (err, res) => {
              if (err) throw err;
              console.log(`Employee has been Updated`);
              init();
            }
          );
        });
    }
  );
};

const deleteDepartment = () => {
  let departmentArray = [];

  connection.query(`SELECT id,name FROM department`, (err, res) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "department",
          type: "rawlist",
          choices() {
            res.forEach((departName) => {
              departmentArray.push(departName.name);
            });
            return departmentArray;
          },
          message: "Which Department would you like to delete?",
        },
      ])
      .then((answer) => {
        let department;

        res.forEach((departmentName) => {
          if (departmentName.name === answer.department) {
            department = departmentName;
          }
        });

        connection.query(
          `DELETE FROM department WHERE id = ?`,
          [department.id],
          (err, res) => {
            if (err) throw err;
            console.log(`Department has been Deleted`);
            init();
          }
        );
      });
  });
};

const deleteRole = () => {
  let roleArray = [];
  connection.query(`SELECT id, title FROM role`, (err, results) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "roleTitle",
          type: "rawlist",
          choices() {
            results.forEach((roleName) => {
              roleArray.push(roleName.title);
            });
            return roleArray;
          },
          message: "Which Role would you like to delete",
        },
      ])
      .then((answer) => {
        let role;
        results.forEach((roleChoice) => {
          if (roleChoice.title === answer.roleTitle) {
            role = roleChoice;
          }
        });

        connection.query(
          `DELETE FROM role WHERE id =?`,
          [role.id],
          (err, res) => {
            if (err) throw err;
            console.log(`Role has been Deleted`);
            init();
          }
        );
      });
  });
};

const deleteEmploy = () => {
  let employArray = [];
  connection.query(
    `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee`,
    (err, results) => {
      if (err) throw err;

      inquirer
        .prompt([
          {
            name: "employeeName",
            type: "rawlist",
            choices() {
              results.forEach((employ) => {
                employArray.push(employ.name);
              });
              return employArray;
            },
            message: "Which employee would you like to delete?",
          },
        ])
        .then((answer) => {
          let employee;

          results.forEach((employChoice) => {
            if (employChoice.name === answer.employeeName) {
              employee = employChoice;
            }
          });

          connection.query(
            `DELETE FROM employee WHERE id =?`,
            [employee.id],
            (err, res) => {
              if (err) throw err;
              console.log(`Employee has been Deleted`);
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
