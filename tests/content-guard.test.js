"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

require("../shared.js");

class MockAnchorElement {
  constructor({ href, target = "" }) {
    this.href = href;
    this.target = target;
  }
}

class MockFormElement {
  constructor(target = "") {
    this.target = target;
  }
}

const documentListeners = new Map();

globalThis.HTMLAnchorElement = MockAnchorElement;
globalThis.HTMLFormElement = MockFormElement;
globalThis.location = { href: "https://example.com/article" };
globalThis.document = {
  addEventListener(type, listener) {
    const listeners = documentListeners.get(type) || [];
    listeners.push(listener);
    documentListeners.set(type, listeners);
  },
  dispatchEvent() {
    return true;
  }
};
globalThis.chrome = {
  storage: {
    local: {
      get: async () => ({ enabled: true, blacklist: ["example.com"] })
    },
    onChanged: {
      addListener: () => undefined
    }
  }
};

require("../content-guard.js");

function createEvent(path, overrides = {}) {
  return {
    button: 0,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    prevented: false,
    stopped: false,
    composedPath: () => path,
    preventDefault() {
      this.prevented = true;
    },
    stopImmediatePropagation() {
      this.stopped = true;
    },
    ...overrides
  };
}

test("bloque les liens et formulaires qui ouvrent un nouvel onglet", async () => {
  await new Promise((resolve) => setImmediate(resolve));

  const clickListener = documentListeners.get("click")[0];
  const blankLinkEvent = createEvent([
    new MockAnchorElement({ href: "https://example.net", target: "_blank" })
  ]);
  clickListener(blankLinkEvent);
  assert.equal(blankLinkEvent.prevented, true);
  assert.equal(blankLinkEvent.stopped, true);

  const normalLinkEvent = createEvent([
    new MockAnchorElement({ href: "https://example.net" })
  ]);
  clickListener(normalLinkEvent);
  assert.equal(normalLinkEvent.prevented, false);

  const submitListener = documentListeners.get("submit")[0];
  const formEvent = createEvent([new MockFormElement("_blank")]);
  submitListener(formEvent);
  assert.equal(formEvent.prevented, true);
});
