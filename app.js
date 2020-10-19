import Promise from 'bluebird';
import 'classlist-polyfill';
import headerHTML from 'raw-loader!./header.html';
import getPrefix from './lib/getPrefix';
import { handleChar, writeChar, writeJsChar, writeSimpleChar } from './lib/writeChar';
let styleText = [0, 1, 2].map((i) => require('raw-loader!./styles' + i + '.css').default);
let jsText = [0, 1].map((i) => require('raw-loader!./fizz' + i + '.js').default);

// Vars that will help us get er done
const speed = 20; // TODO: Change this once everything is finished
let style, styleEl, jsEl, skipAnimationEl, pauseEl;
let animationSkipped = false, done = false, paused = false;
let browserPrefix;

// Wait for load to get started.
document.addEventListener("DOMContentLoaded", function() {
  getBrowserPrefix();
  populateHeader();
  getElements();
  createEventHandlers();
  startAnimation();
});

async function startAnimation() {
  try {
    await writeTo(styleEl, styleText[0], 0, speed, true, 1);
    // Don't actually execute the first file
    await writeTo(jsEl, jsText[0], 0, speed, false, 1, false);
    await writeTo(jsEl, jsText[1], 0, speed, false, 1, true);
    await writeTo(styleEl, styleText[1], 0, speed, true, 1);
    await Promise.delay(1000);
    await writeTo(styleEl, styleText[2], 0, speed, true, 1);
    await writeTo(styleEl, styleText[3], 0, speed, true, 1);
  }
  catch(e) {
    if (e.message === "SKIP IT") {
      surprisinglyShortAttentionSpan();
    } else {
      throw e;
    }
  }
}

// Skips all the animations.
async function surprisinglyShortAttentionSpan() {
  if (done) return;
  done = true;
  let txt = styleText.join('\n');

  style.textContent += txt;
  let styleHTML = "";
  for(let i = 0; i < txt.length; i++) {
     styleHTML = handleChar(styleHTML, txt[i]);
  }
  styleEl.innerHTML = styleHTML;
  createWorkBox();

  // There's a bit of a scroll problem with this thing
  let start = Date.now();
  while(Date.now() - 1000 > start) {
    styleEl.scrollTop = jsEl.scrollTop = Infinity;
    await Promise.delay(16);
  }
}


/**
 * Helpers
 */

let endOfSentence = /[\.\?\!]\s$/;
let comma = /\D[\,]\s$/;
let endOfBlock = /[^\/]\n\n$/;

async function writeTo(el, message, index, interval, mirrorToStyle, charsPerInterval, isJs = false){
  if (animationSkipped) {
    // Lol who needs proper flow control
    throw new Error('SKIP IT');
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
    if (comma.test(thisSlice)) thisInterval = interval * 30;
    if (endOfBlock.test(thisSlice)) thisInterval = interval * 50;
    if (endOfSentence.test(thisSlice)) thisInterval = interval * 70;

    do {
      await Promise.delay(thisInterval);
    } while(paused);

    return writeTo(el, message, index, interval, mirrorToStyle, charsPerInterval, isJs);
  }
}

//
// Older versions of major browsers (like Android) still use prefixes. So we figure out what that prefix is
// and use it.
//
function getBrowserPrefix() {
  // Ghetto per-browser prefixing
  browserPrefix = getPrefix(); // could be empty string, which is fine
  styleText = styleText.map(function(text) {
    return text.replace(/-webkit-/g, browserPrefix);
  });
}

function getElements() {
  // El refs
  style = document.getElementById('style-tag');
  styleEl = document.getElementById('style-text');
  jsEl = document.getElementById('js-text');
  skipAnimationEl = document.getElementById('skip-animation');
  pauseEl = document.getElementById('pause-resume');
}

function populateHeader() {
  let header = document.getElementById('header');
  header.innerHTML = headerHTML;
}

//
// Create basic event handlers for user input.
//
function createEventHandlers() {
  // Mirror user edits back to the style element.
  styleEl.addEventListener('input', function() {
    style.textContent = styleEl.textContent;
  });

  // Skip anim on click to skipAnimation
  skipAnimationEl.addEventListener('click', function(e) {
    e.preventDefault();
    animationSkipped = true;
  });

  pauseEl.addEventListener('click', function(e) {
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
