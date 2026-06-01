// src/components/Sidebar.jsx
import React from 'react';
import { Activity, LayoutDashboard, Users, Calendar, ActivitySquare, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'triage', label: 'Smart Triage', icon: ActivitySquare },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <Activity size={28} color="var(--primary)" className="brand-icon" />
          <span className="brand-name">CareFlow AI</span>
        </div>

        <nav>
          <ul className="nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div>
        {user && (
          <div className="user-badge glass-panel" style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)' }}>
            <div className="user-avatar">
              {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <h4>{user.name || 'User'}</h4>
              <p>{user.role || 'Staff'}</p>
            </div>
          </div>
        )}

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
