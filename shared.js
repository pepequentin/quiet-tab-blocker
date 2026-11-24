(function exposeSharedHelpers(root) {
  "use strict";

  const DEFAULT_SETTINGS = Object.freeze({
    enabled: true,
    blacklist: []
  });

  function normalizeSite(value) {
    if (typeof value !== "string") {
      return null;
    }

    let candidate = value.trim().toLowerCase();
    if (!candidate) {
      return null;
    }

    candidate = candidate.replace(/^\*\./, "");

    try {
      const url = new URL(
        /^[a-z][a-z\d+.-]*:\/\//i.test(candidate)
          ? candidate
          : `https://${candidate}`
      );

      if (!url.hostname) {
        return null;
      }

      const hostname = url.hostname
        .replace(/^www\./, "")
        .replace(/\.$/, "");

      if (
        hostname !== "localhost" &&
        !hostname.includes(".") &&
        !hostname.includes(":")
      ) {
        return null;
      }

      return hostname;
    } catch (_error) {
      return null;
    }
  }

  function hostMatchesRule(hostname, rule) {
    const cleanHost = String(hostname || "")
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
    const cleanRule = normalizeSite(rule);

    return Boolean(
      cleanRule &&
        (cleanHost === cleanRule || cleanHost.endsWith(`.${cleanRule}`))
    );
  }

  function cleanSettings(rawSettings) {
    const source = rawSettings || {};
    const seen = new Set();
    const blacklist = [];

    for (const value of Array.isArray(source.blacklist)
      ? source.blacklist
      : []) {
      const normalized = normalizeSite(value);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        blacklist.push(normalized);
      }
    }

    return {
      enabled:
        typeof source.enabled === "boolean"
          ? source.enabled
          : DEFAULT_SETTINGS.enabled,
      blacklist
    };
  }

  function isBlockedUrl(urlValue, rawSettings) {
    const settings = cleanSettings(rawSettings);
    if (!settings.enabled) {
      return false;
    }

    try {
      const url = new URL(urlValue);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return false;
      }

      return settings.blacklist.some((rule) =>
        hostMatchesRule(url.hostname, rule)
      );
    } catch (_error) {
      return false;
    }
  }

  root.ExtensionBlocker = Object.freeze({
    DEFAULT_SETTINGS,
    normalizeSite,
    hostMatchesRule,
    cleanSettings,
    isBlockedUrl
  });
})(globalThis);
