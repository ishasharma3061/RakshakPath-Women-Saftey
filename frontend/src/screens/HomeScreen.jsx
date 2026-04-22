import { useState, useEffect } from "react";

const HomeScreen = ({ onNavigate, language, setLanguage }) => {
  const t = {
    tagline: language === 'hi' ? 'हर महिला के लिए सुरक्षित रास्ते' : 'Guarded Routes for Every Woman',
    heroTitle: language === 'hi' ? 'सुरक्षित रहें, स्मार्ट नेविगेट करें' : 'Stay Safe, Navigate Smart',
    heroSub: language === 'hi' ? 'हर महिला के लिए AI-संचालित सुरक्षित मार्ग' : 'AI-powered safe routes for every woman',
    pressEmerg: language === 'hi' ? 'आपातकाल में दबाएं' : 'Press in emergency',
    findRoute: language === 'hi' ? 'सुरक्षित मार्ग खोजें' : 'Find Safe Route',
    reportDanger: language === 'hi' ? 'खतरे की रिपोर्ट करें' : 'Report Danger',
    recent: language === 'hi' ? '⚠️ हालिया खतरे की रिपोर्ट' : '⚠️ Recent Danger Reports',
    home: language === 'hi' ? 'होम' : 'Home',
    map: language === 'hi' ? 'नक्शा' : 'Map',
    report: language === 'hi' ? 'रिपोर्ट' : 'Report',
    statsDaz: language === 'hi' ? 'खतरनाक क्षेत्र' : 'Danger Zones',
    statsSafe: language === 'hi' ? 'सुरक्षित मार्ग' : 'Safe Routes',
    statsRep: language === 'hi' ? 'रिपोर्ट्स' : 'Reports',
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
      paddingBottom: '80px',
    },
    wrapper: {
      width: '100%',
      maxWidth: '430px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
    },
    // 1. HEADER
    header: {
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '10px'
    },
    headerTitleBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      fontFamily: "'Rajdhani', sans-serif",
      margin: 0,
      color: '#F0F0FF'
    },
    tagline: {
      fontSize: '14px',
      color: '#8888AA',
      margin: '4px 0 0 0'
    },
    locationBadge: {
      backgroundColor: 'rgba(45, 198, 83, 0.1)',
      color: '#2DC653',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '8px',
      alignSelf: 'flex-start'
    },
    // 2. HERO SECTION
    hero: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      marginTop: '16px'
    },
    heroTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#F0F0FF',
      margin: '0 0 8px 0',
      lineHeight: '1.2'
    },
    heroSubtext: {
      color: '#8888AA',
      fontSize: '16px',
      margin: '0 0 36px 0'
    },
    sosButtonContainer: {
      position: 'relative',
      width: '160px',
      height: '160px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    },
    sosButton: {
      width: '160px',
      height: '160px',
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
      animation: 'pulseSOS 2s infinite'
    },
    sosText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      letterSpacing: '2px',
      fontSize: '32px',
    },
    sosHelpText: {
      color: '#F0F0FF',
      fontSize: '14px',
      margin: 0
    },
    // 3. STATS BAR
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '12px',
    },
    statCard: {
      backgroundColor: '#161625',
      borderRadius: '12px',
      padding: '16px 8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    },
    statValueDanger: { color: '#E63946', fontWeight: 'bold', fontSize: '24px' },
    statValueSafe: { color: '#2DC653', fontWeight: 'bold', fontSize: '24px' },
    statValueWarning: { color: '#FFB703', fontWeight: 'bold', fontSize: '24px' },
    statLabelDanger: { color: '#E63946', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' },
    statLabelSafe: { color: '#2DC653', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' },
    statLabelWarning: { color: '#FFB703', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' },
    // 4. RECENT ALERTS
    alertsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    alertsHeading: {
      fontSize: '20px',
      fontWeight: 'bold',
      margin: '0 0 8px 0',
    },
    alertCard: {
      backgroundColor: '#161625',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    alertInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    alertLocation: {
      fontWeight: 'bold',
      fontSize: '16px',
      color: '#F0F0FF'
    },
    alertDetails: {
      color: '#8888AA',
      fontSize: '13px',
      marginTop: '4px'
    },
    alertBadge: {
      backgroundColor: '#E63946',
      color: '#FFFFFF',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    // 5. BOTTOM BUTTONS
    bottomActions: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '16px'
    },
    actionBtnSafe: {
      backgroundColor: '#2DC653',
      color: '#000000',
      padding: '16px 8px',
      borderRadius: '12px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '15px',
      border: 'none'
    },
    actionBtnRisk: {
      backgroundColor: '#FFB703',
      color: '#000000',
      padding: '16px 8px',
      borderRadius: '12px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '15px',
      border: 'none'
    },
    // 6. BOTTOM NAV BAR
    bottomNav: {
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      backgroundColor: '#161625',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 10,
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

  const [address, setAddress] = useState("Locating...");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                const city = data.address.city || data.address.state_district || data.address.state || "Unknown City";
                const area = data.address.neighbourhood || data.address.suburb || data.address.county || "";
                setAddress(area ? `${area}, ${city}` : city);
              } else {
                setAddress(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
              }
            })
            .catch(() => setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`));
        },
        (err) => {
          setAddress("Location Access Denied");
        }
      );
    } else {
      setAddress("Geolocation Not Supported");
    }
  }, []);

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
          
          <div style={styles.header}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={styles.headerTitleBox}>
                <h1 style={styles.headerTitle}>🛡️ RAKSHAKPATH</h1>
              </div>
              <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                <button 
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  style={{backgroundColor: '#FFB703', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'}}
                >
                  {language === 'en' ? 'A/अ' : 'अ/A'}
                </button>
                <div onClick={() => onNavigate('profile')} style={{cursor: 'pointer', fontSize: '18px'}}>
                  👤
                </div>
              </div>
            </div>
            <p style={styles.tagline}>{t.tagline}</p>
            <div style={styles.locationBadge}>
              📍 {address}
            </div>
          </div>

          {/* 2. HERO SECTION */}
          <div style={styles.hero}>
            <h2 style={styles.heroTitle}>{t.heroTitle}</h2>
            <p style={styles.heroSubtext}>{t.heroSub}</p>
            
            <div style={styles.sosButtonContainer}>
              <button 
                style={styles.sosButton}
                onClick={() => onNavigate && onNavigate('sos')}
              >
                <span style={styles.sosText}>SOS</span>
              </button>
            </div>
            <p style={styles.sosHelpText}>{t.pressEmerg}</p>
          </div>

          {/* 3. STATS BAR */}
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <span style={styles.statValueDanger}>0</span>
              <span style={styles.statLabelDanger}>{t.statsDaz}</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValueSafe}>0</span>
              <span style={styles.statLabelSafe}>{t.statsSafe}</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValueWarning}>0</span>
              <span style={styles.statLabelWarning}>{t.statsRep}</span>
            </div>
          </div>

          {/* 4. RECENT ALERTS */}
          <div style={styles.alertsSection}>
            <h3 style={styles.alertsHeading}>⚠️ Recent Danger Reports</h3>
            
            
            <div style={{...styles.alertCard, justifyContent: 'center', color: '#8888AA', fontStyle: 'italic'}}>
              No recent alerts in your area.
            </div>
          </div>

          {/* 5. TWO BOTTOM BUTTONS */}
          <div style={styles.bottomActions}>
            <button 
              style={styles.actionBtnSafe}
              onClick={() => onNavigate && onNavigate('map')}
            >
              <span style={{fontSize: '18px'}}>🗺️</span> 
              <span>{t.findRoute}</span>
            </button>
            
            <button 
              style={styles.actionBtnRisk}
              onClick={() => onNavigate && onNavigate('report')}
            >
              <span style={{fontSize: '18px'}}>⚠️</span> 
              <span>{t.reportDanger}</span>
            </button>
          </div>

        </div>

        {/* 6. FIXED BOTTOM NAV */}
        <div style={styles.bottomNav}>
          <button style={{...styles.navItem, color: '#F0F0FF'}} onClick={() => onNavigate('home')}>
            <span style={{fontSize: '20px'}}>🏠</span>
            <span>{t.home}</span>
          </button>
          <button style={styles.navItem} onClick={() => onNavigate('map')}>
            <span style={{fontSize: '20px'}}>🗺️</span>
            <span>{t.map}</span>
          </button>
          <button style={styles.navItem} onClick={() => onNavigate('sos')}>
            <span style={{fontSize: '20px'}}>🆘</span>
            <span>SOS</span>
          </button>
          <button style={styles.navItem} onClick={() => onNavigate('report')}>
            <span style={{fontSize: '20px'}}>⚠️</span>
            <span>{t.report}</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default HomeScreen;
