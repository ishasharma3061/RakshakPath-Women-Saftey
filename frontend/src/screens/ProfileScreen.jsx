import React from "react";

const ProfileScreen = ({
  onNavigate,
  user,
  language,
  walletAddress,
  onWalletConnect,
}) => {
  const handleLogout = () => {
    onNavigate("auth", { logout: true });
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

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#0D0D1A",
      color: "#F0F0FF",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    wrapper: {
      width: "100%",
      maxWidth: "430px",
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
    avatar: {
      fontSize: "64px",
      marginBottom: "10px",
    },
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
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontSize: "13px",
      color: "#B8B9D6",
      fontWeight: "600",
    },
    value: {
      backgroundColor: "#1F1F35",
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => onNavigate("home")}>
            ←
          </button>
          <h1 style={styles.title}>
            {language === "hi" ? "प्रोफ़ाइल" : "Profile"}
          </h1>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.avatar}>👤</div>
          <h2 style={styles.userName}>{user?.name || "User"}</h2>
          <p style={styles.userEmail}>{user?.email || "user@example.com"}</p>
        </div>

        <div style={styles.card}>
          <div style={styles.fieldBox}>
            <div style={styles.label}>Address</div>
            <div style={styles.value}>{user?.address || "Not available"}</div>
          </div>

          <div style={styles.fieldBox}>
            <div style={styles.label}>Your Contact Number</div>
            <div style={styles.value}>{user?.contactNumber || "Not available"}</div>
          </div>

          <div style={styles.fieldBox}>
            <div style={styles.label}>Alternate Contact 1</div>
            <div style={styles.value}>{user?.alternateContact1 || "Not available"}</div>
          </div>

          <div style={styles.fieldBox}>
            <div style={styles.label}>Alternate Contact 2</div>
            <div style={styles.value}>{user?.alternateContact2 || "Not available"}</div>
          </div>
        </div>

        {walletAddress ? (
          <div style={styles.walletConnected}>
            <span>🦊 Wallet Connected</span>
            <span>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        ) : (
          <button style={styles.walletBtn} onClick={connectWallet}>
            🦊 Connect Web3 Wallet
          </button>
        )}

        <button style={styles.logoutBtn} onClick={handleLogout}>
          {language === "hi" ? "लॉग आउट" : "Log Out"}
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;