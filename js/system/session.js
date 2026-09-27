// js/system/session.js
// Which entry each section was last showing. Reopening a section from the
// launcher returns there, the way it did before the app had URLs.
// It lives apart from the content app so the launcher can read it without
// importing (and therefore eagerly loading) the whole content app.

export const lastEntry = {};
