const xStyleSheet = {
  gen (rules, parentEl = document.head) {
    const style = parentEl.appendChild(document.createElement('style'));
    // style.classList.add('js-styles');
    for (const [selector, declarations] of rules) {
      const index = style.sheet.insertRule(`${selector} {}`, style.sheet.cssRules.length);
      for (const declaration of declarations) {
        style.sheet.cssRules[index].style.setProperty(...declaration);
      }
    }
    return style.sheet;
  },
};
