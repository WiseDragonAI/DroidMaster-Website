/*
 * WHY: The commercial landing page has independent animated surfaces that must not share global state.
 * WHAT: Owns Vite-managed commercial interactions, including the synchronized workspace control demo.
 */

function setupWorkspaceControlDemo(section) {
  const track = section.querySelector("[data-workspace-track]");
  const slides = Array.from(section.querySelectorAll("[data-workspace-slide]"));
  const keys = Array.from(section.querySelectorAll("[data-control-key]"));
  const voice = section.querySelector("[data-voice-widget]");
  const webview = section.querySelector("[data-workspace-webview]");
  const webviewLogo = section.querySelector("[data-side-project-logo]");
  const status = section.querySelector("[data-control-status]");
  const stepLabel = section.querySelector("[data-control-step]");
  if (!track || !slides.length || !keys.length || !voice) return null;

  const state = {
    workspaceIndex: 0,
    columnIndex: 0,
    voiceActive: false,
    skeletonCount: 0,
    scrollByColumn: new Map(),
    key: "",
    step: "ready",
  };
  const scrollStepPx = 48;
  const maxScrollPx = 288;

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
  const activeColumns = () => Array.from(slides[state.workspaceIndex].querySelectorAll("[data-workspace-column]"));
  const columnKey = () => `${state.workspaceIndex}:${state.columnIndex}`;
  const skeletonMarkup = "<span></span><span></span><span></span>";
  const focusedColumn = () => activeColumns()[state.columnIndex];
  const canScrollColumn = (column) => {
    const stack = column && column.querySelector(".workspace-chat-stack");
    return Boolean(column && column.dataset.staticColumn !== "true" && stack && stack.children.length > 0);
  };
  const appendSeedSkeleton = (stack) => {
    const skeleton = document.createElement("div");
    skeleton.className = "workspace-skeleton";
    skeleton.dataset.seeded = "true";
    skeleton.innerHTML = skeletonMarkup;
    stack.appendChild(skeleton);
  };
  const appendGeneratedImageCard = (stack) => {
    const card = document.createElement("div");
    card.className = "workspace-image-card workspace-image-card--conversation workspace-image-card--generated";
    card.innerHTML = "<img src='/assets/photos/software-developer-at-work.jpg' alt='Generated concept image' />";
    stack.appendChild(card);
  };
  const appendLoaderCard = (stack, scrollKey) => {
    const loader = document.createElement("div");
    loader.className = "workspace-loader-card";
    loader.innerHTML = "<span class='workspace-loader-ring'></span><span class='workspace-loader-line'></span>";
    stack.appendChild(loader);
    state.scrollByColumn.set(scrollKey, 0);
    render();
    window.setTimeout(() => {
      loader.remove();
      appendGeneratedImageCard(stack);
      state.scrollByColumn.set(scrollKey, 0);
      render();
    }, 1150);
  };
  const triggerWebviewReload = () => {
    if (!webview) return;
    webview.dataset.reloading = "true";
    webview.dataset.changed = "false";
    window.setTimeout(() => {
      webview.dataset.reloading = "false";
      webview.dataset.changed = "true";
      if (webviewLogo) webviewLogo.src = "/assets/droids/droid_bb8.png";
      state.step = "Side project preview updated";
      render();
    }, 1050);
  };
  const resetState = () => {
    state.workspaceIndex = 0;
    state.columnIndex = 0;
    state.voiceActive = false;
    state.skeletonCount = 0;
    state.scrollByColumn = new Map();
    state.key = "";
    state.step = "ready";
    if (webview) {
      webview.dataset.reloading = "false";
      webview.dataset.changed = "false";
    }
    if (webviewLogo) webviewLogo.src = "/assets/droids/droid_grievous.png";
  };

  const seedColumnSkeletons = () => {
    slides.forEach((slide) => {
      Array.from(slide.querySelectorAll("[data-workspace-column]")).forEach((column, columnIndex) => {
        if (column.dataset.staticColumn === "true") return;
        const existingStack = column.querySelector(".workspace-chat-stack");
        const imageCard = column.querySelector(".workspace-image-card");
        if (existingStack) {
          if (imageCard) column.appendChild(imageCard);
          column.querySelector(".workspace-chat-viewport")?.remove();
        }
        const viewport = document.createElement("div");
        viewport.className = "workspace-chat-viewport";
        const stack = document.createElement("div");
        stack.className = "workspace-chat-stack";
        const sourceImageCard = column.querySelector(":scope > .workspace-image-card");
        const rows = 6 + (columnIndex % 2);
        const imageIndex = Math.max(1, rows - 2);
        for (let index = 0; index < rows; index += 1) {
          if (sourceImageCard && index === imageIndex) {
            sourceImageCard.classList.add("workspace-image-card--conversation");
            stack.appendChild(sourceImageCard);
          }
          appendSeedSkeleton(stack);
        }
        if (sourceImageCard && sourceImageCard.parentElement !== stack) stack.appendChild(sourceImageCard);
        viewport.appendChild(stack);
        column.appendChild(viewport);
      });
    });
  };

  const render = () => {
    track.style.transform = `translateY(-${state.workspaceIndex * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      slide.dataset.active = slideIndex === state.workspaceIndex ? "true" : "false";
      Array.from(slide.querySelectorAll("[data-workspace-column]")).forEach((column, columnIndex) => {
        const focused = slideIndex === state.workspaceIndex && columnIndex === state.columnIndex;
        column.classList.toggle("workspace-column--focus", focused);
        column.dataset.focused = focused ? "true" : "false";
        const scrollKey = `${slideIndex}:${columnIndex}`;
        const viewport = column.querySelector(".workspace-chat-viewport");
        if (viewport) {
          const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
          const historyOffset = clamp(state.scrollByColumn.get(scrollKey) || 0, 0, maxScroll);
          state.scrollByColumn.set(scrollKey, historyOffset);
          viewport.scrollTo({ top: maxScroll - historyOffset, behavior: "smooth" });
        }
      });
    });
    keys.forEach((key) => {
      key.dataset.active = "false";
    });
    voice.dataset.active = state.voiceActive ? "true" : "false";
    if (status) status.textContent = state.step;
    if (stepLabel) stepLabel.textContent = state.key ? `KEY ${state.key.toUpperCase()}` : "READY";
  };

  const addConversationCard = () => {
    const column = focusedColumn();
    if (!column || column.dataset.staticColumn === "true") return null;
    let viewport = column.querySelector(".workspace-chat-viewport");
    if (!viewport) {
      viewport = document.createElement("div");
      viewport.className = "workspace-chat-viewport";
      column.appendChild(viewport);
    }
    let stack = viewport.querySelector(".workspace-chat-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "workspace-chat-stack";
      viewport.appendChild(stack);
    }
    const skeleton = document.createElement("div");
    skeleton.className = "workspace-skeleton workspace-skeleton--prompt";
    skeleton.innerHTML = skeletonMarkup;
    stack.appendChild(skeleton);
    state.skeletonCount += 1;
    state.scrollByColumn.set(columnKey(), 0);
    return { column, stack, card: skeleton };
  };

  const handleVoiceNoteSent = (result) => {
    if (!result) return;
    if (state.workspaceIndex === 2) {
      state.step = "Side project update requested";
      triggerWebviewReload();
      return;
    }
    state.step = "Image generation started";
    window.setTimeout(() => appendLoaderCard(result.stack, columnKey()), 980);
  };

  const pulseKey = (keyName) => {
    const keyNode = keys.find((candidate) => candidate.dataset.controlKey === keyName);
    if (!keyNode) return;
    keyNode.dataset.pulse = "false";
    void keyNode.offsetWidth;
    keyNode.dataset.pulse = "true";
    window.setTimeout(() => {
      if (keyNode.dataset.pulse === "true") {
        keyNode.dataset.pulse = "false";
      }
    }, 340);
  };

  const applyKey = (key) => {
    state.key = key;
    if (key === "a") {
      state.columnIndex = clamp(state.columnIndex - 1, 0, activeColumns().length - 1);
      state.step = "Column focus moved left";
    }
    if (key === "d") {
      state.columnIndex = clamp(state.columnIndex + 1, 0, activeColumns().length - 1);
      state.step = "Column focus moved right";
    }
    if (key === "w") {
      state.workspaceIndex = clamp(state.workspaceIndex - 1, 0, slides.length - 1);
      state.columnIndex = clamp(state.columnIndex, 0, activeColumns().length - 1);
      state.step = "Workspace switched up";
    }
    if (key === "s") {
      state.workspaceIndex = clamp(state.workspaceIndex + 1, 0, slides.length - 1);
      state.columnIndex = clamp(state.columnIndex, 0, activeColumns().length - 1);
      state.step = "Workspace switched down";
    }
    if (key === "r") {
      state.voiceActive = !state.voiceActive;
      state.step = state.voiceActive ? "Voice activated" : "Voice stopped, prompt card inserted";
      if (!state.voiceActive) handleVoiceNoteSent(addConversationCard());
    }
    if (key === "q" || key === "e") {
      const column = focusedColumn();
      if (!canScrollColumn(column)) {
        state.step = "Focused surface has no chat scroll";
        render();
        pulseKey(key);
        return;
      }
      const viewport = column.querySelector(".workspace-chat-viewport");
      const maxScroll = viewport ? Math.max(0, viewport.scrollHeight - viewport.clientHeight) : maxScrollPx;
      const nextScroll = clamp((state.scrollByColumn.get(columnKey()) || 0) + (key === "q" ? scrollStepPx : -scrollStepPx), 0, Math.min(maxScrollPx, maxScroll));
      state.scrollByColumn.set(columnKey(), nextScroll);
      state.step = key === "q" ? "Focused chat scrolled up" : "Focused chat scrolled down";
    }
    render();
    pulseKey(key);
  };

  const play = () => {
    const sequence = [
      "q", "q", "q", "q",
      "d", "r", "r",
      "s", "r", "r",
      "s", "r", "r",
      "w", "w",
    ];
    let index = 0;
    const advance = () => {
      if (index === 0) {
        resetState();
        seedColumnSkeletons();
        render();
      }
      const key = sequence[index];
      const nextKey = sequence[(index + 1) % sequence.length];
      applyKey(key);
      index = (index + 1) % sequence.length;
      const delay = key === "r" && nextKey === "r" ? 1800 : key === "r" ? 2300 : key === "q" && nextKey === "q" ? 230 : index === 0 ? 1300 : 620;
      window.setTimeout(advance, delay);
    };
    window.setTimeout(advance, 500);
  };

  section.addEventListener("click", (event) => {
    const target = event.target.closest("[data-control-key]");
    if (!target) return;
    applyKey(target.dataset.controlKey);
  });

  window.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLElement) {
      const tag = target.tagName;
      if (target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    }
    const key = event.key.toLowerCase();
    if (!["q", "w", "e", "r", "a", "s", "d"].includes(key)) return;
    event.preventDefault();
    applyKey(key);
  });

  seedColumnSkeletons();
  render();
  play();
  return { applyKey };
}

window.DroidMasterCommercial = {
  ...(window.DroidMasterCommercial || {}),
  setupWorkspaceControlDemo,
};
