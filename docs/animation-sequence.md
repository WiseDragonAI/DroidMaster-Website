# Workspace Animation Sequence

## Purpose

The animation demonstrates one operator controlling code, files, images, and browser surfaces with fast keyboard navigation plus voice prompting. The sequence must be logically valid at every keypress: no movement past the first or last column, no useless scroll on browser-only surfaces, and no voice state that shows waveform or meter activity when recording is inactive.

## Starting State

1. Workspace index: `0`, the green text-column workspace.
2. Focused column index: `0`, the leftmost chat column.
3. Voice state: inactive.
4. Chat columns: seeded with enough skeleton cards and image cards to overflow the visible column area.
5. Browser workspace: not focused and not scrolled.

## Canonical Loop

1. Press `Q`.
   1. Focus stays on workspace `0`, column `0`.
   2. The focused chat viewport scrolls up by one step.
   3. The column content visually moves downward because the user is looking further up in the conversation history.
   4. Voice remains inactive and the waveform/meter remain empty.

2. Press `Q`.
   1. Focus stays on workspace `0`, column `0`.
   2. The same chat viewport scrolls further up.
   3. This is valid because column `0` has overflow content.

3. Press `Q`.
   1. Focus stays on workspace `0`, column `0`.
   2. The same chat viewport scrolls further up.
   3. This is valid because the scroll offset remains clamped inside the available overflow range.

4. Press `Q`.
   1. Focus stays on workspace `0`, column `0`.
   2. The same chat viewport scrolls further up.
   3. The repeated `Q` presses are timed closer together to read as one deliberate scroll action.

5. Press `D`.
   1. Focus moves from column `0` to column `1`.
   2. This is valid because column `1` exists.
   3. Voice remains inactive.

6. Press `R`.
   1. Voice recording starts.
   2. The mic button enters the active visual state.
   3. The waveform and voice meter animate.
   4. The voice card glows strongly to draw attention.

7. Press `R`.
   1. Voice recording stops.
   2. The waveform and meter return to empty.
   3. A prompt card is added to the focused column.
   4. The added prompt card performs a large pulse.
   5. A loader appears inside the same column after the prompt card.
   6. The loader fills from empty to full.
   7. A generated image card is pushed into the same column.
   8. No scroll follows the voice note.

8. Press `S`.
   1. Focus moves from workspace `0` to workspace `1`.
   2. The column index remains valid in the new workspace.

9. Press `R`.
   1. Voice recording starts on workspace `1`.
   2. Voice UI becomes active and animated.

10. Press `R`.
    1. Voice recording stops.
    2. A prompt card is added to the focused text column.
    3. A loader fills from empty to full inside that column.
    4. A generated image card appears in that column.

11. Press `S`.
    1. Focus moves from workspace `1` to workspace `2`.
    2. Workspace `2` contains a colspan-3 browser view and one chat column.

12. Press `R`.
    1. Voice recording starts on the browser workspace.
    2. The voice UI becomes active and animated.

13. Press `R`.
    1. Voice recording stops.
    2. A prompt card is added to the focused non-browser column.
    3. The browser view reloads.
    4. The browser view remains minimal: one logo and the title `SIDE PROJECT`.
    5. The logo changes after reload to simulate the operator requesting a site change by voice.

14. Press `W`.
    1. Focus moves from workspace `2` to workspace `1`.
    2. This is valid because workspace `1` exists above the current workspace.

15. Press `W`.
    1. Focus moves from workspace `1` to workspace `0`.
    2. This is valid because workspace `0` exists above the current workspace.
    3. The next loop resets to the seeded state before replaying.

## Rationale

1. `A` and `D` represent horizontal column navigation.
2. `W` and `S` represent vertical workspace navigation.
3. `Q` and `E` represent scrolling within the focused chat session, not browser scrolling.
4. Scroll-up is shown only on a chat column with existing overflow content.
5. Repeated scroll presses are clustered tightly because a real scroll action is multiple quick key taps.
6. `R` is a record toggle, so every voice interaction is a start/stop pair.
7. Voice recording is intentionally longer than navigation steps so the viewer has time to see the active mic state, waveform, and meter.
8. Post-recording actions are visible product outcomes: prompt card insertion, loader progress, generated image insertion, or browser reload.
9. The sequence avoids scrolling after a voice note because the generated result should receive attention in place.
10. The browser workspace receives voice commands but does not scroll because the browser view is a minimal preview surface, not a chat log.
