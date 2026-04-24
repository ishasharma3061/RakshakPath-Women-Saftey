import React, { useState } from "react";

const AuthScreen = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alternateContact1, setAlternateContact1] = useState("");
  const [alternateContact2, setAlternateContact2] = useState("");

  const handleNumberChange = (value, setter) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setter(digitsOnly);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      const savedUser = JSON.parse(localStorage.getItem("rakshak_user"));

      if (!savedUser) {
        alert("No account found. Please create account first.");
        return;
      }

      if (
        savedUser.email === email.trim() &&
        savedUser.password === password.trim()
      ) {
        localStorage.setItem("rakshak_logged_in", "true");
        onNavigate("home", { user: savedUser });
      } else {
        alert("Invalid email or password");
      }
      return;
    }

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !address.trim() ||
      contactNumber.length !== 10 ||
      alternateContact1.length !== 10 ||
      alternateContact2.length !== 10
    ) {
      alert("Please fill all fields correctly. Numbers must be exactly 10 digits.");
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      address: address.trim(),
      contactNumber,
      alternateContact1,
      alternateContact2,
    };

    localStorage.setItem("rakshak_user", JSON.stringify(newUser));
    localStorage.setItem("rakshak_logged_in", "true");
    onNavigate("verification", { user: newUser });
  };

  const primaryColor = "#FFB703";
  const bgColor = "#0D0D1A";
  const cardColor = "#161625";
  const textColor = "#F0F0FF";
  const mutedColor = "#8888AA";
  const inputBg = "#1F1F35";
  const inputBorder = "rgba(255, 255, 255, 0.1)";

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: bgColor,
      color: textColor,
      fontFamily: "'DM Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
    },
    wrapper: {
      width: "100%",
      maxWidth: "430px",
      backgroundColor: cardColor,
      borderRadius: "20px",
      padding: "40px 30px",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    logo: {
      fontSize: "48px",
      marginBottom: "10px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      fontFamily: "'Rajdhani', sans-serif",
      color: primaryColor,
      margin: "0 0 5px 0",
    },
    subtitle: {
      color: mutedColor,
      fontSize: "14px",
      margin: "0 0 24px 0",
      textAlign: "center",
    },
    toggleWrap: {
      width: "100%",
      display: "flex",
      backgroundColor: inputBg,
      borderRadius: "10px",
      padding: "4px",
      marginBottom: "22px",
    },
    toggleButton: {
      flex: 1,
      padding: "12px",
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "14px",
    },
    activeToggle: {
      backgroundColor: primaryColor,
      color: "#000",
    },
    inactiveToggle: {
      backgroundColor: "transparent",
      color: mutedColor,
    },
    form: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      maxHeight: "65vh",
      overflowY: "auto",
      paddingRight: "4px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "13px",
      color: mutedColor,
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      backgroundColor: inputBg,
      border: `1px solid ${inputBorder}`,
      borderRadius: "8px",
      padding: "14px",
      color: textColor,
      fontSize: "15px",
      boxSizing: "border-box",
      outline: "none",
    },
    helper: {
      fontSize: "12px",
      color: mutedColor,
      marginTop: "-4px",
    },
    submitBtn: {
      width: "100%",
      backgroundColor: primaryColor,
      color: "#000",
      border: "none",
      borderRadius: "8px",
      padding: "16px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "10px",
      boxShadow: `0 4px 15px ${primaryColor}40`,
    },
    toggleText: {
      color: mutedColor,
      fontSize: "14px",
      marginTop: "25px",
      textAlign: "center",
    },
    toggleLink: {
      color: primaryColor,
      cursor: "pointer",
      fontWeight: "bold",
      marginLeft: "5px",
    },
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Rajdhani:wght@500;600;700&display=swap');
          body { margin: 0; background-color: #0D0D1A; }
          * { box-sizing: border-box; }
        `}
      </style>

      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.logo}>🛡️</div>
          <h1 style={styles.title}>RAKSHAKPATH</h1>
          <p style={styles.subtitle}>Guarded Routes for Every Woman</p>

          <div style={styles.toggleWrap}>
            <button
              type="button"
              style={{
                ...styles.toggleButton,
                ...(isLogin ? styles.activeToggle : styles.inactiveToggle),
              }}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              type="button"
              style={{
                ...styles.toggleButton,
                ...(!isLogin ? styles.activeToggle : styles.inactiveToggle),
              }}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form style={styles.form} onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g. Aditi Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Address</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Your Contact Number</label>
                  <input
                    style={styles.input}
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={contactNumber}
                    onChange={(e) =>
                      handleNumberChange(e.target.value, setContactNumber)
                    }
                  />
                  <span style={styles.helper}>Only 10 digits allowed</span>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Alternate Contact 1</label>
                  <input
                    style={styles.input}
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={alternateContact1}
                    onChange={(e) =>
                      handleNumberChange(e.target.value, setAlternateContact1)
                    }
                  />
                  <span style={styles.helper}>Only 10 digits allowed</span>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Alternate Contact 2</label>
                  <input
                    style={styles.input}
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={alternateContact2}
                    onChange={(e) =>
                      handleNumberChange(e.target.value, setAlternateContact2)
                    }
                  />
                  <span style={styles.helper}>Only 10 digits allowed</span>
                </div>
              </>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" style={styles.submitBtn}>
              {isLogin ? "Log In" : "Create Account"}
            </button>
          </form>

          <div style={styles.toggleText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span
              style={styles.toggleLink}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthScreen;