"use strict";

const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

let settings = {
  enabled: true,
  blacklist: ["example.com"]
};
let openerUrl = "https://news.example.com/article";
let onCreatedListener;
const removedTabs = [];

globalThis.importScripts = (filename) => {
  require(path.resolve(__dirname, "..", filename));
};

globalThis.chrome = {
  storage: {
    local: {
      get: async () => settings,
      set: async () => undefined
    }
  },
  runtime: {
    onInstalled: { addListener: () => undefined },
    onStartup: { addListener: () => undefined }
  },
  tabs: {
    onCreated: {
      addListener(listener) {
        onCreatedListener = listener;
      }
    },
    get: async () => ({ url: openerUrl }),
    remove: async (tabId) => {
      removedTabs.push(tabId);
    }
  }
};

require("../background.js");

function waitForAsyncListener() {
  return new Promise((resolve) => setImmediate(resolve));
}

test("ferme uniquement les onglets ouverts par un site blacklisté", async () => {
  onCreatedListener({ id: 20, openerTabId: 10 });
  await waitForAsyncListener();
  assert.deepEqual(removedTabs, [20]);

  openerUrl = "https://example.net";
  onCreatedListener({ id: 21, openerTabId: 10 });
  await waitForAsyncListener();
  assert.deepEqual(removedTabs, [20]);

  settings = { ...settings, enabled: false };
  openerUrl = "https://example.com";
  onCreatedListener({ id: 22, openerTabId: 10 });
  await waitForAsyncListener();
  assert.deepEqual(removedTabs, [20]);
});
