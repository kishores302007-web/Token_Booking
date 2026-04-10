import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import api from '../services/api';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedToken, setSelectedToken] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch tokens on mount
  useEffect(() => {
    fetchTokens();
    // Set up polling to refresh tokens every 30 seconds
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Fetch user's tokens from API
   */
  const fetchTokens = async () => {
    try {
      const response = await api.get('/token/my');
      setTokens(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load tokens');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get filtered tokens based on status
   */
  const getFilteredTokens = () => {
    if (filterStatus === 'all') {
      return tokens;
    }
    return tokens.filter(token => token.status === filterStatus);
  };

  /**
   * Get active tokens
   */
  const getActiveTokens = () => {
    return tokens.filter(token => token.status === 'pending' || token.status === 'active');
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Handle cancel token
   */
  const handleCancelToken = async () => {
    if (!selectedToken) return;

    setCancelLoading(true);
    try {
      await api.put(`/token/${selectedToken.id}/cancel`);
      setShowCancelModal(false);
      setSelectedToken(null);
      fetchTokens();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel token');
    } finally {
      setCancelLoading(false);
    }
  };

  /**
   * Open cancel modal
   */
  const openCancelModal = (token) => {
    setSelectedToken(token);
    setShowCancelModal(true);
  };

  /**
   * Close cancel modal
   */
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedToken(null);
  };

  const filteredTokens = getFilteredTokens();
  const activeTokens = getActiveTokens();

  if (loading) {
    return <div className="loading">Loading your tokens...</div>;
  }

  return (
    <div className="user-dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome, {user?.name}!</h1>
          <p className="dashboard-subtitle">Manage your service tokens</p>
        </div>
        <Link to="/book" className="btn btn-primary btn-large">
          Book New Token
        </Link>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">📋</div>
          <div className="summary-content">
            <div className="summary-value">{tokens.length}</div>
            <div className="summary-label">Total Tokens</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <div className="summary-value">{activeTokens.length}</div>
            <div className="summary-label">Active Tokens</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className="summary-value">
              {tokens.filter(t => t.status === 'completed').length}
            </div>
            <div className="summary-label">Completed</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">❌</div>
          <div className="summary-content">
            <div className="summary-value">
              {tokens.filter(t => t.status === 'cancelled').length}
            </div>
            <div className="summary-label">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Active Tokens Section */}
      {activeTokens.length > 0 && (
        <div className="tokens-section">
          <h2 className="section-title">Active Tokens</h2>
          <div className="active-tokens-grid">
            {activeTokens.map(token => (
              <div key={token.id} className="active-token-card">
                <div className="token-number-large">{token.token_number}</div>
                <div className="token-details-small">
                  <p><strong>Date:</strong> {formatDate(token.date)}</p>
                  <p><strong>Time:</strong> {token.time_slot}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`badge ${getStatusColor(token.status)}`}>
                      {token.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and History */}
      <div className="tokens-section">
        <div className="section-header">
          <h2 className="section-title">Token History</h2>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </button>
            <button
              className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        {filteredTokens.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p className="empty-message">No tokens found</p>
            <Link to="/book" className="btn btn-primary">
              Book a Token
            </Link>
          </div>
        ) : (
          <div className="tokens-table-container">
            <table className="tokens-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Booked On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.map(token => (
                  <tr key={token.id} className="token-row">
                    <td className="token-number-cell">
                      <span className="token-number-badge">{token.token_number}</span>
                    </td>
                    <td>{formatDate(token.date)}</td>
                    <td>{token.time_slot}</td>
                    <td>
                      <span className={`badge ${getStatusColor(token.status)}`}>
                        {token.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{formatDate(token.created_at)}</td>
                    <td className="actions-cell">
                      {token.status === 'pending' && (
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => openCancelModal(token)}
                        >
                          Cancel
                        </button>
                      )}
                      {token.status !== 'pending' && token.status !== 'cancelled' && (
                        <span className="action-disabled">-</span>
                      )}
                      {token.status === 'cancelled' && (
                        <span className="action-info">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedToken && (
        <div className="modal-overlay" onClick={closeCancelModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Cancel Token</h2>
            </div>

            <div className="modal-body">
              <p className="modal-message">
                Are you sure you want to cancel token <strong>#{selectedToken.token_number}</strong>?
              </p>
              <div className="token-info-box">
                <p><strong>Date:</strong> {formatDate(selectedToken.date)}</p>
                <p><strong>Time:</strong> {selectedToken.time_slot}</p>
              </div>
              <p className="modal-warning">
                ⚠️ This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn modal-btn-secondary"
                onClick={closeCancelModal}
                disabled={cancelLoading}
              >
                Keep Token
              </button>
              <button
                className="modal-btn modal-btn-danger"
                onClick={handleCancelToken}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Token'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
