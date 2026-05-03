/*
 * WHY: The commercial page has non-React presentation behaviors that should not live in the HTML shell.
 * WHAT: Initializes palette controls, hero text controls, motion demos, copy actions, and static-page helpers.
 */

      const debugControlsEnabled = new URLSearchParams(window.location.search).get('debug') === '1';
      const revealDebugControls = () => {
        document.querySelectorAll('[data-debug-control]').forEach((control) => {
          if (!(control instanceof HTMLElement)) return;
          control.hidden = !debugControlsEnabled;
        });
        document.body.dataset.debug = debugControlsEnabled ? 'true' : 'false';
      };

      // WHY: Section titles and subtitles should share one canonical per-letter reveal system across the page.
      // WHAT: Prepares typed-title nodes once and lets reveal controllers toggle them without bespoke per-section markup logic.
      const prepareTypedRevealCharacters = (element, {
        characterClass = 'page-flow-typed-char',
        wordClass = 'page-flow-typed-word',
        characterIntervalMs = 4,
        fadeDurationMs = 72,
      } = {}) => {
        if (!(element instanceof HTMLElement) || element.dataset.typePrepared === 'true') return 0;

        let characterCount = 0;
        const buildWordFragment = (text) => {
          const fragment = document.createDocumentFragment();
          const segments = text.match(/\S+|\s+/g) ?? [];

          segments.forEach((segment) => {
            if (/^\s+$/.test(segment)) {
              fragment.appendChild(document.createTextNode(segment));
              characterCount += segment.length;
              return;
            }

            const word = document.createElement('span');
            word.className = wordClass;

            for (const character of segment) {
              const span = document.createElement('span');
              span.className = characterClass;
              span.textContent = character;
              span.style.animationDelay = `${characterCount * characterIntervalMs}ms`;
              characterCount += 1;
              word.appendChild(span);
            }

            fragment.appendChild(word);
          });

          return fragment;
        };

        const buildNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            return buildWordFragment(node.textContent ?? '');
          }

          if (!(node instanceof HTMLElement)) return document.createDocumentFragment();

          const clone = document.createElement(node.tagName.toLowerCase());
          clone.className = node.className;
          Array.from(node.childNodes).forEach((child) => {
            clone.appendChild(buildNode(child));
          });
          return clone;
        };

        const fragment = document.createDocumentFragment();
        Array.from(element.childNodes).forEach((child) => {
          fragment.appendChild(buildNode(child));
        });
        element.textContent = '';
        element.appendChild(fragment);
        element.dataset.typePrepared = 'true';
        element.dataset.typeDurationMs = String((characterCount * characterIntervalMs) + fadeDurationMs);
        return characterCount;
      };

      const collectTypedRevealTargets = (scope, { includeTypeLines = false } = {}) => {
        if (!(scope instanceof HTMLElement)) return [];
        const selector = includeTypeLines ? '[data-type-reveal], [data-type-line]' : '[data-type-reveal]';
        const targets = [];
        if (scope.matches(selector)) targets.push(scope);
        targets.push(...Array.from(scope.querySelectorAll(selector)).filter((element) => element instanceof HTMLElement));
        return [...new Set(targets)];
      };

      const resetTypedRevealTarget = (target) => {
        if (!(target instanceof HTMLElement)) return;
        target.classList.remove('is-visible');
        target.querySelectorAll('.page-flow-typed-char, .one-super-typed-char').forEach((character) => {
          if (!(character instanceof HTMLElement)) return;
          character.style.animation = 'none';
          character.style.opacity = '';
          character.style.filter = '';
          void character.offsetWidth;
          character.style.animation = '';
        });
      };

      const showTypedRevealTargets = (scope, options = {}) => {
        collectTypedRevealTargets(scope, options).forEach((target) => {
          target.classList.add('is-visible');
        });
      };

      const hideTypedRevealTargets = (scope, options = {}) => {
        collectTypedRevealTargets(scope, options).forEach((target) => {
          resetTypedRevealTarget(target);
        });
      };

      (() => {
        const setupTypedRevealNodes = () => {
          document.querySelectorAll('[data-type-reveal]').forEach((element) => {
            prepareTypedRevealCharacters(element);
          });
        };

        window.addEventListener('load', setupTypedRevealNodes);
      })();

      // WHAT: Let the operator cycle through robotic Google Fonts for the masthead.
      (() => {
        const brandFonts = [
          'Audiowide',
          'Michroma',
          'Zen Dots',
          'Orbitron',
          'Tektur',
          'Oxanium',
          'Quantico',
          'Electrolize',
          'Aldrich',
          'Syncopate',
          'Saira Stencil One',
          'Black Ops One',
          'Bungee Inline',
          'Chakra Petch',
          'Exo 2',
          'Changa One',
          'Share Tech Mono',
          'Turret Road'
        ];
        const punchlineFonts = [
          'Rajdhani',
          'Chakra Petch',
          'Exo 2',
          'Oxanium',
          'Tektur',
          'Orbitron',
          'Saira Semi Condensed',
          'Barlow Condensed',
          'Space Grotesk',
          'Jura',
          'Kanit',
          'Titillium Web',
          'Encode Sans Semi Condensed',
          'Tomorrow',
          'Saira'
        ];

        const setupBrandFontCycle = () => {
          const titleNodes = Array.from(document.querySelectorAll('[data-brand-title]'));
          const brandCap = document.querySelector('[data-brand-cap]');
          const button = document.querySelector('[data-brand-font-cycle]');
          const animationButton = document.querySelector('[data-brand-animation-toggle]');
          const glowButton = document.querySelector('[data-brand-glow-cycle]');
          const opacityButton = document.querySelector('[data-brand-opacity-cycle]');
          const orbGlowButton = document.querySelector('[data-brand-orb-glow-cycle]');
          if (!titleNodes.length || !button || !brandCap) return;
          const randomBrandStartIndices = [0, 2, 3, 9];
          let activeIndex = randomBrandStartIndices[Math.floor(Math.random() * randomBrandStartIndices.length)];
          let animationEnabled = true;
          let glowLevel = 0.65;
          let opacityLevel = 1;
          let orbGlowLevel = 1;
          let pulseFrame = null;
          const pulseMs = 18000;

          const render = () => {
            const font = brandFonts[activeIndex];
            brandCap.style.setProperty('--brand-title-font', `'${font}', 'Orbitron', sans-serif`);
            button.textContent = `Font ${String(activeIndex + 1).padStart(2, '0')}/${brandFonts.length}`;
            button.title = font;
          };

          const renderEffect = () => {
            brandCap.style.setProperty('--brand-font-glow-effect', glowLevel.toFixed(2));
            brandCap.style.setProperty('--brand-font-opacity-effect', opacityLevel.toFixed(1));
            brandCap.style.setProperty('--brand-orb-glow-effect', orbGlowLevel.toFixed(1));
            if (glowButton) glowButton.textContent = `Glow ${Math.round(glowLevel * 100)}%`;
            if (opacityButton) opacityButton.textContent = `Opacity ${Math.round(opacityLevel * 100)}%`;
            if (orbGlowButton) orbGlowButton.textContent = `Orbs ${Math.round(orbGlowLevel * 100)}%`;
          };

          const applyPulse = (pulse) => {
            const shapedPulse = Math.max(0, Math.min(1, pulse));
            const randomishGlow = 0.6 + (0.1 * shapedPulse);
            brandCap.style.setProperty('--brand-font-glow-effect', randomishGlow.toFixed(3));
            brandCap.style.setProperty('--brand-text-glow-opacity', opacityLevel.toFixed(3));
            brandCap.style.setProperty('--brand-stroke-opacity', opacityLevel.toFixed(3));
            brandCap.style.setProperty('--brand-glow-blur', `${(5.2 + (1.4 * shapedPulse)) * randomishGlow}px`);
            brandCap.style.setProperty('--brand-glow-blue-shadow', `${(8.4 + (1.8 * shapedPulse)) * randomishGlow}px`);
            brandCap.style.setProperty('--brand-glow-purple-shadow', `${(17 + (3.5 * shapedPulse)) * randomishGlow}px`);
            brandCap.style.setProperty('--brand-stroke-blue-shadow', `${(2.2 + (0.7 * shapedPulse)) * randomishGlow}px`);
            brandCap.style.setProperty('--brand-stroke-purple-shadow', `${(5.8 + (1.2 * shapedPulse)) * randomishGlow}px`);
          };

          const animatePulse = (now) => {
            if (!animationEnabled) return;
            const phase = (now % pulseMs) / pulseMs;
            const pulse = (
              (Math.sin((phase * Math.PI * 2) - 0.7) + 1) * 0.42 +
              (Math.sin((phase * Math.PI * 5.4) + 1.9) + 1) * 0.24 +
              (Math.sin((phase * Math.PI * 8.6) - 2.4) + 1) * 0.16
            ) / 1.64;
            applyPulse(pulse);
            pulseFrame = window.requestAnimationFrame(animatePulse);
          };

          const restartPulse = () => {
            window.cancelAnimationFrame(pulseFrame);
            if (animationEnabled) {
              pulseFrame = window.requestAnimationFrame(animatePulse);
              return;
            }
            applyPulse(1);
          };

          const renderAnimation = () => {
            brandCap.classList.toggle('brand-animation-paused', !animationEnabled);
            if (animationButton) animationButton.textContent = animationEnabled ? 'Anim on' : 'Anim off';
            restartPulse();
          };

          // WHAT: Once the reveal wipe is complete, remove the mask so the title glow can overflow naturally.
          brandCap.addEventListener('animationend', (event) => {
            if (event.animationName !== 'brandTitleRevealMask') return;
            brandCap.classList.add('brand-cap--revealed');
          });

          button.addEventListener('click', () => {
            activeIndex = (activeIndex + 1) % brandFonts.length;
            render();
          });
          button.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            activeIndex = (activeIndex - 1 + brandFonts.length) % brandFonts.length;
            render();
          });
          if (animationButton) {
            animationButton.addEventListener('click', () => {
              animationEnabled = !animationEnabled;
              renderAnimation();
            });
          }
          if (glowButton) {
            glowButton.addEventListener('click', () => {
              glowLevel = Math.min(0.7, Number((glowLevel + 0.01).toFixed(2)));
              renderEffect();
              if (!animationEnabled) applyPulse(1);
            });
            glowButton.addEventListener('contextmenu', (event) => {
              event.preventDefault();
              glowLevel = Math.max(0.6, Number((glowLevel - 0.01).toFixed(2)));
              renderEffect();
              if (!animationEnabled) applyPulse(1);
            });
          }
          if (opacityButton) {
            opacityButton.addEventListener('click', () => {
              const percent = Math.round(opacityLevel * 100);
              const stepped =
                percent < 3 ? 3 :
                percent < 5 ? 5 :
                percent < 7 ? 7 :
                percent < 10 ? 10 :
                Math.min(100, percent + 10);
              opacityLevel = stepped / 100;
              renderEffect();
              if (!animationEnabled) applyPulse(1);
            });
            opacityButton.addEventListener('contextmenu', (event) => {
              event.preventDefault();
              const percent = Math.round(opacityLevel * 100);
              const stepped =
                percent > 10 ? percent - 10 :
                percent === 10 ? 7 :
                percent === 7 ? 5 :
                percent === 5 ? 3 :
                percent === 3 ? 0 :
                0;
              opacityLevel = stepped / 100;
              renderEffect();
              if (!animationEnabled) applyPulse(1);
            });
          }
          if (orbGlowButton) {
            orbGlowButton.addEventListener('click', () => {
              orbGlowLevel = Math.min(2.5, Number((orbGlowLevel + 0.1).toFixed(1)));
              renderEffect();
            });
            orbGlowButton.addEventListener('contextmenu', (event) => {
              event.preventDefault();
              orbGlowLevel = Math.max(0.2, Number((orbGlowLevel - 0.1).toFixed(1)));
              renderEffect();
            });
          }
          render();
          renderEffect();
          renderAnimation();
        };

        const setupPunchlineFontCycle = () => {
          const nodes = Array.from(document.querySelectorAll('[data-punchline-title]'));
          const button = document.querySelector('[data-punchline-font-cycle]');
          if (!nodes.length || !button) return;
          let activeIndex = 0;
          const fitPunchline = () => {
            nodes.forEach((node) => {
              node.style.fontSize = '';
              const availableWidth = node.parentElement ? node.parentElement.clientWidth : node.clientWidth;
              if (!availableWidth) return;
              const computed = window.getComputedStyle(node);
              const currentSize = Number.parseFloat(computed.fontSize);
              const overflowWidth = node.scrollWidth;
              if (!currentSize || !overflowWidth) return;
              const scale = Math.min(1, (availableWidth - 2) / overflowWidth);
              node.style.fontSize = `${Math.max(24, currentSize * scale)}px`;
            });
          };
          const renderPunchline = () => {
            const font = punchlineFonts[activeIndex];
            document.documentElement.style.setProperty('--punchline-font', `'${font}', 'Rajdhani', sans-serif`);
            button.textContent = `Punch ${String(activeIndex + 1).padStart(2, '0')}/${punchlineFonts.length}`;
            button.title = font;
            window.requestAnimationFrame(() => {
              fitPunchline();
              if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(fitPunchline);
              }
            });
          };
          button.addEventListener('click', () => {
            activeIndex = (activeIndex + 1) % punchlineFonts.length;
            renderPunchline();
          });
          button.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            activeIndex = (activeIndex - 1 + punchlineFonts.length) % punchlineFonts.length;
            renderPunchline();
          });
          window.addEventListener('resize', fitPunchline);
          renderPunchline();
        };

        window.addEventListener('load', () => {
          revealDebugControls();
          setupBrandFontCycle();
          setupPunchlineFontCycle();
        });
      })();
      // WHY: The install command is the primary open-source action and must be copyable directly from the hero.
      // WHAT: Copies the exact command from the first hero action button when the browser clipboard API is available.
      (() => {
        const command = 'npx droidmaster web';

        const setupCommandCopy = () => {
          const button = document.querySelector('[data-copy-command]');
          const label = document.querySelector('[data-copy-command-label]');
          // WHY: Static variants can reuse the script without mounting the hero copy action.
          // WHAT: Stop setup when the command button is not present in the current document.
          if (!button || !label) return;

          // WHY: Copy must only claim success when the browser exposes the actual clipboard writer.
          // WHAT: Disable the command action when direct clipboard writes are unavailable.
          if (!navigator.clipboard?.writeText) {
            button.disabled = true;
            label.textContent = 'Clipboard unavailable';
            return;
          }

          button.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(command);
              label.textContent = 'Copied';
              window.setTimeout(() => {
                label.textContent = command;
              }, 1200);
            } catch (_error) {
              label.textContent = 'Copy blocked';
              window.setTimeout(() => {
                label.textContent = command;
              }, 1200);
            }
          });
        };

        window.addEventListener('load', setupCommandCopy);
      })();
      // WHY: The hero screenshot should feel like a physical interactive card instead of a static image.
      // WHAT: Maps pointer position into local CSS variables that drive a simple tilt plus glare response.
      (() => {
        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
        const round = (value, precision = 3) => Number(value.toFixed(precision));
        const restingState = {
          pointerX: 24,
          pointerY: 16,
          fromLeft: 0.24,
          fromTop: 0.16,
          fromCenter: 0.52,
          rotateX: -8,
          rotateY: 4,
          shiftX: -10,
          shiftY: -4,
          scale: 1,
          glareOpacity: 0.34,
          hoverShiftX: 0,
          hoverShiftY: 0,
          hoverScale: 1,
          backdropOpacity: 0
        };

        const applyDeckState = (surface, state) => {
          surface.style.setProperty('--deck-pointer-x', `${state.pointerX}%`);
          surface.style.setProperty('--deck-pointer-y', `${state.pointerY}%`);
          surface.style.setProperty('--deck-from-left', String(round(state.fromLeft)));
          surface.style.setProperty('--deck-from-top', String(round(state.fromTop)));
          surface.style.setProperty('--deck-from-center', String(round(state.fromCenter)));
          surface.style.setProperty('--deck-rotate-x', `${round(state.rotateX, 2)}deg`);
          surface.style.setProperty('--deck-rotate-y', `${round(state.rotateY, 2)}deg`);
          surface.style.setProperty('--deck-shift-x', `${round(state.shiftX, 2)}px`);
          surface.style.setProperty('--deck-shift-y', `${round(state.shiftY, 2)}px`);
          surface.style.setProperty('--deck-scale', String(round(state.scale, 4)));
          surface.style.setProperty('--deck-glare-opacity', String(round(state.glareOpacity)));
          surface.style.setProperty('--deck-hover-shift-x', `${round(state.hoverShiftX ?? 0, 2)}px`);
          surface.style.setProperty('--deck-hover-shift-y', `${round(state.hoverShiftY ?? 0, 2)}px`);
          surface.style.setProperty('--deck-hover-scale', String(round(state.hoverScale ?? 1, 4)));
          surface.style.setProperty('--deck-backdrop-opacity', String(round(state.backdropOpacity ?? 0)));
        };

        const buildHoverLift = (surface) => {
          const rect = surface.getBoundingClientRect();
          const viewportCenterX = window.innerWidth / 2;
          const viewportCenterY = window.innerHeight / 2;
          const cardCenterX = rect.left + (rect.width / 2);
          const cardCenterY = rect.top + (rect.height / 2);

          return {
            hoverShiftX: viewportCenterX - cardCenterX,
            hoverShiftY: viewportCenterY - cardCenterY,
            hoverScale: 1.7,
            backdropOpacity: 1
          };
        };

        const buildInteractiveState = (rect, clientX, clientY, hoverLift) => {
          const absoluteX = clamp(clientX - rect.left, 0, rect.width);
          const absoluteY = clamp(clientY - rect.top, 0, rect.height);
          const percentX = clamp((absoluteX / rect.width) * 100, 0, 100);
          const percentY = clamp((absoluteY / rect.height) * 100, 0, 100);
          const centerX = (percentX - 50) / 50;
          const centerY = (percentY - 50) / 50;
          const fromCenter = clamp(Math.hypot(centerX, centerY), 0, 1);

          return {
            pointerX: percentX,
            pointerY: percentY,
            fromLeft: percentX / 100,
            fromTop: percentY / 100,
            fromCenter,
            rotateX: centerX * 8.5,
            rotateY: -centerY * 7.25,
            shiftX: centerX * 12,
            shiftY: centerY * 9,
            scale: 1.012 + (fromCenter * 0.015),
            glareOpacity: 0.3 + (fromCenter * 0.5),
            hoverShiftX: hoverLift.hoverShiftX,
            hoverShiftY: hoverLift.hoverShiftY,
            hoverScale: hoverLift.hoverScale,
            backdropOpacity: hoverLift.backdropOpacity
          };
        };

        const setupHeroDeckCard = () => {
          const surfaces = Array.from(document.querySelectorAll('[data-hero-card]'));
          if (!surfaces.length) return;
          const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          document.body.dataset.heroCardFocus = 'false';

          surfaces.forEach((surface) => {
            if (!(surface instanceof HTMLElement)) return;
            surface.dataset.cardActive = 'false';
            applyDeckState(surface, restingState);
            if (reduceMotion) return;

            let frameId = 0;
            let pendingState = null;
            let hoverLift = buildHoverLift(surface);

            const flush = () => {
              frameId = 0;
              if (!pendingState) return;
              applyDeckState(surface, pendingState);
              pendingState = null;
            };

            const queueState = (state) => {
              pendingState = state;
              if (frameId) return;
              frameId = window.requestAnimationFrame(flush);
            };

            surface.addEventListener('pointerenter', () => {
              surface.dataset.cardActive = 'true';
              document.body.dataset.heroCardFocus = 'true';
              hoverLift = buildHoverLift(surface);
              queueState({
                ...restingState,
                ...hoverLift
              });
            });

            surface.addEventListener('pointermove', (event) => {
              // WHY: The effect should be owned by the screenshot bounds, not a child overlay.
              // WHAT: Normalize every pointer frame against the outer screenshot rect.
              const rect = surface.getBoundingClientRect();
              queueState(buildInteractiveState(rect, event.clientX, event.clientY, hoverLift));
            });

            const reset = () => {
              surface.dataset.cardActive = 'false';
              document.body.dataset.heroCardFocus = 'false';
              queueState(restingState);
            };

            surface.addEventListener('pointerleave', reset);
            surface.addEventListener('pointercancel', reset);
            window.addEventListener('resize', () => {
              hoverLift = buildHoverLift(surface);
              if (surface.dataset.cardActive === 'true') {
                queueState({
                  ...restingState,
                  ...hoverLift
                });
              }
            });
          });
        };

        window.addEventListener('load', setupHeroDeckCard);
      })();
      // WHAT: Expose live primary and secondary color controls so the landing palette can be tuned in place.
      (() => {
        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
        const clampHue = (value) => {
          const hue = Number(value);
          if (!Number.isFinite(hue)) return 0;
          return ((Math.round(hue) % 360) + 360) % 360;
        };

        const hsvToRgb = (hue, saturation, value) => {
          const s = saturation / 100;
          const v = value / 100;
          const chroma = v * s;
          const segment = hue / 60;
          const second = chroma * (1 - Math.abs((segment % 2) - 1));
          let red = 0;
          let green = 0;
          let blue = 0;

          if (segment >= 0 && segment < 1) {
            red = chroma;
            green = second;
          } else if (segment < 2) {
            red = second;
            green = chroma;
          } else if (segment < 3) {
            green = chroma;
            blue = second;
          } else if (segment < 4) {
            green = second;
            blue = chroma;
          } else if (segment < 5) {
            red = second;
            blue = chroma;
          } else {
            red = chroma;
            blue = second;
          }

          const match = v - chroma;
          return [red, green, blue].map((channel) => Math.round((channel + match) * 255));
        };

        const colorTargets = {
          primary: {
            label: 'Primary Blue',
            note: 'Auto-cycles between hue 204 and 222 when animations are on. Turn animations off to tune hue manually.',
            hueKey: 'droidmaster-primary-hue',
            saturationKey: 'droidmaster-primary-saturation',
            luminosityKey: 'droidmaster-primary-luminosity',
              css: {
                hue: '--primary-h',
                saturation: '--primary-s',
                luminosity: '--primary-v',
                rgb: '--primary-rgb',
                soft: '--primary-soft-rgb',
                ui: '--primary-ui-rgb',
              muted: '--primary-muted-rgb'
            },
            defaults: { hue: 204, saturation: 95, luminosity: 100 },
            valueProfile: { rgb: 1, soft: .92, ui: .82, muted: .65 }
          },
          secondary: {
            label: 'Secondary Accent',
            note: 'Auto-cycles between hue 264 and 276 when animations are on. Turn animations off to tune hue manually.',
            hueKey: 'droidmaster-accent-hue',
            saturationKey: 'droidmaster-accent-saturation',
            luminosityKey: 'droidmaster-accent-luminosity',
              css: {
                hue: '--accent-h',
                saturation: '--accent-s',
                luminosity: '--accent-v',
                rgb: '--accent-rgb',
                soft: '--accent-soft-rgb',
                ui: '--accent-ui-rgb',
              muted: '--accent-muted-rgb'
            },
            defaults: { hue: 0, saturation: 100, luminosity: 89 },
            valueProfile: { rgb: 1, soft: .92, ui: .82, muted: .65 }
          }
        };
        const animatedHueRanges = {
          primary: { min: 204, max: 222, halfPeriodMs: 7000 },
          secondary: { min: 0, max: 12, halfPeriodMs: 9000 }
        };

        const targetStorageKey = 'droidmaster-color-target';
        const animationStorageKey = 'droidmaster-animations-enabled';
        const tunerHiddenStorageKey = 'droidmaster-color-tuner-hidden';
        const paletteVersionKey = 'droidmaster-palette-version';
        const paletteVersion = '2026-05-03-primary-204-222-secondary-red-0-100-89';
        const offerGlowStorageKey = 'droidmaster-offer-glow-power';
        const triangleWave = (timestamp, halfPeriodMs) => {
          const fullPeriodMs = halfPeriodMs * 2;
          const cycleProgress = (timestamp % fullPeriodMs) / fullPeriodMs;
          return cycleProgress <= 0.5
            ? cycleProgress * 2
            : (1 - cycleProgress) * 2;
        };
        const getAnimatedHue = (targetName, timestamp) => {
          const range = animatedHueRanges[targetName];
          if (!range) {
            return colorTargets[targetName].defaults.hue;
          }
          return range.min + ((range.max - range.min) * triangleWave(timestamp, range.halfPeriodMs));
        };

        const setColorState = (targetName, state, persist) => {
          const target = colorTargets[targetName];
          const hue = clampHue(state.hue);
          const saturation = clamp(Number(state.saturation) || 0, 0, 100);
          const luminosity = clamp(Number(state.luminosity) || target.defaults.luminosity, 0, 100);
          const hsvValue = (luminosity / 100) * 100;
          const variants = target.valueProfile;
          const accentRgb = hsvToRgb(hue, saturation, hsvValue * variants.rgb).join(' ');
          const accentSoftRgb = hsvToRgb(hue, saturation, hsvValue * variants.soft).join(' ');
          const accentUiRgb = hsvToRgb(hue, saturation, hsvValue * variants.ui).join(' ');
          const accentMutedRgb = hsvToRgb(hue, saturation, hsvValue * variants.muted).join(' ');
          const root = document.documentElement;
          root.style.setProperty(target.css.hue, String(hue));
          root.style.setProperty(target.css.saturation, String(saturation));
          root.style.setProperty(target.css.luminosity, String(luminosity));
          root.style.setProperty(target.css.rgb, accentRgb);
          root.style.setProperty(target.css.soft, accentSoftRgb);
          root.style.setProperty(target.css.ui, accentUiRgb);
          root.style.setProperty(target.css.muted, accentMutedRgb);

          if (persist) {
            window.localStorage.setItem(target.hueKey, String(hue));
            window.localStorage.setItem(target.saturationKey, String(saturation));
            window.localStorage.setItem(target.luminosityKey, String(luminosity));
          }

          return { hue, saturation, luminosity };
        };

        const renderControls = (targetName, state) => {
          const panel = document.querySelector('[data-color-panel]');
          const label = document.querySelector('[data-color-target-label]');
          const note = document.querySelector('[data-color-note]');
          const summary = document.querySelector('[data-color-summary]');
          const hueValue = document.querySelector('[data-color-hue-value]');
          const saturationValue = document.querySelector('[data-color-saturation-value]');
          const luminosityValue = document.querySelector('[data-color-luminosity-value]');
          const hueSlider = document.querySelector('[data-color-hue-slider]');
          const saturationSlider = document.querySelector('[data-color-saturation-slider]');
          const luminositySlider = document.querySelector('[data-color-luminosity-slider]');

          if (panel) {
            panel.setAttribute('data-color-target', targetName);
          }
          if (label) {
            label.textContent = colorTargets[targetName].label;
          }
          if (note) {
            note.textContent = colorTargets[targetName].note;
          }
          if (summary) {
            summary.textContent = `${state.hue}deg · ${state.saturation}% · ${state.luminosity}%`;
          }
          if (hueValue) {
            hueValue.textContent = `${state.hue}deg`;
          }
          if (saturationValue) {
            saturationValue.textContent = `${state.saturation}%`;
          }
          if (luminosityValue) {
            luminosityValue.textContent = `${state.luminosity}%`;
          }
          if (hueSlider instanceof HTMLInputElement) {
            hueSlider.value = String(state.hue);
          }
          if (saturationSlider instanceof HTMLInputElement) {
            saturationSlider.value = String(state.saturation);
          }
          if (luminositySlider instanceof HTMLInputElement) {
            luminositySlider.value = String(state.luminosity);
          }

          document.querySelectorAll('[data-color-target-option]').forEach((button) => {
            if (!(button instanceof HTMLButtonElement)) {
              return;
            }
            const isActive = button.dataset.colorTargetOption === targetName;
            button.dataset.active = isActive ? 'true' : 'false';
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          });
        };

        window.addEventListener('DOMContentLoaded', () => {
          const panel = document.querySelector('[data-color-panel]');
          const closeButton = document.querySelector('[data-color-close]');
          const reopenButton = document.querySelector('[data-color-reopen]');
          const animationButton = document.querySelector('[data-color-animation-toggle]');
          const hueSlider = document.querySelector('[data-color-hue-slider]');
          const hueLabel = document.querySelector('[data-color-hue-label]');
          const offerGlowSlider = document.querySelector('[data-offer-glow-slider]');
          const offerGlowValue = document.querySelector('[data-offer-glow-value]');
          let animationsEnabled = false;
          window.localStorage.setItem(animationStorageKey, 'false');

          if (window.localStorage.getItem(paletteVersionKey) !== paletteVersion) {
            Object.values(colorTargets).forEach((target) => {
              window.localStorage.removeItem(target.hueKey);
              window.localStorage.removeItem(target.saturationKey);
              window.localStorage.removeItem(target.luminosityKey);
            });
            window.localStorage.removeItem(offerGlowStorageKey);
            window.localStorage.setItem(paletteVersionKey, paletteVersion);
          }

          const setOfferGlow = (rawValue, persist) => {
            const value = clamp(Number(rawValue) || 0, 0, 300);
            const power = value / 100;
            document.documentElement.style.setProperty('--offer-glow-power', power.toFixed(2));
            if (offerGlowSlider instanceof HTMLInputElement) {
              offerGlowSlider.value = String(value);
            }
            if (offerGlowValue) {
              offerGlowValue.textContent = `${value}%`;
            }
            if (persist) {
              window.localStorage.setItem(offerGlowStorageKey, String(value));
            }
          };

          const renderAnimationMode = () => {
            document.body.classList.remove('animations-paused');
            if (hueSlider instanceof HTMLInputElement) {
              hueSlider.disabled = animationsEnabled;
            }
            if (hueLabel) {
              hueLabel.textContent = animationsEnabled ? 'Hue Auto' : 'Hue Manual';
            }
            if (animationButton instanceof HTMLButtonElement) {
              animationButton.textContent = animationsEnabled ? 'Animations on' : 'Animations off';
              animationButton.setAttribute('aria-pressed', animationsEnabled ? 'true' : 'false');
            }
          };

          revealDebugControls();
          if (!debugControlsEnabled) {
            if (panel instanceof HTMLElement) panel.hidden = true;
            if (reopenButton instanceof HTMLButtonElement) reopenButton.hidden = true;
          } else if (panel instanceof HTMLElement && window.localStorage.getItem(tunerHiddenStorageKey) === 'true') {
            panel.hidden = true;
          }
          if (reopenButton instanceof HTMLButtonElement) {
            reopenButton.hidden = !debugControlsEnabled || !(panel instanceof HTMLElement && panel.hidden);
          }
          if (closeButton instanceof HTMLButtonElement && panel instanceof HTMLElement) {
            closeButton.addEventListener('click', () => {
              if (!debugControlsEnabled) return;
              panel.hidden = true;
              if (reopenButton instanceof HTMLButtonElement) {
                reopenButton.hidden = false;
              }
              window.localStorage.setItem(tunerHiddenStorageKey, 'true');
            });
          }
          if (reopenButton instanceof HTMLButtonElement && panel instanceof HTMLElement) {
            reopenButton.addEventListener('click', () => {
              if (!debugControlsEnabled) return;
              panel.hidden = false;
              reopenButton.hidden = true;
              window.localStorage.removeItem(tunerHiddenStorageKey);
            });
          }
          if (animationButton instanceof HTMLButtonElement) {
            animationButton.addEventListener('click', () => {
              animationsEnabled = false;
              window.localStorage.setItem(animationStorageKey, 'false');
              renderAnimationMode();
            });
          }
          renderAnimationMode();
          setOfferGlow(window.localStorage.getItem(offerGlowStorageKey) ?? '72', false);

          const rootStyles = getComputedStyle(document.documentElement);
          const readRootNumber = (propertyName, fallback) => {
            const rawValue = rootStyles.getPropertyValue(propertyName).trim();
            const value = Number(rawValue);
            return Number.isFinite(value) ? value : fallback;
          };
          const stateByTarget = Object.fromEntries(
            Object.entries(colorTargets).map(([name, target]) => {
              const rawHue = window.localStorage.getItem(target.hueKey);
              const rawSaturation = window.localStorage.getItem(target.saturationKey);
              const rawLuminosity = window.localStorage.getItem(target.luminosityKey);
              const state = setColorState(name, {
                hue: rawHue == null ? readRootNumber(target.css.hue, target.defaults.hue) : rawHue,
                saturation: rawSaturation == null ? readRootNumber(target.css.saturation, target.defaults.saturation) : rawSaturation,
                luminosity: rawLuminosity == null ? readRootNumber(target.css.luminosity, target.defaults.luminosity) : rawLuminosity
              }, false);
              return [name, state];
            })
          );

          let activeTarget = window.localStorage.getItem(targetStorageKey);
          if (!(activeTarget in colorTargets)) {
            activeTarget = 'secondary';
          }
          renderControls(activeTarget, stateByTarget[activeTarget]);
          const saturationSlider = document.querySelector('[data-color-saturation-slider]');
          const luminositySlider = document.querySelector('[data-color-luminosity-slider]');

          if (hueSlider instanceof HTMLInputElement) {
            hueSlider.addEventListener('input', (event) => {
              const target = event.currentTarget;
              if (!(target instanceof HTMLInputElement) || animationsEnabled) {
                return;
              }
              stateByTarget[activeTarget] = setColorState(activeTarget, {
                ...stateByTarget[activeTarget],
                hue: target.value
              }, true);
              renderControls(activeTarget, stateByTarget[activeTarget]);
              renderAnimationMode();
            });
          }

          if (saturationSlider instanceof HTMLInputElement) {
            saturationSlider.addEventListener('input', (event) => {
              const target = event.currentTarget;
              if (!(target instanceof HTMLInputElement)) {
                return;
              }
              stateByTarget[activeTarget] = setColorState(activeTarget, {
                ...stateByTarget[activeTarget],
                saturation: target.value
              }, true);
              renderControls(activeTarget, stateByTarget[activeTarget]);
            });
          }

          if (luminositySlider instanceof HTMLInputElement) {
            luminositySlider.addEventListener('input', (event) => {
              const target = event.currentTarget;
              if (!(target instanceof HTMLInputElement)) {
                return;
              }
              stateByTarget[activeTarget] = setColorState(activeTarget, {
                ...stateByTarget[activeTarget],
                luminosity: target.value
              }, true);
              renderControls(activeTarget, stateByTarget[activeTarget]);
            });
          }

          if (offerGlowSlider instanceof HTMLInputElement) {
            offerGlowSlider.addEventListener('input', (event) => {
              const target = event.currentTarget;
              if (!(target instanceof HTMLInputElement)) {
                return;
              }
              setOfferGlow(target.value, true);
            });
          }

          document.querySelectorAll('[data-color-target-option]').forEach((button) => {
            if (!(button instanceof HTMLButtonElement)) {
              return;
            }
            button.addEventListener('click', () => {
              const nextTarget = button.dataset.colorTargetOption;
              if (!(nextTarget in colorTargets)) {
                return;
              }
              activeTarget = nextTarget;
              window.localStorage.setItem(targetStorageKey, activeTarget);
              renderControls(activeTarget, stateByTarget[activeTarget]);
            });
          });

          const animatePalette = (timestamp) => {
            if (animationsEnabled) {
              Object.keys(animatedHueRanges).forEach((targetName) => {
                stateByTarget[targetName] = setColorState(targetName, {
                  ...stateByTarget[targetName],
                  hue: getAnimatedHue(targetName, timestamp)
                }, false);
              });
              renderControls(activeTarget, stateByTarget[activeTarget]);
            }
            window.requestAnimationFrame(animatePalette);
          };

          window.requestAnimationFrame(animatePalette);
        });
      })();
      // WHAT: Drive star-layer parallax from page scroll so background depth responds to operator movement.
      (() => {
        window.addEventListener('DOMContentLoaded', () => {
          let ticking = false;
          const renderParallax = () => {
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const root = document.documentElement;
            root.style.setProperty('--star-scroll-far', `${(scrollY * -0.025).toFixed(2)}px`);
            root.style.setProperty('--star-scroll-mid', `${(scrollY * -0.055).toFixed(2)}px`);
            root.style.setProperty('--star-scroll-near', `${(scrollY * -0.095).toFixed(2)}px`);
            ticking = false;
          };
          const requestParallax = () => {
            if (ticking) {
              return;
            }
            ticking = true;
            window.requestAnimationFrame(renderParallax);
          };
          renderParallax();
          window.addEventListener('scroll', requestParallax, { passive: true });
        });
      })();
      // WHAT: Poll the served root document so static-server edits trigger a browser reload.
      (() => {
        const targetPath = window.location.pathname === '/' ? '/index.html' : window.location.pathname;
        let lastModified = null;

        const checkForUpdate = async () => {
          try {
            const response = await fetch(targetPath, {
              method: 'HEAD',
              cache: 'no-store'
            });
            const nextModified = response.headers.get('Last-Modified');
            if (!nextModified) {
              return;
            }
            if (lastModified && nextModified !== lastModified) {
              window.location.reload();
              return;
            }
            lastModified = nextModified;
          } catch (_error) {
          }
        };

        window.addEventListener('load', () => {
          void checkForUpdate();
          window.setInterval(checkForUpdate, 1000);
        });
      })();
      // WHAT: Animate the problem-aware cards so the terminal sessions and cipher stream feel live.
      (() => {
        const setupProblemAwareMotion = () => {
          const sessionStreams = Array.from(document.querySelectorAll('[data-problem-session-stream]'));
          if (!sessionStreams.length) return;

          const appendTerminalLine = (stream) => {
            const line = document.createElement('div');
            const widths = ['34%', '48%', '56%', '62%', '74%', '88%'];
            line.className = 'problem-session-line';
            if (Math.random() < 0.24) {
              line.classList.add('problem-session-line--accent');
            }
            line.style.width = widths[Math.floor(Math.random() * widths.length)];
            stream.appendChild(line);
            stream.scrollTop = stream.scrollHeight;
            while (stream.children.length > 20) {
              stream.removeChild(stream.firstElementChild);
            }
          };

          sessionStreams.forEach((stream, idx) => {
            for (let seed = 0; seed < 8 + idx; seed += 1) {
              appendTerminalLine(stream);
            }

            const schedule = () => {
              window.setTimeout(() => {
                appendTerminalLine(stream);
                schedule();
              }, 160 + Math.floor(Math.random() * 220));
            };

            schedule();
          });
        };

        window.addEventListener('load', setupProblemAwareMotion);
      })();
      // WHAT: Drive the canonical Business OS voice dock waveform inside the V1 problem card.
      (() => {
        const track = [
          0.18, 0.24, 0.21, 0.34, 0.48, 0.43, 0.52, 0.31,
          0.28, 0.39, 0.57, 0.69, 0.46, 0.35, 0.41, 0.29,
          0.23, 0.32, 0.44, 0.61, 0.53, 0.37, 0.26, 0.21,
          0.33, 0.49, 0.64, 0.58, 0.42, 0.36, 0.27, 0.22,
        ];
        const pointCount = 38;
        const frameIntervalMs = 1000 / 30;
        const viewBoxWidth = 1000;
        const viewBoxHeight = 100;
        const baseline = 100;
        const maxAmplitude = 72;

        const buildWavePath = (samples) => {
          const values = samples.length ? samples : [0];
          const step = values.length > 1 ? viewBoxWidth / (values.length - 1) : viewBoxWidth;
          const coordinates = values.map((value, index) => ({
            x: values.length === 1 ? viewBoxWidth : index * step,
            y: baseline - Math.pow(value, 0.78) * maxAmplitude,
          }));

          let path = `M0 ${baseline}`;
          if (coordinates.length === 1) {
            const point = coordinates[0];
            return `${path} L0 ${point.y.toFixed(1)} L${viewBoxWidth} ${point.y.toFixed(1)} L${viewBoxWidth} ${viewBoxHeight} L0 ${viewBoxHeight} Z`;
          }

          coordinates.forEach((point, index) => {
            if (index === 0) {
              path += ` L${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
              return;
            }
            const previous = coordinates[index - 1];
            path += ` Q${previous.x.toFixed(1)} ${previous.y.toFixed(1)} ${((previous.x + point.x) / 2).toFixed(1)} ${((previous.y + point.y) / 2).toFixed(1)}`;
          });
          return `${path} L${viewBoxWidth} ${viewBoxHeight} L0 ${viewBoxHeight} Z`;
        };

        const setupCanonicalVoiceDock = () => {
          document.querySelectorAll('[data-v1-wave-panel]').forEach((panel, panelIndex) => {
            if (panel.dataset.voiceWaveReady === 'true') return;
            const areaPath = panel.querySelector('.v1-wave-area-path');
            const meterFill = panel.parentElement?.querySelector('.v1-meter-fill');
            if (!areaPath) return;

            panel.dataset.voiceWaveReady = 'true';
            const samples = [];
            let smoothed = 0.26;
            let readIndex = panelIndex * 5;
            let lastFrameAt = 0;

            const tick = (now) => {
              if (now - lastFrameAt >= frameIntervalMs) {
                const next = track[readIndex % track.length] ?? 0.18;
                smoothed += (next - smoothed) * 0.32;
                let frameLevel = smoothed;
                samples.push(frameLevel);
                if (samples.length > pointCount) {
                  samples.length = 0;
                  smoothed = 0.24;
                  frameLevel = smoothed;
                  samples.push(frameLevel);
                }
                areaPath.setAttribute('d', buildWavePath(samples));
                if (meterFill instanceof HTMLElement) {
                  meterFill.style.height = `${Math.round(18 + frameLevel * 74)}%`;
                }
                readIndex += 1;
                lastFrameAt = now;
              }
              window.requestAnimationFrame(tick);
            };

            window.requestAnimationFrame(tick);
          });
        };

        window.addEventListener('load', setupCanonicalVoiceDock);
      })();
      // WHY: The one-super sequence should reveal from visually meaningful containers instead of outer spacing shells.
      // WHAT: Reveals the centered heading and capability lines quickly, while the workspace subtitle and mock own their own half-visible intersection triggers.
      (() => {
        const LETTER_INTERVAL_MS = 4;
        const LETTER_FADE_MS = 72;
        const LINE_OFFSET_MS = 46;

        const setupOneSuperSequence = () => {
          const section = document.querySelector('[data-one-super-section]');
          if (!(section instanceof HTMLElement)) return;

          const heading = section.querySelector('[data-one-super-reveal="heading"]');
          const typedShell = section.querySelector('[data-one-super-reveal="typed"]');
          const workspaceCopy = section.querySelector('[data-one-super-reveal="workspace-copy"]');
          const workspaceStage = section.querySelector('[data-one-super-reveal="workspace-stage"]');
          const typedLines = Array.from(section.querySelectorAll('[data-type-line]'));
          if (!(typedShell instanceof HTMLElement) || !typedLines.length) return;

          const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          let typedStarted = false;
          let typedTimers = [];

          const isFullyVisible = (element) => {
            const rect = element.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
          };

          const isRevealReady = (element) => {
            const rect = element.getBoundingClientRect();
            const visibleTop = Math.max(rect.top, 0);
            const visibleBottom = Math.min(rect.bottom, window.innerHeight);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            return visibleHeight >= (rect.height * 0.35);
          };

          const isFullyOutside = (element) => {
            const rect = element.getBoundingClientRect();
            return rect.bottom <= 0 || rect.top >= window.innerHeight;
          };

          const showElement = (element) => {
            if (!(element instanceof HTMLElement)) return;
            element.classList.remove('is-hidden-instant');
            element.classList.add('is-visible');
            showTypedRevealTargets(element);
          };

          const hideElementInstantly = (element) => {
            if (!(element instanceof HTMLElement)) return;
            element.classList.add('is-hidden-instant');
            element.classList.remove('is-visible');
            hideTypedRevealTargets(element);
            window.requestAnimationFrame(() => {
              element.classList.remove('is-hidden-instant');
            });
          };

          const resetTypedLines = () => {
            typedTimers.forEach((timer) => window.clearTimeout(timer));
            typedTimers = [];
            typedStarted = false;
            typedLines.forEach((line) => {
              if (!(line instanceof HTMLElement)) return;
              line.classList.remove('is-visible');
              line.querySelectorAll('.one-super-typed-char').forEach((character) => {
                if (!(character instanceof HTMLElement)) return;
                character.style.animation = 'none';
                character.style.opacity = '';
                character.style.filter = '';
                void character.offsetWidth;
                character.style.animation = '';
              });
            });
            hideElementInstantly(typedShell);
          };

          const bindFullVisibility = (element, { onEnter, onExit, observedElement } = {}) => {
            if (!(element instanceof HTMLElement)) return;
            const target = observedElement instanceof HTMLElement ? observedElement : element;
            let visible = false;

            if (isRevealReady(target)) {
              visible = true;
              onEnter?.();
            }

            const localObserver = new IntersectionObserver((entries) => {
              const entry = entries[0];
              if (!visible && Boolean(entry?.isIntersecting) && isRevealReady(target)) {
                visible = true;
                onEnter?.();
                return;
              }
              if (visible && isFullyOutside(target)) {
                visible = false;
                onExit?.();
              }
            }, {
              threshold: [0, 0.35, 1],
              rootMargin: '0px'
            });

            localObserver.observe(target);
          };

          const revealFinal = () => {
            if (heading instanceof HTMLElement) heading.classList.add('is-visible');
            typedShell.classList.add('is-visible');
            typedLines.forEach((line) => {
              if (!(line instanceof HTMLElement)) return;
              line.classList.add('is-visible');
            });
            if (workspaceCopy instanceof HTMLElement) workspaceCopy.classList.add('is-visible');
            if (workspaceStage instanceof HTMLElement) workspaceStage.classList.add('is-visible');
          };

          typedLines.forEach((line) => {
            prepareTypedRevealCharacters(line, {
              characterClass: 'one-super-typed-char',
              characterIntervalMs: LETTER_INTERVAL_MS,
              fadeDurationMs: LETTER_FADE_MS,
            });
          });

          const startTypedSequence = () => {
            if (typedStarted) return;
            typedStarted = true;

            if (reduceMotion) {
              revealFinal();
              return;
            }

            showElement(typedShell);
            typedLines.forEach((line, index) => {
              if (!(line instanceof HTMLElement)) return;
              const timer = window.setTimeout(() => {
                line.classList.add('is-visible');
              }, index * LINE_OFFSET_MS);
              typedTimers.push(timer);
            });
          };

          if (reduceMotion) {
            revealFinal();
            return;
          }

          bindFullVisibility(heading, {
            onEnter: () => showElement(heading),
            onExit: () => hideElementInstantly(heading),
          });
          bindFullVisibility(typedShell, {
            onEnter: startTypedSequence,
            onExit: resetTypedLines,
          });
          bindFullVisibility(workspaceCopy, {
            onEnter: () => showElement(workspaceCopy),
            onExit: () => hideElementInstantly(workspaceCopy),
            observedElement: workspaceCopy.querySelector('.one-super-demo-title'),
          });
          bindFullVisibility(workspaceStage, {
            onEnter: () => showElement(workspaceStage),
            onExit: () => hideElementInstantly(workspaceStage),
            observedElement: workspaceStage.querySelector('.workspace-control-grid'),
          });
        };

        window.addEventListener('load', setupOneSuperSequence);
      })();
      // WHY: Section discovery should feel owned by scroll position rather than one-shot page load timing.
      // WHAT: Reveals tagged sections once enough of the visual container is in view to feel discoverable and hides them immediately on full exit.
      (() => {
        const setupRepeatableScrollReveals = () => {
          const elements = Array.from(document.querySelectorAll('[data-scroll-reveal], [data-post-brand-reveal]'))
            .filter((element) => !(element instanceof HTMLElement && element.hasAttribute('data-one-super-reveal')));

          const isFullyVisible = (element) => {
            const rect = element.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
          };

          const isRevealReady = (element) => {
            const rect = element.getBoundingClientRect();
            const visibleTop = Math.max(rect.top, 0);
            const visibleBottom = Math.min(rect.bottom, window.innerHeight);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            return visibleHeight >= (rect.height * 0.35);
          };

          const isFullyOutside = (element) => {
            const rect = element.getBoundingClientRect();
            return rect.bottom <= 0 || rect.top >= window.innerHeight;
          };

          const revealWithPaint = (element) => {
            element.classList.remove('is-hidden-instant');
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => {
                element.classList.add('is-visible');
                showTypedRevealTargets(element);
              });
            });
          };

          elements.forEach((element) => {
            if (!(element instanceof HTMLElement)) return;
            let visible = false;

            if (isRevealReady(element)) {
              visible = true;
              revealWithPaint(element);
            }

            const observer = new IntersectionObserver((entries) => {
              const entry = entries[0];
              if (!visible && Boolean(entry?.isIntersecting) && isRevealReady(element)) {
                visible = true;
                revealWithPaint(element);
                return;
              }
              if (visible && isFullyOutside(element)) {
                visible = false;
                element.classList.add('is-hidden-instant');
                element.classList.remove('is-visible');
                hideTypedRevealTargets(element);
                window.requestAnimationFrame(() => {
                  element.classList.remove('is-hidden-instant');
                });
              }
            }, {
              threshold: [0, 0.35, 1],
              rootMargin: '0px'
            });
            observer.observe(element);
          });
        };

        window.addEventListener('load', setupRepeatableScrollReveals);
      })();
      // WHAT: Initialize the workspace demo from one synchronized keyboard and voice state model.
      (() => {
        const setup = () => {
          const section = document.querySelector('[data-workspace-control-demo]');
          if (!section) return;
          window.DroidMasterCommercial?.setupWorkspaceControlDemo?.(section);
        };

        window.addEventListener('load', setup);
      })();
      // WHAT: Drive the factory card stack as a real queue: fill, evaporate, rotate, repeat.
      (() => {
        const factoryPromptQueue = [
          { name: 'Internet Scout', label: 'research:scan' },
          { name: 'Value Analyst', label: 'research:summarize' },
          { name: 'Deep Researcher', label: 'research:deep_dive' },
          { name: 'Conclusion Writer', label: 'research:conclude' },
          { name: 'Researcher', label: 'proto:research' },
          { name: 'Requirements Engineer', label: 'proto:prd' },
          { name: 'Domain Analyst', label: 'proto:domain' },
          { name: 'System Architect', label: 'proto:architecture' },
          { name: 'API Designer', label: 'proto:api_contracts' },
          { name: 'Quality Ops Planner', label: 'proto:quality_ops' },
          { name: 'Test Strategist', label: 'proto:test_strategy' },
          { name: 'Delivery Planner', label: 'proto:delivery' },
          { name: 'Red Team Reviewer', label: 'proto:redteam' },
          { name: 'Design Packager', label: 'proto:sdd' },
          { name: 'Implementer', label: 'proto:implementation' },
          { name: 'Researcher', label: 'epic:research' },
          { name: 'Analyzer', label: 'epic:analyze' },
          { name: 'Architect', label: 'epic:architecture' },
          { name: 'Quality Planner', label: 'epic:quality' },
          { name: 'Decomposer', label: 'epic:decompose' },
          { name: 'Reviewer', label: 'epic:review' },
          { name: 'Implementer', label: 'feat:implement' },
          { name: 'Auditor', label: 'feat:audit' },
          { name: 'Root Cause Analysis', label: 'bug:rca' },
          { name: 'Fixer', label: 'bug:fix' },
          { name: 'Auditor', label: 'bug:audit' },
          { name: 'Analyzer', label: 'refactor:analyze' },
          { name: 'Implementer', label: 'refactor:implement' },
          { name: 'Auditor', label: 'refactor:audit' }
        ];

        const setupFactoryStack = () => {
          const stack = document.querySelector('[data-factory-stack]');
          if (!stack) return;
          let cards = Array.from(stack.querySelectorAll('[data-factory-card]'));
          if (!cards.length) return;

          let nextPromptIndex = cards.length;

          const render = (activeCard = null) => {
            cards.forEach((card, idx) => {
              const nameNode = card.querySelector('[data-factory-name]');
              const tagNode = card.querySelector('[data-factory-tag]');
              if (!nameNode || !tagNode) return;
              card.dataset.depth = String(idx);
              card.classList.toggle('is-active', card === activeCard);
            });
          };

          const cycle = () => {
            const activeCard = cards[0];
            if (!activeCard) return;

            render(null);
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => {
                activeCard.classList.add('is-active');
              });
            });

            const executionMs = 712 + Math.floor(Math.random() * 233);
            window.setTimeout(() => {
              activeCard.classList.add('is-evaporating');

              window.setTimeout(() => {
                activeCard.classList.remove('is-active', 'is-evaporating');
                cards = cards.slice(1).concat(activeCard);
                const recycledName = activeCard.querySelector('[data-factory-name]');
                const recycledTag = activeCard.querySelector('[data-factory-tag]');
                const recycledPrompt =
                  factoryPromptQueue[nextPromptIndex % factoryPromptQueue.length];
                if (recycledName && recycledTag) {
                  recycledName.textContent = recycledPrompt.name;
                  recycledTag.textContent = recycledPrompt.label;
                }
                nextPromptIndex += 1;
                activeCard.classList.add('is-entering');
                activeCard.classList.add('is-repositioning');
                render(null);
                void activeCard.offsetHeight;
                activeCard.classList.remove('is-repositioning');
                window.requestAnimationFrame(() => {
                  window.requestAnimationFrame(() => {
                    activeCard.classList.remove('is-entering');
                  });
                });
                window.setTimeout(cycle, 60);
              }, 200);
            }, executionMs);
          };

          cards.forEach((card, idx) => {
            const nameNode = card.querySelector('[data-factory-name]');
            const tagNode = card.querySelector('[data-factory-tag]');
            const prompt = factoryPromptQueue[idx % factoryPromptQueue.length];
            if (nameNode && tagNode) {
              nameNode.textContent = prompt.name;
              tagNode.textContent = prompt.label;
            }
          });
          render(null);
          window.setTimeout(cycle, 120);
        };

        window.addEventListener('load', setupFactoryStack);
      })();
      // WHAT: FAQ cards should expand in flow on hover/focus and also toggle open on touch or click.
      (() => {
        const setupFaqCardToggles = () => {
          const cards = Array.from(document.querySelectorAll('[data-faq-card]'));
          if (!cards.length) return;

          const syncFaqListFixedHeight = () => {
            const faqList = document.querySelector('.faq-list');
            if (!(faqList instanceof HTMLElement)) return;
            const cards = Array.from(faqList.querySelectorAll('[data-faq-card]')).filter((card) => card instanceof HTMLElement);
            if (!cards.length) return;

            const previousStates = cards.map((card) => card.dataset.open === 'true');
            const previousFocusStates = cards.map((card) => card.matches(':focus-within'));

            cards.forEach((card) => {
              card.dataset.open = 'false';
              const trigger = card.querySelector('.faq-card-trigger');
              if (trigger instanceof HTMLButtonElement) {
                trigger.setAttribute('aria-expanded', 'false');
              }
            });

            let maxHeight = faqList.scrollHeight;

            cards.forEach((card) => {
              card.dataset.open = 'true';
              const trigger = card.querySelector('.faq-card-trigger');
              if (trigger instanceof HTMLButtonElement) {
                trigger.setAttribute('aria-expanded', 'true');
              }
              maxHeight = Math.max(maxHeight, faqList.scrollHeight);
              card.dataset.open = 'false';
              if (trigger instanceof HTMLButtonElement) {
                trigger.setAttribute('aria-expanded', 'false');
              }
            });

            faqList.style.setProperty('--faq-list-fixed-height', `${maxHeight}px`);

            cards.forEach((card, index) => {
              const shouldOpen = previousStates[index] || previousFocusStates[index];
              card.dataset.open = shouldOpen ? 'true' : 'false';
              const trigger = card.querySelector('.faq-card-trigger');
              if (trigger instanceof HTMLButtonElement) {
                trigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
              }
            });
          };

          cards.forEach((card) => {
            if (!(card instanceof HTMLElement)) return;
            const trigger = card.querySelector('.faq-card-trigger');
            if (!(trigger instanceof HTMLButtonElement)) return;

            const render = (open) => {
              card.dataset.open = open ? 'true' : 'false';
              trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
            };

            render(false);

            trigger.addEventListener('click', () => {
              const nextOpen = card.dataset.open !== 'true';
              cards.forEach((otherCard) => {
                if (!(otherCard instanceof HTMLElement)) return;
                const otherTrigger = otherCard.querySelector('.faq-card-trigger');
                if (!(otherTrigger instanceof HTMLButtonElement)) return;
                const isTarget = otherCard === card;
                otherCard.dataset.open = isTarget && nextOpen ? 'true' : 'false';
                otherTrigger.setAttribute('aria-expanded', isTarget && nextOpen ? 'true' : 'false');
              });
            });
          });

          syncFaqListFixedHeight();
          window.addEventListener('resize', syncFaqListFixedHeight);
        };

        window.addEventListener('load', setupFaqCardToggles);
      })();
      // WHAT: Animate the workspace structure mockup as a single 2D vertical strip inside one clipped viewport.
      (() => {
        const setupWorkspaceStack = () => {
          const stacks = Array.from(document.querySelectorAll('[data-workspace-switcher]'));
          if (!stacks.length) return;

          stacks.forEach((stack) => {
            if (stack.closest('[data-workspace-control-demo]')) return;
            const track = stack.querySelector('[data-workspace-track]');
            const slides = Array.from(stack.querySelectorAll('[data-workspace-slide]'));
            if (!track || slides.length < 2) return;

            const sequence = [0, 1, 2, 1];
            let sequenceIndex = 0;
            let activeIndex = sequence[sequenceIndex];
            let isAnimating = false;

            const applyPosition = () => {
              track.style.transform = `translateY(-${activeIndex * 100}%)`;
            };

            const scheduleNext = () => {
              window.setTimeout(() => {
                if (isAnimating) {
                  scheduleNext();
                  return;
                }
                isAnimating = true;
                sequenceIndex = (sequenceIndex + 1) % sequence.length;
                activeIndex = sequence[sequenceIndex];
                applyPosition();
                window.setTimeout(() => {
                  isAnimating = false;
                  scheduleNext();
                }, 170);
              }, 920);
            };

            applyPosition();
            scheduleNext();
          });
        };

        window.addEventListener('load', setupWorkspaceStack);
      })();
