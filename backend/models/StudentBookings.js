const { Sequelize, DataTypes } = require('sequelize');
import sequelize from '../config/db';

const StudentBookings = sequelize.define(
  'StudentBookings',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students', // Name of the table in the database
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
  },
  {
    tableName: 'student_bookings', // Specify the table name
  }
);

export default StudentBookings;
