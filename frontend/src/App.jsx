import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import SOSScreen from "./screens/SOSScreen";

export default function App() {
  const [screen, setScreen] = useState("home");
  return (
    <div>
      {screen === "home" && <HomeScreen onNavigate={setScreen} />}
      {screen === "map" && <MapScreen onNavigate={setScreen} />}
      {screen === "sos" && <SOSScreen onNavigate={setScreen} />}
    </div>
  );
}