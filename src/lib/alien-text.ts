/**
 * Alien Text Generator Library
 * Transforms regular text into various alien-style text formats
 * using Unicode characters and special symbols
 */

// Unicode character sets for different alien styles
const alienStyles = {
  // Zalgo-style (creepy/glitchy)
  zalgo: {
    name: 'Zalgo',
    combiningMarks: [
      '\u0300',
      '\u0301',
      '\u0302',
      '\u0303',
      '\u0304',
      '\u0305',
      '\u0306',
      '\u0307',
      '\u0308',
      '\u0309',
      '\u030A',
      '\u030B',
      '\u030C',
      '\u030D',
      '\u030E',
      '\u030F',
      '\u0310',
      '\u0311',
      '\u0312',
      '\u0313',
      '\u0314',
      '\u0315',
      '\u031A',
      '\u031B',
      '\u033D',
      '\u033E',
      '\u033F',
      '\u0340',
      '\u0341',
      '\u0342',
      '\u0343',
      '\u0344',
      '\u0345',
      '\u0346',
      '\u0347',
      '\u0348',
      '\u0349',
      '\u034A',
      '\u034B',
      '\u034C',
      '\u034D',
      '\u034E',
    ],
  },
  // Alien symbols (mixed Unicode)
  symbols: {
    name: 'Alien Symbols',
    map: {
      a: '\u00e5',
      b: '\u0253',
      c: '\u00e7',
      d: '\u0257',
      e: '\u0113',
      f: '\u0192',
      g: '\u011f',
      h: '\u0125',
      i: '\u00ed',
      j: '\u0135',
      k: '\u0137',
      l: '\u013c',
      m: '\u0271',
      n: '\u00f1',
      o: '\u00f8',
      p: '\u03c1',
      q: '\u01eb',
      r: '\u0159',
      s: '\u015f',
      t: '\u0167',
      u: '\u00fc',
      v: '\u1e7d',
      w: '\u0175',
      x: '\u00d7',
      y: '\u00fd',
      z: '\u017e',
      A: '\u00c5',
      B: '\u0181',
      C: '\u00c7',
      D: '\u0189',
      E: '\u0112',
      F: '\u0191',
      G: '\u011e',
      H: '\u0124',
      I: '\u00cd',
      J: '\u0134',
      K: '\u0136',
      L: '\u013b',
      M: '\u019c',
      N: '\u00d1',
      O: '\u00d8',
      P: '\u03a1',
      Q: '\u01ea',
      R: '\u0158',
      S: '\u015e',
      T: '\u0166',
      U: '\u00dc',
      V: '\u1e7c',
      W: '\u0174',
      X: '\u00d7',
      Y: '\u00dd',
      Z: '\u017d',
    },
  },
  // Circle text
  circle: {
    name: 'Circle Text',
    map: {
      a: '\u24d0',
      b: '\u24d1',
      c: '\u24d2',
      d: '\u24d3',
      e: '\u24d4',
      f: '\u24d5',
      g: '\u24d6',
      h: '\u24d7',
      i: '\u24d8',
      j: '\u24d9',
      k: '\u24da',
      l: '\u24db',
      m: '\u24dc',
      n: '\u24dd',
      o: '\u24de',
      p: '\u24df',
      q: '\u24e0',
      r: '\u24e1',
      s: '\u24e2',
      t: '\u24e3',
      u: '\u24e4',
      v: '\u24e5',
      w: '\u24e6',
      x: '\u24e7',
      y: '\u24e8',
      z: '\u24e9',
      A: '\u24b6',
      B: '\u24b7',
      C: '\u24b8',
      D: '\u24b9',
      E: '\u24ba',
      F: '\u24bb',
      G: '\u24bc',
      H: '\u24bd',
      I: '\u24be',
      J: '\u24bf',
      K: '\u24c0',
      L: '\u24c1',
      M: '\u24c2',
      N: '\u24c3',
      O: '\u24c4',
      P: '\u24c5',
      Q: '\u24c6',
      R: '\u24c7',
      S: '\u24c8',
      T: '\u24c9',
      U: '\u24ca',
      V: '\u24cb',
      W: '\u24cc',
      X: '\u24cd',
      Y: '\u24ce',
      Z: '\u24cf',
      '0': '\u24ea',
      '1': '\u2460',
      '2': '\u2461',
      '3': '\u2462',
      '4': '\u2463',
      '5': '\u2464',
      '6': '\u2465',
      '7': '\u2466',
      '8': '\u2467',
      '9': '\u2468',
    },
  },
  // Square text
  square: {
    name: 'Square Text',
    map: {
      a: '\ud83c\udd70',
      b: '\ud83c\udd71',
      c: '\ud83c\udd72',
      d: '\ud83c\udd73',
      e: '\ud83c\udd74',
      f: '\ud83c\udd75',
      g: '\ud83c\udd76',
      h: '\ud83c\udd77',
      i: '\ud83c\udd78',
      j: '\ud83c\udd79',
      k: '\ud83c\udd7a',
      l: '\ud83c\udd7b',
      m: '\ud83c\udd7c',
      n: '\ud83c\udd7d',
      o: '\ud83c\udd7e',
      p: '\ud83c\udd7f',
      q: '\ud83c\udd80',
      r: '\ud83c\udd81',
      s: '\ud83c\udd82',
      t: '\ud83c\udd83',
      u: '\ud83c\udd84',
      v: '\ud83c\udd85',
      w: '\ud83c\udd86',
      x: '\ud83c\udd87',
      y: '\ud83c\udd88',
      z: '\ud83c\udd89',
      A: '\ud83c\udd70',
      B: '\ud83c\udd71',
      C: '\ud83c\udd72',
      D: '\ud83c\udd73',
      E: '\ud83c\udd74',
      F: '\ud83c\udd75',
      G: '\ud83c\udd76',
      H: '\ud83c\udd77',
      I: '\ud83c\udd78',
      J: '\ud83c\udd79',
      K: '\ud83c\udd7a',
      L: '\ud83c\udd7b',
      M: '\ud83c\udd7c',
      N: '\ud83c\udd7d',
      O: '\ud83c\udd7e',
      P: '\ud83c\udd7f',
      Q: '\ud83c\udd80',
      R: '\ud83c\udd81',
      S: '\ud83c\udd82',
      T: '\ud83c\udd83',
      U: '\ud83c\udd84',
      V: '\ud83c\udd85',
      W: '\ud83c\udd86',
      X: '\ud83c\udd87',
      Y: '\ud83c\udd88',
      Z: '\ud83c\udd89',
    },
  },
  // Futuristic/Greek
  futuristic: {
    name: 'Futuristic',
    map: {
      a: '\u03b1',
      b: '\u03b2',
      c: '\u00e7',
      d: '\u03b4',
      e: '\u03b5',
      f: '\u0192',
      g: '\u03b3',
      h: '\u0266',
      i: '\u03b9',
      j: '\u029d',
      k: '\u043a',
      l: '\u03bb',
      m: '\u043c',
      n: '\u03b7',
      o: '\u03c3',
      p: '\u03c1',
      q: '\u0566',
      r: '\u0433',
      s: '\u0455',
      t: '\u0442',
      u: '\u03c5',
      v: '\u03bd',
      w: '\u03c9',
      x: '\u03c7',
      y: '\u03b3',
      z: '\u0579',
      A: '\u0391',
      B: '\u0392',
      C: '\u00c7',
      D: '\u0394',
      E: '\u0395',
      F: '\u0191',
      G: '\u0393',
      H: '\u0397',
      I: '\u0399',
      J: '\u0408',
      K: '\u041a',
      L: '\u039b',
      M: '\u039c',
      N: '\u039d',
      O: '\u039f',
      P: '\u03a1',
      Q: '\u051a',
      R: '\u0413',
      S: '\u0405',
      T: '\u03a4',
      U: '\u03a5',
      V: '\u03bd',
      W: '\u03a9',
      X: '\u03a7',
      Y: '\u03a5',
      Z: '\u0396',
    },
  },
  // Cursive/Italic
  cursive: {
    name: 'Cursive',
    map: {
      a: '\ud835\udc82',
      b: '\ud835\udc83',
      c: '\ud835\udc84',
      d: '\ud835\udc85',
      e: '\ud835\udc86',
      f: '\ud835\udc87',
      g: '\ud835\udc88',
      h: '\ud835\udc89',
      i: '\ud835\udc8a',
      j: '\ud835\udc8b',
      k: '\ud835\udc8c',
      l: '\ud835\udc8d',
      m: '\ud835\udc8e',
      n: '\ud835\udc8f',
      o: '\ud835\udc90',
      p: '\ud835\udc91',
      q: '\ud835\udc92',
      r: '\ud835\udc93',
      s: '\ud835\udc94',
      t: '\ud835\udc95',
      u: '\ud835\udc96',
      v: '\ud835\udc97',
      w: '\ud835\udc98',
      x: '\ud835\udc99',
      y: '\ud835\udc9a',
      z: '\ud835\udc9b',
      A: '\ud835\udc68',
      B: '\ud835\udc69',
      C: '\ud835\udc6a',
      D: '\ud835\udc6b',
      E: '\ud835\udc6c',
      F: '\ud835\udc6d',
      G: '\ud835\udc6e',
      H: '\ud835\udc6f',
      I: '\ud835\udc70',
      J: '\ud835\udc71',
      K: '\ud835\udc72',
      L: '\ud835\udc73',
      M: '\ud835\udc74',
      N: '\ud835\udc75',
      O: '\ud835\udc76',
      P: '\ud835\udc77',
      Q: '\ud835\udc78',
      R: '\ud835\udc79',
      S: '\ud835\udc7a',
      T: '\ud835\udc7b',
      U: '\ud835\udc7c',
      V: '\ud835\udc7d',
      W: '\ud835\udc7e',
      X: '\ud835\udc7f',
      Y: '\ud835\udc80',
      Z: '\ud835\udc81',
    },
  },
};

