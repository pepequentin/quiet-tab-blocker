(function installPageGuard() {
  "use strict";

  const STATE_EVENT = "quiet-tab-blocker:state-change";
  const nativeWindowOpen = window.open;
  let isActive = false;

  function guardedWindowOpen(...args) {
    if (isActive) {
      return null;
    }

    return Reflect.apply(nativeWindowOpen, window, args);
  }

  try {
    Object.defineProperty(window, "open", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: guardedWindowOpen
    });
  } catch (_error) {
    window.open = guardedWindowOpen;
  }

  document.addEventListener(
    STATE_EVENT,
    (event) => {
      isActive = event.detail === true;
    },
    true
  );
})();
