/*
 * WHY: The V4 page needs Business OS token behavior without importing the whole Business OS app.
 * WHAT: Applies token controls, persists values, cycles fonts, and keeps the voice meter alive.
 */

import { systemConfig } from "./system-config.js";

const tokenEntries = Object.entries(systemConfig.tokens);
const pixelTokenTypes = new Set(["number"]);

const readStoredSettings = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(systemConfig.storageKey) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
};

const readSavedValues = () => {
  const saved = readStoredSettings();
  const values = saved.values && typeof saved.values === "object" ? saved.values : saved;
  return normalizeSavedValues(values);
};

const readSavedFontIndex = () => {
  const saved = readStoredSettings();
  return Number.isInteger(saved.fontIndex) ? saved.fontIndex : 0;
};

const normalizeSavedValues = (values) => {
  const normalized = {};
  tokenEntries.forEach(([key, token]) => {
    const storedValue = readTokenValue(values, key, token);
    if (storedValue !== undefined) normalized[key] = storedValue;
  });
  return normalized;
};

const readTokenValue = (values, key, token) => {
  if (Object.prototype.hasOwnProperty.call(values, key)) return values[key];
  const alias = (token.aliases || []).find((candidate) => Object.prototype.hasOwnProperty.call(values, candidate));
  return alias ? values[alias] : undefined;
};

const formatValue = (token, rawValue) => {
  if (token.type === "font") return `"${rawValue}"`;
  if (token.transform === "decimal") return `1.${rawValue}`;
  if (token.unit) return `${rawValue}${token.unit}`;
  return String(rawValue);
};

const applyToken = (key, rawValue) => {
  const token = systemConfig.tokens[key];
  if (!token) return;
  document.documentElement.style.setProperty(token.cssVar, formatValue(token, rawValue));
  if (key === "workspacePrimary") document.documentElement.style.setProperty("--workspace-primary-rgb", hexToRgb(rawValue));
  if (key === "workspaceSecondary") document.documentElement.style.setProperty("--workspace-secondary-rgb", hexToRgb(rawValue));
};

const saveValues = () => {
  const values = {};
  document.querySelectorAll("[data-token-key]").forEach((control) => {
    values[control.dataset.tokenKey] = control.value;
  });
  window.localStorage.setItem(systemConfig.storageKey, JSON.stringify({
    fontIndex: readSavedFontIndex(),
    values,
  }));
};

const renderControl = (key) => {
  const token = systemConfig.tokens[key];
  if (token.type === "font") {
    return `
      <label class="token-row token-row-font">
        <span>${token.label}</span>
        <button type="button" value="${token.value}" data-token-key="${key}" data-default-value="${token.value}" data-font-cycle-target="${key}" aria-label="${token.label}">
          <strong data-font-cycle-label>${token.value}</strong>
        </button>
        <output>${token.value}</output>
      </label>
    `;
  }
  if (pixelTokenTypes.has(token.type)) {
    return `
      <label class="token-row">
        <span>${token.label}</span>
        <div class="token-stepper">
          <button type="button" data-token-step="-1" data-token-target="${key}" aria-label="Decrease ${token.label}">-</button>
          <input type="number" min="${token.min}" max="${token.max}" step="1" value="${token.value}" data-token-key="${key}" data-default-value="${token.value}" />
          <b>${token.unit || ""}</b>
          <button type="button" data-token-step="1" data-token-target="${key}" aria-label="Increase ${token.label}">+</button>
        </div>
        <output>${token.value}${token.unit || ""}</output>
      </label>
    `;
  }
  const bounds = token.type === "color" ? "" : `min="${token.min}" max="${token.max}"`;
  return `
    <label class="token-row">
      <span>${token.label}</span>
      <input type="${token.type}" ${bounds} step="1" value="${token.value}" data-token-key="${key}" data-default-value="${token.value}" />
      <output>${token.value}${token.unit || ""}</output>
    </label>
  `;
};

const renderTokenPanel = () => {
  const panel = document.querySelector("[data-token-panel]");
  if (!panel) return;
  panel.innerHTML = `
    <header>
      <span>Tokens</span>
      <div>
        <button type="button" data-token-save>Save</button>
        <button type="button" data-token-reset>Reset</button>
      </div>
    </header>
    ${systemConfig.groups.map((group) => `
      <section class="token-group">
        <h3>${group.title}</h3>
        ${group.keys.map(renderControl).join("")}
      </section>
    `).join("")}
  `;
};

