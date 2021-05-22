const viewTable = (tableName) => {
  console.log(`${tableName}\n`);
  connection.query(`SELECT * FROM ${tableName}`, (err, res) => {
    if (err) throw err;
    init();
  });
};

module.exports = viewTable;
