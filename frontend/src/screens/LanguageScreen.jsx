// import React from "react";

// const LanguageScreen = ({ onNavigate, setLanguage }) => {
//   return (
//     <div className="center">
//       <h2>Select Language</h2>

//       <button onClick={() => {
//         setLanguage("en");
//         onNavigate("auth");
//       }}>English</button>

//       <button onClick={() => {
//         setLanguage("hi");
//         onNavigate("auth");
//       }}>हिंदी</button>
//     </div>
//   );
// };

// export default LanguageScreen;

import React from "react";

const LanguageScreen = ({ onSelect }) => {
  return (
    <div style={{textAlign: "center", marginTop: "100px"}}>
      <h2>Select Language</h2>

      <button onClick={() => onSelect("en")}>English</button>
      <button onClick={() => onSelect("hi")}>हिंदी</button>
    </div>
  );
};

export default LanguageScreen;