import React, { useState } from 'react';
import axios from 'axios';
import './CreateGroup.css';

const CreateGroup = ({ onClose, onCreateSuccess }) => {
  const [groupName, setGroupName] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: group name, 2: invite members

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!groupName.trim()) {
        setError('Please provide a group name');
        return;
      }
      setError('');
      setStep(2);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/groups', {
        name: groupName
      });
      
      const groupId = response.data.group_id;
      
    
      if (inviteEmails.trim()) {
        const emails = inviteEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email !== '');
        await Promise.all(emails.map(async (email) => {
          try {
            await axios.post(`/groups/${groupId}/invite`, { email });
          } catch (err) {
            console.warn(`Failed to invite ${email}:`, err);
            
          }
        }));
      }
      
      
      onCreateSuccess({
        _id: groupId,
        name: groupName,
        created_at: new Date().toISOString(),
        members: [1],
        created_by: 'current-user'
      });
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.message || 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
  };
  
  return (
    <div className="create-group-form">
      <button className="close-button" onClick={onClose}>×</button>
      <h2>{step === 1 ? 'Create New Group' : 'Invite Members'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {step === 1 ? (
          <div className="form-step">
            <div className="form-group">
              <label htmlFor="groupName">Group Name</label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="form-step">
            <div className="form-group">
              <label htmlFor="inviteEmails">Invite Members (Optional)</label>
              <textarea
                id="inviteEmails"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas"
                rows={4}
              />
              <p className="helper-text">Leave empty if you want to add members later</p>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={handleBack}>
                Back
              </button>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateGroup;
