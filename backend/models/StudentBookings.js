import { Sequelize, DataTypes, UUIDV4  } from 'sequelize';
import sequelize from '../config/db';

const StudentBookings = sequelize.define(
  'StudentBookings',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    student_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'students', // Name of the table in the database
        key: 'id',
      },
    },
    time_slot_id: {
      type: DataTypes.STRING,
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
