let styleBuffer = "";
let jsBuffer = "";
const fullTextStorage = {};

export function writeCssChar(el, chars, style) {
  let fullText = fullTextStorage[el.id];
  if (!fullText) fullText = fullTextStorage[el.id] = el.innerHTML;

  fullText += chars;
  el.innerHTML = fullTextStorage[el.id] = fullText;

  styleBuffer += chars;
  if (chars.includes("}")) {
    style.textContent += styleBuffer;
    styleBuffer = "";
  }
}

export function writeJsChar(el, char) {
  let fullText = fullTextStorage[el.id];
  if (!fullText) fullText = fullTextStorage[el.id] = el.innerHTML;

  fullText += char;
  el.innerHTML = fullTextStorage[el.id] = fullText;

  jsBuffer += char;
}

export function flushJsScript(overrideScript = null) {
  const newScript = document.createElement("script");
  newScript.textContent = overrideScript || jsBuffer;

  if (!overrideScript) jsBuffer = "";
  document.getElementsByTagName("body")[0].appendChild(newScript);
}
