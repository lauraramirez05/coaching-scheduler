import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/db';

const CoachPrevSessions = sequelize.define(
  'CoachPrevSessions',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    coach_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'coaches', // Name of the table in the database
        key: 'id',
      },
    },
    time_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'time_slots', // Name of the table in the database
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'coach_previous_sessions', // Specify the table name
  }
);

export default CoachPrevSessions;
