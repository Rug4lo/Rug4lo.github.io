// js/config.js
// Single source of truth for identity and contact details.
// Colours, fonts, radii and durations are NOT here: they live as custom
// properties in css/main.css, which is what the stylesheets actually read.
export const PORTFOLIO_CONFIG = {
  personal: {
    name: "Rug4lo",
    birthYear: 2003,
    // Not rendered anywhere yet; kept because the meta tags use a third wording.
    tagline: "Red Team | Cybersecurity Researcher",
    location: "Valladolid, España"
  },
  contact: {
    github: "https://github.com/Rug4lo",
    linkedin: "https://www.linkedin.com/in/ruben-garcia-lopez-aka-rug4lo-055496279",
    htb: "https://app.hackthebox.com/users/1478590",
    email: "rubengarciavalladolid@gmail.com"
  }
};
