import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCandidates, castVote, getElectionState, getMe } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState('');
  const [electionStatus, setElectionStatus] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      // Always fetch fresh user status from server — prevents stale localStorage bypass
      const [candRes, stateRes, meRes] = await Promise.all([
        getCandidates(),
        getElectionState(),
        getMe(),
      ]);
      setCandidates(candRes.data);
      setElectionStatus(stateRes.data.status);

      const freshUser = meRes.data;
      setHasVoted(freshUser.hasVoted);

      // Sync localStorage with fresh server data
      loginUser({ ...user, hasVoted: freshUser.hasVoted });
    } catch {
      setError('Failed to load election data');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selected) { setError('Please select a candidate'); return; }
    setError('');
    setVoting(true);
    try {
      const { data } = await castVote(selected);
      setMessage(data.message);
      setHasVoted(true);
      loginUser({ ...user, hasVoted: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div className="page-center"><div className="spinner" /></div>;

  return (
    <div className="page-center">
      <div className="card wide-card">
        <div className="card-header">
          <span className="card-icon">🗳️</span>
          <h2>Cast Your Vote</h2>
          <p className="subtitle">
            Election Status:{' '}
            <span className={`status-badge status-${electionStatus?.toLowerCase()}`}>
              {electionStatus}
            </span>
          </p>
        </div>

        {message && <div className="alert alert-success">✅ {message}</div>}
        {error && <div className="alert alert-error">❌ {error}</div>}

        {hasVoted || message ? (
          <div className="voted-banner">
            <span>🎉</span>
            <p>You have already cast your vote. Thank you for participating!</p>
            <button className="btn btn-outline" onClick={() => navigate('/result')}>
              View Results
            </button>
          </div>
        ) : electionStatus !== 'RUNNING' ? (
          <div className="info-banner">
            <span>ℹ️</span>
            <p>
              {electionStatus === 'NOT_STARTED'
                ? 'The election has not started yet.'
                : 'The election has ended.'}
            </p>
            {electionStatus === 'ENDED' && (
              <button className="btn btn-outline" onClick={() => navigate('/result')}>
                View Results
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="candidates-grid">
              {candidates.map((c) => (
                <div
                  key={c._id}
                  className={`candidate-card ${selected === c._id ? 'selected' : ''}`}
                  onClick={() => setSelected(c._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelected(c._id)}
                  aria-pressed={selected === c._id}
                >
                  <div className="candidate-avatar">{c.name[0]}</div>
                  <h3>{c.name}</h3>
                  <span className="party-badge">{c.party}</span>
                  <p className="candidate-desc">{c.description}</p>
                  <div className="select-indicator">
                    {selected === c._id ? '✔ Selected' : 'Select'}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleVote}
              disabled={voting || !selected}
            >
              {voting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
