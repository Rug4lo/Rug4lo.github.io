// js/system/dom.js
// The one helper that builds an element. Anything painted through here sets its
// text with textContent, which cannot be talked into running markup, and keeps
// innerHTML out of the modules that render live data.

export const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
