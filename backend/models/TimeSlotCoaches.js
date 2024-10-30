import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/db';

const TimeSlotCoaches = sequelize.define(
  'TimeSlotCoaches',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    time_slot_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'TimeSlots', // The table name should match the defined model name
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    coach_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Coaches', // The table name should match the defined model name
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'time_slot_coaches', // Specify the table name if different from the default
  }
);

export default TimeSlotCoaches;
