function html (tagName, attributes, ...childNodes) {
  const el = document.createElement(tagName);
  if (attributes) {
    for (const [prop, value] of Object.entries(attributes)) {
      if (prop === 'style' && (Array.isArray(value) || value instanceof Map)) {
        for (const declaration of value) {
          el.style.setProperty(...declaration);
        }
      }
      else {
        el.setAttribute(prop, value);
      }
    }
  }
  if (childNodes) {
    for (let node of childNodes) {
      if (typeof node === 'string') {
        node = document.createTextNode(node);
      }
      el.appendChild(node);
    }
  }
  return el;
}
