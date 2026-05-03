/*
 * WHY: The initial flashy page needs generated Business OS tokens before local styling.
 * WHAT: Imports the token CSS module and then the route stylesheet through Vite.
 */

import "../../../../../business-os-mock/ux/generated/design-system-tokens.module.css";
import "../versions/initial-flashy/styles.css";
