import "classlist-polyfill";
import hljs from "highlightjs";
import headerHTML from "raw-loader!./header.html";
import { getPrefix } from "./lib/getPrefix";
import { flushJsScript, writeCssChar, writeJsChar } from "./lib/writeChar";

let styleText = [...Array(9).keys()].map(
  (i) => require("raw-loader!./src/css/styles" + i + ".css").default
);
const jsText = [0, 1].map(
  (i) => require("raw-loader!./src/js/fizz" + i + ".js").default
);
const idrisText = require("raw-loader!./src/js/fizz.idr").default;

const speed = 20;
let style, styleEl, jsEl, pauseEl;
let animationSkipped = false,
  done = false,
  paused = false;

const renderIcons = () => feather.replace({ width: "24px", height: "24px" });

const executeInitialSetup = () => {
  correctBrowserPrefix();
  populateHeader();
  getElements();
  renderIcons();
  createEventHandlers();
  startAnimation();
};

const waitForInput = () => {
  const input = document.getElementById("o̵̡̤͆̌c̸̳͔͒͌̕̕e̵̟̭̓̆ă̴̺̜ṋ̵̢̛̗̬͋̀͝ṵ̸̓̂s̴͖̩̰͐̒͝");
  input.focus();
  return new Promise((resolve) => {
    input.addEventListener("input", resolve);
  });
};

document.addEventListener("DOMContentLoaded", executeInitialSetup);

async function startAnimation() {
  try {
    await writeTo(styleEl, styleText[0], 0, speed, 1);
    await writeTo(jsEl, idrisText, 0, speed, 1, "idris");
    hljs.highlightBlock(jsEl);

    // Run the glitch setup at full speed
    await writeTo(styleEl, styleText[1], 0, 0, 8);
    await writeTo(styleEl, styleText[2], 0, speed, 1);
    // Run the glitch HTML setup at full speed
    await writeTo(styleEl, styleText[3], 0, 0, 5);

    // Give time for the keyframes to properly paint
    await sleep(3000);
    await writeTo(styleEl, styleText[4], 0, speed, 1);
    await sleep(1000);

    clearJsElement();

    await Promise.all([
      writeTo(jsEl, jsText[0], 0, speed, 1, "js"),
      writeTo(styleEl, styleText[5], 0, speed, 2),
    ]);
    hljs.highlightBlock(jsEl);

    await sleep(2000);

    await Promise.all([
      writeTo(jsEl, jsText[1], 0, speed, 1, "js"),
      writeTo(styleEl, styleText[6], 0, speed, 1),
    ]);

    flushJsScript();

    hljs.highlightBlock(jsEl);

    // Wait for user to input something
    await waitForInput();

    flushJsScript();

    await writeTo(styleEl, styleText[7], 0, speed, 1);
    hljs.highlightBlock(styleEl);

    await sleep(15000);
    await writeTo(styleEl, styleText[8], 0, speed, 1);
    hljs.highlightBlock(styleEl);
  } catch (e) {
    if (e.message === "SKIP IT") {
      skipToEnd();
    } else {
      throw e;
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const clearJsElement = () => {
  jsEl.innerHTML = "";
  jsEl.className = "";
};

async function skipToEnd() {
  if (done) return;

  done = true;
  let txt = styleText.join("\n");
  const mergedJsText = jsText.join("\n");

  style.textContent += txt;

  let styleHTML = "";
  for (let i = 0; i < txt.length; i++) {
    styleHTML += txt[i];
  }

  styleEl.innerHTML = styleHTML;
  jsEl.textContent = mergedJsText;
  flushJsScript(mergedJsText);

  let input = document.getElementById("o̵̡̤͆̌c̸̳͔͒͌̕̕e̵̟̭̓̆ă̴̺̜ṋ̵̢̛̗̬͋̀͝ṵ̸̓̂s̴͖̩̰͐̒͝");
  if (!input) {
    const content = document.getElementById("js-text");
    input = document.createElement("input");
    input.id = "o̵̡̤͆̌c̸̳͔͒͌̕̕e̵̟̭̓̆ă̴̺̜ṋ̵̢̛̗̬͋̀͝ṵ̸̓̂s̴͖̩̰͐̒͝";
    content.after(input);
  }
  hljs.highlightBlock(styleEl);
  hljs.highlightBlock(jsEl);
  input.focus();

  // TODO: Why do we need this?
  const start = Date.now();
  while (Date.now() - 1000 > start) {
    styleEl.scrollTop = jsEl.scrollTop = Infinity;
    await sleep(16);
  }
}

const END_OF_SENTENCE = /[\.\?\!]\s$/;
const COMMA = /\D[\,]\s$/;
const END_OF_BLOCK = /[^\/]\n\n$/;

async function writeTo(
  element,
  message,
  index,
  interval,
  charsPerInterval,
  mode = "css"
) {
  if (animationSkipped) {
    throw new Error("SKIP IT");
  }
  // Write a character or multiple characters to the buffer.
  let chars = message.slice(index, index + charsPerInterval);
  index += charsPerInterval;

  // Ensure we stay scrolled to the bottom.
  element.scrollTop = element.scrollHeight;

  if (mode === "js") {
    writeJsChar(element, chars);
  } else if (mode === "css") {
    writeCssChar(element, chars, style);
  } else {
    element.innerHTML += chars;
  }

  // Schedule another write.
  if (index < message.length) {
    let thisInterval = interval;
    let thisSlice = message.slice(index - 2, index + 1);

    // Add pauses after punctuation
    if (COMMA.test(thisSlice)) thisInterval = interval * 30;
    if (END_OF_BLOCK.test(thisSlice)) thisInterval = interval * 50;
    if (END_OF_SENTENCE.test(thisSlice)) thisInterval = interval * 70;

    do {
      await sleep(thisInterval);
    } while (paused);

    return writeTo(element, message, index, interval, charsPerInterval, mode);
  }
}

function correctBrowserPrefix() {
  styleText = styleText.map((text) => {
    return text.replace(/-webkit-/g, getPrefix);
  });
}

function getElements() {
  style = document.getElementById("style-tag");
  styleEl = document.getElementById("style-text");
  jsEl = document.getElementById("js-text");
  pauseEl = document.getElementById("pause-resume");
}

function populateHeader() {
  let header = document.getElementById("header");
  header.innerHTML = headerHTML;
}

function createEventHandlers() {
  styleEl.addEventListener("input", function () {
    style.textContent = styleEl.textContent;
  });

  // Skip anim on click to skipAnimation
  document.getElementById("skip-animation").addEventListener("click", (e) => {
    e.preventDefault();
    animationSkipped = true;
  });

  pauseEl.addEventListener("click", function (e) {
    e.preventDefault();
    if (paused) {
      pauseEl.innerHTML = '<i data-feather="pause"></i>';
      paused = false;
    } else {
      pauseEl.innerHTML = '<i data-feather="play"></i>';
      paused = true;
    }
    renderIcons();
  });
}
