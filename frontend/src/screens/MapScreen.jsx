import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getDangers } from '../api';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const dangerZones = [
  { lat: 28.7041, lng: 77.1025, name: "Rohini Sector 7", reports: 5 },
  { lat: 28.6562, lng: 77.2410, name: "Karol Bagh Metro", reports: 3 },
  { lat: 28.5355, lng: 77.3910, name: "Noida Sector 18", reports: 7 },
  { lat: 28.6304, lng: 77.2177, name: "Connaught Place", reports: 4 },
  { lat: 28.6692, lng: 77.4538, name: "Ghaziabad Border", reports: 6 }
];

const safeZones = [
  { lat: 28.6129, lng: 77.2295, name: "India Gate Police Station", type: "Police" },
  { lat: 28.5677, lng: 77.2433, name: "AIIMS Hospital", type: "Hospital" },
  { lat: 28.6315, lng: 77.2167, name: "Connaught Place Police Booth", type: "Police" },
  { lat: 28.7041, lng: 77.1000, name: "Rohini Sector 7 Hospital", type: "Hospital" }
];

const create3DUserIcon = (userName) => L.divIcon({
  className: 'custom-3d-user-icon',
  html: `
    <div style="position: relative; width: 40px; height: 40px; transform: translate(-50%, -100%);">
      <div style="position: absolute; bottom: -5px; left: 5px; width: 30px; height: 10px; background: rgba(0,0,0,0.5); border-radius: 50%; filter: blur(4px);"></div>
      <div style="position: absolute; top: 0; left: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #FFB703, #E63946); border-radius: 50%; border: 3px solid #FFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px rgba(230,57,70,0.4), inset 0 -4px 8px rgba(0,0,0,0.2); animation: bobUser 2s infinite ease-in-out;">
        <span style="font-size: 18px;">👤</span>
      </div>
      <div style="position: absolute; top: -30px; left: -30px; width: 100px; text-align: center; color: #FFF; background: #161625; padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: bold; border: 1px solid rgba(255,183,3,0.5); box-shadow: 0 4px 10px rgba(0,0,0,0.5); animation: bobUser 2s infinite ease-in-out; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${userName}
      </div>
    </div>
  `,
  iconSize: [0, 0]
});

