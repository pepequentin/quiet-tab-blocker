"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

require("../shared.js");

const {
  normalizeSite,
  hostMatchesRule,
  cleanSettings,
  isBlockedUrl
} = globalThis.ExtensionBlocker;

test("normalise les domaines et les URL collées", () => {
  assert.equal(
    normalizeSite("https://www.Example.com/path?q=1"),
    "example.com"
  );
  assert.equal(normalizeSite("*.news.example.com"), "news.example.com");
  assert.equal(normalizeSite("localhost:3000/path"), "localhost");
  assert.equal(normalizeSite("not-a-domain"), null);
});

test("fait correspondre le domaine et ses sous-domaines sans faux positif", () => {
  assert.equal(hostMatchesRule("example.com", "example.com"), true);
  assert.equal(hostMatchesRule("shop.example.com", "example.com"), true);
  assert.equal(hostMatchesRule("fakeexample.com", "example.com"), false);
});

test("nettoie et déduplique les réglages stockés", () => {
  assert.deepEqual(
    cleanSettings({
      enabled: false,
      blacklist: ["www.example.com", "example.com", "invalid"]
    }),
    {
      enabled: false,
      blacklist: ["example.com"]
    }
  );
});

test("respecte l’interrupteur global", () => {
  const blacklist = ["example.com"];
  assert.equal(
    isBlockedUrl("https://a.example.com/page", { enabled: true, blacklist }),
    true
  );
  assert.equal(
    isBlockedUrl("https://example.com", { enabled: false, blacklist }),
    false
  );
  assert.equal(
    isBlockedUrl("https://example.net", { enabled: true, blacklist }),
    false
  );
});
