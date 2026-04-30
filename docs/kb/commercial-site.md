# Commercial Site Knowledge Base

## Product Story

1. The headline theme is **one super app: code, files, images, and browser**.
2. The supporting promise is **fast navigation and voice prompting**.
3. The website should show the actual usable product surface instead of a generic marketing mock.
4. The canonical page currently keeps the main story, workspace mock, topology section, feature carousel, and FAQ.
5. Sections after the FAQ live in `archive.html` and are not part of the canonical website.

## Visual System

1. Primary hue animation range: **204deg to 222deg**.
2. Secondary hue animation range: **30deg to 40deg**.
3. Title glow uses the primary palette and is capped at **40%** of the older maximum.
4. Non-heading copy uses **Ubuntu**.
5. Hero and major title typography stay separate from body typography.
6. Main section hover uses glow only, with no hover border.
7. Section hover glow alternates primary and secondary by section parity.
8. FAQ cards are conventional vertical accordion cards.

## Workspace Mock Invariants

1. The workspace mock remains visually constrained to its intended frame.
2. Columns must not expand to fake overflow.
3. Chat content is pinned to the bottom when not scrolled.
4. Scroll-up means the viewed content moves downward.
5. Image cards are part of the chat log and move with skeleton cards during scroll.
6. The browser workspace is not a scroll target.
7. Voice inactive means empty waveform and empty voice meter.
8. Voice active means animated waveform, animated meter, active mic button, and strong voice-card glow.
9. A sent voice note must create a visible prompt card.
10. The added prompt card must pulse strongly.
11. Text-column voice results show an in-column loader that fills from empty to full, then insert a generated image.
12. Browser voice results reload the minimal `SIDE PROJECT` browser view and change the logo.

## Debug Controls

1. Palette, title, and punchline controls are tuning tools.
2. They must stay hidden unless the URL contains `debug=1`.
3. The public page must not show debug controls by default.

## Feature Content

1. Users can bring their own **Codex** or **Claude Code** subscription.
2. Claude support wraps official `claude -p`, the headless Claude Code interface.
3. OpenAI support uses **Codex**.
4. DroidMaster supports multi-account auth and conversations with different providers.
5. Local execution is containerized so users grant access only to what they choose.
6. Image generation is included through OpenRouter-compatible tools.
7. The browser is in-app.
8. Cloud deployment and mobile access sync with the local workspace.

## Deployment Topology

1. The topology section shows desktop browser, local or remote server, and mobile client.
2. The server may run locally through Docker or remotely on a VPS.
3. Desktop and mobile clients connect to the same workspace surface.
4. Animated links between clients and server show live sync.

## Link Targets

1. GitHub: `https://github.com/WiseDragonAI/DroidMaster-Website`
2. Discord: `https://discord.gg/QzGH2XwySv`
