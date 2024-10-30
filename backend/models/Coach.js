import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Coach = sequelize.define(
  'Coach',
  {
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
  },
  {
    sequelize,
    modelName: 'Coach',
    tableName: 'coaches', 
    timestamps: false,
  }
);

export default Coach;
