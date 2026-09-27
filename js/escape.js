// js/escape.js
// This was duplicated verbatim in whoami.js and content-app.js.
// It covers the five characters that matter, which is enough for text and for
// quoted attributes, the only two contexts it is used in.

const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => MAP[char]);
}
