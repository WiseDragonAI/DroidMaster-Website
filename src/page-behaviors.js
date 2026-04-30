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

      // WHAT: Renders the voice-note mock as one smooth accumulated envelope fed by mock voice data.
      (() => {
        const setupVoiceSpectrumWidgets = () => {
          const histories = Array.from(document.querySelectorAll('.voice-history'));
          if (!histories.length) return;

          histories.forEach((history, historyIndex) => {
            if (!(history instanceof HTMLElement) || history.dataset.voiceSpectrumReady === 'true') return;
            history.dataset.voiceSpectrumReady = 'true';

            const canvas = document.createElement('canvas');
            canvas.className = 'voice-spectrum-canvas';
            canvas.setAttribute('aria-hidden', 'true');
            history.appendChild(canvas);

            const timer = document.createElement('span');
            timer.className = 'voice-time-chip';
            timer.dataset.wordGlowSkip = 'true';
            timer.textContent = '00:00';
            history.appendChild(timer);

            const context = canvas.getContext('2d');
            if (!context) return;

            const shell = history.closest('.voice-shell');
            const values = [];
            const startedAt = performance.now() - historyIndex * 420;
            let smoothed = 0.28;
            let lastFrame = 0;

            const isActive = () => {
              const widget = history.closest('.workspace-voice-widget');
              return !widget || widget.dataset.active === 'true';
            };

            const resize = () => {
              const rect = history.getBoundingClientRect();
              const width = Math.max(1, Math.round(rect.width * window.devicePixelRatio));
              const height = Math.max(1, Math.round(rect.height * window.devicePixelRatio));
              if (canvas.width === width && canvas.height === height) return;
              canvas.width = width;
              canvas.height = height;
            };

            const mockAmplitude = (elapsedSeconds) => {
              const phrase = Math.sin(elapsedSeconds * 2.35 + historyIndex * 0.9) * 0.5 + 0.5;
              const syllable = Math.sin(elapsedSeconds * 9.6 + historyIndex * 1.7) * 0.5 + 0.5;
              const consonant = Math.sin(elapsedSeconds * 21.2 + historyIndex * 2.4) * 0.5 + 0.5;
              return Math.min(1, 0.16 + phrase * 0.46 + syllable * 0.26 + consonant * 0.12);
            };

            const drawEmpty = () => {
              context.clearRect(0, 0, canvas.width, canvas.height);
              timer.textContent = '00:00';
              if (shell instanceof HTMLElement) shell.style.setProperty('--voice-level', '0%');
            };

            const draw = (elapsedSeconds) => {
              const width = canvas.width;
              const height = canvas.height;
              const ratio = window.devicePixelRatio || 1;
              const maxPoints = Math.max(32, Math.floor(width / (3.2 * ratio)));
              const sample = mockAmplitude(elapsedSeconds);
              smoothed += (sample - smoothed) * 0.18;
              values.push(smoothed);
              while (values.length > maxPoints) values.shift();

              context.clearRect(0, 0, width, height);
              const topPadding = 10 * ratio;
              const bottomPadding = 10 * ratio;
              const baseline = height - bottomPadding;
              const maxWaveHeight = Math.max(1, height - topPadding - bottomPadding);
              const step = values.length > 1 ? width / (values.length - 1) : width;
              const fill = context.createLinearGradient(0, topPadding, 0, baseline);
              fill.addColorStop(0, 'rgba(229, 128, 76, 0.92)');
              fill.addColorStop(0.62, 'rgba(195, 96, 58, 0.74)');
              fill.addColorStop(1, 'rgba(110, 49, 32, 0.94)');

              context.save();
              context.shadowColor = 'rgba(229, 128, 76, 0.24)';
              context.shadowBlur = 14 * ratio;
              context.beginPath();
              context.moveTo(0, baseline);
              values.forEach((value, index) => {
                const x = index * step;
                const y = baseline - Math.pow(value, 0.78) * maxWaveHeight;
                if (index === 0) {
                  context.lineTo(x, y);
                  return;
                }
                const previousValue = values[index - 1];
                const previousX = (index - 1) * step;
                const previousY = baseline - Math.pow(previousValue, 0.78) * maxWaveHeight;
                context.quadraticCurveTo(previousX, previousY, (previousX + x) / 2, (previousY + y) / 2);
              });
              if (values.length) {
                const lastValue = values[values.length - 1];
                context.lineTo(width, baseline - Math.pow(lastValue, 0.78) * maxWaveHeight);
              }
              context.lineTo(width, baseline);
              context.closePath();
              context.fillStyle = fill;
              context.fill();
              context.restore();

              context.strokeStyle = 'rgba(255, 187, 129, 0.28)';
              context.lineWidth = 1 * ratio;
              context.beginPath();
              values.forEach((value, index) => {
                const x = index * step;
                const y = baseline - Math.pow(value, 0.78) * maxWaveHeight;
                if (index === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
              });
              context.stroke();

              const seconds = Math.floor(elapsedSeconds);
              timer.textContent = `00:${String(seconds % 60).padStart(2, '0')}`;
              if (shell instanceof HTMLElement) shell.style.setProperty('--voice-level', `${Math.round(smoothed * 92)}%`);
            };

            const tick = (now) => {
              resize();
              if (!isActive()) {
                values.length = 0;
                smoothed = 0.18;
                drawEmpty();
                window.requestAnimationFrame(tick);
                return;
              }
              if (now - lastFrame >= 1000 / 60) {
                lastFrame = now;
                draw((now - startedAt) / 1000);
              }
              window.requestAnimationFrame(tick);
            };

            window.requestAnimationFrame(tick);
          });
        };

        window.addEventListener('load', setupVoiceSpectrumWidgets);
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
          let activeIndex = 9;
          let animationEnabled = true;
          let glowLevel = 0.4;
          let opacityLevel = 1;
          let orbGlowLevel = 1;
          let pulseFrame = null;
          const pulseMs = 4800;

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
            const rest = 0.02;
            const falloff = 0.12;
            const shapedPulse = Math.max(0, Math.min(1, pulse));
            const glowOpacity = opacityLevel * (rest + ((1 - rest) * shapedPulse));
            const strokeOpacity = opacityLevel * (0.05 + (0.95 * shapedPulse));
            const afterglow = Math.max(falloff, shapedPulse);
            brandCap.style.setProperty('--brand-text-glow-opacity', glowOpacity.toFixed(3));
            brandCap.style.setProperty('--brand-stroke-opacity', strokeOpacity.toFixed(3));
            brandCap.style.setProperty('--brand-glow-blur', `${(1 + (7 * shapedPulse)) * glowLevel}px`);
            brandCap.style.setProperty('--brand-glow-blue-shadow', `${(3 + (11 * shapedPulse)) * glowLevel}px`);
            brandCap.style.setProperty('--brand-glow-purple-shadow', `${(6 + (24 * shapedPulse)) * glowLevel}px`);
            brandCap.style.setProperty('--brand-stroke-blue-shadow', `${(1 + (3 * afterglow)) * glowLevel}px`);
            brandCap.style.setProperty('--brand-stroke-purple-shadow', `${(2 + (8 * afterglow)) * glowLevel}px`);
          };

          const animatePulse = (now) => {
            if (!animationEnabled) return;
            const phase = (now % pulseMs) / pulseMs;
            const pulse = Math.pow((Math.sin((phase * Math.PI * 2) - (Math.PI / 2)) + 1) / 2, 2.6);
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
              glowLevel = Math.min(0.4, Number((glowLevel + 0.04).toFixed(2)));
              renderEffect();
              if (!animationEnabled) applyPulse(1);
            });
            glowButton.addEventListener('contextmenu', (event) => {
              event.preventDefault();
              glowLevel = Math.max(0.04, Number((glowLevel - 0.04).toFixed(2)));
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
            note: 'Auto-cycles between hue 30 and 40 when animations are on. Turn animations off to tune hue manually.',
            hueKey: 'droidmaster-accent-hue',
            saturationKey: 'droidmaster-accent-saturation',
            luminosityKey: 'droidmaster-accent-luminosity',
            css: {
              hue: '--accent-h',
              saturation: '--accent-s',
              rgb: '--accent-rgb',
              soft: '--accent-soft-rgb',
              ui: '--accent-ui-rgb',
              muted: '--accent-muted-rgb'
            },
            defaults: { hue: 30, saturation: 82, luminosity: 88 },
            valueProfile: { rgb: 1, soft: .92, ui: .82, muted: .65 }
          }
        };
        const animatedHueRanges = {
          primary: { min: 204, max: 222, halfPeriodMs: 7000 },
          secondary: { min: 30, max: 40, halfPeriodMs: 9000 }
        };

        const targetStorageKey = 'droidmaster-color-target';
        const animationStorageKey = 'droidmaster-animations-enabled';
        const tunerHiddenStorageKey = 'droidmaster-color-tuner-hidden';
        const paletteVersionKey = 'droidmaster-palette-version';
        const paletteVersion = '2026-04-30-primary-204-222-secondary-30-40';
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
          let animationsEnabled = window.localStorage.getItem(animationStorageKey) !== 'false';

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
              animationsEnabled = !animationsEnabled;
              window.localStorage.setItem(animationStorageKey, animationsEnabled ? 'true' : 'false');
              renderAnimationMode();
            });
          }
          renderAnimationMode();
          setOfferGlow(window.localStorage.getItem(offerGlowStorageKey) ?? '72', false);

          const stateByTarget = Object.fromEntries(
            Object.entries(colorTargets).map(([name, target]) => {
              const rawHue = window.localStorage.getItem(target.hueKey);
              const rawSaturation = window.localStorage.getItem(target.saturationKey);
              const rawLuminosity = window.localStorage.getItem(target.luminosityKey);
              const state = setColorState(name, {
                hue: rawHue == null ? target.defaults.hue : rawHue,
                saturation: rawSaturation == null ? target.defaults.saturation : rawSaturation,
                luminosity: rawLuminosity == null ? target.defaults.luminosity : rawLuminosity
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
      // WHAT: Keep FAQ cards conventional while syncing expand and collapse motion.
      (() => {
        const setupFaqAccordion = () => {
          const cards = Array.from(document.querySelectorAll('.faq-card'));
          if (!cards.length) return;

          cards.forEach((card) => {
            const summary = card.querySelector('summary');
            const body = card.querySelector('.faq-card-body');
            if (!summary || !body) return;
            card.classList.toggle('is-open', card.open);
            card.open = true;

            summary.addEventListener('click', (event) => {
              event.preventDefault();
              const shouldOpen = !card.classList.contains('is-open');

              cards.forEach((otherCard) => {
                otherCard.classList.toggle('is-open', otherCard === card && shouldOpen);
              });
            });
          });
        };

        window.addEventListener('load', setupFaqAccordion);
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
      // WHAT: Gives each visible word its own hover glow while leaving FAQ answer content plain.
      (() => {
        const excludedWordGlowSelector = [
          'script',
          'style',
          'svg',
          'canvas',
          'textarea',
          'input',
          'select',
          'option',
          '.faq-card-body',
          '.punchline-word',
          '.text-glow-word',
          '[data-word-glow-skip]',
        ].join(',');
        let wrappingScheduled = false;

        const canWrapTextNode = (node) => {
          if (!node.textContent || !node.textContent.trim()) return false;
          const parent = node.parentElement;
          return Boolean(parent && !parent.closest(excludedWordGlowSelector));
        };

        const wrapTextNode = (node) => {
          if (!canWrapTextNode(node)) return;
          const fragment = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              fragment.appendChild(document.createTextNode(part));
              return;
            }
            const word = document.createElement('span');
            word.className = 'text-glow-word';
            word.textContent = part;
            fragment.appendChild(word);
          });
          node.replaceWith(fragment);
        };

        const wrapVisibleWords = () => {
          wrappingScheduled = false;
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => (canWrapTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
          });
          const nodes = [];
          while (walker.nextNode()) nodes.push(walker.currentNode);
          nodes.forEach(wrapTextNode);
        };

        const scheduleWrap = () => {
          if (wrappingScheduled) return;
          wrappingScheduled = true;
          window.requestAnimationFrame(wrapVisibleWords);
        };

        window.addEventListener('load', () => {
          scheduleWrap();
          const observer = new MutationObserver(scheduleWrap);
          observer.observe(document.body, { childList: true, subtree: true });
        });
      })();
