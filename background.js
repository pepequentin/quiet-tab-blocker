"use strict";

importScripts("shared.js");

const { DEFAULT_SETTINGS, cleanSettings, isBlockedUrl } = ExtensionBlocker;

async function readSettings() {
  const stored = await chrome.storage.local.get(["enabled", "blacklist"]);
  return cleanSettings(stored);
}

async function initializeSettings() {
  const stored = await chrome.storage.local.get(["enabled", "blacklist"]);
  const settings = cleanSettings(stored);
  const update = {};

  if (typeof stored.enabled !== "boolean") {
    update.enabled = DEFAULT_SETTINGS.enabled;
  }

  if (!Array.isArray(stored.blacklist)) {
    update.blacklist = DEFAULT_SETTINGS.blacklist;
  } else if (JSON.stringify(stored.blacklist) !== JSON.stringify(settings.blacklist)) {
    update.blacklist = settings.blacklist;
  }

  if (Object.keys(update).length > 0) {
    await chrome.storage.local.set(update);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void initializeSettings();
});

chrome.runtime.onStartup.addListener(() => {
  void initializeSettings();
});

chrome.tabs.onCreated.addListener((createdTab) => {
  void (async () => {
    if (!createdTab.id || !createdTab.openerTabId) {
      return;
    }

    const settings = await readSettings();
    if (!settings.enabled || settings.blacklist.length === 0) {
      return;
    }

    try {
      const openerTab = await chrome.tabs.get(createdTab.openerTabId);
      if (openerTab.url && isBlockedUrl(openerTab.url, settings)) {
        await chrome.tabs.remove(createdTab.id);
      }
    } catch (_error) {
      // L’onglet a déjà été fermé ou sa page d’origine n’existe plus.
    }
  })();
});
