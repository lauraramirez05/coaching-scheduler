import { Sequelize, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from '../config/db.js';

const TimeSlotCoaches = sequelize.define(
  'TimeSlotCoaches',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    time_slot_id: {
      type: DataTypes.STRING,
      references: {
        model: 'TimeSlots', // The table name should match the defined model name
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    coach_id: {
      type: DataTypes.STRING,
      references: {
        model: 'Coaches', // The table name should match the defined model name
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('available', 'booked', 'completed'),
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    participants: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'time_slot_coaches', // Specify the table name if different from the default
    timestamps: false,
  }
);

// Define the associations outside the define method
TimeSlotCoaches.associate = (models) => {
  TimeSlotCoaches.belongsTo(models.TimeSlot, {
    foreignKey: 'time_slot_id',
    as: 'timeSlot', // This alias will be used for including
  });
};

export default TimeSlotCoaches;
