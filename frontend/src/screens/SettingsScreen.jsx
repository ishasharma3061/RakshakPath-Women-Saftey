import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  { code: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
];

const SettingsScreen = ({ onNavigate, user, language, setLanguage }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [activeSection, setActiveSection] = useState("language");
  const [selectedLang, setSelectedLang] = useState(language || "en");

  const handleLangSave = () => {
    setLanguage(selectedLang);
    localStorage.setItem("rakshak_language", selectedLang);
    showToast("Language updated!");
  };

  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const t = isDark ? tokens.dark : tokens.light;

  const sections = [
    { id: "language", label: "Language", icon: "🌐", desc: "Regional" },
    { id: "account", label: "Account", icon: "👤", desc: "Profile & Security" },
  ];

  return (
    <div style={{ ...styles.page, background: t.pageBg, color: t.text }}>
      {/* Toast */}
      {toast && (
        <div style={{ ...styles.toast, background: t.toastBg }}>
          ✅ {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ ...styles.header, borderBottom: `1px solid ${t.border}`, background: t.headerBg }}>
        <span style={{ fontSize: 28 }}>⚙️</span>
        <div>
          <h1 style={{ ...styles.headerTitle, color: t.primary }}>Settings</h1>
          <p style={{ ...styles.headerSub, color: t.muted }}>Customize your RakshakPath experience</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Left Tab Nav */}
        <nav style={{ ...styles.tabs, background: t.cardBg, border: `1px solid ${t.border}` }}>
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  ...styles.tabBtn,
                  background: isActive ? t.tabActiveBg : "transparent",
                  borderLeft: isActive ? `3px solid ${t.primary}` : "3px solid transparent",
                  color: isActive ? t.primary : t.muted,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = t.hoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: 22 }}>{sec.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: "bold", fontSize: 14 }}>{sec.label}</div>
                  <div style={{ fontSize: 11, color: t.muted }}>{sec.desc}</div>
                </div>
                {isActive && <span style={{ marginLeft: "auto", color: t.primary }}>›</span>}
              </button>
            );
          })}
        </nav>

        {/* Right Content */}
        <div style={{ flex: 1 }}>



          {/* ── LANGUAGE SECTION ── */}
          {activeSection === "language" && (
            <div style={{ ...styles.card, background: t.cardBg, border: `1px solid ${t.border}` }}>
              <SectionTitle icon="🌐" title="Language" subtitle="Select your preferred language" t={t} />

              <div style={styles.langGrid}>
                {LANGUAGES.map((lang) => {
                  const chosen = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLang(lang.code)}
                      style={{
                        ...styles.langCard,
                        background: chosen ? `${t.primary}18` : t.fieldBg,
                        border: chosen ? `2px solid ${t.primary}` : `1px solid ${t.border}`,
                        color: t.text,
                        boxShadow: chosen ? `0 0 16px ${t.primary}33` : "none",
                      }}
                    >
                      <span style={{ fontSize: 26 }}>{lang.flag}</span>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: "bold", fontSize: 14, color: chosen ? t.primary : t.text }}>
                          {lang.label}
                        </div>
                        <div style={{ fontSize: 12, color: t.muted }}>{lang.native}</div>
                      </div>
                      {chosen && (
                        <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: t.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#000", fontWeight: "bold" }}>
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleLangSave}
                style={{ ...styles.saveBtn, background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`, color: "#000" }}
              >
                💾 Save Language Preference
              </button>

              <InfoBox t={t} text="Language changes affect all UI text including navigation, alerts, and system messages." />
            </div>
          )}

          {/* ── ACCOUNT SECTION ── */}
          {activeSection === "account" && (
            <div style={{ ...styles.card, background: t.cardBg, border: `1px solid ${t.border}` }}>
              <SectionTitle icon="👤" title="Account" subtitle="Your identity & security settings" t={t} />

              {/* User Info */}
              <div style={{ ...styles.accountCard, background: t.fieldBg, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    ) : "👤"}
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 18, color: t.text }}>{user?.name || "User"}</div>
                    <div style={{ fontSize: 13, color: t.muted }}>{user?.email || "No email"}</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      <span style={{ background: `${t.primary}22`, color: t.primary, padding: "2px 8px", borderRadius: 10, fontWeight: "bold" }}>
                        Trust Level 4
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                <AccountRow
                  icon="✏️" label="Edit Profile" desc="Update name, address & contacts"
                  t={t} onClick={() => onNavigate("profile")}
                  color={t.primary}
                />
                <AccountRow
                  icon="🔐" label="Security & Privacy" desc="Manage account permissions"
                  t={t} onClick={() => showToast("Coming soon!")}
                  color="#4C9EFF"
                />
                <AccountRow
                  icon="📱" label="Linked Devices" desc="Manage trusted devices"
                  t={t} onClick={() => showToast("Coming soon!")}
                  color="#2DC653"
                />
                <AccountRow
                  icon="🔔" label="Notifications" desc="Alert & sound preferences"
                  t={t} onClick={() => showToast("Coming soon!")}
                  color="#9B59B6"
                />
              </div>

              <div style={{ borderTop: `1px solid ${t.border}`, marginTop: 16, paddingTop: 16 }}>
                <button
                  onClick={() => onNavigate("auth", { logout: true })}
                  style={{ ...styles.dangerBtn, borderColor: "#E63946", color: "#E63946" }}
                >
                  🚪 Logout from RakshakPath
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ── Small reusable components ── */
const SectionTitle = ({ icon, title, subtitle, t }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <h2 style={{ margin: 0, fontSize: 22, color: t.text, fontFamily: "'Rajdhani', sans-serif" }}>{title}</h2>
        <p style={{ margin: 0, fontSize: 13, color: t.muted }}>{subtitle}</p>
      </div>
    </div>
  </div>
);

const InfoBox = ({ t, text }) => (
  <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 12, background: `${t.primary}11`, border: `1px solid ${t.primary}33`, fontSize: 13, color: t.muted, display: "flex", gap: 8, alignItems: "flex-start" }}>
    <span>💡</span>
    <span>{text}</span>
  </div>
);

const AccountRow = ({ icon, label, desc, t, onClick, color }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 16px", borderRadius: 14,
      background: t.fieldBg, border: `1px solid ${t.border}`,
      cursor: "pointer", width: "100%", textAlign: "left",
      transition: "all 0.2s ease",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}11`; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.fieldBg; }}
  >
    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: "bold", fontSize: 14, color: t.text }}>{label}</div>
      <div style={{ fontSize: 12, color: t.muted }}>{desc}</div>
    </div>
    <span style={{ color: t.muted, fontSize: 18 }}>›</span>
  </button>
);

