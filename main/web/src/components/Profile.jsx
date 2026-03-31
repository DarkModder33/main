import React, { useState, useEffect } from 'react';
import { userProfileStorage } from '../lib/api-client';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://api.dicebear.com/7.x/identicon/svg?seed=tradehax');

  useEffect(() => {
    async function fetchProfile() {
      const loaded = await userProfileStorage.load();
      setProfile(loaded);
      setAvatarUrl(loaded?.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=tradehax');
    }
    fetchProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    await userProfileStorage.save({ ...profile, avatarUrl });
    setEditing(false);
  }

  if (!profile) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#0E1117', color: '#C8D8E8', borderRadius: 12, padding: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 18 }}>User Profile</h2>
      <img src={avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid #00D9FF', marginBottom: 18 }} />
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600 }}>Avatar URL:</label>
        <input
          type="text"
          name="avatarUrl"
          value={avatarUrl}
          onChange={e => setAvatarUrl(e.target.value)}
          style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 6, border: '1px solid #1C2333', background: '#12161E', color: '#C8D8E8' }}
        />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600 }}>Risk Tolerance:</label>
        <select name="riskTolerance" value={profile.riskTolerance} onChange={handleChange} style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 6, border: '1px solid #1C2333', background: '#12161E', color: '#C8D8E8' }}>
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600 }}>Trading Style:</label>
        <select name="tradingStyle" value={profile.tradingStyle} onChange={handleChange} style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 6, border: '1px solid #1C2333', background: '#12161E', color: '#C8D8E8' }}>
          <option value="scalp">Scalp</option>
          <option value="day">Day</option>
          <option value="swing">Swing</option>
          <option value="position">Position</option>
        </select>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600 }}>Favorite Assets (comma separated):</label>
        <input
          type="text"
          name="favoriteAssets"
          value={profile.preferredAssets?.join(', ') || ''}
          onChange={e => setProfile(prev => ({ ...prev, preferredAssets: e.target.value.split(',').map(a => a.trim()) }))}
          style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 6, border: '1px solid #1C2333', background: '#12161E', color: '#C8D8E8' }}
        />
      </div>
      <button
        onClick={handleSave}
        style={{ background: '#00D9FF', color: '#090B10', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 10 }}
      >
        Save Profile
      </button>
    </div>
  );
}
