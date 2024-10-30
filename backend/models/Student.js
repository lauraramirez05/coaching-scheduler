import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Student = sequelize.define(
  'Student',
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
  { tableName: 'students', timestamps: false }
);

export default Student;
