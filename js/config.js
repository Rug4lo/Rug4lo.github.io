// js/config.js
const PORTFOLIO_CONFIG = {
  personal: {
    name: "Rug4lo",
    age: 21,         
    role: "Red Team | Cybersecurity Researcher",
    location: "Valladolid, España"
  },
  contact: {
    github: "https://github.com/rug4lo",
    linkedin: "https://linkedin.com/in/rug4lo",
    htb: "https://app.hackthebox.com/profile/rug4lo",
    email: "rug4lo@protonmail.com"
  },
    theme: {
    colors: {
      bg: "#0a0e27",        
      surface: "#1a1f3a", 
      text: "#e0e6ff",      
      textMuted: "#8892b0", 
      accent: "#00eeff",     
      accentDim: "#004d0f", 
      border: "#2d3748",
      danger: "#ff3333"
    },
    fonts: {
      mono: "'JetBrains Mono', monospace",
      sans: "'Inter', sans-serif"
    }
  },
  currentDate: new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
};

function getAge(birthYear) {
  return new Date().getFullYear() - birthYear;
}

PORTFOLIO_CONFIG.personal.age = getAge(2003);
