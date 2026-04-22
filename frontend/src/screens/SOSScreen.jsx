import React, { useState, useEffect } from 'react';

const SOSScreen = ({ onNavigate }) => {
  const [location, setLocation] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  // 1. Fetch GPS Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
        },
        (err) => console.log('Geolocation error:', err)
      );
    }
  }, []);

  // 2. Countdown Timer Logic
  useEffect(() => {
    let timer;
    if (isCounting && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCounting && countdown === 0) {
      setIsCounting(false);
      setAlertSent(true);
      setTimestamp(new Date().toLocaleTimeString());
    }
    return () => clearInterval(timer);
  }, [isCounting, countdown]);

  const handleSOSClick = () => {
    if (!isCounting && !alertSent) {
      setIsCounting(true);
      setCountdown(5);
    }
  };

  const handleCancel = () => {
    setIsCounting(false);
    setCountdown(5);
  };

  const resetSOS = () => {
    setAlertSent(false);
    setIsCounting(false);
    setCountdown(5);
    onNavigate('home');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0D0D1A',
      color: '#F0F0FF',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    },
    wrapper: {
      width: '100%',
      maxWidth: '430px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      height: '100vh',
      paddingBottom: '80px',
      boxSizing: 'border-box'
    },
    // HEADER
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px 20px',
      backgroundColor: '#161625',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      gap: '16px',
      zIndex: 10
    },
    backBtn: {
      background: 'none',
      border: 'none',
      color: '#F0F0FF',
      fontSize: '20px',
      cursor: 'pointer',
      padding: 0,
    },
    headerTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      fontFamily: "'Rajdhani', sans-serif",
      margin: 0,
      color: '#E63946'
    },
    // CONTENT AREA
    content: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      flexGrow: 1,
      overflowY: 'auto'
    },
    // STATUS CARD
    statusCard: {
      backgroundColor: '#161625',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    },
    statusTextActive: {
      color: '#2DC653',
      fontWeight: 'bold',
      fontSize: '15px'
    },
    statusTextLoading: {
      color: '#FFB703',
      fontWeight: 'bold',
      fontSize: '15px'
    },
    coords: {
      color: '#8888AA',
      fontSize: '13px',
      marginTop: '8px',
      fontFamily: "monospace"
    },
    // SOS BUTTON / COUNTDOWN / SUCCESS AREA
    actionArea: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '240px'
    },
    sosButtonContainer: {
      position: 'relative',
      width: '180px',
      height: '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sosButton: {
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      backgroundColor: '#E63946',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: 2,
      position: 'relative',
      animation: 'pulseSOS 2s infinite',
      boxShadow: '0 0 30px rgba(230,57,70,0.5)',
    },
    sosText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      letterSpacing: '2px',
      fontSize: '40px',
      fontFamily: "'Rajdhani', sans-serif"
    },
    pulseText: {
      color: '#E63946',
      fontWeight: 'bold',
      fontSize: '16px',
      marginTop: '24px',
      textAlign: 'center'
    },
    // COUNTDOWN
    countNum: {
      fontSize: '80px',
      fontWeight: 'bold',
      color: '#E63946',
      fontFamily: "'Rajdhani', sans-serif"
    },
    cancelBtn: {
      marginTop: '20px',
      backgroundColor: 'transparent',
      border: '2px solid #E63946',
      color: '#E63946',
      padding: '12px 32px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: 'pointer'
    },
    // SUCCESS
    successIcon: {
      fontSize: '60px',
      marginBottom: '12px'
    },
    successTitle: {
      color: '#2DC653',
      fontSize: '28px',
      fontWeight: 'bold',
      fontFamily: "'Rajdhani', sans-serif",
      margin: '0 0 8px 0'
    },
    successDesc: {
      color: '#F0F0FF',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '8px'
    },
    successInfo: {
      color: '#8888AA',
      fontSize: '13px',
      margin: '4px 0'
    },
    backHomeBtn: {
      marginTop: '24px',
      backgroundColor: '#2DC653',
      color: '#000000',
      border: 'none',
      padding: '14px 24px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: 'pointer',
      width: '100%'
    },
    // TRUSTED CONTACTS
    contactsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: "'Rajdhani', sans-serif",
      margin: 0
    },
    contactCard: {
      backgroundColor: '#161625',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    contactName: {
      fontWeight: 'bold',
      fontSize: '16px',
      color: '#F0F0FF'
    },
    contactNumber: {
      color: '#8888AA',
      fontSize: '13px',
      marginTop: '4px'
    },
    badge: {
      backgroundColor: 'rgba(45,198,83,0.1)',
      color: '#2DC653',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 'bold'
    },
    // TIPS
    tipsCard: {
      backgroundColor: 'rgba(255,183,3,0.05)',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(255,183,3,0.2)',
      marginTop: '8px'
    },
    tipsTitle: {
      color: '#FFB703',
      fontWeight: 'bold',
      fontSize: '16px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    tipItem: {
      color: '#F0F0FF',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    },
    // BOTTOM NAV
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: '#161625',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 10,
      borderTop: '1px solid rgba(255,255,255,0.07)',
      boxSizing: 'border-box'
    },
    navItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      cursor: 'pointer',
      color: '#8888AA',
      fontSize: '12px',
      border: 'none',
      background: 'none'
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Rajdhani:wght@500;600;700&display=swap');
          
          body {
            margin: 0;
            background-color: #0D0D1A;
          }
          * {
            box-sizing: border-box;
          }
          @keyframes pulseSOS {
            0% { transform: scale(1); box-shadow: 0 0 20px rgba(230,57,70,0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(230,57,70,0.8); }
            100% { transform: scale(1); box-shadow: 0 0 20px rgba(230,57,70,0.4); }
          }
        `}
      </style>

      <div style={styles.container}>
        <div style={styles.wrapper}>
          
          {/* HEADER */}
          <div style={styles.header}>
            <button style={styles.backBtn} onClick={() => onNavigate('home')}>←</button>
            <h1 style={styles.headerTitle}>🆘 SOS Emergency</h1>
          </div>

          <div style={styles.content}>
            
            {/* STATUS CARD */}
            <div style={styles.statusCard}>
              {location ? (
                <>
                  <span style={styles.statusTextActive}>📍 Location detected</span>
                  <span style={styles.coords}>{location.lat}, {location.lng}</span>
                </>
              ) : (
                <span style={styles.statusTextLoading}>Fetching location...</span>
              )}
            </div>

            {/* ACTION AREA (Default / Countdown / Success) */}
            <div style={styles.actionArea}>
              
              {!isCounting && !alertSent && (
                <>
                  <div style={styles.sosButtonContainer}>
                    <button style={styles.sosButton} onClick={handleSOSClick}>
                      <span style={styles.sosText}>SOS</span>
                    </button>
                  </div>
                  <div style={styles.pulseText}>Press in emergency</div>
                </>
              )}

              {isCounting && !alertSent && (
                <>
                  <div style={styles.countNum}>{countdown}</div>
                  <div style={styles.pulseText}>Sending alert in {countdown} seconds...</div>
                  <button style={styles.cancelBtn} onClick={handleCancel}>CANCEL</button>
                </>
              )}

              {alertSent && (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <div style={styles.successIcon}>✅</div>
                  <h2 style={styles.successTitle}>Alert Sent!</h2>
                  <p style={styles.successDesc}>Your location has been shared with 2 contacts</p>
                  {location && <p style={styles.successInfo}>Location: {location.lat}, {location.lng}</p>}
                  <p style={styles.successInfo}>Time: {timestamp}</p>
                  <button style={styles.backHomeBtn} onClick={resetSOS}>Back to Home</button>
                </div>
              )}

            </div>

            {/* TRUSTED CONTACTS SECTION */}
            <div style={styles.contactsSection}>
              <h3 style={styles.sectionTitle}>📞 Trusted Contacts</h3>
              
              <div style={styles.contactCard}>
                <div>
                  <div style={styles.contactName}>👩 Mom</div>
                  <div style={styles.contactNumber}>+91 98765 43210</div>
                </div>
                <div style={styles.badge}>Will be notified</div>
              </div>

              <div style={styles.contactCard}>
                <div>
                  <div style={styles.contactName}>👫 Best Friend</div>
                  <div style={styles.contactNumber}>+91 91234 56789</div>
                </div>
                <div style={styles.badge}>Will be notified</div>
              </div>
            </div>

            {/* SAFETY TIPS CARD */}
            <div style={styles.tipsCard}>
              <div style={styles.tipsTitle}>💡 Stay Safe</div>
              <div style={styles.tipItem}>• Move to a crowded/lit area</div>
              <div style={styles.tipItem}>• Stay on call with someone</div>
              <div style={styles.tipItem}>• Share live location if possible</div>
            </div>

          </div>

          {/* FIXED BOTTOM NAV */}
          <div style={styles.bottomNav}>
            <button style={styles.navItem} onClick={() => onNavigate('home')}>
              <span style={{fontSize: '20px'}}>🏠</span>
              <span>Home</span>
            </button>
            <button style={styles.navItem} onClick={() => onNavigate('map')}>
              <span style={{fontSize: '20px'}}>🗺️</span>
              <span>Map</span>
            </button>
            <button style={{...styles.navItem, color: '#F0F0FF'}} onClick={() => onNavigate('sos')}>
              <span style={{fontSize: '20px'}}>🆘</span>
              <span>SOS</span>
            </button>
            <button style={styles.navItem} onClick={() => onNavigate('report')}>
              <span style={{fontSize: '20px'}}>⚠️</span>
              <span>Report</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default SOSScreen;
