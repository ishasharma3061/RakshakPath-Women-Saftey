// const [perms, setPerms] = useState({
//   location: false,
//   mic: false,
//   notif: false
// });

// return (
//   <>
//     <button onClick={() => setPerms({...perms, location: true})}>
//       Location {perms.location && "✓"}
//     </button>

//     <button onClick={() => setPerms({...perms, mic: true})}>
//       Mic {perms.mic && "✓"}
//     </button>

//     <button onClick={() => setPerms({...perms, notif: true})}>
//       Notifications {perms.notif && "✓"}
//     </button>

//     <button
//       disabled={!perms.location || !perms.mic || !perms.notif}
//       onClick={onNext}
//     >
//       Continue
//     </button>
//   </>
// );


import React, { useState } from "react";

const PermissionsScreen = ({ onNavigate }) => {
  const [perm, setPerm] = useState({
    loc: false,
    mic: false
  });

  return (
    <div>
      <h2>Permissions</h2>

      <button onClick={() => setPerm({...perm, loc: true})}>
        Location {perm.loc && "✅"}
      </button>

      <button onClick={() => setPerm({...perm, mic: true})}>
        Mic {perm.mic && "✅"}
      </button>

      <button disabled={!perm.loc || !perm.mic}
        onClick={() => onNavigate("home")}>
        Continue
      </button>
    </div>
  );
};

export default PermissionsScreen;