import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, Circle, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapScreen = ({ onNavigate, user, language }) => {
  const [toLocation, setToLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentLocationName, setCurrentLocationName] = useState('Locating...');
  const debounceRef = useRef(null);
  const searchRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [activeRoute, setActiveRoute] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [reports, setReports] = useState([]);
  const [is4DMode, setIs4DMode] = useState(true);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [isSatellite, setIsSatellite] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(0);
  const mapRef = useRef();

  // 🏪 Nearby Help State
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const safeZones = [
    { name: "Central Police Station", lat: 28.6139, lng: 77.2090, type: "Police" },
    { name: "City General Hospital", lat: 28.6155, lng: 77.2150, type: "Medical" },
    { name: "Sentinel Outreach Node", lat: 28.6210, lng: 77.2050, type: "Police" }
  ];

  const autoFollowRef = useRef(autoFollow);
  const lastGeocodedCoordsRef = useRef(null); // tracks last geocoded position

  useEffect(() => {
    autoFollowRef.current = autoFollow;
  }, [autoFollow]);

  // Component to update map view from inside MapContainer context
  const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center && autoFollowRef.current) {
        map.setView(center, 16, { animate: true });
      }
    }, [center, map]);
    return null;
  };

  useEffect(() => {
    fetchDangers();
    const interval = setInterval(fetchDangers, 10000);

    let watchId;
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by this browser.");
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setGpsAccuracy(position.coords.accuracy);
        // Re-geocode if moved more than ~500m from last geocoded point
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const last = lastGeocodedCoordsRef.current;
        const distMoved = last
          ? Math.sqrt(Math.pow(lat - last[0], 2) + Math.pow(lng - last[1], 2)) * 111000 // approx meters
          : Infinity;

        if (distMoved > 50) {
          lastGeocodedCoordsRef.current = [lat, lng];
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            .then(r => r.json())
            .then(data => {
              const a = data.address || {};
              // data.name gives exact POI/building name e.g. "Chitkara University, Himachal Campus"
              const poi = data.name || a.amenity || a.university || a.college || a.school || a.hospital || a.tourism || a.shop || a.office;
              const area = a.suburb || a.neighbourhood || a.village || a.town || a.city_district || a.city || a.county;
              const name = poi
                ? (area && !poi.toLowerCase().includes(area.toLowerCase()) ? `${poi}, ${area}` : poi)
                : (area || data.display_name?.split(',')[0] || 'My Location');
              setCurrentLocationName(`📍 ${name}`);
            })
            .catch(err => console.error('Geocode error:', err));
        }
      },
      (error) => {
        console.error("GPS Error:", error.code, error.message);
        // Fallback: try getCurrentPosition once
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            setGpsAccuracy(pos.coords.accuracy);
          },
          (e) => console.error("GPS fallback also failed:", e.message),
          { enableHighAccuracy: false, timeout: 10000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );

    return () => {
      clearInterval(interval);
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, []); // ✅ runs only once on mount

  const fetchDangers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5001/api/dangers");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Fetch Dangers Error:", err);
    }
  };

  const fetchSuggestions = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`);
        const data = await res.json();
        const enriched = data.map(d => {
          const lat = parseFloat(d.lat);
          const lon = parseFloat(d.lon);
          // Count danger reports near this suggestion
          const nearbyDangers = reports.filter(r => {
            if (!r.lat || !r.lng) return false;
            return Math.sqrt(Math.pow(lat - r.lat, 2) + Math.pow(lon - r.lng, 2)) < 0.05; // ~5km
          }).length;
          const safety = nearbyDangers === 0 ? { label: 'Safe', color: '#2DC653', icon: '🟢' }
            : nearbyDangers <= 2 ? { label: 'Caution', color: '#FFB703', icon: '🟡' }
            : { label: 'Danger', color: '#E63946', icon: '🔴' };
          return {
            name: d.display_name.split(',').slice(0, 3).join(', '),
            lat: d.lat, lon: d.lon,
            safety, nearbyDangers
          };
        });
        setSuggestions(enriched);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 350);
  };

  const handleSuggestionClick = (suggestion) => {
    setToLocation(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    // Trigger route to this suggestion directly
    const destCoords = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    setDestinationCoords(destCoords);
    setActiveRoute(true);
    setRouteLoading(true);
    setRouteInfo(null);
    if (userLocation) {
      const [fromLat, fromLng] = userLocation;
      const [toLat, toLng] = destCoords;
      fetch(`https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&overview=full&alternatives=true`)
        .then(r => r.json())
        .then(routeData => {
          if (routeData.code === 'Ok' && routeData.routes.length > 0) {
            const bestRoute = routeData.routes[0];
            const points = bestRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            setRoutePoints(points);
            const dangerNearRoute = reports.filter(r => r.lat && r.lng && points.some(([plat, plng]) => Math.sqrt(Math.pow(plat - r.lat, 2) + Math.pow(plng - r.lng, 2)) < 0.01)).length;
            const safetyScore = Math.max(10, 100 - dangerNearRoute * 15);
            const trafficLevel = dangerNearRoute === 0 ? 'Clear' : dangerNearRoute <= 2 ? 'Moderate' : 'Heavy';
            const trafficColor = dangerNearRoute === 0 ? '#2DC653' : dangerNearRoute <= 2 ? '#FFB703' : '#E63946';
            setRouteInfo({ distance: (bestRoute.distance / 1000).toFixed(1), duration: Math.round(bestRoute.duration / 60), safetyScore, trafficLevel, trafficColor, dangerCount: dangerNearRoute, recommendation: dangerNearRoute === 0 ? '✅ Route is safe. No danger zones detected.' : dangerNearRoute <= 2 ? '⚠️ Moderate risk. Stay alert near highlighted zones.' : '🔴 High risk! Danger zones detected. Travel with company.' });
            if (mapRef.current) mapRef.current.fitBounds(points, { padding: [60, 60] });
          }
        })
        .finally(() => setRouteLoading(false));
    } else {
      if (mapRef.current) mapRef.current.setView(destCoords, 14);
      setRouteLoading(false);
    }
  };

  const handleGoToMyLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 17, { animate: true });
    }
  };

  const handleClearRoute = () => {
    setToLocation('');
    setSuggestions([]);
    setActiveRoute(false);
    setRouteInfo(null);
    setRoutePoints([]);
    setDestinationCoords(null);
  };
  const handleSearch = async () => {
    if (!toLocation) return;
    try {
      // Step 1: Geocode destination
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toLocation)}`);
      const geoData = await geoRes.json();
      if (geoData.length === 0) { alert('Location not found. Try a more specific name.'); return; }

      const destCoords = [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)];
      setDestinationCoords(destCoords);
      setActiveRoute(true);
      setRouteLoading(true);
      setRouteInfo(null);

      // Step 2: Get actual road route from OSRM with alternatives
      if (userLocation) {
        const [fromLat, fromLng] = userLocation;
        const [toLat, toLng] = destCoords;
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&overview=full&alternatives=true`;
        const routeRes = await fetch(osrmUrl);
        const routeData = await routeRes.json();

        if (routeData.code === 'Ok' && routeData.routes.length > 0) {
          const bestRoute = routeData.routes[0];
          const points = bestRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoutePoints(points);

          // Compute safety score based on how many danger reports are near the route
          const dangerNearRoute = reports.filter(r => {
            if (!r.lat || !r.lng) return false;
            return points.some(([plat, plng]) => {
              const dist = Math.sqrt(Math.pow(plat - r.lat, 2) + Math.pow(plng - r.lng, 2));
              return dist < 0.01; // ~1km radius
            });
          }).length;

          const distKm = (bestRoute.distance / 1000).toFixed(1);
          const durationMin = Math.round(bestRoute.duration / 60);
          const safetyScore = Math.max(10, 100 - dangerNearRoute * 15);
          const trafficLevel = dangerNearRoute === 0 ? 'Clear' : dangerNearRoute <= 2 ? 'Moderate' : 'Heavy';
          const trafficColor = dangerNearRoute === 0 ? '#2DC653' : dangerNearRoute <= 2 ? '#FFB703' : '#E63946';

          setRouteInfo({
            distance: distKm,
            duration: durationMin,
            safetyScore,
            trafficLevel,
            trafficColor,
            dangerCount: dangerNearRoute,
            recommendation: dangerNearRoute === 0
              ? '✅ Route is safe. No danger zones detected. Proceed confidently.'
              : dangerNearRoute <= 2
              ? '⚠️ Moderate risk. Stay alert near highlighted danger zones.'
              : '🔴 High risk route! Danger zones detected. Consider alternate path or travel with company.'
          });

          // Fit map to show entire route
          if (mapRef.current && points.length > 0) {
            mapRef.current.fitBounds(points, { padding: [60, 60] });
          }
        } else {
          setRoutePoints([userLocation, destCoords]);
        }
      } else {
        if (mapRef.current) mapRef.current.setView(destCoords, 14);
      }
    } catch (err) {
      console.error('Search/Route error:', err);
      alert('Could not get route. Check your internet connection.');
    } finally {
      setRouteLoading(false);
    }
  };

  const styles = {
    container: { height: '100vh', width: '100%', backgroundColor: '#080812', color: 'white', position: 'relative', overflow: 'hidden' },
    wrapper: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes scan4D {
            0% { top: 0; opacity: 0; }
            50% { opacity: 0.5; }
            100% { top: 100%; opacity: 0; }
          }
          .scan-line-4d {
            position: absolute;
            left: 0; width: 100%; height: 2px;
            background: #2DC653; box-shadow: 0 0 15px #2DC653;
            z-index: 1000; pointer-events: none;
            animation: scan4D 5s linear infinite;
          }
          .map-vignette { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 500; pointer-events: none; background: radial-gradient(circle at 50% 50%, transparent 40%, rgba(8, 8, 18, 0.4) 100%); }
          .leaflet-container { background: #080812 !important; }
          .tactical-popup .leaflet-popup-content-wrapper { background: rgba(13, 13, 26, 0.95) !important; backdrop-filter: blur(20px) !important; color: white !important; border: 1px solid rgba(255,183,3,0.3) !important; }
        `}
      </style>
      
      <div style={styles.wrapper}>
        {/* Tactical Search Bar with Autocomplete */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', right: '80px', maxWidth: '600px', zIndex: 1001 }} ref={searchRef}>
          {/* Main pill */}
          <div style={{ backgroundColor: 'rgba(13, 13, 26, 0.92)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {/* Location icon */}
            <span style={{ fontSize: '18px', flexShrink: 0 }}>🔍</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input type="text" value={currentLocationName} readOnly style={{ background: 'none', border: 'none', color: '#4C9EFF', width: '100%', outline: 'none', fontSize: '11px', letterSpacing: '0.5px', fontWeight: '500', cursor: 'default' }} />
              <input
                type="text"
                placeholder="Search destination, area, city..."
                value={toLocation}
                onChange={(e) => { setToLocation(e.target.value); fetchSuggestions(e.target.value); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { setShowSuggestions(false); handleSearch(); } if (e.key === 'Escape') { setShowSuggestions(false); } }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '15px', fontFamily: "'Inter', sans-serif" }}
              />
            </div>
            {/* Clear button */}
            {toLocation && <button onClick={handleClearRoute} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px', flexShrink: 0, padding: '2px 4px' }}>✕</button>}
            {/* My location button */}
            <button onClick={handleGoToMyLocation} title="Go to my location" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(76,158,255,0.15)', border: '1px solid rgba(76,158,255,0.3)', color: '#4C9EFF', cursor: 'pointer', fontSize: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📍</button>
            {/* Search button */}
            <button onClick={() => { setShowSuggestions(false); handleSearch(); }} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFB703', border: 'none', cursor: 'pointer', fontSize: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚀</button>
          </div>

          {/* Autocomplete Dropdown with Safety Ratings */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ marginTop: '6px', backgroundColor: 'rgba(13, 13, 26, 0.97)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '8px 18px 4px', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>📍 Location Recommendations</div>
              {suggestions.map((s, i) => (
                <div key={i} onClick={() => handleSuggestionClick(s)}
                  style={{ padding: '10px 18px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,183,3,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{s.safety.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#F0F0FF', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name.split(',')[0]}</div>
                    <div style={{ color: '#555', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name.split(',').slice(1).join(',').trim()}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: s.safety.color, padding: '2px 8px', borderRadius: '6px', background: `${s.safety.color}18`, border: `1px solid ${s.safety.color}33` }}>{s.safety.label}</div>
                    {s.nearbyDangers > 0 && <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{s.nearbyDangers} alert(s)</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4D Map Wrapper */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', perspective: '1500px' }}>
          <div className="map-vignette"></div>
          {is4DMode && <div className="scan-line-4d"></div>}
          
          <div style={{
            width: '100%', height: '100%',
            transform: is4DMode ? 'rotateX(20deg) scale(1.3) translateY(-8%)' : 'none',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>

            <MapContainer
              center={userLocation || [28.6139, 77.2090]}
              zoom={14}
              ref={mapRef}
              style={{ height: '100%', width: '100%', borderRadius: is4DMode ? '20px' : '0' }}
              zoomControl={false}
            >
              <TileLayer 
                url={isSatellite 
                  ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapUpdater center={userLocation} />
              
              {activeRoute && routePoints.length > 0 && (
                <Polyline 
                  positions={routePoints}
                  pathOptions={{ color: '#2DC653', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} 
                />
              )}
              {/* Destination Marker */}
              {activeRoute && destinationCoords && (
                <CircleMarker
                  center={destinationCoords}
                  radius={10}
                  pathOptions={{ color: '#FFB703', fillColor: '#FFB703', fillOpacity: 0.9, weight: 3 }}
                >
                  <Popup className="tactical-popup">
                    <div style={{ color: 'white' }}><strong style={{ color: '#FFB703' }}>🎯 Destination</strong><br/>{toLocation}</div>
                  </Popup>
                </CircleMarker>
              )}

              {/* Traffic Danger Zones (heatmap circles around reports) */}
              {reports.map((report, idx) => {
                const lat = report.lat || (28.61 + (idx * 0.007));
                const lng = report.lng || (77.20 + (idx * 0.005));
                const isHeavy = report.danger_type === 'Harassment' || report.danger_type === 'Suspicious Activity';
                return (
                  <React.Fragment key={idx}>
                    {/* Outer glow zone */}
                    <Circle
                      center={[lat, lng]}
                      radius={isHeavy ? 400 : 250}
                      pathOptions={{ color: isHeavy ? '#E63946' : '#FFB703', fillColor: isHeavy ? '#E63946' : '#FFB703', fillOpacity: 0.12, weight: 0 }}
                    />
                    {/* Danger pin */}
                    <CircleMarker
                      center={[lat, lng]}
                      radius={isHeavy ? 10 : 7}
                      pathOptions={{ color: isHeavy ? '#E63946' : '#FFB703', fillColor: isHeavy ? '#E63946' : '#FFB703', fillOpacity: 0.9, weight: 2 }}
                    >
                      <Popup className="tactical-popup">
                        <div style={{ color: 'white', minWidth: '160px' }}>
                          <strong style={{ color: isHeavy ? '#E63946' : '#FFB703', fontSize: '13px' }}>
                            {isHeavy ? '🔴' : '🟡'} {report.danger_type}
                          </strong><br/>
                          <span style={{ color: '#aaa', fontSize: '12px' }}>📍 {report.location_name}</span><br/>
                          <span style={{ color: '#aaa', fontSize: '11px' }}>🕐 {report.time_of_incident || 'Unknown time'}</span><br/>
                          <span style={{ color: isHeavy ? '#E63946' : '#FFB703', fontSize: '11px', fontWeight: 'bold' }}>
                            {isHeavy ? '⚠️ HIGH TRAFFIC RISK' : '⚠️ Moderate Risk Zone'}
                          </span>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </React.Fragment>
                );
              })}

              {userLocation && !isGhostMode && (
                <>
                  <Circle center={userLocation} radius={gpsAccuracy} pathOptions={{ color: '#4C9EFF', fillOpacity: 0.1 }} />
                  <CircleMarker center={userLocation} radius={10} pathOptions={{ color: 'white', fillColor: '#4C9EFF', fillOpacity: 1, weight: 3 }}>
                    <Popup className="tactical-popup">SENTINEL_NODE_ACTIVE</Popup>
                  </CircleMarker>
                </>
              )}
            </MapContainer>
          </div>

          {/* Controls */}
          <div style={{ position: 'absolute', bottom: '100px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => mapRef.current?.zoomIn()} style={{ width: '50px', height: '50px', borderRadius: '15px', backgroundColor: 'rgba(22, 22, 37, 0.85)', color: '#FFB703', border: '1px solid rgba(255,183,3,0.3)', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold' }}>+</button>
            <button onClick={() => mapRef.current?.zoomOut()} style={{ width: '50px', height: '50px', borderRadius: '15px', backgroundColor: 'rgba(22, 22, 37, 0.85)', color: '#FFB703', border: '1px solid rgba(255,183,3,0.3)', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold' }}>-</button>
            <button onClick={() => setIsSatellite(!isSatellite)} style={{ width: '50px', height: '50px', borderRadius: '15px', backgroundColor: isSatellite ? '#4C9EFF' : 'rgba(22, 22, 37, 0.85)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>{isSatellite ? 'MAP' : 'SAT'}</button>
            <button onClick={() => setIs4DMode(!is4DMode)} style={{ width: '50px', height: '50px', borderRadius: '15px', backgroundColor: is4DMode ? '#FFB703' : 'rgba(22, 22, 37, 0.85)', color: is4DMode ? 'black' : 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>{is4DMode ? '2D' : '3D'}</button>
            <button onClick={() => setIsGhostMode(!isGhostMode)} style={{ width: '50px', height: '50px', borderRadius: '15px', backgroundColor: isGhostMode ? '#E63946' : 'rgba(22, 22, 37, 0.85)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '24px' }}>{isGhostMode ? '👻' : '👁️'}</button>
            <button onClick={() => setAutoFollow(!autoFollow)} style={{ width: '50px', height: '50px', borderRadius: '15px', backgroundColor: autoFollow ? '#2DC653' : 'rgba(22, 22, 37, 0.85)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '24px' }}>📍</button>
          </div>
        </div>

          {/* Route Recommendation Panel */}
          {routeInfo && (
            <div style={{
              position: 'absolute', bottom: '20px', left: '20px', right: '90px',
              backgroundColor: 'rgba(13, 13, 26, 0.95)', backdropFilter: 'blur(20px)',
              borderRadius: '20px', padding: '16px 20px',
              border: `1px solid ${routeInfo.trafficColor}44`,
              zIndex: 1000, boxShadow: `0 0 30px ${routeInfo.trafficColor}22`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFB703' }}>{routeInfo.distance} km</div>
                    <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Distance</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4C9EFF' }}>{routeInfo.duration} min</div>
                    <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>ETA</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: routeInfo.trafficColor }}>{routeInfo.safetyScore}%</div>
                    <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Safety</div>
                  </div>
                  <div style={{ padding: '5px 12px', borderRadius: '8px', background: `${routeInfo.trafficColor}22`, border: `1px solid ${routeInfo.trafficColor}44`, fontSize: '13px', fontWeight: 'bold', color: routeInfo.trafficColor }}>
                    {routeInfo.trafficLevel === 'Clear' ? '🟢' : routeInfo.trafficLevel === 'Moderate' ? '🟡' : '🔴'} {routeInfo.trafficLevel} Traffic · {routeInfo.dangerCount} zone(s)
                  </div>
                </div>
                <button onClick={() => { setActiveRoute(false); setRouteInfo(null); setRoutePoints([]); }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>✕</button>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '12px', background: `${routeInfo.trafficColor}11`, border: `1px solid ${routeInfo.trafficColor}33`, fontSize: '13px', color: '#F0F0FF', lineHeight: '1.6' }}>
                {routeInfo.recommendation}
              </div>
            </div>
          )}

          {routeLoading && (
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, backgroundColor: 'rgba(13,13,26,0.92)', backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '12px 20px', color: '#FFB703', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,183,3,0.2)' }}>
              ⏳ Calculating safest route...
            </div>
          )}

      </div>
    </div>
  );
};

export default MapScreen;
