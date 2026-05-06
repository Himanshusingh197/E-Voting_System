import mongoose from 'mongoose';

const candidateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    party: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;
