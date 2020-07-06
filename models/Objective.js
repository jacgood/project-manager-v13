const { Schema, model } = require('mongoose');

const ObjectiveSchema = new Schema(
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
    password: {
      type: String,
      required: true,
    },
    dateDue: {
      type: Date,
    },
    pCompleted: {
      type: Schema.Types.Decimal128,
      default: 0.0,
    },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'task' }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
module.exports = model('objectives', ObjectiveSchema);