/* ── Theme token maps ── */
const tokens = {
  dark: {
    pageBg: "#080812",
    text: "#F0F0FF",
    muted: "#8888AA",
    primary: "#FFB703",
    primaryDark: "#E6A502",
    cardBg: "rgba(22,22,37,0.9)",
    fieldBg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    headerBg: "rgba(8,8,18,0.95)",
    tabActiveBg: "rgba(255,183,3,0.1)",
    hoverBg: "rgba(255,255,255,0.04)",
    toastBg: "#1F1F35",
  },
  light: {
    pageBg: "#F5F0E8",
    text: "#1C1008",
    muted: "#5C4A2A",
    primary: "#B45309",
    primaryDark: "#92400E",
    cardBg: "rgba(255, 250, 240, 0.96)",
    fieldBg: "rgba(255, 248, 230, 0.85)",
    border: "rgba(120, 80, 20, 0.15)",
    headerBg: "rgba(255, 248, 232, 0.97)",
    tabActiveBg: "rgba(180, 83, 9, 0.1)",
    hoverBg: "rgba(255, 245, 220, 0.7)",
    toastBg: "#2D1A08",
  },
};

/* ── Static styles ── */
const styles = {
  page: {
    minHeight: "100vh",
    overflowY: "auto",
    fontFamily: "'Outfit', sans-serif",
    transition: "background 0.3s ease, color 0.3s ease",
  },
  header: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "24px 28px",
    backdropFilter: "blur(20px)",
    position: "sticky", top: 0, zIndex: 100,
  },
  headerTitle: {
    margin: 0, fontSize: 26, fontFamily: "'Rajdhani', sans-serif", fontWeight: "bold",
  },
  headerSub: { margin: 0, fontSize: 13 },
  layout: {
    display: "flex", gap: 20, padding: "24px 28px",
    alignItems: "flex-start",
  },
  tabs: {
    width: 210, borderRadius: 16, padding: 8, flexShrink: 0,
    display: "flex", flexDirection: "column", gap: 4,
    position: "sticky", top: 90,
  },
  tabBtn: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 14px", borderRadius: 12,
    border: "none", cursor: "pointer",
    textAlign: "left", width: "100%",
    transition: "all 0.2s ease",
  },
  card: {
    borderRadius: 20, padding: "28px 24px",
    backdropFilter: "blur(20px)",
    animation: "fadeIn 0.3s ease",
  },
  themeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  themeCard: {
    borderRadius: 16, overflow: "hidden", cursor: "pointer",
    textAlign: "left", transition: "all 0.25s ease",
    border: "none",
  },
  themePreview: {
    height: 90, display: "flex", flexDirection: "column",
    alignItems: "flex-start", justifyContent: "center", padding: "0 16px",
    borderRadius: "16px 16px 0 0",
  },
  langGrid: { display: "flex", flexDirection: "column", gap: 10 },
  langCard: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "14px 18px", borderRadius: 14,
    cursor: "pointer", transition: "all 0.2s ease",
    border: "none",
  },
  saveBtn: {
    marginTop: 20, padding: "14px 24px", borderRadius: 14,
    fontWeight: "bold", fontSize: 15, cursor: "pointer",
    border: "none", width: "100%",
    transition: "all 0.2s ease",
    fontFamily: "'Outfit', sans-serif",
  },
  accountCard: {
    padding: "18px", borderRadius: 16, marginBottom: 16,
  },
  dangerBtn: {
    width: "100%", padding: "14px", borderRadius: 14,
    background: "transparent", fontWeight: "bold",
    fontSize: 15, cursor: "pointer", border: "1.5px solid",
    fontFamily: "'Outfit', sans-serif",
    transition: "all 0.2s ease",
  },
  toast: {
    position: "fixed", bottom: 30, left: "50%",
    transform: "translateX(-50%)",
    color: "#F0F0FF", padding: "12px 24px",
    borderRadius: 30, fontWeight: "bold", fontSize: 14,
    zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    animation: "fadeIn 0.3s ease",
  },
};

export default SettingsScreen;