const renderSystemMap = () => {
  const map = document.querySelector("[data-system-map]");
  if (!map) return;
  map.innerHTML = `
    <article class="system-card system-card-wide">
      <span>Research Inputs</span>
      <h3>Borrowed structure from mature systems</h3>
      <ul>
        ${systemConfig.references.map(([name, body]) => `<li><strong>${name}:</strong> ${body}</li>`).join("")}
      </ul>
    </article>
    ${systemConfig.sections.map(([kind, category, title, body]) => `
      <article class="system-card">
        <span>${category}</span>
        <h3>${title}</h3>
        <p>${body}</p>
        ${sectionSpecimen(kind)}
      </article>
    `).join("")}
  `;
};

const sectionSpecimen = (kind) => {
  const renderers = {
    spacingGrid: () => `
      <div class="specimen specimen-grid">
        <i></i><i></i><i></i><i></i><i></i><i></i>
        <b style="--w:4px"></b><b style="--w:8px"></b><b style="--w:12px"></b><b style="--w:16px"></b><b style="--w:24px"></b>
      </div>
    `,
    colorThemes: () => `
      <div class="specimen specimen-colors">
        ${[
          ["Gray", ["#eef4ff", "#97a4b3", "#4c5a6b", "#111821"]],
          ["Purple", ["#ece8ff", "#b9adff", "#6656e8", "#211a52"]],
          ["Green", ["#dffbea", "#6ee7a8", "#1d9f67", "#123b2b"]],
          ["Yellow", ["#fff5bf", "#ffd84d", "#b8860b", "#3f2b05"]],
          ["Red", ["#ffe1df", "#ff8b82", "#e23d35", "#4a1410"]],
        ].map(([name, colors]) => `<div><b>${name}</b>${colors.map((color) => `<i style="--swatch:${color}"></i>`).join("")}</div>`).join("")}
      </div>
    `,
    desktopTypography: () => `
      <div class="specimen specimen-type">
        <b class="type-display">Display 1</b><b class="type-heading">Heading 2</b><b class="type-body">Dense operator context.</b><b class="type-label">LABEL / CONTROL</b>
      </div>
    `,
    mobileTypography: () => `<div class="specimen specimen-mobile"><b>Mobile Title</b><p>Compact descriptions keep constrained panels scannable.</p><i></i><i></i><i></i></div>`,
    icons: () => `<div class="specimen specimen-icons">${["+", "x", "i", "?", "#", "/"].map((glyph) => `<button type="button">${glyph}</button>`).join("")}</div>`,
    styles: () => `<div class="specimen specimen-styles"><i></i><i></i><i></i><i></i></div>`,
    buttons: () => `<div class="specimen specimen-buttons"><button class="terminal-button terminal-button-primary" type="button">Primary</button><button class="terminal-button" type="button">Neutral</button><button class="terminal-button" type="button" disabled>Disabled</button></div>`,
    inputs: () => `<div class="specimen specimen-inputs"><label>Default<input value="Context" /></label><label>Error<input value="Missing scope" aria-invalid="true" /></label></div>`,
    customInputs: () => `<div class="specimen specimen-custom"><label><input type="checkbox" checked /> Sync</label><label><input type="radio" checked /> Agent</label><button type="button">Voice</button></div>`,
    select: () => `<div class="specimen specimen-select"><select><option>Codex</option><option>Claude</option></select><select><option>High</option><option>Medium</option></select></div>`,
    tabs: () => `<div class="specimen specimen-tabs"><button type="button" aria-current="true">Agents</button><button type="button">Browser</button><button type="button">Files</button></div>`,
    miscellaneous: () => `<div class="specimen specimen-misc"><span>SES</span><progress value="74" max="100"></progress><em>2 in_progress</em></div>`,
    popovers: () => `<div class="specimen specimen-popover"><button type="button">Review</button><aside>Reply draft, constraints, and approval state.</aside></div>`,
  };
  return (renderers[kind] || (() => ""))();
};

