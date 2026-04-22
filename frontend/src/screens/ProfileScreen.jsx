import React, { useState } from 'react';

const ProfileScreen = ({ onNavigate, user, language, walletAddress, onWalletConnect }) => {
  const [c1, setC1] = useState("9876543210");
  const [c2, setC2] = useState("9123456789");

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0D0D1A',
      color: '#F0F0FF',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    wrapper: {
      width: '100%',
      maxWidth: '430px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '10px'
    },
    backBtn: {
      background: 'none',
      border: 'none',
      color: '#F0F0FF',
      fontSize: '24px',
      cursor: 'pointer',
      marginRight: '15px'
    },
    title: {
      fontSize: '24px',
      margin: 0,
      color: '#FFB703'
    },
    profileCard: {
      backgroundColor: '#161625',
      padding: '30px 20px',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      border: '1px solid rgba(255,183,3,0.2)'
    },
    avatar: {
      fontSize: '60px',
      marginBottom: '10px'
    },
    userName: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0
    },
    userEmail: {
      color: '#8888AA',
      fontSize: '14px',
      marginTop: '4px'
    },
    sectionTitle: {
      fontSize: '18px',
      marginTop: '10px',
      marginBottom: '0px'
    },
    inputCard: {
      backgroundColor: '#161625',
      padding: '16px',
      borderRadius: '12px',
      marginTop: '10px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '16px'
    },
    label: {
      fontSize: '13px',
      color: '#8888AA',
      fontWeight: 'bold'
    },
    input: {
      backgroundColor: '#1F1F35',
      border: '1px solid rgba(255,255,255,0.1)',
      padding: '12px',
      borderRadius: '8px',
      color: '#F0F0FF',
      outline: 'none'
    },
    logoutBtn: {
      backgroundColor: 'transparent',
      border: '1px solid #E63946',
      color: '#E63946',
      padding: '16px',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '20px'
    }
  };

  const handleLogout = () => {
    onNavigate('auth', { logout: true });
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          onWalletConnect(accounts[0]);
        }
      } catch (err) {
        console.error("User rejected wallet connection", err);
      }
    } else {
      alert(language === 'hi' ? 'कृपया मेटामास्क (MetaMask) इनस्टॉल करें' : 'Please install MetaMask to use Web3 features.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => onNavigate('home')}>←</button>
          <h1 style={styles.title}>{language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}</h1>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.avatar}>👤</div>
          <h2 style={styles.userName}>{user?.name || "User"}</h2>
          <p style={styles.userEmail}>{user?.name?.toLowerCase().replace(' ', '') || 'user'}@rakshakpath.com</p>
        </div>

        <h3 style={styles.sectionTitle}>{language === 'hi' ? 'आपातकालीन संपर्क (SOS)' : 'Emergency Contacts (SOS)'}</h3>
        <div style={styles.inputCard}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{language === 'hi' ? 'संपर्क 1 (माँ)' : 'Contact 1 (Mom)'}</label>
            <input 
              style={styles.input} 
              value={c1} 
              onChange={(e) => setC1(e.target.value)} 
              placeholder="+91"
            />
          </div>
          <div style={{...styles.inputGroup, marginBottom: 0}}>
            <label style={styles.label}>{language === 'hi' ? 'संपर्क 2 (मित्र)' : 'Contact 2 (Friend)'}</label>
            <input 
              style={styles.input} 
              value={c2} 
              onChange={(e) => setC2(e.target.value)} 
              placeholder="+91"
            />
          </div>
        </div>

        {walletAddress ? (
          <div style={{...styles.inputCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#2DC653'}}>
            <span>🦊 {language === 'hi' ? 'वॉलेट कनेक्टेड' : 'Wallet Connected'}</span>
            <span style={{fontSize: '12px'}}>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
          </div>
        ) : (
          <button 
            onClick={connectWallet}
            style={{...styles.logoutBtn, borderColor: '#FFB703', color: '#FFB703', marginTop: '10px'}}
          >
            🦊 {language === 'hi' ? 'वेब3 वॉलेट से जुड़ें' : 'Connect Web3 Wallet'}
          </button>
        )}

        <button style={styles.logoutBtn} onClick={handleLogout}>
          {language === 'hi' ? 'लॉग आउट' : 'Log Out'}
        </button>

      </div>
    </div>
  );
};

export default ProfileScreen;
