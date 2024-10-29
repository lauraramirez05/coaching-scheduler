const { Sequelize, DataTypes } = require('sequelize');
import sequelize from '../config/db';

const TimeSlot = sequelize.define('TimeSlot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: {
        args: new Date().toISOString(),
        msg: 'Start time mist be today or in the future',
      },

      isWithinSchedule(value) {
        const endOfDay = new Date(value);
        const startOfDay = new Date(value);

        startOfDay.setHours(8, 0, 0);
        endOfDay.setHours(18, 0, 0);

        if (new Date(value) < startOfDay) {
          throw new Error('Start time cannot be earlier than 8:00 AM.');
        }

        if (new Date(value) > endOfDay) {
          throw new Error('Start time cannot be later than 6:00 PM.');
        }
      },
    },
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfter(value) {
        if (value <= this.start_time) {
          throw new Error('End time must be after start time');
        }
      },
    },
  },
  status: {
    type: DataTypes.ENUM('available', 'booked', 'completed'),
    allowNull: false,
  },
  participants: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true,
  },
  satisfaction: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export default TimeSlot;
