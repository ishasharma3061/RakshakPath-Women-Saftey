import React, { useState } from 'react';

const ProfileScreen = ({ onNavigate, user, language, walletAddress, onWalletConnect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState(user?.address || "");
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || "");
  const [alternateContact1, setAlternateContact1] = useState(user?.alternateContact1 || "");
  const [alternateContact2, setAlternateContact2] = useState(user?.alternateContact2 || "");

  const handleSave = () => {
    setIsEditing(false);
    const updatedUser = {
      ...user,
      address,
      contactNumber,
      alternateContact1,
      alternateContact2
    };
    
    // Sync with rakshak_contacts for SOS Screen
    localStorage.setItem(`rakshak_contacts_${updatedUser.email || 'user@example.com'}`, JSON.stringify({
      contact1Name: "Contact 1",
      contact1Number: alternateContact1,
      contact2Name: "Contact 2",
      contact2Number: alternateContact2
    }));

    onNavigate('profile', { user: updatedUser });
  };

  const handleLogout = () => {
    onNavigate('auth', { logout: true });
  };

  const handleNumberChange = (value, setter) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setter(digitsOnly);
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
      paddingBottom: '80px',
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
      color: '#FFB703',
      fontWeight: 'bold',
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
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '10px',
    },
    sectionTitle: {
      fontSize: '18px',
      margin: 0,
      fontWeight: 'bold',
    },
    actionBtn: {
      backgroundColor: isEditing ? '#2DC653' : 'transparent',
      border: isEditing ? 'none' : '1px solid #FFB703',
      color: isEditing ? '#000' : '#FFB703',
      padding: '6px 14px',
      borderRadius: '8px',
      fontSize: '13px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    inputCard: {
      backgroundColor: '#161625',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    },
    fieldBox: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '13px',
      color: '#B8B9D6',
      fontWeight: '600'
    },
    input: {
      backgroundColor: '#1F1F35',
      border: '1px solid rgba(255,255,255,0.2)',
      padding: '12px',
      borderRadius: '8px',
      color: '#F0F0FF',
      outline: 'none',
      fontSize: '15px'
    },
    readonlyText: {
      backgroundColor: '#1F1F35',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '12px',
      borderRadius: '8px',
      color: '#F0F0FF',
      fontSize: '15px',
      wordBreak: 'break-word',
    },
    walletCard: {
      backgroundColor: '#161625',
      padding: '16px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#2DC653',
      border: '1px solid rgba(45,198,83,0.3)',
    },
    walletBtn: {
      backgroundColor: 'transparent',
      border: '1px solid #FFB703',
      color: '#FFB703',
      padding: '16px',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: 'pointer',
      width: '100%',
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
      width: '100%',
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
          <p style={styles.userEmail}>{user?.email || "user@example.com"}</p>
        </div>

        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Details & Emergency Contacts</h3>
          <button 
            style={styles.actionBtn}
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? (language === 'hi' ? 'सेव करें' : 'Save') : (language === 'hi' ? 'एडिट करें' : 'Edit')}
          </button>
        </div>

        <div style={styles.inputCard}>
          <div style={styles.fieldBox}>
            <div style={styles.label}>Address</div>
            {isEditing ? (
              <input 
                style={styles.input} 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Enter your address"
              />
            ) : (
              <div style={styles.readonlyText}>{address || "Not available"}</div>
            )}
          </div>

          <div style={styles.fieldBox}>
            <div style={styles.label}>Your Contact Number</div>
            {isEditing ? (
              <input 
                style={styles.input} 
                value={contactNumber} 
                onChange={(e) => handleNumberChange(e.target.value, setContactNumber)} 
                placeholder="Enter 10-digit number"
                inputMode="numeric"
                maxLength={10}
              />
            ) : (
              <div style={styles.readonlyText}>{contactNumber || "Not available"}</div>
            )}
          </div>

          <div style={styles.fieldBox}>
            <div style={styles.label}>Contact 1</div>
            {isEditing ? (
              <input 
                style={styles.input} 
                value={alternateContact1} 
                onChange={(e) => handleNumberChange(e.target.value, setAlternateContact1)} 
                placeholder="Enter 10-digit number"
                inputMode="numeric"
                maxLength={10}
              />
            ) : (
              <div style={styles.readonlyText}>{alternateContact1 || "Not available"}</div>
            )}
          </div>

          <div style={styles.fieldBox}>
            <div style={styles.label}>Contact 2</div>
            {isEditing ? (
              <input 
                style={styles.input} 
                value={alternateContact2} 
                onChange={(e) => handleNumberChange(e.target.value, setAlternateContact2)} 
                placeholder="Enter 10-digit number"
                inputMode="numeric"
                maxLength={10}
              />
            ) : (
              <div style={styles.readonlyText}>{alternateContact2 || "Not available"}</div>
            )}
          </div>
        </div>

        {walletAddress ? (
          <div style={styles.walletCard}>
            <span>🦊 {language === 'hi' ? 'वॉलेट कनेक्टेड' : 'Wallet Connected'}</span>
            <span style={{fontSize: '12px'}}>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
          </div>
        ) : (
          <button onClick={connectWallet} style={styles.walletBtn}>
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
