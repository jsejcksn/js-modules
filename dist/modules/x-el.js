'use strict';

const xEl = {
  gen (tagName, attributes, ...childNodes) {
    const el = document.createElement(tagName);
    if (attributes) {
      for (const [prop, value] of Object.entries(attributes)) {
        if (prop === 'style' && (Array.isArray(value) || value instanceof Map)) {
          this.style(el, value);
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
  },
  
  get input () {
    return {
      gen: this.gen,
      style: this.style,
      
      getCharacterWidth (el) {
        const styles = getComputedStyle(el);
        const borders = parseFloat(styles.getPropertyValue('border-width')) * 2;
        const paddingLeft = parseFloat(styles.getPropertyValue('padding-left'));
        const paddingRight = parseFloat(styles.getPropertyValue('padding-right'));
        const padding = paddingLeft + paddingRight;
        const textContent = 'hello world';
        const charCount = textContent.length;
        const span = this.gen('span', {style: styles.cssText}, textContent);
        this.style(span, [
          ['width', ''],
          ['opacity', '0'],
          ['position', 'absolute'],
          ['top', '0'],
          ['left', '0'],
        ]);
        document.body.appendChild(span);
        const width = span.getBoundingClientRect().width;
        span.remove();
        return (width - borders - padding) / charCount;
      },

      parse (el) {
        const input = el.value;
        let type;
        let value;
        if (input === 'true') {
          type = 'boolean';
          value = true;
        }
        else if (input === 'false') {
          type = 'boolean';
          value = false;
        }
        else if (input === 'null') {
          type = 'null';
          value = null;
        }
        else if (input === input.trim() && input.trim() !== '' && Number(input) === Number(input)) {
          type = 'number';
          value = Number(input);
        }
        else {
          type = 'string';
          value = input.trim();
        }
        el.dataset.type = type;
        el.dataset.value = `${value}`;
        return value;
      },

      resizeMonospace (el, elBorder = 0, ...elPadding) {
        const styles = getComputedStyle(el);
        const borders = parseFloat(styles.getPropertyValue('border-width')) * 2;
        const paddingLeft = parseFloat(styles.getPropertyValue('padding-left'));
        const paddingRight = parseFloat(styles.getPropertyValue('padding-right'));
        const padding = paddingLeft + paddingRight;
        const charCount = el.value.length ? el.value.length : el.placeholder.length;
        let adjustments = elBorder;
        for (const side of elPadding) {
          adjustments += side;
        }
        const width = (this.getCharacterWidth(el) * charCount) + padding + borders + adjustments;
        this.style(el, [
          ['width', `${width}px`],
        ]);
      },
    };
  },

  style (el, declarations, clearExisting) {
    if (clearExisting) {
      el.style = '';
    }
    for (const declaration of declarations) {
      el.style.setProperty(...declaration);
    }
  },
};

export default xEl;
