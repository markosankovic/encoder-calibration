import React from 'react';

function Footer() {
  return (
    <div>
      Running Node.js {process.versions.node}, Chrome {process.versions.chrome}, and Electron {process.versions.electron}.
    </div>
  );
}

export default Footer;