export type AlienStyle = keyof typeof alienStyles;

/**
 * Convert text to Zalgo style (creepy/glitchy)
 */
function toZalgo(text: string, intensity = 3): string {
  const marks = alienStyles.zalgo.combiningMarks;
  return text
    .split('')
    .map((char) => {
      if (char.match(/[a-zA-Z]/)) {
        const randomMarks = Array.from(
          { length: intensity },
          () => marks[Math.floor(Math.random() * marks.length)]
        ).join('');
        return char + randomMarks;
      }
      return char;
    })
    .join('');
}

/**
 * Convert text using a character map
 */
function convertWithMap(text: string, map: Record<string, string>): string {
  return text
    .split('')
    .map((char) => map[char] || char)
    .join('');
}

/**
 * Main function to convert text to alien style
 */
export function convertToAlienText(
  text: string,
  style: AlienStyle = 'symbols'
): string {
  if (!text) return '';

  switch (style) {
    case 'zalgo':
      return toZalgo(text);
    case 'symbols':
      return convertWithMap(text, alienStyles.symbols.map);
    case 'circle':
      return convertWithMap(text, alienStyles.circle.map);
    case 'square':
      return convertWithMap(text, alienStyles.square.map);
    case 'futuristic':
      return convertWithMap(text, alienStyles.futuristic.map);
    case 'cursive':
      return convertWithMap(text, alienStyles.cursive.map);
    default:
      return text;
  }
}

/**
 * Get all available alien styles
 */
export function getAlienStyles() {
  return Object.keys(alienStyles).map((key) => ({
    value: key as AlienStyle,
    name: alienStyles[key as AlienStyle].name,
  }));
}

/**
 * Get a preview of each style
 */
export function getStylePreview(sampleText = 'Hello World'): Array<{
  style: AlienStyle;
  name: string;
  preview: string;
}> {
  return getAlienStyles().map(({ value, name }) => ({
    style: value,
    name,
    preview: convertToAlienText(sampleText, value),
  }));
}
