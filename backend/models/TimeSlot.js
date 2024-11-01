import { Sequelize, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from '../config/db.js';

const TimeSlot = sequelize.define(
  'TimeSlot',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        // isValidFutureDate(value) {
        //   const currentDateTime = new Date();
        //   if (new Date(value) < currentDateTime) {
        //     throw new Error('Start time must be today or in the future');
        //   }
        // },
        // isWithinSchedule(value) {
        //   const endOfDay = new Date(value);
        //   const startOfDay = new Date(value);
        //   startOfDay.setHours(8, 0, 0);
        //   endOfDay.setHours(18, 0, 0);

        //   if (new Date(value) < startOfDay) {
        //     throw new Error('Start time cannot be earlier than 8:00 AM.');
        //   }

        //   if (new Date(value) > endOfDay) {
        //     throw new Error('Start time cannot be later than 6:00 PM.');
        //   }
        // },
      },
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfter(value) {
          if (new Date(value) <= new Date(this.start_time)) {
            throw new Error('End time must be after start time');
          }
        },
        isTwoHoursApart(value) {
          const twoHoursInMilliseconds = 2 * 60 * 60 * 1000;
          const difference = new Date(value) - new Date(this.start_time);

          if (difference !== twoHoursInMilliseconds) {
            throw new Error(
              'End time must be exactly two hours after start time'
            );
          }
        },
      },
    },
  },
  {
    tableName: 'time_slots',
    timestamps: false,
  }
);

export default TimeSlot;
