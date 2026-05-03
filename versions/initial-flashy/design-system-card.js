/*
 * WHY: The initial flashy route must reuse the Business OS design-system card tokens.
 * WHAT: Imports the canonical V04 token config and applies saved localStorage values to CSS variables.
 */

import { systemConfig } from "../design-system/system-config.js";

const tokenEntries = Object.entries(systemConfig.tokens);

const readStoredSettings = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(systemConfig.storageKey) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
};

const readTokenValue = (values, key, token) => {
  if (Object.prototype.hasOwnProperty.call(values, key)) return values[key];
  const alias = (token.aliases || []).find((candidate) => Object.prototype.hasOwnProperty.call(values, candidate));
  return alias ? values[alias] : token.value;
};

const formatValue = (token, rawValue) => {
  if (token.type === "font") return `"${rawValue}"`;
  if (token.transform === "decimal") return `1.${rawValue}`;
  if (token.unit) return `${rawValue}${token.unit}`;
  return String(rawValue);
};

const hexToRgb = (value) => {
  const hex = String(value || "").replace("#", "");
  const normalized = hex.length === 3 ? hex.split("").map((digit) => `${digit}${digit}`).join("") : hex;
  const number = Number.parseInt(normalized, 16);
  if (!Number.isFinite(number)) return "13, 142, 206";
  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
};

const applyDesignSystemTokens = () => {
  const saved = readStoredSettings();
  const values = saved.values && typeof saved.values === "object" ? saved.values : saved;

  tokenEntries.forEach(([key, token]) => {
    const rawValue = readTokenValue(values, key, token);
    document.documentElement.style.setProperty(token.cssVar, formatValue(token, rawValue));
    if (key === "workspacePrimary") {
      document.documentElement.style.setProperty("--workspace-primary-rgb", hexToRgb(rawValue));
    }
    if (key === "workspaceSecondary") {
      document.documentElement.style.setProperty("--workspace-secondary-rgb", hexToRgb(rawValue));
    }
  });
};

applyDesignSystemTokens();

window.addEventListener("storage", (event) => {
  if (event.key === systemConfig.storageKey) applyDesignSystemTokens();
});
