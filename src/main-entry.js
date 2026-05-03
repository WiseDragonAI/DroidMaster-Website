/*
 * WHY: The website root needs generated Business OS tokens before local styling.
 * WHAT: Imports the token CSS module and then the root stylesheet through Vite.
 */

import "../../../../../business-os-mock/ux/generated/design-system-tokens.module.css";
import "./styles.css";
