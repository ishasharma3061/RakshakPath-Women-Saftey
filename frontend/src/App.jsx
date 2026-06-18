import React, { useState, useEffect } from "react";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import SOSScreen from "./screens/SOSScreen";
import ReportScreen from "./screens/ReportScreen";
import AuthScreen from "./screens/AuthScreen";
import ProfileScreen from "./screens/ProfileScreen";
import VerificationScreen from "./screens/VerificationScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// ✅ Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("🔥 React Crash:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "white", background: "#161625", padding: 40, textAlign: 'center', height: '100vh' }}>
          <h2 style={{color: '#FFB703'}}>Oops! Something went wrong.</h2>
          <p style={{color: '#8888AA'}}>{this.state.error?.toString()}</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} 
                  style={{padding: '10px 20px', background: '#FFB703', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
            Reset App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

function AppInner() {
  const { theme } = useTheme();
  const [screen, setScreen] = useState("auth");
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [language, setLanguage] = useState(() => localStorage.getItem("rakshak_language") || "en");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // ✅ LOAD USER FROM LOCALSTORAGE (FIXED LOGIC)
  useEffect(() => {
    const initApp = () => {
      try {
        const savedUser = localStorage.getItem("rakshak_user");
        const savedWallet = localStorage.getItem("rakshak_wallet");

        if (savedUser && savedUser !== "undefined") {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // Navigation logic: Force Auth screen if not fully verified for fresh session
          if (parsedUser.isVerified) {
            // Restore last visited screen (default: home)
            const savedScreen = localStorage.getItem('rakshak_screen');
            const safeScreens = ['home', 'map', 'report', 'sos', 'profile'];
            setScreen(safeScreens.includes(savedScreen) ? savedScreen : 'home');
          } else {
            setScreen('auth');
          }
        } else {
          setScreen("auth");
        }

        if (savedWallet) setWalletAddress(savedWallet);
      } catch (err) {
        console.error("❌ Auth Init Error:", err);
        setScreen("auth");
      }
      setIsLoaded(true);
    };

    initApp();

    // Splash timer
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // ✅ NAVIGATION HANDLER
  const handleNavigate = (newScreen, payload = {}) => {
    if (payload.user) {
      const updatedUser = { ...payload.user };
      setUser(updatedUser);
      localStorage.setItem("rakshak_user", JSON.stringify(updatedUser));
    }

    if (newScreen === 'auth' && payload.logout) {
      localStorage.removeItem('rakshak_user');
      localStorage.removeItem('rakshak_wallet');
      localStorage.removeItem('rakshak_screen');
      setUser(null);
    }

    // Persist screen for reload (skip auth/verification)
    if (!['auth', 'verification'].includes(newScreen)) {
      localStorage.setItem('rakshak_screen', newScreen);
    }

    setScreen(newScreen);
  };

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
    if (address) localStorage.setItem("rakshak_wallet", address);
    else localStorage.removeItem("rakshak_wallet");
  };

  // ✅ Splash Screen
  if (showSplash) {
    return (
      <div style={{ 
        height: "100vh", 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        color: '#FFB703',
        padding: '24px',
        animation: 'fadeIn 1.5s ease-out',
        backgroundImage: 'linear-gradient(rgba(8, 8, 18, 0.4), rgba(8, 8, 18, 0.4)), url("https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=1000")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          backdropFilter: 'blur(20px)', 
          borderRadius: '32px', 
          padding: '48px 32px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          maxWidth: '380px',
          width: '100%'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '24px', animation: 'pulseSOS 2s infinite' }}>🛡️</div>
          <h1 style={{ 
            fontSize: '48px', 
            fontFamily: "'Rajdhani', sans-serif", 
            fontWeight: 'bold', 
            margin: '0 0 12px 0',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#FFB703',
            textShadow: '0 0 20px rgba(255, 183, 3, 0.4)'
          }}>
            RAKSHAKPATH
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#F0F0FF', 
            margin: '0', 
            fontWeight: '500',
            letterSpacing: '1px'
          }}>
            Aapki Suraksha, Hamara Vada
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#8888AA', 
            marginTop: '16px',
            fontStyle: 'italic'
          }}>
            Empowering Women through Innovation
          </p>
          
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="loader" style={{ 
              width: '32px', 
              height: '32px', 
              border: '3px solid rgba(255,183,3,0.1)', 
              borderTop: '3px solid #FFB703', 
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        </div>

        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          @keyframes pulseSOS {
            0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255,183,3,0.4)); }
            50% { transform: scale(1.1); filter: drop-shadow(0 0 30px rgba(255,183,3,0.8)); }
            100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255,183,3,0.4)); }
          }
        `}</style>
      </div>
    );
  }

  // ✅ Loading State
  if (!isLoaded) {
    return (
      <div style={{ height: "100vh", background: "#0D0D1A", display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFB703' }}>
      <h2>Loading RakshakPath...</h2>
      </div>
    );
  }

  const Sidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(45, 198, 83, 0.4); }
          50% { opacity: 0.8; transform: scale(1.2); box-shadow: 0 0 0 6px rgba(45, 198, 83, 0); }
        }
        @keyframes sidebar-scan {
          0% { top: -2px; opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes logo-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(255,183,3,0.3); }
          50% { text-shadow: 0 0 25px rgba(255,183,3,0.8), 0 0 50px rgba(255,183,3,0.3); }
        }
        @keyframes node-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes border-glow {
          0%, 100% { border-color: rgba(255,183,3,0.3); box-shadow: 0 0 8px rgba(255,183,3,0.1); }
          50% { border-color: rgba(255,183,3,0.7); box-shadow: 0 0 20px rgba(255,183,3,0.3); }
        }
        .sidebar-item { animation: slide-in 0.3s ease forwards; }
        .sidebar-item:nth-child(1) { animation-delay: 0.05s; }
        .sidebar-item:nth-child(2) { animation-delay: 0.1s; }
        .sidebar-item:nth-child(3) { animation-delay: 0.15s; }
        .sidebar-item:nth-child(4) { animation-delay: 0.2s; }
        .sidebar-item:nth-child(5) { animation-delay: 0.25s; }
      `}</style>

      {/* Animated scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,183,3,0.4), transparent)',
        animation: 'sidebar-scan 6s linear infinite',
        pointerEvents: 'none', zIndex: 10
      }} />

      {/* Logo */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '22px' }}>🛡️</span>
          <h1 style={{
            fontSize: '22px', fontWeight: 'bold', color: '#FFB703', margin: 0,
            fontFamily: "'Rajdhani', sans-serif",
            animation: 'logo-glow 3s ease-in-out infinite'
          }}>RAKSHAKPATH</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '32px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2DC653',
            animation: 'pulse-dot 2s ease-in-out infinite'
          }} />
          <p style={{ fontSize: '9px', color: '#8888AA', letterSpacing: '1.5px', margin: 0, textTransform: 'uppercase' }}>
            Blockchain Safety Node
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {(() => {
          const sidebarTranslations = {
            en: [
              { id: 'home', label: 'Dashboard', icon: '🏠', desc: 'Command Center' },
              { id: 'map', label: 'Safety Map', icon: '🗺️', desc: 'Live Threat Map' },
              { id: 'report', label: 'File Report', icon: '⚠️', desc: 'Report Danger' },
              { id: 'sos', label: 'Emergency SOS', icon: '🆘', desc: 'Panic Button' },
              { id: 'profile', label: 'Node & Profile', icon: '👤', desc: 'Identity Node' },
              { id: 'settings', label: 'Settings', icon: '⚙️', desc: 'Language' },
            ],
            hi: [
              { id: 'home', label: 'डैशबोर्ड', icon: '🏠', desc: 'कमांड सेंटर' },
              { id: 'map', label: 'सुरक्षा मैप', icon: '🗺️', desc: 'लाइव थ्रेट मैप' },
              { id: 'report', label: 'रिपोर्ट करें', icon: '⚠️', desc: 'खतरे की रिपोर्ट' },
              { id: 'sos', label: 'इमरजेंसी SOS', icon: '🆘', desc: 'पैनिक बटन' },
              { id: 'profile', label: 'प्रोफाइल', icon: '👤', desc: 'पहचान नोड' },
              { id: 'settings', label: 'सेटिंग्स', icon: '⚙️', desc: 'भाषा' },
            ],
            mr: [
              { id: 'home', label: 'डॅशबोर्ड', icon: '🏠', desc: 'कमांड सेंटर' },
              { id: 'map', label: 'सुरक्षा नकाशा', icon: '🗺️', desc: 'लाइव्ह थ्रेट मॅप' },
              { id: 'report', label: 'तक्रार नोंदवा', icon: '⚠️', desc: 'धोक्याची नोंद' },
              { id: 'sos', label: 'आणीबाणी SOS', icon: '🆘', desc: 'पॅनिक बटण' },
              { id: 'profile', label: 'प्रोफाइल', icon: '👤', desc: 'ओळख नोड' },
              { id: 'settings', label: 'सेटिंग्ज', icon: '⚙️', desc: 'भाषा' },
            ],
            bn: [
              { id: 'home', label: 'ড্যাশবোর্ড', icon: '🏠', desc: 'কমান্ড সেন্টার' },
              { id: 'map', label: 'নিরাপত্তা ম্যাপ', icon: '🗺️', desc: 'লাইভ থ্রেট ম্যাপ' },
              { id: 'report', label: 'রিপোর্ট করুন', icon: '⚠️', desc: 'বিপদের রিপোর্ট' },
              { id: 'sos', label: 'জরুরী SOS', icon: '🆘', desc: 'প্যানিক বোতাম' },
              { id: 'profile', label: 'প্রোফাইল', icon: '👤', desc: 'পরিচয় নোড' },
              { id: 'settings', label: 'সেটিংস', icon: '⚙️', desc: 'ভাষা' },
            ],
            te: [
              { id: 'home', label: 'డాష్‌బోర్డ్', icon: '🏠', desc: 'కమాండ్ సెంటర్' },
              { id: 'map', label: 'భద్రతా మ్యాప్', icon: '🗺️', desc: 'లైవ్ థ్రెట్ మ్యాప్' },
              { id: 'report', label: 'రిపోర్ట్ చేయండి', icon: '⚠️', desc: 'ప్రమాద రిపోర్ట్' },
              { id: 'sos', label: 'ఎమర్జెన్సీ SOS', icon: '🆘', desc: 'పానిక్ బటన్' },
              { id: 'profile', label: 'ప్రొఫైల్', icon: '👤', desc: 'గుర్తింపు నోడ్' },
              { id: 'settings', label: 'సెట్టింగ్‌లు', icon: '⚙️', desc: 'భాష' },
            ],
            ta: [
              { id: 'home', label: 'டாஷ்போர்டு', icon: '🏠', desc: 'கட்டளை மையம்' },
              { id: 'map', label: 'பாதுகாப்பு வரைபடம்', icon: '🗺️', desc: 'நேரடி அச்சுறுத்தல் வரைபடம்' },
              { id: 'report', label: 'புகாரளி', icon: '⚠️', desc: 'ஆபத்து அறிக்கை' },
              { id: 'sos', label: 'அவசர SOS', icon: '🆘', desc: 'பீதி பொத்தான்' },
              { id: 'profile', label: 'சுயவிவரம்', icon: '👤', desc: 'அடையாள முனையம்' },
              { id: 'settings', label: 'அமைப்புகள்', icon: '⚙️', desc: 'மொழி' },
            ]
          };
          const items = sidebarTranslations[language] || sidebarTranslations.en;
          return items.map((item, idx) => (
          <button
            key={item.id}
            className="sidebar-item"
            onClick={() => handleNavigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '12px',
              border: 'none',
              borderLeft: screen === item.id ? '3px solid #FFB703' : '3px solid transparent',
              background: screen === item.id
                ? 'linear-gradient(90deg, rgba(255,183,3,0.12), rgba(255,183,3,0.03))'
                : 'transparent',
              color: screen === item.id ? '#FFB703' : '#8888AA',
              cursor: 'pointer',
              fontWeight: screen === item.id ? 'bold' : '500',
              textAlign: 'left',
              transition: 'all 0.25s ease',
              width: '100%',
              boxShadow: screen === item.id ? '0 0 20px rgba(255,183,3,0.08), inset 0 0 0 1px rgba(255,183,3,0.1)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (screen !== item.id) {
                e.currentTarget.style.color = '#F0F0FF';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderLeft = '3px solid rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (screen !== item.id) {
                e.currentTarget.style.color = '#8888AA';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderLeft = '3px solid transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', letterSpacing: '0.3px', lineHeight: '1.2' }}>{item.label}</div>
              <div style={{ fontSize: '10px', color: screen === item.id ? 'rgba(255,183,3,0.5)' : '#555', letterSpacing: '0.5px' }}>{item.desc}</div>
            </div>
            {screen === item.id && (
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFB703', animation: 'pulse-dot 1.5s ease-in-out infinite', flexShrink: 0 }} />
            )}
          </button>
          ));
        })()}
      </div>

      {/* System Status */}
      <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(45,198,83,0.05)', border: '1px solid rgba(45,198,83,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#2DC653', animation: 'node-blink 1s ease infinite' }} />
          <span style={{ fontSize: '9px', color: '#2DC653', letterSpacing: '1px', textTransform: 'uppercase' }}>System Online</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          {[{ label: 'Network', val: 'Active' }, { label: 'Node', val: 'Secure' }].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '9px', color: '#555' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: '#2DC653', fontWeight: 'bold' }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => handleNavigate('auth', { logout: true })}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', padding: '12px 16px', width: '100%',
            borderRadius: '12px', border: '1px solid rgba(230,57,70,0.2)',
            background: 'linear-gradient(90deg, rgba(230,57,70,0.08), transparent)',
            color: '#E63946', cursor: 'pointer', fontWeight: 'bold',
            transition: 'all 0.3s ease', letterSpacing: '1px'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(230,57,70,0.18)'; e.currentTarget.style.borderColor = 'rgba(230,57,70,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(90deg, rgba(230,57,70,0.08), transparent)'; e.currentTarget.style.borderColor = 'rgba(230,57,70,0.2)'; }}
        >
          <span style={{ fontSize: '16px' }}>🚪</span>
          <span style={{ fontSize: '12px', textTransform: 'uppercase' }}>Secure Logout</span>
        </button>
      </div>
    </div>
  );

  const renderScreen = () => {
    switch (screen) {
      case "auth": return <AuthScreen onNavigate={handleNavigate} />;
      case "verification": return <VerificationScreen onNavigate={handleNavigate} user={user} language={language} />;
      case "home": return <HomeScreen onNavigate={handleNavigate} user={user} language={language} setLanguage={setLanguage} />;
      case "map": return <MapScreen onNavigate={handleNavigate} user={user} language={language} />;
      case "sos": return <SOSScreen onNavigate={handleNavigate} user={user} language={language} />;
      case "report": return <ReportScreen onNavigate={handleNavigate} user={user} language={language} walletAddress={walletAddress} />;
      case "profile": return <ProfileScreen onNavigate={handleNavigate} user={user} language={language} walletAddress={walletAddress} onWalletConnect={handleWalletConnect} />;
      case "settings": return <SettingsScreen onNavigate={handleNavigate} user={user} language={language} setLanguage={setLanguage} />;
      default: return <HomeScreen onNavigate={handleNavigate} user={user} language={language} setLanguage={setLanguage} />;
    }
  };

  const isAuthPage = screen === "auth" || screen === "verification";

  return (
    <ErrorBoundary>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: theme === 'light' ? 'var(--bg-page)' : '#05050F', 
        position: 'relative', 
        overflow: 'hidden',
        backgroundImage: theme === 'dark'
          ? 'linear-gradient(rgba(8, 8, 18, 0.4), rgba(8, 8, 18, 0.4)), url("https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=1000")'
          : 'linear-gradient(rgba(240,240,250,0.7), rgba(235,235,248,0.85))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background 0.4s ease'
      }}>
        <style>
          {`
            @keyframes meshMove {
              0%   { transform: scale(1)   translate(0%,  0%);  }
              25%  { transform: scale(1.2) translate(8%,  5%);  }
              50%  { transform: scale(1.4) translate(-5%, 10%); }
              75%  { transform: scale(1.2) translate(-8%, -5%); }
              100% { transform: scale(1)   translate(0%,  0%);  }
            }
            body { background-color: #05050F; margin: 0; }
            .bg-mesh {
              position: fixed;
              top: -20%; left: -20%;
              width: 140%; height: 140%;
              background:
                radial-gradient(ellipse at 20% 20%, rgba(255, 183, 3, 0.45) 0%, transparent 45%),
                radial-gradient(ellipse at 80% 80%, rgba(45, 198, 83, 0.35) 0%, transparent 45%),
                radial-gradient(ellipse at 60% 20%, rgba(76, 158, 255, 0.3) 0%, transparent 45%),
                radial-gradient(ellipse at 30% 80%, rgba(230, 57, 70, 0.2) 0%, transparent 40%);
              z-index: 0;
              animation: meshMove 18s ease-in-out infinite;
              filter: blur(60px);
              pointer-events: none;
            }
          `}
        </style>

        {!isAuthPage && (
          <div style={{
            width: '320px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            backgroundColor: 'var(--sidebar-bg)',
            backdropFilter: 'blur(40px)',
            borderRight: '1px solid var(--glass-stroke)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            boxSizing: 'border-box',
            transition: 'background 0.3s ease'
          }}>
            <Sidebar />
          </div>
        )}

        <div style={{ 
          flex: 1, 
          marginLeft: (screen !== "auth" && screen !== "verification") ? '320px' : '0', 
          width: (screen !== "auth" && screen !== "verification") ? 'calc(100% - 320px)' : '100%',
          position: 'relative',
          zIndex: 1
        }}>
          {renderScreen()}
        </div>
      </div>
    </ErrorBoundary>
  );
}