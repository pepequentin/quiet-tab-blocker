(function initializePopup() {
  "use strict";

  const { cleanSettings, normalizeSite } = ExtensionBlocker;
  const elements = {
    toggle: document.querySelector("#enabled-toggle"),
    statusTitle: document.querySelector("#status-title"),
    statusCaption: document.querySelector("#status-caption"),
    count: document.querySelector("#site-count"),
    form: document.querySelector("#add-form"),
    input: document.querySelector("#site-input"),
    message: document.querySelector("#form-message"),
    addCurrent: document.querySelector("#add-current"),
    empty: document.querySelector("#empty-state"),
    list: document.querySelector("#blacklist")
  };

  let settings = cleanSettings();

  function pluralizeSites(count) {
    return `${count} site${count > 1 ? "s" : ""} protégé${count > 1 ? "s" : ""}`;
  }

  function render() {
    elements.toggle.checked = settings.enabled;
    document.body.classList.toggle("is-paused", !settings.enabled);
    elements.statusTitle.textContent = settings.enabled
      ? "Blocage actif"
      : "Blocage en pause";
    elements.statusCaption.textContent = pluralizeSites(settings.blacklist.length);
    elements.count.textContent = String(settings.blacklist.length);
    elements.empty.hidden = settings.blacklist.length > 0;

    elements.list.replaceChildren(
      ...settings.blacklist.map((site) => {
        const item = document.createElement("li");
        item.className = "site-item";

        const favicon = document.createElement("span");
        favicon.className = "site-favicon";
        favicon.setAttribute("aria-hidden", "true");
        favicon.textContent = site.charAt(0);

        const name = document.createElement("span");
        name.className = "site-name";
        name.title = site;
        name.textContent = site;

        const remove = document.createElement("button");
        remove.className = "delete-button";
        remove.type = "button";
        remove.dataset.site = site;
        remove.setAttribute("aria-label", `Retirer ${site}`);
        remove.innerHTML = `
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5.5 6.5h9M8 4.5h4M7 6.5l.4 9h5.2l.4-9M8.5 9v4M11.5 9v4" />
          </svg>`;

        item.append(favicon, name, remove);
        return item;
      })
    );
  }

  async function save(nextSettings) {
    settings = cleanSettings(nextSettings);
    await chrome.storage.local.set(settings);
    render();
  }

  function showMessage(message, type = "error") {
    elements.message.textContent = message;
    elements.message.classList.toggle("is-success", type === "success");
    elements.input.classList.toggle("has-error", type === "error" && Boolean(message));
  }

  async function addSite(rawSite) {
    const site = normalizeSite(rawSite);
    if (!site) {
      showMessage("Saisissez un domaine valide.");
      return false;
    }

    if (settings.blacklist.includes(site)) {
      showMessage("Ce domaine est déjà dans la liste.");
      return false;
    }

    await save({
      ...settings,
      blacklist: [...settings.blacklist, site]
    });
    showMessage(`${site} a été ajouté.`, "success");
    return true;
  }

  elements.toggle.addEventListener("change", () => {
    void save({ ...settings, enabled: elements.toggle.checked });
  });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    void (async () => {
      const added = await addSite(elements.input.value);
      if (added) {
        elements.input.value = "";
      }
    })();
  });

  elements.input.addEventListener("input", () => {
    showMessage("");
  });

  elements.list.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-button");
    if (!button) {
      return;
    }

    const site = button.dataset.site;
    void save({
      ...settings,
      blacklist: settings.blacklist.filter((entry) => entry !== site)
    });
  });

  elements.addCurrent.addEventListener("click", () => {
    void (async () => {
      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      if (!currentTab?.url || !(await addSite(currentTab.url))) {
        return;
      }
    })();
  });

  void (async () => {
    const stored = await chrome.storage.local.get(["enabled", "blacklist"]);
    settings = cleanSettings(stored);
    render();

    const [currentTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    elements.addCurrent.disabled = !normalizeSite(currentTab?.url || "");
  })();
})();
