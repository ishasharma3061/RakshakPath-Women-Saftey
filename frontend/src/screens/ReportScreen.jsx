import React, { useState } from 'react';
import { reportDanger } from '../api';

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
      user_name: isAnonymous ? "Anonymous User" : (user?.name || "RAKSHAKPATH User"),
      signature: signature,
      wallet_address: signerAddress
    }).then(() => {
      setSubmitted(true);
    }).catch(err => {
      console.error(err);
      setError('Failed to save to database');
    });
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
  const primaryColor = '#FFB703';
  const bgColor = '#0D0D1A';
  const cardColor = '#161625';
  const textColor = '#F0F0FF';
  const mutedColor = '#8888AA';
  const greenColor = '#2DC653';
  const redColor = '#E63946';
  const inputBg = '#1F1F35';
  const inputBorder = 'rgba(255, 255, 255, 0.1)';

  const containerStyle = {
    backgroundColor: bgColor,
    color: textColor,
    minHeight: '100vh',
    fontFamily: 'Inter, system-ui, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '80px', // For bottom nav
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: cardColor,
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
    backgroundColor: cardColor,
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  };

  const sectionTitleStyle = {
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: '600',
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
    backgroundColor: primaryColor,
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: `0 4px 15px ${primaryColor}40`,
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

  const submitAnotherBtnStyle = {
    backgroundColor: 'transparent',
    border: `1px solid ${primaryColor}`,
    color: primaryColor,
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '30px',
  };

  const reportItemStyle = {
    backgroundColor: inputBg,
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: `1px solid ${inputBorder}`,
  };

  const reportItemColStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  };

  const reportLocationStyle = {
    fontWeight: '600',
    fontSize: '16px',
  };

  const reportMetaStyle = {
    fontSize: '12px',
    color: mutedColor,
    display: 'flex',
    gap: '10px',
  };   

  const badgeStyle = {
    backgroundColor: `${primaryColor}20`,
    color: primaryColor,
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  const statsContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '20px',
  };

  const statItemStyle = {
    flex: 1,
    backgroundColor: cardColor,
    borderRadius: '12px',
    padding: '15px 10px',
    textAlign: 'center',
    border: `1px solid ${inputBorder}`,
  };

  const bottomNavStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: cardColor,
    borderTop: `1px solid ${inputBorder}`,
    display: 'flex',
    justifyContent: 'space-around',
    padding: '15px 0',
    zIndex: 100,
  };

  const navItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: mutedColor,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    gap: '5px',
    fontSize: '12px',
  };

  const activeNavItemStyle = {
    ...navItemStyle,
    color: primaryColor,
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
        <div style={statsContainerStyle}>
          <div style={statItemStyle}>
            <div style={{ color: redColor, fontWeight: 'bold', fontSize: '18px' }}>47</div>
            <div style={{ fontSize: '11px', color: mutedColor, marginTop: '4px' }}>Reports Today</div>
          </div>
          <div style={statItemStyle}>
             <div style={{ color: primaryColor, fontWeight: 'bold', fontSize: '18px' }}>12</div>
             <div style={{ fontSize: '11px', color: mutedColor, marginTop: '4px' }}>Areas Flagged</div>
          </div>
          <div style={statItemStyle}>
             <div style={{ color: greenColor, fontWeight: 'bold', fontSize: '18px' }}>3.2K</div>
             <div style={{ fontSize: '11px', color: mutedColor, marginTop: '4px' }}>Members</div>
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
                <div style={toggleStyle} onClick={() => setUseCurrentLocation(!useCurrentLocation)}>
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
            <div style={checkmarkStyle}>✅</div>
            <h2 style={successTitleStyle}>Saved to database ✅</h2>
            <p style={successTextStyle}>Thank you for making Delhi safer</p>
            <p style={successTextStyle}>Your report helps other women stay safe</p>
            <button type="button" onClick={handleReset} style={submitAnotherBtnStyle}>
              Submit Another Report
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

      {/* Fixed Bottom Nav */}
      <div style={bottomNavStyle}>
        <button style={navItemStyle} onClick={() => onNavigate('home')}>
          <span style={{fontSize: '20px'}}>🏠</span>
          Home
        </button>
        <button style={navItemStyle} onClick={() => onNavigate('map')}>
          <span style={{fontSize: '20px'}}>🗺️</span>
          Map
        </button>
        <button style={activeNavItemStyle}>
          <span style={{fontSize: '20px'}}>⚠️</span>
          Report
        </button>
        <button style={navItemStyle} onClick={() => onNavigate('sos')}>
          <span style={{fontSize: '20px'}}>🚨</span>
          SOS
        </button>
      </div>
    </div>
  );
};

export default ReportScreen;
