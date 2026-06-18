import React, { useState } from "react";
import { auth } from "../api"; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification 
} from "firebase/auth";

const AuthScreen = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [emergencyContact1, setEmergencyContact1] = useState("");
  const [emergencyContact2, setEmergencyContact2] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleNumberChange = (value, setter) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setter(digitsOnly);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        
        // Skip verification check for demo speed
        onNavigate("home", { user: { ...userCredential.user, isVerified: true } });
      } else {
        // --- SIGNUP LOGIC (Simplified Validation) ---
        if (!name.trim() || !email.trim() || !password.trim()) {
          setErrorMsg("Please fill Name, Email, and Password.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
        await sendEmailVerification(userCredential.user);

        const newUser = {
          name: name.trim(),
          email: email.trim(),
          address: address.trim() || "Not provided",
          contactNumber: contactNumber || "0000000000",
          emergencyContact1: emergencyContact1 || "",
          emergencyContact2: emergencyContact2 || "",
          isVerified: false
        };

        // --- BACKEND SYNC ---
        try {
          await fetch("http://127.0.0.1:5001/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
          });
        } catch (backendErr) {
          console.error("❌ Backend Sync Failed:", backendErr);
          // We continue anyway as Firebase auth succeeded
        }

        localStorage.setItem("rakshak_user", JSON.stringify(newUser));
        onNavigate("verification", { user: newUser });
      }
    } catch (error) {

      if (error.code === "auth/email-already-in-use") setErrorMsg("Email already exists.");
      else if (error.code === "auth/weak-password") setErrorMsg("Password is too weak.");
      else if (error.code === "auth/wrong-password") setErrorMsg("Incorrect password. Please try again.");
      else if (error.code === "auth/user-not-found") setErrorMsg("No account found with this email.");
      else if (error.code === "auth/invalid-credential") setErrorMsg("Invalid email or password.");
      else setErrorMsg(error.message);

    }
  };

  const styles = {
    title: { fontSize: "28px", fontWeight: "bold", color: "#FFB703", textAlign: 'center', marginBottom: '20px' },
    toggleWrap: { display: "flex", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "4px", marginBottom: "20px" },
    toggleButton: { flex: 1, padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "all 0.3s ease" },
    form: { 
      display: "flex", 
      flexDirection: "column", 
      gap: "15px", 
      maxHeight: "380px", 
      overflowY: "auto", 
      paddingRight: "5px" 
    },
    inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
    label: { fontSize: "12px", color: "#8888AA", fontWeight: "bold" },
    passwordWrapper: { position: "relative", display: "flex", alignItems: "center" },
    togglePass: { 
      position: "absolute", 
      right: "10px", 
      background: "none", 
      border: "none", 
      color: "#FFB703", 
      cursor: "pointer", 
      fontSize: "14px",
      fontWeight: "bold"
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "24px" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "32px 24px" }}>
        <h1 style={styles.title}>RAKSHAKPATH</h1>
        <p style={{ textAlign: 'center', color: '#8888AA', fontSize: '14px', marginBottom: '24px', marginTop: '-15px' }}>
          {isLogin ? "Welcome Back, Guardian" : "Join the Safety Revolution"}
        </p>
        <div style={styles.toggleWrap}>
          <button style={{...styles.toggleButton, backgroundColor: isLogin ? "#FFB703" : "transparent", color: isLogin ? "#000" : "#8888AA"}} onClick={() => setIsLogin(true)}>Login</button>
          <button style={{...styles.toggleButton, backgroundColor: !isLogin ? "#FFB703" : "transparent", color: !isLogin ? "#000" : "#8888AA"}} onClick={() => setIsLogin(false)}>Sign Up</button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input className="glass-input" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Address</label>
                <input className="glass-input" type="text" placeholder="Home Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input className="glass-input" type="text" value={contactNumber} maxLength={10} placeholder="10 Digit Number" onChange={(e) => handleNumberChange(e.target.value, setContactNumber)} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Emergency Contact 1</label>
                <input className="glass-input" type="text" value={emergencyContact1} maxLength={10} placeholder="Emergency Number 1" onChange={(e) => handleNumberChange(e.target.value, setEmergencyContact1)} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Emergency Contact 2</label>
                <input className="glass-input" type="text" value={emergencyContact2} maxLength={10} placeholder="Emergency Number 2" onChange={(e) => handleNumberChange(e.target.value, setEmergencyContact2)} />
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input className="glass-input" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input 
                className="glass-input" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ width: "100%", paddingRight: "50px" }}
              />
              <button 
                type="button" 
                style={styles.togglePass} 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {errorMsg && <div style={{ color: "#FF3B5C", fontSize: "13px", textAlign: "center", padding: "8px", background: "rgba(255,59,92,0.1)", borderRadius: "5px"}}>{errorMsg}</div>}

          <button type="submit" className="btn-primary" style={{marginTop: "10px"}}>{isLogin ? "Log In" : "Create Account"}</button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;