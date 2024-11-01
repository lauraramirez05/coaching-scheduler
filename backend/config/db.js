import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'coaching_scheduler_db_2',
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

export default sequelize;
