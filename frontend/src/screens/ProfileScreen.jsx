import React, { useState } from "react";
import { auth } from "../api";
import { deleteUser } from "firebase/auth";

const ProfileScreen = ({
  onNavigate,
  user,
  language,
  walletAddress,
  onWalletConnect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    address: user?.address || "",
    contactNumber: user?.contactNumber || "",
    emergencyContact1: user?.emergencyContact1 || "",
    emergencyContact2: user?.emergencyContact2 || "",
    profilePic: user?.profilePic || "",
  });

  const fileInputRef = React.useRef(null);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image too large! Please use a smaller image (< 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const updatedUser = { ...user, ...formData };
    
    // --- BACKEND SYNC ---
    try {
      await fetch("http://127.0.0.1:5001/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, ...formData }),
      });
    } catch (err) {
      console.error("❌ Profile Sync Failed:", err);
    }

    onNavigate("profile", { user: updatedUser });
    setIsEditing(false);
    alert("Profile Updated Successfully!");
  };


  const handleLogout = () => {
    onNavigate("auth", { logout: true });
  };

  const handleDeleteAccount = async () => {
    try {
      // 1. Delete from Firebase Auth
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          await deleteUser(firebaseUser);
        } catch (fbErr) {
          console.error("Firebase deletion failed:", fbErr);
          if (fbErr.code === "auth/requires-recent-login") {
            alert(language === "hi" 
              ? "सुरक्षा के लिए कृपया फिर से लॉगिन करें और फिर डिलीट करें।" 
              : "For security, please log in again before deleting your account.");
            onNavigate("auth", { logout: true });
            return;
          }
        }
      }

      // 2. Delete from Backend
      const response = await fetch("http://localhost:5001/api/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });

      if (response.ok) {
        alert(
          language === "hi"
            ? "आपका अकाउंट सफलतापूर्वक डिलीट हो गया।"
            : "Your account has been deleted successfully."
        );
        onNavigate("auth", { logout: true, deleteAccount: true });
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete account from backend.");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      alert("Error during account deletion.");
    }
  };


  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          onWalletConnect(accounts[0]);
        }
      } catch (err) {
        console.error("Wallet connection rejected:", err);
      }
    } else {
      alert(
        language === "hi"
          ? "MetaMask install karo pehle."
          : "Please install MetaMask first."
      );
    }
  };

  const containerStyle = {
    color: "#F0F0FF",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "100px",
    minHeight: "100vh",
    position: "relative",
    zIndex: 1,
    overflowY: "auto",
    backgroundColor: "transparent"
  };

  const styles = {
    container: containerStyle,
    wrapper: {
      width: "100%",
      maxWidth: "none",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    header: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    },
    backBtn: {
      background: "none",
      border: "none",
      color: "#F0F0FF",
      fontSize: "24px",
      cursor: "pointer",
      marginRight: "15px",
    },
    title: {
      fontSize: "24px",
      margin: 0,
      color: "#FFB703",
      fontFamily: "'Rajdhani', sans-serif",
      fontWeight: "bold",
    },
    profileCard: {
      backgroundColor: "#161625",
      padding: "30px 20px",
      borderRadius: "18px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      border: "1px solid rgba(255,183,3,0.25)",
    },
    avatar: { fontSize: "64px", marginBottom: "10px" },
    userName: {
      fontSize: "32px",
      fontWeight: "bold",
      margin: 0,
      textTransform: "capitalize",
    },
    userEmail: {
      color: "#9DA3C2",
      fontSize: "15px",
      marginTop: "6px",
      wordBreak: "break-word",
    },
    input: {
      backgroundColor: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "white",
      padding: "12px",
      borderRadius: "12px",
      width: "100%",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box"
    },
    card: {
      backgroundColor: "#161625",
      padding: "18px",
      borderRadius: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    fieldBox: {
      backgroundColor: "rgba(255,255,255,0.02)",
      padding: "16px",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.05)",
      marginBottom: "15px",
    },
    label: {
      fontSize: "11px",
      color: "#8888AA",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: "1px",
      marginBottom: "8px",
      display: "block",
    },
    value: {
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "12px",
      borderRadius: "10px",
      color: "#F0F0FF",
      fontSize: "15px",
      wordBreak: "break-word",
    },
    walletBtn: {
      backgroundColor: "transparent",
      border: "1px solid #FFB703",
      color: "#FFB703",
      padding: "16px",
      borderRadius: "12px",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: "pointer",
      width: "100%",
    },
    walletConnected: {
      backgroundColor: "#161625",
      padding: "16px",
      borderRadius: "12px",
      color: "#2DC653",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "14px",
      border: "1px solid rgba(45,198,83,0.25)",
    },
    logoutBtn: {
      backgroundColor: "transparent",
      border: "1px solid #E63946",
      color: "#E63946",
      padding: "16px",
      borderRadius: "12px",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: "pointer",
      width: "100%",
    },
    deleteBtn: {
      backgroundColor: "transparent",
      border: "1px dashed #FF4444",
      color: "#FF4444",
      padding: "14px",
      borderRadius: "12px",
      fontWeight: "bold",
      fontSize: "15px",
      cursor: "pointer",
      width: "100%",
    },
    modalOverlay: {
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modalBox: {
      backgroundColor: "#161625",
      borderRadius: "18px",
      padding: "28px 24px",
      maxWidth: "380px",
      width: "100%",
      border: "1px solid rgba(230,57,70,0.5)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    modalTitle: {
      color: "#E63946",
      fontSize: "20px",
      fontWeight: "bold",
      fontFamily: "'Rajdhani', sans-serif",
      margin: 0,
    },
    modalText: {
      color: "#B8B9D6",
      fontSize: "14px",
      lineHeight: "1.6",
      margin: 0,
    },
    modalInput: {
      backgroundColor: "#1F1F35",
      border: "1px solid rgba(230,57,70,0.4)",
      borderRadius: "10px",
      padding: "12px",
      color: "#F0F0FF",
      fontSize: "15px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },
    modalBtns: { display: "flex", gap: "10px" },
    modalConfirmBtn: {
      flex: 1,
      backgroundColor: "#E63946",
      border: "none",
      borderRadius: "10px",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "15px",
      padding: "13px",
      cursor: "pointer",
    },
    modalCancelBtn: {
      flex: 1,
      backgroundColor: "transparent",
      border: "1px solid #555",
      borderRadius: "10px",
      color: "#F0F0FF",
      fontWeight: "bold",
      fontSize: "15px",
      padding: "13px",
      cursor: "pointer",
    },
  };

  const isConfirmValid = deleteInput.trim().toUpperCase() === "DELETE";

  return (
    <>
      <style>
        {`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulseSOS {
            0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255,183,3,0.3)); }
            50% { transform: scale(1.05); filter: drop-shadow(0 0 15px rgba(255,183,3,0.6)); }
            100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255,183,3,0.3)); }
          }
        `}
      </style>
      <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => onNavigate("home")}>←</button>
          <h1 style={styles.title}>
            {language === "hi" ? "प्रोफ़ाइल" : "Profile"}
          </h1>
          {!isEditing && (
            <button
              style={{ marginLeft: "auto", background: "#FFB703", border: "none", borderRadius: "5px", padding: "6px 12px", fontWeight: "bold", cursor: "pointer" }}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
        </div>

        {/* 5. WALLET SECTION */}
        <div style={styles.sectionTitle}>{language === 'hi' ? 'वेब3 नोड' : 'Web3 Node Status'}</div>
        <div style={styles.profileCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '30px' }}>⛓️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', color: '#FFF' }}>
                {walletAddress ? 'Node Activated' : 'Node Offline'}
              </div>
              <div style={{ fontSize: '12px', color: '#8888AA', fontFamily: 'monospace' }}>
                {walletAddress ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-10)}` : 'Connect wallet to sync on-chain'}
              </div>
            </div>
          </div>
          <button 
            onClick={walletAddress ? () => onWalletConnect("") : connectWallet}
            style={{ 
              marginTop: '15px', 
              width: '100%', 
              padding: '12px', 
              borderRadius: '10px', 
              border: walletAddress ? '1px solid rgba(230,57,70,0.5)' : '1px solid #FFB703',
              background: walletAddress ? 'rgba(230,57,70,0.1)' : 'rgba(255,183,3,0.1)',
              color: walletAddress ? '#E63946' : '#FFB703',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {walletAddress ? 'Deactivate Node' : 'Activate Web3 Node'}
          </button>
        </div>

        {/* Profile Card */}
        <div style={{...styles.profileCard, padding: '40px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, transparent, #FFB703, transparent)' }}></div>
          
          <div style={{ position: "relative", margin: '0 auto', width: "120px" }}>
            {/* Pulsing Outer Ring */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              right: '-10px',
              bottom: '-10px',
              borderRadius: '50%',
              border: '2px dashed rgba(255,183,3,0.3)',
              animation: 'spin 10s linear infinite'
            }}></div>
            
            <div style={{ 
              ...styles.avatar, 
              width: "120px", 
              height: "120px", 
              borderRadius: "50%", 
              overflow: "hidden", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "3px solid #FFB703",
              boxShadow: '0 0 30px rgba(255,183,3,0.2)'
            }}>
              {(formData.profilePic || user?.profilePic) ? (
                <img src={formData.profilePic || user?.profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "60px" }}>👤</span>
              )}
            </div>
            
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current.click()}
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  background: "#FFB703",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
                  zIndex: 5
                }}
              >
                📸
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              accept="image/*"
              onChange={handleProfilePicChange}
            />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h2 style={{ ...styles.userName, margin: 0, fontSize: '28px' }}>{user?.name || "User"}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '10px', backgroundColor: 'rgba(45,198,83,0.2)', color: '#2DC653', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>SENTINEL RANK</span>
              <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,183,3,0.2)', color: '#FFB703', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>TRUST LEVEL 4</span>
            </div>
          </div>
        </div>

        {/* 6. REPUTATION STATS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Reports', value: '12', color: '#FFB703' },
            { label: 'Safety Score', value: '98%', color: '#2DC653' },
            { label: 'Guardian ID', value: '#742', color: '#8888AA' }
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '15px 10px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: stat.color, fontFamily: "'Rajdhani', sans-serif" }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: '#8888AA', textTransform: 'uppercase', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div style={styles.card}>
          <div style={styles.fieldBox}>
            <div style={styles.label}>Full Name</div>
            {isEditing ? (
              <input style={styles.input} value={formData.name} onChange={e => handleInputChange("name", e.target.value)} />
            ) : (
              <div style={styles.value}>{user?.name || "Not available"}</div>
            )}
          </div>

          <div style={styles.fieldBox}>
            <div style={styles.label}>Address</div>
            {isEditing ? (
              <input style={styles.input} value={formData.address} onChange={e => handleInputChange("address", e.target.value)} />
            ) : (
              <div style={styles.value}>{user?.address || "Not available"}</div>
            )}
          </div>
          <div style={styles.fieldBox}>
            <div style={styles.label}>Emergency Contact 1</div>
            {isEditing ? (
              <input className="glass-input" style={styles.input} value={formData.emergencyContact1} maxLength={10} onChange={e => handleInputChange("emergencyContact1", e.target.value.replace(/\D/g, ""))} />
            ) : (
              <div style={{ ...styles.value, border: !user?.emergencyContact1 ? "1px solid #E63946" : styles.value.border }}>
                {user?.emergencyContact1 || "Not available"}
              </div>
            )}
          </div>

          <div style={styles.fieldBox}>
            <div style={styles.label}>Emergency Contact 2</div>
            {isEditing ? (
              <input className="glass-input" value={formData.emergencyContact2} maxLength={10} onChange={e => handleInputChange("emergencyContact2", e.target.value.replace(/\D/g, ""))} />
            ) : (
              <div style={{ ...styles.value, border: !user?.emergencyContact2 ? "1px solid #E63946" : styles.value.border }}>
                {user?.emergencyContact2 || "Not available"}
              </div>
            )}
          </div>

          {!user?.emergencyContact1 && !user?.emergencyContact2 && (
            <p style={{ color: "#E63946", fontSize: "13px", margin: "10px 0 0 0", textAlign: "center", fontWeight: "bold" }}>
              🚨 Please add emergency contacts to enable SOS!
            </p>
          )}

          <p style={{ color: "#8888AA", fontSize: "12px", marginTop: "15px", textAlign: "center", fontStyle: "italic" }}>
            Note: For the demo, use numbers verified in your Twilio Dashboard.
          </p>

          {isEditing && (
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Changes</button>
              <button className="btn-secondary" style={{ flex: 1, borderColor: "#888" }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          )}
        </div>

        {/* Logout */}
        <button style={styles.logoutBtn} onClick={handleLogout}>
          {language === "hi" ? "लॉग आउट" : "Log Out"}
        </button>

        {/* Delete Account */}
        <button style={styles.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>
          🗑️ {language === "hi" ? "अकाउंट डिलीट करें" : "Delete Account"}
        </button>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <p style={styles.modalTitle}>
              ⚠️ {language === "hi" ? "अकाउंट डिलीट करें?" : "Delete Account?"}
            </p>
            <p style={styles.modalText}>
              {language === "hi"
                ? `यह एक स्थायी क्रिया है। आपका सारा डेटा हमेशा के लिए हट जाएगा। पुष्टि करने के लिए "DELETE" टाइप करें।`
                : `This is permanent and cannot be undone. All your data will be erased. Type "DELETE" below to confirm.`}
            </p>
            <input
              style={styles.modalInput}
              placeholder='Type "DELETE" to confirm'
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              autoFocus
            />
            <div style={styles.modalBtns}>
              <button
                style={{ ...styles.modalConfirmBtn, opacity: isConfirmValid ? 1 : 0.4, cursor: isConfirmValid ? "pointer" : "not-allowed" }}
                disabled={!isConfirmValid}
                onClick={handleDeleteAccount}
              >
                {language === "hi" ? "हाँ, डिलीट करो" : "Yes, Delete"}
              </button>
              <button
                style={styles.modalCancelBtn}
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
              >
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ProfileScreen;