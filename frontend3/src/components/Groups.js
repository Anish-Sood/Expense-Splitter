import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Groups.css';
import CreateGroup from './CreateGroup';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('/groups');
        setGroups(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups. Please try again later.');
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleCreateSuccess = (newGroup) => {
    setGroups([...groups, newGroup]);
    setShowCreateForm(false);
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1>Your Groups</h1>
        <button 
          className="create-group-button" 
          onClick={() => setShowCreateForm(true)}
        >
          <i className="fas fa-plus"></i> Create Group
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="modal-overlay">
          <CreateGroup 
            onClose={() => setShowCreateForm(false)} 
            onCreateSuccess={handleCreateSuccess} 
          />
        </div>
      )}

      {groups.length === 0 ? (
        <div className="no-groups">
          <p>You don't have any groups yet.</p>
          <button 
            className="create-first-group" 
            onClick={() => setShowCreateForm(true)}
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => (
            <div key={group._id} className="group-card">
              <h3>{group.name}</h3>
              <p className="group-role">
                {group.created_by === currentUser?._id ? 'Admin' : 'Member'}
              </p>
              <div className="group-meta">
                <span>{new Date(group.created_at).toLocaleDateString()}</span>
                <span>{group.members?.length || 1} members</span>
              </div>
              <Link to={`/groups/${group._id}`} className="view-group-link">
                View Details <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;
