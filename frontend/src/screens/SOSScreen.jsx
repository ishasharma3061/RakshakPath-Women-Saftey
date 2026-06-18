import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { sendSOS } from '../api';

emailjs.init("ZNNuLKc75zgQzIz56");

const SOSScreen = ({ onNavigate, user, language }) => {
  const [location, setLocation] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSilentMode, setIsSilentMode] = useState(false);

  const triggerEmergency = (silent = false) => {
    setIsCounting(false);
    if (silent) setIsSilentMode(true);
    
    setTimestamp(new Date().toLocaleTimeString());
    
    const templateParams = {
      to_email: "kjindal509@gmail.com",
      user_name: "RAKSHAKPATH User",
      location: location ? `${location.lat}, ${location.lng}` : "Location not available",
      latitude: location ? location.lat : "Unknown",
      longitude: location ? location.lng : "Unknown",
      time: new Date().toLocaleString()
    };

    const googleMapsUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : "Location not available";
    // For Hackathon Demo: Force injecting the verified Twilio number to ensure call/sms delivery
    const demoNumber = "7986578178";
    const contactsList = [user?.emergencyContact1 || demoNumber, user?.emergencyContact2].filter(Boolean);
    const smsMessage = `🚨 HELP! I am using RAKSHAKPATH and I need assistance. My last location: ${googleMapsUrl}`;

    // --- OFFLINE FALLBACK ---
    if (!navigator.onLine) {
      if (contactsList.length > 0) {
        const phones = contactsList.join(',');
        window.location.href = `sms:${phones}?body=${encodeURIComponent(smsMessage)}`;
        setEmailError('No internet connection. Opening your SMS app to send alert via mobile network.');
        setAlertSent(true);
      } else {
        setEmailError('Network is offline and no emergency contacts are saved.');
        setAlertSent(false);
      }
      return;
    }

    // Call Backend (This now triggers Twilio SMS & Call)
    sendSOS({
      latitude: templateParams.latitude,
      longitude: templateParams.longitude,
      location: templateParams.location,
      time: templateParams.time,
      user_name: user?.name || "RAKSHAKPATH User",
      contacts: contactsList
    }).then((res) => {
      setAlertSent(true);
      setEmailError(''); // Clear any previous errors
    }).catch(err => {
      console.error("SOS Error:", err);
      // --- SERVER ERROR FALLBACK ---
      if (contactsList.length > 0) {
        const phones = contactsList.join(',');
        window.location.href = `sms:${phones}?body=${encodeURIComponent(smsMessage)}`;
        setEmailError('Server error. Opening your SMS app to send alert manually.');
        setAlertSent(true);
      } else {
        const errorMessage = err.response?.data?.error || "Failed to trigger emergency system.";
        setEmailError(errorMessage);
        setAlertSent(false);
      }
    });
  };

  // 1. Voice Trigger SOS Listener
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return; // Browser doesn't support it

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (transcript.includes('help') || transcript.includes('bachao') || transcript.includes('danger') || transcript.includes('emergency')) {
        setIsCounting(prev => {
          if (!prev && !alertSent) {
            setCountdown(5);
            return true;
          }
          return prev;
        });
      }
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e) {
      console.log("Failed to start voice recognition", e);
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [alertSent]);

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
      triggerEmergency(false);
    }
    return () => clearInterval(timer);
  }, [isCounting, countdown, location]);

  const handleSOSClick = () => {
    // Proceed with SOS directly
    if (!alertSent) {
      triggerEmergency(false);
    }
  };

  const handleCancel = () => {
    setIsCounting(false);
  };

  const resetSOS = () => {
    setAlertSent(false);
    setIsCounting(false);
    setEmailError('');
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

  if (isSilentMode) {
    return (
      <div 
        style={{ backgroundColor: '#000', height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }} 
        onClick={() => setIsSilentMode(false)}
      >
      </div>
    );
  }

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
          @keyframes pulseMic {
            0% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0.5; transform: scale(1); }
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
              
              {!isCounting && !alertSent && !emailError && (
                <>
                  <div style={styles.sosButtonContainer}>
                    <button style={styles.sosButton} onClick={handleSOSClick}>
                      <span style={styles.sosText}>SOS</span>
                    </button>
                  </div>
                  <div style={styles.pulseText}>Press directly or speak in emergency</div>
                  {isListening && (
                    <div style={{ marginTop: '16px', color: '#2DC653', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                      <span style={{ animation: 'pulseMic 1.5s infinite' }}>🎙️</span> Listening for "Help" or "Bachao"...
                    </div>
                  )}

                  <button 
                    style={{
                      marginTop: '30px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', 
                      color: '#8888AA', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer'
                    }}
                    onClick={() => triggerEmergency(true)}
                  >
                    🥷 Use Silent SOS (No countdown)
                  </button>
                </>
              )}

              {isCounting && !alertSent && !emailError && (
                <>
                  <div style={styles.pulseText}>Sending alert...</div>
                </>
              )}

              {(alertSent || emailError) && (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  {emailError ? (
                    <>
                      <div style={styles.successIcon}>❌</div>
                      <h2 style={{ ...styles.successTitle, color: '#E63946' }}>Alert Failed!</h2>
                      <p style={{ color: '#E63946', textAlign: 'center', marginBottom: '8px' }}>{emailError}</p>
                    </>
                  ) : (
                    <>
                      <div style={styles.successIcon}>✅</div>
                      <h2 style={styles.successTitle}>Alert Sent!</h2>
                      <p style={styles.successDesc}>Automated Call & SMS triggered successfully!</p>
                      {location && <p style={styles.successInfo}>Location: {location.lat}, {location.lng}</p>}
                      <p style={styles.successInfo}>Time: {timestamp}</p>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', width: '100%', justifyContent: 'center' }}>
                        <button 
                          style={{ flex: 1, backgroundColor: 'rgba(76, 158, 255, 0.1)', border: '1px solid #4C9EFF', padding: '12px', borderRadius: '8px', color: '#4C9EFF', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}
                          onClick={() => window.location.href = `tel:+91${user?.emergencyContact1 || "7986578178"}`}
                        >
                          <span style={{fontSize: '18px'}}>📞</span> Call Contact 1
                        </button>
                        {user?.emergencyContact2 && (
                          <button 
                            style={{ flex: 1, backgroundColor: 'rgba(76, 158, 255, 0.1)', border: '1px solid #4C9EFF', padding: '12px', borderRadius: '8px', color: '#4C9EFF', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}
                            onClick={() => window.location.href = `tel:+91${user.emergencyContact2}`}
                          >
                            <span style={{fontSize: '18px'}}>📞</span> Call Contact 2
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  <button style={{ ...styles.backHomeBtn, marginTop: '24px' }} onClick={resetSOS}>Back to Dashboard</button>
                </div>
              )}

            </div>

            {/* TRUSTED CONTACTS SECTION */}
            <div style={styles.contactsSection}>
              <h3 style={styles.sectionTitle}>📞 Trusted Contacts</h3>
              
              {[user?.emergencyContact1 || "7986578178", user?.emergencyContact2].map((contact, idx) => {
                if (!contact) return null;
                const formattedPhone = contact.startsWith('+') ? contact : `+91${contact}`;
                const smsMessage = `🚨 HELP! I am using RAKSHAKPATH and I need assistance. My last location: ${location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : "Not available"}`;

                return (
                  <div key={idx} style={styles.contactCard}>
                    <div style={{ flex: 1 }}>
                      <div style={styles.contactName}>Contact {idx + 1}</div>
                      <div style={styles.contactNumber}>{formattedPhone}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        style={{ ...styles.badge, backgroundColor: '#2DC653', color: '#000', border: 'none', cursor: 'pointer', padding: '8px 12px' }}
                        onClick={() => window.location.href = `tel:${formattedPhone}`}
                      >
                        📞 Call
                      </button>
                      <button 
                        style={{ ...styles.badge, backgroundColor: '#4C9EFF', color: '#FFF', border: 'none', cursor: 'pointer', padding: '8px 12px' }}
                        onClick={() => window.location.href = `sms:${formattedPhone}?body=${encodeURIComponent(smsMessage)}`}
                      >
                        💬 SMS
                      </button>
                    </div>
                  </div>
                );
              })}
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
