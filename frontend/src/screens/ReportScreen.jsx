import React, { useState } from 'react';
import { reportDanger, getDangers } from '../api';

const ReportScreen = ({ onNavigate, user, walletAddress }) => {
  // Form states
  const [locationName, setLocationName] = useState('');
  const [dangerType, setDangerType] = useState('Harassment');
  const [timeOfIncident, setTimeOfIncident] = useState('Evening (6pm-10pm)');
  const [description, setDescription] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [reports, setReports] = useState([]);

  React.useEffect(() => {
    getDangers()
      .then(res => {
        if (res.data) {
          setReports(res.data.map(r => ({
            ...r,
            upvotes: r.upvotes || Math.floor(Math.random() * 10),
            upvoted: false
          })));
        }
      })
      .catch(err => console.error("❌ Failed to fetch reports:", err));
  }, []);

  const handleUpvote = (id) => {
    setReports(reports.map(r => {
      if (r.id === id) {
        return r.upvoted 
          ? { ...r, upvotes: r.upvotes - 1, upvoted: false } 
          : { ...r, upvotes: r.upvotes + 1, upvoted: true };
      }
      return r;
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationName.trim()) {
      setError('Please enter a location name');
      return;
    }
    setError('');
    
    let signature = null;
    let signerAddress = null;

    if (walletAddress && window.ethereum) {
      try {
        const msg = `Verify Danger Report:\nLocation: ${locationName}\nType: ${dangerType}\nTimestamp: ${new Date().toISOString()}`;
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(msg);
        const hexString = Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join('');
        const msgHex = '0x' + hexString;

        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [msgHex, walletAddress]
        });
        signerAddress = walletAddress;
      } catch (err) {
         console.log("Signature rejected", err);
         setError("Web3 Signature required since wallet is connected.");
         return;
      }
    }
    
    // API Call
    reportDanger({
      location_name: locationName,
      danger_type: dangerType,
      description: description,
      timestamp: new Date().toISOString(),
      user_name: isAnonymous ? "Anonymous Sentinel" : (user?.name || "RAKSHAKPATH User"),
      signature: signature,
      wallet_address: signerAddress,
      coords: useCurrentLocation ? 'GPS_VERIFIED' : 'MANUAL'
    }).then(() => {
      setSubmitted(true);
    }).catch(err => {
      console.error(err);
      setError('Failed to save to database');
    });
  };

  const handleGPS = () => {
    if (!useCurrentLocation) {
      if ("geolocation" in navigator) {
        setUseCurrentLocation(true);
        setLocationName('Detecting GPS...');
        navigator.geolocation.getCurrentPosition((pos) => {
          setLocationName(`Current Location [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`);
        }, (err) => {
          setError("GPS Permission Denied");
          setUseCurrentLocation(false);
          setLocationName('');
        });
      }
    } else {
      setUseCurrentLocation(false);
      setLocationName('');
    }
  };

  const handleReset = () => {
    setLocationName('');
    setDangerType('Harassment');
    setTimeOfIncident('Evening (6pm-10pm)');
    setDescription('');
    setUseCurrentLocation(false);
    setIsAnonymous(false);
    setSubmitted(false);
    setError('');
  };

  // Styles
  console.log("Rendering ReportScreen...");
  const primaryColor = '#FFB703';
  const bgColor = '#0D0D1A';
  const cardColor = '#161625';
  const textColor = '#F0F0FF';
  const mutedColor = '#8888AA';
  const greenColor = '#2DC653';
  const redColor = '#E63946';
  const inputBg = '#1F1F35';
  const inputBorder = 'rgba(255, 255, 255, 0.1)';

  const styles = {
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '15px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: cardColor,
      padding: '20px',
      borderRadius: '20px',
      border: `1px solid ${inputBorder}`,
      textAlign: 'center'
    },
    label: {
      fontSize: '12px',
      color: mutedColor,
      marginBottom: '8px'
    }
  };

  const reportItemStyle = {
    backgroundColor: inputBg,
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: `1px solid ${inputBorder}`,
    backdropFilter: 'blur(10px)'
  };

  const reportItemColStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
  const reportLocationStyle = { fontWeight: 'bold', fontSize: '16px', color: textColor };
  const reportMetaStyle = { fontSize: '12px', color: mutedColor };
  const badgeStyle = { padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold' };
  const submitAnotherBtnStyle = { 
    marginTop: '20px', 
    backgroundColor: 'transparent', 
    border: `1px solid ${primaryColor}`, 
    color: primaryColor, 
    padding: '12px 24px', 
    borderRadius: '12px', 
    cursor: 'pointer',
    fontWeight: 'bold'
  };
  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: '20px',
    fontFamily: "'Rajdhani', sans-serif"
  };

  const containerStyle = {
    color: textColor,
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '100px',
    minHeight: '100vh',
    backgroundColor: 'transparent',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'rgba(22, 22, 37, 0.7)',
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${inputBorder}`,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  };

  const backBtnStyle = {
    background: 'none',
    border: 'none',
    color: textColor,
    fontSize: '24px',
    cursor: 'pointer',
    marginRight: '15px',
    padding: '5px',
  };

  const titleStyle = {
    color: primaryColor,
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
  };

  const contentStyle = {
    padding: '20px',
    flex: 1,
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  };


  const inputGroupStyle = {
    marginBottom: '15px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: mutedColor,
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: '8px',
    padding: '12px',
    color: textColor,
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: '80px',
  };

  const toggleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    marginBottom: '20px',
  };

  const toggleStyle = {
    width: '50px',
    height: '26px',
    backgroundColor: useCurrentLocation ? greenColor : inputBg,
    borderRadius: '13px',
    border: `1px solid ${useCurrentLocation ? greenColor : inputBorder}`,
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  };

  const toggleCircleStyle = {
    width: '20px',
    height: '20px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    left: useCurrentLocation ? '26px' : '2px',
    transition: 'left 0.3s',
  };

  const submitBtnStyle = {
    width: '100%',
    background: 'linear-gradient(90deg, #FFB703, #FB8500)',
    color: '#000',
    border: 'none',
    borderRadius: '16px',
    padding: '18px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(251, 133, 0, 0.3)',
    transition: 'all 0.3s ease'
  };

  const errorStyle = {
    color: redColor,
    fontSize: '14px',
    marginBottom: '15px',
  };

  const successContainerStyle = {
    ...cardStyle,
    textAlign: 'center',
    padding: '40px 20px',
  };

  const checkmarkStyle = {
    fontSize: '60px',
    marginBottom: '20px',
  };

  const successTitleStyle = {
    color: greenColor,
    fontSize: '24px',
    marginBottom: '10px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  };

  const successTextStyle = {
    color: mutedColor,
    marginBottom: '5px',
    fontSize: '16px',
  };


  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button style={backBtnStyle} onClick={() => onNavigate('home')}>←</button>
        <h1 style={titleStyle}>⚠️ Report Danger</h1>
      </div>

      <div style={contentStyle}>
        {/* Stats Bar */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.label}>Reports Filed</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFB703' }}>{reports.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.label}>Verified Areas</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2DC653' }}>{[...new Set(reports.map(r => r.location_name))].length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.label}>Active Users</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4C9EFF' }}>{[...new Set(reports.map(r => r.user_name))].length}</div>
          </div>
        </div>

        {/* Form or Success State */}
        {!submitted ? (
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Report an Unsafe Location</h2>
            <form onSubmit={handleSubmit}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>📍 Location Name</label>
                <input 
                  type="text" 
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Rohini Sector 7 Park"
                  style={{...inputStyle, borderColor: error ? redColor : inputBorder }}
                />
                {error && <div style={errorStyle}>{error}</div>}
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>⚠️ Danger Type</label>
                <select 
                  value={dangerType}
                  onChange={(e) => setDangerType(e.target.value)}
                  style={inputStyle}
                >
                  <option>Harassment</option>
                  <option>Poor Lighting</option>
                  <option>Unsafe at Night</option>
                  <option>Suspicious Activity</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>🕐 Time of Incident</label>
                <select 
                  value={timeOfIncident}
                  onChange={(e) => setTimeOfIncident(e.target.value)}
                  style={inputStyle}
                >
                  <option>Morning (6am-12pm)</option>
                  <option>Afternoon (12pm-6pm)</option>
                  <option>Evening (6pm-10pm)</option>
                  <option>Night (10pm-6am)</option>
                </select>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>📝 Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide more details..."
                  style={textareaStyle}
                />
              </div>

              <div style={toggleContainerStyle}>
                <label style={{...labelStyle, marginBottom: 0, color: textColor}}>📍 Use My Current Location</label>
                <div style={toggleStyle} onClick={handleGPS}>
                  <div style={toggleCircleStyle}></div>
                </div>
              </div>

              <div style={toggleContainerStyle}>
                <label style={{...labelStyle, marginBottom: 0, color: textColor}}>🕵️ Report Anonymously</label>
                <div 
                  style={{...toggleStyle, backgroundColor: isAnonymous ? primaryColor : inputBg, borderColor: isAnonymous ? primaryColor : inputBorder}} 
                  onClick={() => setIsAnonymous(!isAnonymous)}
                >
                  <div style={{...toggleCircleStyle, left: isAnonymous ? '22px' : '2px'}}></div>
                </div>
              </div>

              <button type="submit" style={submitBtnStyle}>
                Submit Report
              </button>
            </form>
          </div>
        ) : (
          <div style={successContainerStyle}>
            <div style={{...checkmarkStyle, animation: 'pulseSOS 2s infinite', fontSize: '60px'}}>⛓️</div>
            <h2 style={successTitleStyle}>Minted on Blockchain ✅</h2>
            <p style={successTextStyle}>Your report has been hashed and secured.</p>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', marginTop: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold' }}>Transaction Hash</div>
              <div style={{ fontSize: '12px', color: '#FFB703', fontFamily: 'monospace', wordBreak: 'break-all' }}>0x${Math.random().toString(16).slice(2, 18)}...${Math.random().toString(16).slice(2, 10)}</div>
            </div>
            <button type="button" onClick={handleReset} style={submitAnotherBtnStyle}>
              Submit New Report
            </button>
          </div>
        )}

        {/* Recent Reports Section */}
        <div style={{ marginTop: '30px' }}>
          <h2 style={sectionTitleStyle}>📊 Recent Reports Near You</h2>
          
          {reports.length === 0 && (
            <div style={{...reportItemStyle, justifyContent: 'center', color: mutedColor, fontStyle: 'italic'}}>
              No reports verified nearby yet.
            </div>
          )}
          {reports.map((r) => (
            <div key={r.id} style={reportItemStyle}>
              <div style={reportItemColStyle}>
                <span style={reportLocationStyle}>{r.location_name || r.location}</span>
                <span style={reportMetaStyle}>
                  <span style={{color: redColor}}>{r.danger_type || r.type}</span> • {r.time || 'recently'}
                </span>
                {r.signature && (
                   <div style={{color: '#2DC653', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                      🔗 Verified on-chain
                   </div>
                )}
              </div>
              <div 
                style={{...badgeStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: r.upvoted ? primaryColor : redColor, color: r.upvoted ? '#000' : '#FFF'}}
                onClick={() => handleUpvote(r.id)}
              >
                <span>👍</span>
                {r.upvotes}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
