import mongoose from 'mongoose';

const stateSchema = mongoose.Schema(
  {
    electionStatus: {
      type: String,
      enum: ['NOT_STARTED', 'RUNNING', 'ENDED'],
      default: 'NOT_STARTED',
    },
  },
  {
    timestamps: true,
  }
);

const State = mongoose.model('State', stateSchema);

export default State;
