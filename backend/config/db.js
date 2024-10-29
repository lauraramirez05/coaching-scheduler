const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'coaching_scheduler_db',
  'lauraramirez',
  'mugre2006',
  {
    host: 'localhost',
    dialect: 'postgres',
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Connection to the db has been establsihed successfully.`);
  } catch (error) {
    console.error(`Unable to connect to the database`, error);
  }
};

testConnection();

module.exports = sequelize;
