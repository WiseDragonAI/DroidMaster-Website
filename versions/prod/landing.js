/*
 * WHY: The landing page needs only minimal behavior after removing global tuning and word-glow scripts.
 * WHAT: Initializes the synchronized workspace demo and copy-to-clipboard command buttons.
 */

import "./workspace-demo.js";

const setupWorkspaceDemo = () => {
  const section = document.querySelector("[data-workspace-control-demo]");
  if (!section) return;
  window.DroidMasterCommercial?.setupWorkspaceControlDemo?.(section);
};

const setupCopyButtons = () => {
  const buttons = Array.from(document.querySelectorAll("[data-copy-command]"));
  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const command = button.dataset.copyCommand;
      if (!command) return;
      await navigator.clipboard.writeText(command);
      button.dataset.copied = "true";
      const label = button.querySelector("[data-copy-command-label]");
      const originalText = label ? label.textContent : button.textContent;
      if (label) label.textContent = "Copied";
      else button.textContent = "Copied";
      window.setTimeout(() => {
        button.dataset.copied = "false";
        if (label) label.textContent = originalText;
        else button.textContent = originalText;
      }, 1200);
    });
  });
};

window.addEventListener("load", () => {
  setupWorkspaceDemo();
  setupCopyButtons();
});
