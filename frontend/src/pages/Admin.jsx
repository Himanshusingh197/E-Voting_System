import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCandidates, addCandidate, deleteCandidate,
  getAdminState, updateElectionState, getBlockchain
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [electionStatus, setElectionStatus] = useState('');
  const [blockchain, setBlockchain] = useState(null);
  const [form, setForm] = useState({ name: '', party: '', description: '' });
  const [activeTab, setActiveTab] = useState('candidates');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    try {
      const [candRes, stateRes] = await Promise.all([getCandidates(), getAdminState()]);
      setCandidates(candRes.data);
      setElectionStatus(stateRes.data.electionStatus);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const flash = (m, isError = false) => {
    if (isError) setError(m); else setMsg(m);
    setTimeout(() => { setMsg(''); setError(''); }, 3000);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addCandidate(form);
      setCandidates([...candidates, data]);
      setForm({ name: '', party: '', description: '' });
      flash('Candidate added successfully');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to add candidate', true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    try {
      await deleteCandidate(id);
      setCandidates(candidates.filter((c) => c._id !== id));
      flash('Candidate removed');
    } catch {
      flash('Failed to delete candidate', true);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateElectionState(status);
      setElectionStatus(status);
      flash(`Election status updated to ${status}`);
    } catch {
      flash('Failed to update status', true);
    }
  };

  const loadBlockchain = async () => {
    try {
      const { data } = await getBlockchain();
      setBlockchain(data);
    } catch {
      flash('Failed to load blockchain', true);
    }
  };

  if (loading) return <div className="page-center"><div className="spinner" /></div>;

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <span className={`status-badge status-${electionStatus?.toLowerCase()}`}>{electionStatus}</span>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="tab-bar">
        {['candidates', 'election', 'blockchain'].map((t) => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => { setActiveTab(t); if (t === 'blockchain') loadBlockchain(); }}
          >
            {t === 'candidates' ? '👥 Candidates' : t === 'election' ? '⚙️ Election Control' : '🔗 Blockchain'}
          </button>
        ))}
      </div>

      {activeTab === 'candidates' && (
        <div className="tab-content">
          <div className="two-col">
            <div className="card">
              <h3>Add Candidate</h3>
              <form onSubmit={handleAddCandidate}>
                <div className="form-group">
                  <label>Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Candidate name" required />
                </div>
                <div className="form-group">
                  <label>Party</label>
                  <input value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder="Party name" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" required rows={3} />
                </div>
                <button type="submit" className="btn btn-success">Add Candidate</button>
              </form>
            </div>

            <div className="card">
              <h3>Candidates ({candidates.length})</h3>
              {candidates.length === 0 ? (
                <p className="empty-state">No candidates yet. Add one!</p>
              ) : (
                <div className="candidate-list">
                  {candidates.map((c) => (
                    <div key={c._id} className="candidate-item">
                      <div className="candidate-avatar sm">{c.name[0]}</div>
                      <div className="candidate-item-info">
                        <strong>{c.name}</strong>
                        <span className="party-badge">{c.party}</span>
                        <small>{c.description}</small>
                      </div>
                      <div className="candidate-item-votes">{c.voteCount} votes</div>
                      <button className="btn btn-danger sm" onClick={() => handleDelete(c._id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'election' && (
        <div className="tab-content">
          <div className="card election-control">
            <h3>Election Control</h3>
            <p>Current Status: <span className={`status-badge status-${electionStatus?.toLowerCase()}`}>{electionStatus}</span></p>
            <div className="control-buttons">
              <button
                className="btn btn-success"
                disabled={electionStatus === 'RUNNING'}
                onClick={() => handleStatusChange('RUNNING')}
              >▶ Start Election</button>
              <button
                className="btn btn-danger"
                disabled={electionStatus !== 'RUNNING'}
                onClick={() => handleStatusChange('ENDED')}
              >⏹ End Election</button>
              <button
                className="btn btn-outline"
                disabled={electionStatus === 'NOT_STARTED'}
                onClick={() => handleStatusChange('NOT_STARTED')}
              >↺ Reset</button>
            </div>
            <div className="status-info">
              <div className={`status-step ${electionStatus === 'NOT_STARTED' ? 'active' : electionStatus !== 'NOT_STARTED' ? 'done' : ''}`}>1. Not Started</div>
              <div className="step-arrow">→</div>
              <div className={`status-step ${electionStatus === 'RUNNING' ? 'active' : electionStatus === 'ENDED' ? 'done' : ''}`}>2. Running</div>
              <div className="step-arrow">→</div>
              <div className={`status-step ${electionStatus === 'ENDED' ? 'active' : ''}`}>3. Ended</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blockchain' && (
        <div className="tab-content">
          <div className="card">
            <h3>Blockchain Ledger</h3>
            {blockchain ? (
              <>
                <div className={`alert ${blockchain.isValid ? 'alert-success' : 'alert-error'}`}>
                  Chain Integrity: {blockchain.isValid ? '✅ Valid' : '❌ Tampered'}
                </div>
                <div className="blockchain-chain">
                  {blockchain.chain.map((block, i) => (
                    <div key={i} className="block-card">
                      <div className="block-header">Block #{block.index}</div>
                      <div className="block-body">
                        <div><span>Data:</span> {JSON.stringify(block.data)}</div>
                        <div><span>Hash:</span> <code>{block.hash.slice(0, 20)}...</code></div>
                        <div><span>Prev:</span> <code>{block.previousHash.slice(0, 20)}...</code></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="empty-state">Click the Blockchain tab to load chain data.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
