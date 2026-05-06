import Candidate from '../models/Candidate.js';
import State from '../models/State.js';
import votingBlockchain from '../blockchain/Blockchain.js';

// @desc    Add a candidate
// @route   POST /api/admin/candidates
// @access  Private/Admin
export const addCandidate = async (req, res) => {
  const { name, party, description } = req.body;
  try {
    const candidate = new Candidate({ name, party, description });
    const createdCandidate = await candidate.save();
    res.status(201).json(createdCandidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a candidate
// @route   DELETE /api/admin/candidates/:id
// @access  Private/Admin
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get or Create Election State
// @route   GET /api/admin/state
// @access  Private/Admin
export const getElectionStateAdmin = async (req, res) => {
  try {
    let state = await State.findOne();
    if (!state) {
      state = await State.create({ electionStatus: 'NOT_STARTED' });
    }
    res.json(state);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Election State
// @route   PUT /api/admin/state
// @access  Private/Admin
export const updateElectionState = async (req, res) => {
  try {
    let state = await State.findOne();
    if (!state) {
      state = await State.create({ electionStatus: req.body.electionStatus });
    } else {
      state.electionStatus = req.body.electionStatus;
      await state.save();
    }
    res.json(state);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Blockchain Data
// @route   GET /api/admin/blockchain
// @access  Private/Admin
export const getBlockchain = (req, res) => {
  res.json({
    isValid: votingBlockchain.isChainValid(),
    chain: votingBlockchain.chain
  });
};
