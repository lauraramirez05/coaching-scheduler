import { Sequelize, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from '../config/db.js';

const Coach = sequelize.define(
  'Coach',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
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
