import { useState, useEffect, useRef } from 'react';
import { getResults } from '../services/api';

// Simple confetti burst
function Confetti({ active }) {
  const pieces = Array.from({ length: 40 });
  if (!active) return null;
  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.5}s`,
            background: ['#4f46e5','#f59e0b','#16a34a','#dc2626','#0ea5e9','#ec4899'][i % 6],
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

export default function Result() {
  const [candidates, setCandidates] = useState([]);
  const [electionStatus, setElectionStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animated, setAnimated] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5s while election is running
    intervalRef.current = setInterval(fetchData, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await getResults();
      const sorted = [...data.candidates].sort((a, b) => b.voteCount - a.voteCount);
      setCandidates(sorted);
      setElectionStatus(data.status);
      if (data.status === 'ENDED') {
        clearInterval(intervalRef.current);
        setTimeout(() => { setShowConfetti(true); setAnimated(true); }, 300);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
  const winner = candidates[0];
  const runnerUp = candidates[1];
  const margin = winner && runnerUp ? winner.voteCount - runnerUp.voteCount : winner?.voteCount || 0;

  if (loading) return <div className="page-center"><div className="spinner" /></div>;

  return (
    <div className="page-center">
      <Confetti active={showConfetti} />
      <div className="card wide-card">
        <div className="card-header">
          <span className="card-icon">📊</span>
          <h2>Election Results</h2>
          <div className="result-status-row">
            <span className={`status-badge status-${electionStatus?.toLowerCase()}`}>{electionStatus}</span>
            {electionStatus === 'RUNNING' && (
              <span className="live-badge">🔴 LIVE</span>
            )}
          </div>
        </div>

        {/* Winner announcement */}
        {electionStatus === 'ENDED' && winner && winner.voteCount > 0 && (
          <div className={`winner-card ${animated ? 'winner-animate' : ''}`}>
            <div className="winner-trophy">🏆</div>
            <div className="winner-title">Winner Declared!</div>
            <div className="winner-name">{winner.name}</div>
            <div className="winner-party-tag">{winner.party} Party</div>
            <div className="winner-msg">
              <strong>{winner.party}</strong> party wins with{' '}
              <strong>{winner.voteCount}</strong> vote{winner.voteCount !== 1 ? 's' : ''}
              {runnerUp && runnerUp.voteCount > 0 && (
                <span> — leading by <strong>{margin}</strong> vote{margin !== 1 ? 's' : ''} over {runnerUp.name}</span>
              )}
            </div>
          </div>
        )}

        {/* Live running banner */}
        {electionStatus === 'RUNNING' && (
          <div className="live-banner">
            ⚡ Results update automatically every 5 seconds
          </div>
        )}

        {/* Not started */}
        {electionStatus === 'NOT_STARTED' && (
          <div className="info-banner">
            <span>🕐</span>
            <p>Election hasn't started yet. Check back soon!</p>
          </div>
        )}

        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-num">{totalVotes}</div>
            <div className="stat-label">Total Votes</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{candidates.length}</div>
            <div className="stat-label">Candidates</div>
          </div>
          {winner && totalVotes > 0 && (
            <div className="stat-box">
              <div className="stat-num">{Math.round((winner.voteCount / totalVotes) * 100)}%</div>
              <div className="stat-label">Leading Share</div>
            </div>
          )}
        </div>

        {candidates.length === 0 ? (
          <p className="empty-state">No candidates available yet.</p>
        ) : (
          <div className="results-list">
            {candidates.map((c, i) => {
              const pct = totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0;
              const isWinner = electionStatus === 'ENDED' && i === 0 && c.voteCount > 0;
              return (
                <div key={c._id} className={`result-row ${isWinner ? 'result-winner' : ''}`}>
                  <div className="result-rank">
                    {isWinner ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </div>
                  <div className="result-info">
                    <div className="result-name">
                      {c.name}
                      <span className="party-badge">{c.party}</span>
                      {isWinner && <span className="winner-tag">Winner</span>}
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${isWinner ? 'progress-winner' : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="result-votes">
                    {c.voteCount}
                    <span> ({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