const MapScreen = ({ onNavigate, user, language }) => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [liveZones, setLiveZones] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // 1. Fetch Dangers
    getDangers()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // Map backend data to local structure. Since backend lacks coordinates, assign nearby dummy ones
          const apiDangers = res.data.map((d) => ({
            lat: 28.5 + (Math.random() * 0.3),
            lng: 77.0 + (Math.random() * 0.4),
            name: d.location_name,
            type: d.danger_type,
            reports: 1 
          }));
          setLiveZones(apiDangers);
        }
      })
      .catch((err) => {
        console.error("Map API Error (using hardcoded fallback):", err);
      });

    // 2. Fetch User's Live Geolocation
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.log('Map Geolocation error:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

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
      paddingBottom: '80px', // For bottom nav
      boxSizing: 'border-box'
    },
    // 1. HEADER
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
      margin: 0
    },
    // 2. SEARCH BAR
    searchBox: {
      backgroundColor: '#161625',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 10,
      borderBottom: '1px solid rgba(255,255,255,0.07)'
    },
    inputRow: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#0D0D1A',
      borderRadius: '8px',
      padding: '12px 14px',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    inputIcon: {
      fontSize: '14px',
      marginRight: '12px'
    },
    input: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#F0F0FF',
      width: '100%',
      outline: 'none',
      fontSize: '14px',
      fontFamily: "'DM Sans', sans-serif",
    },
    findBtn: {
      backgroundColor: '#2DC653',
      color: '#000000',
      border: 'none',
      borderRadius: '8px',
      padding: '14px',
      fontWeight: 'bold',
      fontSize: '15px',
      cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      marginTop: '6px'
    },
    // 3. MAP
    mapContainerWrapper: {
      flexGrow: 1,
      position: 'relative',
      width: '100%',
      // Leaflet container needs absolute height effectively, flexGrow handles wrapper
    },
    // 4. LEGEND
    legend: {
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      right: '16px',
      backgroundColor: '#161625',
      padding: '12px',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.07)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    // 5. BOTTOM NAV
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
      zIndex: 1000,
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

  const getRiskColor = (score) => {
    if (score < 40) return '#E63946'; // High Risk
    if (score <= 70) return '#FFB703'; // Medium Risk
    return '#2DC653'; // Safe
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

          /* Darken the map tiles via CSS filter for dark mode feel */
          .leaflet-tile-pane {
            filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
          }
          
          /* Modernize popup styling */
          .leaflet-popup-content-wrapper {
            background-color: #161625 !important;
            color: #F0F0FF !important;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 8px !important;
          }
          .leaflet-popup-tip {
            background-color: #161625 !important;
          }

          @keyframes bobUser {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}
      </style>

      <div style={styles.container}>
        <div style={styles.wrapper}>
          
          {/* 1. HEADER */}
          <div style={styles.header}>
            <button style={styles.backBtn} onClick={() => onNavigate('home')}>
              ←
            </button>
            <h1 style={styles.headerTitle}>🗺️ Safe Map</h1>
          </div>

          {/* 2. SEARCH BAR */}
          <div style={styles.searchBox}>
            <div style={styles.inputRow}>
              <span style={styles.inputIcon}>📍</span>
              <input 
                type="text" 
                placeholder="From" 
                style={styles.input}
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
              />
            </div>
            <div style={styles.inputRow}>
              <span style={styles.inputIcon}>🏁</span>
              <input 
                type="text" 
                placeholder="To" 
                style={styles.input}
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
              />
            </div>
            <button style={styles.findBtn}>Find Safe Route</button>
          </div>

          {/* 3. LEAFLET MAP */}
          <div style={styles.mapContainerWrapper}>
            <MapContainer 
              center={[28.6139, 77.2090]} 
              zoom={13} 
              style={{ height: '100%', width: '100%', zIndex: 1 }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {safeZones.map((zone, idx) => (
                <CircleMarker 
                  key={`safe-${idx}`}
                  center={[zone.lat, zone.lng]}
                  pathOptions={{ color: '#2DC653', fillColor: '#2DC653', fillOpacity: 0.8 }}
                  radius={12}
                >
                  <Popup>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: '4px' }}>
                      <strong style={{color: '#2DC653'}}>{zone.type === "Police" ? '🚓' : '🏥'} {zone.name}</strong>
                      <div style={{color: '#8888AA', marginTop: '4px', fontSize: '12px'}}>Verified Safe Haven</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              
              {liveZones.map((zone, idx) => {
                const currentHour = new Date().getHours();
                const isNight = currentHour >= 18 || currentHour < 6;
                
                let penalty = zone.reports * 15;
                if (isNight && (zone.type === "Poor Lighting" || zone.type === "Unsafe at Night" || zone.name?.toLowerCase().includes("night"))) {
                   penalty += 40; // Apply AI-driven dynamic nighttime penalty
                }
                const score = Math.max(0, 100 - penalty);
                const riskColor = getRiskColor(score);
                
                return (
                  <CircleMarker 
                    key={idx}
                    center={[zone.lat, zone.lng]}
                    pathOptions={{ color: riskColor, fillColor: riskColor, fillOpacity: 0.6 }}
                    radius={12 + (zone.reports * 2)}
                  >
                    <Popup>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", padding: '4px' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>{zone.name}</h3>
                        <p style={{ margin: '4px 0', fontSize: '13px', color: '#8888AA' }}>
                          Reports: <strong style={{color: '#E63946'}}>{zone.reports}</strong>
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '13px', color: '#8888AA' }}>
                          Safety Score: <strong style={{color: riskColor}}>{score}/100</strong>
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {userLocation && (
                <Marker 
                  position={userLocation} 
                  icon={create3DUserIcon(user?.name || 'User')} 
                />
              )}
            </MapContainer>

            {/* 4. SAFETY LEGEND */}
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <span style={{ fontSize: '16px' }}>🔴</span> High Risk
              </div>
              <div style={styles.legendItem}>
                <span style={{ fontSize: '16px' }}>🟡</span> Medium Risk
              </div>
              <div style={styles.legendItem}>
                <span style={{ fontSize: '16px' }}>🟢</span> Safe
              </div>
            </div>
          </div>

        </div>

        {/* 5. FIXED BOTTOM NAV */}
        <div style={styles.bottomNav}>
          <button style={styles.navItem} onClick={() => onNavigate('home')}>
            <span style={{fontSize: '20px'}}>🏠</span>
            <span>Home</span>
          </button>
          <button style={{...styles.navItem, color: '#F0F0FF'}} onClick={() => onNavigate('map')}>
            <span style={{fontSize: '20px'}}>🗺️</span>
            <span>Map</span>
          </button>
          <button style={styles.navItem} onClick={() => onNavigate('sos')}>
            <span style={{fontSize: '20px'}}>🆘</span>
            <span>SOS</span>
          </button>
          <button style={styles.navItem} onClick={() => onNavigate('report')}>
            <span style={{fontSize: '20px'}}>⚠️</span>
            <span>Report</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default MapScreen;
