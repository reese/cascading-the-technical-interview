let styleBuffer = "";
let jsBuffer = "";
const fullTextStorage = {};

export function writeChar(el, chars, style) {
  // Grab text. We buffer it in storage so we don't have to read from the DOM every iteration.
  let fullText = fullTextStorage[el.id];
  if (!fullText) fullText = fullTextStorage[el.id] = el.innerHTML;

  fullText = handleChar(fullText, chars);
  // But we still write to the DOM every iteration, which can be pretty slow.
  el.innerHTML = fullTextStorage[el.id] = fullText;

  // Buffer writes to the <style> element so we don't have to paint quite so much.
  styleBuffer += chars;
  if (chars.includes("}")) {
    style.textContent += styleBuffer;
    styleBuffer = "";
  }
}

export function writeJsChar(el, char) {
  let fullText = fullTextStorage[el.id];
  if (!fullText) fullText = fullTextStorage[el.id] = el.innerHTML;

  fullText = handleChar(fullText, char);
  el.innerHTML = fullTextStorage[el.id] = fullText;

  jsBuffer += char;
}

export function flushJsScript() {
  const newScript = document.createElement("script");
  newScript.textContent += jsBuffer;
  jsBuffer = "";
  document.getElementsByTagName("body")[0].appendChild(newScript);
}

export function writeSimpleChar(el, char) {
  el.innerHTML += char;
}

let openComment = false;
const commentRegex = /(\/\*(?:[^](?!\/\*))*\*)$/;

export function handleChar(fullText, char) {
  fullText += char;
  return fullText;
}
