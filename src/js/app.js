import Promise from "bluebird";
import "classlist-polyfill";
import headerHTML from "raw-loader!../../header.html";
import getPrefix from "../../lib/getPrefix";
import {
  handleChar,
  writeChar,
  writeJsChar,
  writeSimpleChar
} from "../../lib/writeChar";

let styleText = [0, 1, 2].map(
  (i) => require("raw-loader!../css/styles" + i + ".css").default
);
const jsText = [0, 1, 2].map(
  (i) => require("raw-loader!./fizz" + i + ".js").default
);
const idrisText = require("raw-loader!./fizz.idr").default;

const speed = 0; // TODO: Change this once everything is finished
let style, styleEl, jsEl, pauseEl;
let animationSkipped = false,
  done = false,
  paused = false;

const executeInitialSetup = () => {
  correctBrowserPrefix();
  populateHeader();
  getElements();
  createEventHandlers();
  startAnimation();
};

document.addEventListener("DOMContentLoaded", executeInitialSetup);

async function startAnimation() {
  try {
    await writeTo(styleEl, styleText[0], 0, speed, true, 1);
    await writeTo(jsEl, idrisText, 0, speed, true, 1);
    await writeTo(styleEl, styleText[1], 0, speed, true, 1);

    clearJsElement();

    await writeTo(jsEl, jsText[0], 0, speed, true, 1, true);
    await writeTo(styleEl, styleText[2], 0, speed, true, 1);
    await writeTo(styleEl, styleText[3], 0, speed, true, 1);
  } catch (e) {
    if (e.message === "SKIP IT") {
      skipToEnd();
    } else {
      throw e;
    }
  }
}

const clearJsElement = () => jsEl.innterHTML = "";

// Skips all the animations.
async function skipToEnd() {
  if (done) return;

  done = true;
  let txt = styleText.join("\n");

  style.textContent += txt;
  let styleHTML = "";
  for (let i = 0; i < txt.length; i++) {
    styleHTML = handleChar(styleHTML, txt[i]);
  }
  styleEl.innerHTML = styleHTML;

  // TODO: Why do we need this?
  let start = Date.now();
  while (Date.now() - 1000 > start) {
    styleEl.scrollTop = jsEl.scrollTop = Infinity;
    await Promise.delay(16);
  }
}

const END_OF_SENTENCE = /[\.\?\!]\s$/;
const COMMA = /\D[\,]\s$/;
const END_OF_BLOCK = /[^\/]\n\n$/;

async function writeTo(
  el,
  message,
  index,
  interval,
  mirrorToStyle,
  charsPerInterval,
  isJs = false
) {
  if (animationSkipped) {
    throw new Error("SKIP IT");
  }
  // Write a character or multiple characters to the buffer.
  let chars = message.slice(index, index + charsPerInterval);
  index += charsPerInterval;

  // Ensure we stay scrolled to the bottom.
  el.scrollTop = el.scrollHeight;

  // If this is going to <style> or <script> it's more complex; otherwise, just write.
  if (isJs) {
    writeJsChar(el, chars);
  } else if (mirrorToStyle) {
    writeChar(el, chars, style);
  } else {
    writeSimpleChar(el, chars);
  }

  // Schedule another write.
  if (index < message.length) {
    let thisInterval = interval;
    let thisSlice = message.slice(index - 2, index + 1);
    if (COMMA.test(thisSlice)) thisInterval = interval * 30;
    if (END_OF_BLOCK.test(thisSlice)) thisInterval = interval * 50;
    if (END_OF_SENTENCE.test(thisSlice)) thisInterval = interval * 70;

    do {
      await Promise.delay(thisInterval);
    } while (paused);

    return writeTo(
      el,
      message,
      index,
      interval,
      mirrorToStyle,
      charsPerInterval,
      isJs
    );
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
      pauseEl.textContent = "Pause ||";
      paused = false;
    } else {
      pauseEl.textContent = "Resume >>";
      paused = true;
    }
  });
}
