(function installContentGuard() {
  "use strict";

  const STATE_EVENT = "quiet-tab-blocker:state-change";
  let isActive = false;

  function publishState() {
    document.dispatchEvent(
      new CustomEvent(STATE_EVENT, {
        detail: isActive
      })
    );
  }

  async function refreshState() {
    try {
      const stored = await chrome.storage.local.get(["enabled", "blacklist"]);
      isActive = ExtensionBlocker.isBlockedUrl(location.href, stored);
      publishState();
    } catch (_error) {
      isActive = false;
      publishState();
    }
  }

  function findLink(event) {
    return event
      .composedPath()
      .find(
        (element) =>
          element instanceof HTMLAnchorElement && Boolean(element.href)
      );
  }

  function preventNewTab(event) {
    if (!isActive) {
      return;
    }

    const link = findLink(event);
    if (!link) {
      return;
    }

    const opensNewContext =
      link.target.toLowerCase() === "_blank" ||
      event.button === 1 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey;

    if (opensNewContext) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function preventNewWindowForm(event) {
    if (!isActive) {
      return;
    }

    const form = event
      .composedPath()
      .find((element) => element instanceof HTMLFormElement);

    if (form?.target.toLowerCase() === "_blank") {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  document.addEventListener("click", preventNewTab, true);
  document.addEventListener("auxclick", preventNewTab, true);
  document.addEventListener("submit", preventNewWindowForm, true);

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (
      areaName === "local" &&
      (Object.hasOwn(changes, "enabled") ||
        Object.hasOwn(changes, "blacklist"))
    ) {
      void refreshState();
    }
  });

  void refreshState();
})();
