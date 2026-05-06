import express from 'express';
import { addCandidate, deleteCandidate, getElectionStateAdmin, updateElectionState, getBlockchain } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/candidates')
  .post(protect, admin, addCandidate);

router.route('/candidates/:id')
  .delete(protect, admin, deleteCandidate);

router.route('/state')
  .get(protect, admin, getElectionStateAdmin)
  .put(protect, admin, updateElectionState);

router.route('/blockchain')
  .get(protect, admin, getBlockchain);

export default router;
