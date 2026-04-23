import { useState, useEffect } from "react";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import SOSScreen from "./screens/SOSScreen";
import ReportScreen from "./screens/ReportScreen";
import AuthScreen from "./screens/AuthScreen";
import ProfileScreen from "./screens/ProfileScreen";

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [user, setUser] = useState({ name: "User" });
  const [language, setLanguage] = useState("en");
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('rakshak_user');
    const savedWallet = localStorage.getItem('rakshak_wallet');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setScreen('home');
    }
    if (savedWallet) setWalletAddress(savedWallet);
    setIsLoaded(true);
  }, []);

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
    if (address) localStorage.setItem('rakshak_wallet', address);
    else localStorage.removeItem('rakshak_wallet');
  };

  const handleNavigate = (newScreen, payload) => {
    if (payload && payload.user) {
      setUser(payload.user);
      localStorage.setItem('rakshak_user', JSON.stringify(payload.user));
    } else if (newScreen === 'auth' && payload?.logout) {
      setUser({ name: "User" });
      localStorage.removeItem('rakshak_user');
    }
    setScreen(newScreen);
  };

  if (!isLoaded) return <div style={{backgroundColor: '#0D0D1A', height: '100vh'}} />;

  return (
    <div>
      {screen === "auth" && <AuthScreen onNavigate={handleNavigate} />}
      {screen === "home" && <HomeScreen onNavigate={handleNavigate} user={user} language={language} setLanguage={setLanguage} />}
      {screen === "map" && <MapScreen onNavigate={handleNavigate} user={user} language={language} />}
      {screen === "sos" && <SOSScreen onNavigate={handleNavigate} user={user} language={language} />}
      {screen === "report" && <ReportScreen onNavigate={handleNavigate} user={user} language={language} walletAddress={walletAddress} />}
      {screen === "profile" && <ProfileScreen onNavigate={handleNavigate} user={user} language={language} walletAddress={walletAddress} onWalletConnect={handleWalletConnect} />}
    </div>
  );
}