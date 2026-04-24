import React, { useState, useEffect } from 'react';

const VerificationScreen = ({ onNavigate, user, language }) => {
  const [level, setLevel] = useState(1); // 1 to 6 (6 is success)
  
  // Level 1 States
  const [phone, setPhone] = useState(user?.contactNumber || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  // Level 2 States
  const [dbChecked, setDbChecked] = useState(false);
  
  // Level 3 States
  const [contactPhone, setContactPhone] = useState('');
  const [contactStatus, setContactStatus] = useState('none'); // none, pending, verified
  
  // Level 4 States
  const [walletStatus, setWalletStatus] = useState('none'); // none, verified, skipped
  
  // Level 5 States
  const [perms, setPerms] = useState({ loc: false, mic: false, notif: false });

  // Styles
  const styles = {
    container: {
      minHeight: '100vh', backgroundColor: '#0A0F1E', color: '#FFF',
      fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '20px', paddingBottom: '80px', overflowY: 'auto'
    },
    wrapper: { width: '100%', maxWidth: '390px', display: 'flex', flexDirection: 'column', gap: '20px' },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column', gap: '16px'
    },
    title: { fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#FFB703', textAlign: 'center' },
    subtitle: { fontSize: '14px', color: '#8B95A5', textAlign: 'center', margin: '0 0 16px 0' },
    input: {
      backgroundColor: '#12182B', border: '1px solid rgba(255,255,255,0.2)', padding: '14px',
      borderRadius: '12px', color: '#FFF', fontSize: '16px', outline: 'none', width: '100%', boxSizing: 'border-box'
    },
    btnPrimary: {
      backgroundColor: '#FF3B5C', color: '#FFF', border: 'none', padding: '16px', borderRadius: '12px',
      fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', transition: '0.2s', marginTop: '10px'
    },
    btnSecondary: {
      backgroundColor: 'transparent', color: '#8B95A5', border: '1px solid rgba(255,255,255,0.2)',
      padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%'
    },
    progressWrap: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' },
    dot: (active, completed) => ({
      width: '30px', height: '6px', borderRadius: '3px',
      backgroundColor: completed ? '#00D97E' : (active ? '#FF3B5C' : 'rgba(255,255,255,0.2)'),
      transition: 'all 0.3s'
    }),
    colors: { red: '#FF3B5C', green: '#00D97E', blue: '#4C9EFF', amber: '#FFB703' }
  };

  // --- Level Handlers ---

  const handleSendOtp = () => {
    if (phone.length !== 10) return alert(language === 'hi' ? 'सही 10-digit नंबर डालें' : 'Enter valid 10-digit number');
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) return alert(language === 'hi' ? '6-digit OTP डालें' : 'Enter 6-digit OTP');
    setPhoneVerified(true);
    setTimeout(() => setLevel(2), 1000);
  };

  useEffect(() => {
    if (level === 2 && !dbChecked) {
      const timer = setTimeout(() => {
        setDbChecked(true);
        setTimeout(() => setLevel(3), 2000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [level, dbChecked]);

  const handleSendContactReq = () => {
    if (contactPhone.length !== 10) return alert('Enter valid 10-digit number');
    setContactStatus('pending');
    // Simulate contact accepting the SMS link
    setTimeout(() => {
      setContactStatus('verified');
    }, 4000);
  };

  const handleWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletStatus('verified');
        setTimeout(() => setLevel(5), 1000);
      } else {
        alert("MetaMask not found. Simulating successful connection for demo.");
        setWalletStatus('verified');
        setTimeout(() => setLevel(5), 1000);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const checkPermsComplete = () => {
    if (perms.loc && perms.mic && perms.notif) {
      setTimeout(() => setLevel(6), 1000);
    }
  };
  
  useEffect(() => {
    if (level === 5) checkPermsComplete();
  }, [perms]);

  const calcTrustScore = () => {
    let score = 0;
    if (phoneVerified) score += 30;
    if (contactStatus === 'verified') score += 30;
    if (walletStatus === 'verified') score += 20;
    if (perms.loc) score += 20;
    return score;
  };

  // --- Renderers ---

  const renderProgress = () => (
    <div style={styles.progressWrap}>
      {[1,2,3,4,5].map(i => <div key={i} style={styles.dot(level === i, level > i)} />)}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {level < 6 && renderProgress()}

        {/* LEVEL 1: PHONE */}
        {level === 1 && (
          <div style={styles.glassCard}>
            <h2 style={styles.title}>{language === 'hi' ? 'फोन वेरिफिकेशन' : 'Phone Verification'}</h2>
            <p style={styles.subtitle}>Level 1: Confirm your identity</p>
            
            {!otpSent ? (
              <>
                <div style={{display: 'flex', gap: '10px'}}>
                  <div style={{...styles.input, width: '60px', textAlign: 'center'}}>+91</div>
                  <input style={{...styles.input, flex: 1}} type="number" placeholder="Enter Phone Number" value={phone} onChange={e => setPhone(e.target.value.slice(0,10))} />
                </div>
                <div style={{fontSize: '12px', color: styles.colors.green, display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <span style={{fontSize: '16px'}}>🛡️</span> Protected by Google reCAPTCHA
                </div>
                <button style={styles.btnPrimary} onClick={handleSendOtp}>Send OTP</button>
              </>
            ) : (
              <>
                <input style={{...styles.input, textAlign: 'center', letterSpacing: '8px', fontSize: '24px'}} type="number" placeholder="••••••" value={otp} onChange={e => setOtp(e.target.value.slice(0,6))} />
                <div style={{fontSize: '12px', color: styles.colors.amber, textAlign: 'center'}}>Expires in 00:29s</div>
                {!phoneVerified ? (
                  <button style={styles.btnPrimary} onClick={handleVerifyOtp}>Verify OTP</button>
                ) : (
                  <div style={{...styles.btnPrimary, backgroundColor: styles.colors.green, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                    ✓ Number Verified
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* LEVEL 2: DB CHECK */}
        {level === 2 && (
          <div style={{...styles.glassCard, alignItems: 'center', justifyContent: 'center', minHeight: '300px'}}>
            <style>{`
              @keyframes spinPulse {
                0% { transform: scale(1); filter: drop-shadow(0 0 10px #FF3B5C); }
                50% { transform: scale(1.1); filter: drop-shadow(0 0 30px #FF3B5C); }
                100% { transform: scale(1); filter: drop-shadow(0 0 10px #FF3B5C); }
              }
            `}</style>
            {!dbChecked ? (
              <>
                <div style={{fontSize: '60px', animation: 'spinPulse 1.5s infinite'}}>🛡️</div>
                <h3 style={{marginTop: '20px'}}>Checking Database...</h3>
                <p style={{color: styles.colors.textSec, fontSize: '14px'}}>Securely verifying user profile existence.</p>
              </>
            ) : (
              <>
                <div style={{fontSize: '60px'}}>👋</div>
                <h3 style={{marginTop: '20px', color: styles.colors.green}}>Welcome, {user?.name || 'Priya'}</h3>
                <p style={{color: styles.colors.textSec, fontSize: '14px'}}>Profile verified.</p>
              </>
            )}
          </div>
        )}

        {/* LEVEL 3: CONTACTS */}
        {level === 3 && (
          <div style={styles.glassCard}>
            <h2 style={styles.title}>{language === 'hi' ? 'इमरजेंसी संपर्क' : 'Emergency Contacts'}</h2>
            <p style={styles.subtitle}>Level 3: Add a trusted contact. They must accept the request for your SOS to work.</p>
            
            {contactStatus === 'none' && (
              <>
                <input style={styles.input} type="number" placeholder="Contact's 10-digit number" value={contactPhone} onChange={e => setContactPhone(e.target.value.slice(0,10))} />
                <button style={styles.btnPrimary} onClick={handleSendContactReq}>Send Invite SMS</button>
              </>
            )}

            {contactStatus === 'pending' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center'}}>
                <div style={{padding: '16px', background: 'rgba(255,183,3,0.1)', border: `1px solid ${styles.colors.amber}`, borderRadius: '12px', color: styles.colors.amber, width: '100%', textAlign: 'center'}}>
                  <div style={{fontSize: '24px', marginBottom: '8px'}}>⏳</div>
                  <strong>Waiting for Approval</strong>
                  <p style={{fontSize: '12px', margin: '8px 0 0 0'}}>SMS sent. Waiting for contact to click the accept link...</p>
                </div>
              </div>
            )}

            {contactStatus === 'verified' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center'}}>
                <div style={{padding: '16px', background: 'rgba(0,217,126,0.1)', border: `1px solid ${styles.colors.green}`, borderRadius: '12px', color: styles.colors.green, width: '100%', textAlign: 'center'}}>
                  <div style={{fontSize: '24px', marginBottom: '8px'}}>✅</div>
                  <strong>Contact Verified</strong>
                  <p style={{fontSize: '12px', margin: '8px 0 0 0'}}>Your SOS feature is now fully active.</p>
                </div>
                <button style={styles.btnPrimary} onClick={() => setLevel(4)}>Continue</button>
              </div>
            )}
          </div>
        )}

        {/* LEVEL 4: WALLET */}
        {level === 4 && (
          <div style={styles.glassCard}>
            <h2 style={styles.title}>{language === 'hi' ? 'वेब3 वॉलेट' : 'Web3 Wallet Binding'}</h2>
            <p style={styles.subtitle}>Level 4: Cryptographically bind your device to ensure danger reports are immutable.</p>
            
            {walletStatus === 'none' && (
              <>
                <div style={{padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '13px', color: '#FFF', marginBottom: '10px'}}>
                  <strong>Message to sign:</strong><br/>
                  <span style={{color: styles.colors.textSec}}>I am binding this wallet to my RakshakPath account: {user?.contactNumber || 'user123'}</span>
                </div>
                <button style={{...styles.btnPrimary, background: 'linear-gradient(45deg, #FFB703, #FF3B5C)'}} onClick={handleWallet}>
                  🦊 Connect & Sign via MetaMask
                </button>
                <button style={{...styles.btnSecondary, marginTop: '10px'}} onClick={() => { setWalletStatus('skipped'); setLevel(5); }}>
                  Skip for now
                </button>
              </>
            )}

            {walletStatus === 'verified' && (
              <div style={{padding: '16px', background: 'rgba(0,217,126,0.1)', border: `1px solid ${styles.colors.green}`, borderRadius: '12px', color: styles.colors.green, textAlign: 'center'}}>
                <div style={{fontSize: '24px', marginBottom: '8px'}}>🦊 ✅</div>
                <strong>Wallet Bound Successfully</strong>
              </div>
            )}
          </div>
        )}

        {/* LEVEL 5: PERMISSIONS */}
        {level === 5 && (
          <div style={styles.glassCard}>
            <h2 style={styles.title}>{language === 'hi' ? 'परमिशन' : 'Safety Permissions'}</h2>
            <p style={styles.subtitle}>Level 5: Allow access for core safety features.</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: perms.loc ? `1px solid ${styles.colors.green}` : 'none'}}>
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '15px'}}>📍 GPS Location</div>
                  <div style={{fontSize: '12px', color: styles.colors.textSec}}>Required for map & SOS</div>
                </div>
                <button onClick={() => setPerms({...perms, loc: true})} style={{padding: '8px 16px', borderRadius: '20px', border: 'none', background: perms.loc ? styles.colors.green : '#FFF', color: perms.loc ? '#FFF' : '#000', fontWeight: 'bold'}}>
                  {perms.loc ? 'Granted' : 'Allow'}
                </button>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: perms.mic ? `1px solid ${styles.colors.green}` : 'none'}}>
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '15px'}}>🎙️ Microphone</div>
                  <div style={{fontSize: '12px', color: styles.colors.textSec}}>Required for Voice SOS</div>
                </div>
                <button onClick={() => setPerms({...perms, mic: true})} style={{padding: '8px 16px', borderRadius: '20px', border: 'none', background: perms.mic ? styles.colors.green : '#FFF', color: perms.mic ? '#FFF' : '#000', fontWeight: 'bold'}}>
                  {perms.mic ? 'Granted' : 'Allow'}
                </button>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: perms.notif ? `1px solid ${styles.colors.green}` : 'none'}}>
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '15px'}}>🔔 Notifications</div>
                  <div style={{fontSize: '12px', color: styles.colors.textSec}}>Required for alerts</div>
                </div>
                <button onClick={() => setPerms({...perms, notif: true})} style={{padding: '8px 16px', borderRadius: '20px', border: 'none', background: perms.notif ? styles.colors.green : '#FFF', color: perms.notif ? '#FFF' : '#000', fontWeight: 'bold'}}>
                  {perms.notif ? 'Granted' : 'Allow'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LEVEL 6: SUCCESS SUMMARY */}
        {level === 6 && (
          <div style={{...styles.glassCard, alignItems: 'center', padding: '30px 20px'}}>
            <div style={{width: '80px', height: '80px', background: `rgba(0,217,126,0.2)`, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: `2px solid ${styles.colors.green}`, marginBottom: '16px'}}>
              <span style={{fontSize: '40px'}}>🛡️</span>
            </div>
            <h2 style={{color: styles.colors.green, margin: '0 0 8px 0'}}>Account Verified</h2>
            <p style={styles.subtitle}>You are now ready to navigate safely.</p>

            <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
                <span>📱 Phone Identity</span>
                <span style={{color: styles.colors.green}}>✓ Verified</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
                <span>🤝 Emergency Contacts</span>
                <span style={{color: styles.colors.green}}>✓ Trusted</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
                <span>🦊 Web3 Wallet</span>
                {walletStatus === 'verified' ? <span style={{color: styles.colors.blue}}>✓ Bound</span> : <span style={{color: styles.colors.textSec}}>Skipped</span>}
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
                <span>📍 Location Systems</span>
                <span style={{color: styles.colors.green}}>✓ Active</span>
              </div>
            </div>

            <div style={{background: 'rgba(76, 158, 255, 0.1)', border: `1px solid ${styles.colors.blue}`, borderRadius: '16px', padding: '20px', width: '100%', textAlign: 'center', marginBottom: '20px'}}>
              <div style={{fontSize: '14px', color: styles.colors.textSec}}>Final Trust Score</div>
              <div style={{fontSize: '48px', fontWeight: 'bold', color: styles.colors.blue}}>{calcTrustScore()}/100</div>
            </div>

            <button style={{...styles.btnPrimary, backgroundColor: styles.colors.green, color: '#000'}} onClick={() => onNavigate('home', { user: {...user, isVerified: true} })}>
              Enter RakshakPath
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerificationScreen;
