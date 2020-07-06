const { Schema, model } = require('mongoose');

const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    descriptions: {
      type: String,
    },
    client: {
      type: { type: Schema.Types.ObjectId, ref: 'user' },
      required: true,
    },
    assignedUser: {
      type: { type: Schema.Types.ObjectId, ref: 'user' },
      required: true,
    },
    dateDue: {
      type: Date,
    },
    objectives: [{ type: Schema.Types.ObjectId, ref: 'objective' }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
module.exports = model('projects', ProjectSchema);
