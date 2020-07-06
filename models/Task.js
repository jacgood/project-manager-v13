const { Schema, model } = require('mongoose');

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    assignedUser: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    pCompleted: {
      type: Schema.Types.Decimal128,
      default: 0.0,
    },
    dateDue: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
module.exports = model('tasks', TaskSchema);
