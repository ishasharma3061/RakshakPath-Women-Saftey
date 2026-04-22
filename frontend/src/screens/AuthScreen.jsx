import React, { useState } from 'react';

const AuthScreen = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Bypassing real authentication for demo purposes
    // In production, wire this to Firebase Auth
    onNavigate('home', { userName: isLogin ? (email.split('@')[0] || 'User') : (name || 'User') });
  };

  const primaryColor = '#FFB703';
  const bgColor = '#0D0D1A';
  const cardColor = '#161625';
  const textColor = '#F0F0FF';
  const mutedColor = '#8888AA';
  const inputBg = '#1F1F35';
  const inputBorder = 'rgba(255, 255, 255, 0.1)';

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: bgColor,
      color: textColor,
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    },
    wrapper: {
      width: '100%',
      maxWidth: '430px',
      backgroundColor: cardColor,
      borderRadius: '20px',
      padding: '40px 30px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    logo: {
      fontSize: '48px',
      marginBottom: '10px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      fontFamily: "'Rajdhani', sans-serif",
      color: primaryColor,
      margin: '0 0 5px 0'
    },
    subtitle: {
      color: mutedColor,
      fontSize: '14px',
      margin: '0 0 30px 0',
      textAlign: 'center'
    },
    form: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '13px',
      color: mutedColor,
      fontWeight: 'bold'
    },
    input: {
      width: '100%',
      backgroundColor: inputBg,
      border: `1px solid ${inputBorder}`,
      borderRadius: '8px',
      padding: '14px',
      color: textColor,
      fontSize: '15px',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    submitBtn: {
      width: '100%',
      backgroundColor: primaryColor,
      color: '#000',
      border: 'none',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px',
      boxShadow: `0 4px 15px ${primaryColor}40`,
      transition: 'transform 0.1s'
    },
    toggleText: {
      color: mutedColor,
      fontSize: '14px',
      marginTop: '25px',
      textAlign: 'center'
    },
    toggleLink: {
      color: primaryColor,
      cursor: 'pointer',
      fontWeight: 'bold',
      marginLeft: '5px'
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Rajdhani:wght@500;600;700&display=swap');
          
          body { margin: 0; background-color: #0D0D1A; }
          * { box-sizing: border-box; }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.logo}>🛡️</div>
          <h1 style={styles.title}>RAKSHAKPATH</h1>
          <p style={styles.subtitle}>Guarded Routes for Every Woman</p>

          <form style={styles.form} onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input 
                  style={styles.input} 
                  type="text" 
                  placeholder="e.g. Aditi Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            )}
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                style={styles.input} 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input 
                style={styles.input} 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" style={styles.submitBtn}>
              {isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div style={styles.toggleText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span 
              style={styles.toggleLink} 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthScreen;