const setupControls = () => {
  const saved = readSavedValues();
  tokenEntries.forEach(([key, token]) => applyToken(key, saved[key] ?? token.value));
  document.querySelectorAll("[data-token-key]").forEach((control) => {
    const token = systemConfig.tokens[control.dataset.tokenKey];
    if (Object.prototype.hasOwnProperty.call(saved, control.dataset.tokenKey)) control.value = saved[control.dataset.tokenKey];
    if (control.matches("button[data-font-cycle-target]")) updateFontButton(control, control.value);
    const output = control.closest(".token-row")?.querySelector("output");
    if (output) output.textContent = `${control.value}${token.unit || ""}`;
  });
  document.addEventListener("input", (event) => {
    const control = event.target.closest("[data-token-key]");
    if (!control) return;
    const token = systemConfig.tokens[control.dataset.tokenKey];
    applyToken(control.dataset.tokenKey, control.value);
    const output = control.closest(".token-row")?.querySelector("output");
    if (output) output.textContent = `${control.value}${token.unit || ""}`;
    saveValues();
  });
  document.addEventListener("click", (event) => {
    const stepButton = event.target.closest("[data-token-step]");
    if (stepButton) {
      stepToken(stepButton);
      return;
    }
    const fontButton = event.target.closest("[data-font-cycle-target]");
    if (fontButton) cycleFontControl(fontButton, 1);
  });
  document.addEventListener("contextmenu", (event) => {
    const fontButton = event.target.closest("[data-font-cycle-target]");
    if (!fontButton) return;
    event.preventDefault();
    cycleFontControl(fontButton, -1);
  });
  document.querySelector("[data-token-reset]")?.addEventListener("click", () => {
    document.querySelectorAll("[data-token-key]").forEach((control) => {
      control.value = control.dataset.defaultValue;
      if (control.matches("button[data-font-cycle-target]")) updateFontButton(control, control.value);
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    window.localStorage.removeItem(systemConfig.storageKey);
  });
  document.querySelector("[data-token-save]")?.addEventListener("click", saveValues);
};

const stepToken = (button) => {
  const key = button.dataset.tokenTarget;
  const control = document.querySelector(`[data-token-key="${CSS.escape(key)}"]`);
  const token = systemConfig.tokens[key];
  if (!control || !token) return;
  const next = Math.min(Number(token.max), Math.max(Number(token.min), Number(control.value) + Number(button.dataset.tokenStep || "0")));
  control.value = String(next);
  control.dispatchEvent(new Event("input", { bubbles: true }));
};

const cycleFontControl = (button, direction) => {
  const token = systemConfig.tokens[button.dataset.fontCycleTarget];
  if (!token) return;
  const fontSet = systemConfig[token.fontSet] || systemConfig.fonts;
  const current = fontSet.indexOf(button.value);
  const safeIndex = current === -1 ? 0 : current;
  const nextFont = fontSet[(safeIndex + direction + fontSet.length) % fontSet.length];
  button.value = nextFont;
  updateFontButton(button, nextFont);
  button.dispatchEvent(new Event("input", { bubbles: true }));
};

const updateFontButton = (button, value) => {
  const label = button.querySelector("[data-font-cycle-label]");
  if (label) label.textContent = value;
  const output = button.closest(".token-row")?.querySelector("output");
  if (output) output.textContent = value;
};

const setupVoiceMeter = () => {
  const fill = document.querySelector("[data-meter-fill]");
  if (!fill) return;
  const started = performance.now();
  const tick = () => {
    const elapsed = (performance.now() - started) / 1000;
    const level = 32 + Math.sin(elapsed * 2.8) * 18 + Math.sin(elapsed * 9.2) * 8;
    fill.style.height = `${Math.max(12, Math.min(92, level))}%`;
    requestAnimationFrame(tick);
  };
  tick();
};

function hexToRgb(value) {
  const hex = value.replace("#", "");
  const normalized = hex.length === 3 ? hex.split("").map((digit) => `${digit}${digit}`).join("") : hex;
  const number = Number.parseInt(normalized, 16);
  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}

window.addEventListener("DOMContentLoaded", () => {
  renderTokenPanel();
  renderSystemMap();
  setupControls();
  setupVoiceMeter();
});
