import express from 'express';
import { getCandidates, castVote, getElectionState, getResults } from '../controllers/voterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/candidates', protect, getCandidates);
router.post('/vote', protect, castVote);
router.get('/state', getElectionState);
router.get('/results', getResults); // public - no auth needed

export default router;
