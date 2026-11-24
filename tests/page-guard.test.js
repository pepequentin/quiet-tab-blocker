"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

globalThis.window = {
  open(url) {
    return `opened:${url}`;
  }
};
globalThis.document = new EventTarget();

require("../page-guard.js");

test("neutralise window.open seulement lorsque le blocage est actif", () => {
  assert.equal(window.open("https://example.net"), "opened:https://example.net");

  document.dispatchEvent(
    new CustomEvent("quiet-tab-blocker:state-change", { detail: true })
  );
  assert.equal(window.open("https://example.net"), null);

  document.dispatchEvent(
    new CustomEvent("quiet-tab-blocker:state-change", { detail: false })
  );
  assert.equal(window.open("https://example.net"), "opened:https://example.net");
});
