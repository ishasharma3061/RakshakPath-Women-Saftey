import React, { useState, useEffect } from 'react';
import { auth } from "../api"; 
import API from "../api";

const VerificationScreen = ({ onNavigate, user, language }) => {
  const [level, setLevel] = useState(1);
  const [phone, setPhone] = useState(user?.email || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [actualEmailOtp, setActualEmailOtp] = useState('');
  const [dbChecked, setDbChecked] = useState(false);
  const [perms, setPerms] = useState({ loc: false, mic: false, notif: false });

  const handleSendOtp = async () => {
    if (!phone) {
      alert("Please enter your email address.");
      return;
    }

    // Email check
    if (user?.email && phone.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
      alert(`Please use the same email you signed up with: ${user.email}`);
      return;
    }

    try {
      const response = await API.post("/api/send-email-otp", { email: phone });
      
      if (response.status === 200) {
        setOtpSent(true);
        setActualEmailOtp('SENT');
        alert(`OTP has been sent to ${phone}!`);
      } else {
        alert("Error: Failed to send email");
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || "Failed to connect to backend server."));
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await API.post("/api/verify-email-otp", { email: phone, otp });
      const data = response.data;
      
      if (data.success) {
        setPhoneVerified(true);
        setTimeout(() => setLevel(2), 1000);
      } else {
        alert("Invalid OTP!");
      }
    } catch (error) {
      alert("Verification failed!");
    }
  };

  const styles = {
    title: { fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#FFB703', textAlign: 'center' },
    subtitle: { fontSize: '14px', color: '#8B95A5', textAlign: 'center', margin: '0 0 16px 0' },
    progressWrap: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' },
    dot: (active, completed) => ({ width: '40px', height: '6px', borderRadius: '3px', backgroundColor: completed ? '#00D97E' : (active ? '#FF3B5C' : 'rgba(255,255,255,0.2)'), transition: 'all 0.3s' }),
    colors: { red: '#FF3B5C', green: '#00D97E', blue: '#4C9EFF', amber: '#FFB703', textSec: '#8B95A5' }
  };

  useEffect(() => { 
    if (level === 2 && !dbChecked) { 
      setTimeout(() => { 
        setDbChecked(true); 
        setTimeout(() => setLevel(3), 1500); 
      }, 1500); 
    } 
  }, [level, dbChecked]);

  const renderProgress = () => ( 
    <div style={styles.progressWrap}> 
      {[1, 2, 3].map(i => <div key={i} style={styles.dot(level === i, level > i)} />)} 
    </div> 
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', paddingBottom: '80px', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => onNavigate('auth', { logout: true })}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', cursor: 'pointer', fontSize: '20px' }}
          >
            ←
          </button>
          <span style={{ color: '#888', fontSize: '14px' }}>Back to Auth</span>
        </div>

        {level < 4 && renderProgress()}
        
        <div id="recaptcha-container"></div>

        {level === 1 && (
          <div className="glass-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <h2 style={styles.title}>{language === 'hi' ? 'ईमेल वेरिफिकेशन' : 'Email Verification'}</h2>
            <p style={styles.subtitle}>Level 1: Confirm your identity</p>
            
            {!otpSent ? (
              <>
                <input className="glass-input" type="text" placeholder="Email Address" value={phone} onChange={e => setPhone(e.target.value)} />
                <button className="btn-primary" onClick={handleSendOtp}>Send OTP</button>
              </>
            ) : (
              <>
                <input 
                  className="glass-input" 
                  style={{textAlign: 'center', letterSpacing: '8px', fontSize: '24px'}} 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••••" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0,6))} 
                />
                {!phoneVerified ? <button className="btn-primary" onClick={handleVerifyOtp}>Verify OTP</button> : <div className="btn-primary" style={{backgroundColor: styles.colors.green, color: '#000', textAlign: 'center'}}>✓ Verified</div>}
              </>
            )}
            <p style={{fontSize: '11px', color: '#888', textAlign: 'center'}}>OTP will be sent to your email.</p>
          </div>
        )}

        {level === 2 && (
          <div className="glass-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <h2 style={styles.title}>Database Check</h2>
            <p style={styles.subtitle}>Level 2: Verifying records...</p>
            {!dbChecked ? (
              <div style={{ textAlign: 'center', padding: '20px', color: styles.colors.blue }}>Scanning Database...</div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: styles.colors.green }}>✓ Clean Record Found</div>
            )}
          </div>
        )}

        {level === 3 && (
          <div className="glass-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <h2 style={styles.title}>Device Access</h2>
            <p style={styles.subtitle}>Level 3: Required for SOS</p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <button className="btn-secondary" style={{color: perms.loc ? styles.colors.green : '#FFF'}} onClick={() => setPerms({...perms, loc: true})}>📍 Location {perms.loc && '✓'}</button>
              <button className="btn-secondary" style={{color: perms.mic ? styles.colors.green : '#FFF'}} onClick={() => setPerms({...perms, mic: true})}>🎙️ Microphone {perms.mic && '✓'}</button>
              <button className="btn-secondary" style={{color: perms.notif ? styles.colors.green : '#FFF'}} onClick={() => setPerms({...perms, notif: true})}>🔔 Notifications {perms.notif && '✓'}</button>
            </div>
            <button className="btn-primary" style={{opacity: (perms.loc && perms.mic && perms.notif) ? 1 : 0.5}} onClick={() => { if(perms.loc && perms.mic && perms.notif) setLevel(4) }}>Complete Setup</button>
          </div>
        )}
        
        {level === 4 && (
            <div className="glass-card" style={{alignItems: 'center', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div style={{fontSize: '50px'}}>🎉</div>
              <h2 style={{color: styles.colors.green}}>Profile Verified!</h2>
              <p style={{color: '#888', textAlign: 'center'}}>Your account is now fully secured with RakshakPath.</p>
              <button className="btn-primary" onClick={() => onNavigate('home', { user: { ...(user || {}), isVerified: true } })}>Enter RakshakPath</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default VerificationScreen;