import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import State from '../models/State.js';
import votingBlockchain from '../blockchain/Blockchain.js';
import Block from '../blockchain/Block.js';

// @desc    Get all candidates
// @route   GET /api/voter/candidates
// @access  Private
export const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    // We can hide vote counts until election ends if we want, but for now we return them
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cast a vote
// @route   POST /api/voter/vote
// @access  Private
export const castVote = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const voterId = req.user._id;

    // Check if election is running
    const state = await State.findOne();
    if (!state || state.electionStatus !== 'RUNNING') {
      return res.status(400).json({ message: 'Election is not currently active' });
    }

    // Check if user already voted
    const user = await User.findById(voterId);
    if (!user || user.hasVoted) {
      return res.status(400).json({ message: 'You have already voted.' });
    }

    // Find candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // 1. Update candidate vote count
    candidate.voteCount += 1;
    await candidate.save();

    // 2. Mark user as voted
    user.hasVoted = true;
    await user.save();

    // 3. Add to blockchain
    const latestBlock = votingBlockchain.getLatestBlock();
    const newIndex = latestBlock.index + 1;
    const newBlock = new Block(newIndex, Date.now().toString(), {
      voterId: voterId.toString(),
      candidateId: candidateId.toString(),
      candidateName: candidate.name
    });
    
    votingBlockchain.addBlock(newBlock);

    res.json({ message: 'Vote successfully cast!', hasVoted: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Election Status (public utility)
// @route   GET /api/voter/state
// @access  Public
export const getElectionState = async (req, res) => {
  try {
    const state = await State.findOne();
    res.json({ status: state ? state.electionStatus : 'NOT_STARTED' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public results (candidates + vote counts)
// @route   GET /api/voter/results
// @access  Public
export const getResults = async (req, res) => {
  try {
    const candidates = await Candidate.find({}).select('name party voteCount');
    const state = await State.findOne();
    res.json({
      candidates,
      status: state ? state.electionStatus : 'NOT_STARTED',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
