const { Sequelize, DataTypes } = require('sequelize');
import sequelize from '../config/db';

const Coach = sequelize.define('Coach', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Coach;
