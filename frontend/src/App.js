import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import CreateSlot from './components/CreateSlot';
import SlotList from './components/SlotList';
import EditSlot from './components/EditSlot';
import SearchSlots from './components/SearchSlots';

function App(){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [editId, setEditId] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <>
      {showLogin && !isAuthenticated && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, maxWidth: 400, width: '90%' }}>
            <button onClick={() => setShowLogin(false)} style={{ float: 'right', marginBottom: 10 }}>×</button>
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
      <div style={{ maxWidth: 900, margin: '24px auto', padding: 12 }}>
        <SearchSlots />
        <CreateSlot onLogout={handleLogout} onShowLogin={() => setShowLogin(true)} isAuthenticated={isAuthenticated} />
        <SlotList onEdit={(id) => setEditId(id)} />
        {editId && <EditSlot slotId={editId} onDone={() => setEditId(null)} />}
      </div>
    </>
  );
}
export default App;
