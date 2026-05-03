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
  const webviewImage = section.querySelector("[data-workspace-webview-image]");
  const status = section.querySelector("[data-control-status]");
  const stepLabel = section.querySelector("[data-control-step]");
  if (!track || !slides.length || !keys.length || !voice) return null;

  const state = {
    workspaceIndex: 0,
    columnIndex: 1,
    voiceActive: false,
    skeletonCount: 0,
    scrollByColumn: new Map(),
    key: "",
    step: "Ready",
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
  const generatedImageForWorkspace = (workspaceIndex) => {
    if (workspaceIndex !== 0) return null;
    return {
      src: "/assets/lore/rick-and-morty/rick-and-morty-air-force-wong.png",
      alt: "Generated Rick and Morty image concept",
    };
  };
  const getOrCreateStack = (column) => {
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
    return stack;
  };
  const appendGeneratedImageCard = (stack, workspaceIndex) => {
    const image = generatedImageForWorkspace(workspaceIndex);
    if (!image) return;
    const card = document.createElement("div");
    card.className = "workspace-image-card workspace-image-card--conversation workspace-image-card--generated";
    card.innerHTML = `<img src='${image.src}' alt='${image.alt}' />`;
    stack.appendChild(card);
  };
  const appendGeneratedDiffCard = (stack) => {
    const card = document.createElement("div");
    card.className = "workspace-diff-card workspace-diff-card--conversation workspace-diff-card--generated";
    card.innerHTML = `
      <span class='workspace-diff-line workspace-diff-line--remove workspace-diff-line--long'></span>
      <span class='workspace-diff-line workspace-diff-line--add workspace-diff-line--mid'></span>
      <span class='workspace-diff-line workspace-diff-line--add workspace-diff-line--long'></span>
      <span class='workspace-diff-line workspace-diff-line--remove workspace-diff-line--short'></span>
      <span class='workspace-diff-line workspace-diff-line--add workspace-diff-line--mid'></span>
    `;
    stack.appendChild(card);
  };
  const appendLoaderCard = (stack, scrollKey, onComplete) => {
    const loader = document.createElement("div");
    loader.className = "workspace-loader-card";
    loader.innerHTML = "<span class='workspace-loader-ring'></span><span class='workspace-loader-line'></span>";
    stack.appendChild(loader);
    state.scrollByColumn.set(scrollKey, 0);
    render();
    window.setTimeout(() => {
      loader.remove();
      onComplete?.();
      state.scrollByColumn.set(scrollKey, 0);
      render();
    }, 1150);
  };
  const triggerWebviewReload = (image) => {
    if (!webview) return;
    webview.dataset.reloading = "true";
    webview.dataset.changed = "false";
    window.setTimeout(() => {
      webview.dataset.reloading = "false";
      webview.dataset.changed = "true";
      if (webviewImage && image) {
        webviewImage.src = image.src;
        webviewImage.alt = image.alt;
      }
      state.step = "Fan site hero updated";
      render();
    }, 1050);
  };
  const resetState = () => {
    state.workspaceIndex = 0;
    state.columnIndex = 1;
    state.voiceActive = false;
    state.skeletonCount = 0;
    state.scrollByColumn = new Map();
    state.key = "";
    state.step = "Ready";
    if (webview) {
      webview.dataset.reloading = "false";
      webview.dataset.changed = "false";
    }
    if (webviewImage) {
      webviewImage.src = "/assets/lore/rick-and-morty/rick-and-morty-s08e01.jpg";
      webviewImage.alt = "Rick and Morty blog hero art";
    }
  };

  const seedColumnSkeletons = () => {
    slides.forEach((slide) => {
      Array.from(slide.querySelectorAll("[data-workspace-column]")).forEach((column, columnIndex) => {
        if (column.dataset.staticColumn === "true") return;
        const existingStack = column.querySelector(".workspace-chat-stack");
        const sourceCard = column.querySelector(".workspace-image-card, .workspace-diff-card");
        if (existingStack) {
          if (sourceCard) column.appendChild(sourceCard);
          column.querySelector(".workspace-chat-viewport")?.remove();
        }
        const viewport = document.createElement("div");
        viewport.className = "workspace-chat-viewport";
        const stack = document.createElement("div");
        stack.className = "workspace-chat-stack";
        const conversationCard = column.querySelector(":scope > .workspace-image-card, :scope > .workspace-diff-card");
        const rows = 6 + (columnIndex % 2);
        const imageIndex = Math.max(1, rows - 2);
        for (let index = 0; index < rows; index += 1) {
          if (conversationCard && index === imageIndex) {
            if (conversationCard.classList.contains("workspace-image-card")) {
              conversationCard.classList.add("workspace-image-card--conversation");
            }
            if (conversationCard.classList.contains("workspace-diff-card")) {
              conversationCard.classList.add("workspace-diff-card--conversation");
            }
            stack.appendChild(conversationCard);
          }
          appendSeedSkeleton(stack);
        }
        if (conversationCard && conversationCard.parentElement !== stack) stack.appendChild(conversationCard);
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
    const stack = getOrCreateStack(column);
    if (!column || !stack) return null;
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
      const originColumn = result.column;
      const originKey = columnKey();
      state.step = "Droid launched";
      appendLoaderCard(result.stack, originKey, () => {
        appendGeneratedDiffCard(result.stack);
        state.step = "First droid finished";
        render();
      });
      window.setTimeout(() => {
        state.columnIndex = clamp(state.columnIndex + 1, 0, activeColumns().length - 1);
        state.step = "Switched to next column";
        render();
      }, 260);
      window.setTimeout(() => {
        const nextColumn = focusedColumn();
        if (!nextColumn || nextColumn === originColumn) return;
        const nextStack = getOrCreateStack(nextColumn);
        if (!nextStack) return;
        const nextPrompt = document.createElement("div");
        nextPrompt.className = "workspace-skeleton workspace-skeleton--prompt";
        nextPrompt.innerHTML = skeletonMarkup;
        nextStack.appendChild(nextPrompt);
        const nextKey = columnKey();
        state.scrollByColumn.set(nextKey, 0);
        state.step = "Second droid request sent";
        render();
        window.setTimeout(() => appendLoaderCard(nextStack, nextKey, () => {
          appendGeneratedDiffCard(nextStack);
          state.step = "Parallel droids completed";
          render();
        }), 280);
      }, 520);
      render();
      return;
    }
    if (state.workspaceIndex === 1) {
      state.step = "Patch generation started";
      window.setTimeout(() => appendLoaderCard(result.stack, columnKey(), () => {
        appendGeneratedDiffCard(result.stack);
        state.step = "Patch generated";
      }), 980);
      return;
    }
    state.step = "Image generation started";
    window.setTimeout(() => appendLoaderCard(result.stack, columnKey(), () => {
      const image = generatedImageForWorkspace(state.workspaceIndex);
      appendGeneratedImageCard(result.stack, state.workspaceIndex);
      triggerWebviewReload(image);
    }), 980);
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
      state.step = "Column moved left";
    }
    if (key === "d") {
      state.columnIndex = clamp(state.columnIndex + 1, 0, activeColumns().length - 1);
      state.step = "Column moved right";
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
      if (state.voiceActive) {
        state.step =
          state.workspaceIndex === 0 ? "Design image prompt recorded" :
          state.workspaceIndex === 1 ? "Patch request recorded" :
          "Creative note recorded";
      } else {
        state.step =
          state.workspaceIndex === 0 ? "Design prompt submitted" :
          state.workspaceIndex === 1 ? "Patch prompt submitted" :
          "Creative note submitted";
      }
      if (!state.voiceActive) handleVoiceNoteSent(addConversationCard());
    }
    if (key === "q" || key === "e") {
      const column = focusedColumn();
      if (!canScrollColumn(column)) {
        state.step = "No scrollable history";
        render();
        pulseKey(key);
        return;
      }
      const viewport = column.querySelector(".workspace-chat-viewport");
      const maxScroll = viewport ? Math.max(0, viewport.scrollHeight - viewport.clientHeight) : maxScrollPx;
      const nextScroll = clamp((state.scrollByColumn.get(columnKey()) || 0) + (key === "q" ? scrollStepPx : -scrollStepPx), 0, Math.min(maxScrollPx, maxScroll));
      state.scrollByColumn.set(columnKey(), nextScroll);
      state.step =
        state.workspaceIndex === 0
          ? (key === "q" ? "Design chat scrolled up" : "Design chat scrolled down")
          : state.workspaceIndex === 1
            ? (key === "q" ? "Patch history scrolled up" : "Patch history scrolled down")
            : (key === "q" ? "Creative queue scrolled up" : "Creative queue scrolled down");
    }
    render();
    pulseKey(key);
  };

  const play = () => {
    const sequence = [
      "q", "q", "q", "q",
      "r", "r",
      "s", "q", "r", "r",
      "s", "r", "r",
      "w", "w",
    ];
    let index = 0;
    let loopResetPrepared = false;
    const advance = () => {
      if (index === 0) {
        if (loopResetPrepared) {
          loopResetPrepared = false;
        } else {
          resetState();
          seedColumnSkeletons();
          render();
        }
      }
      const key = sequence[index];
      const nextKey = sequence[(index + 1) % sequence.length];
      if (index === sequence.length - 1 && key === "w") {
        resetState();
        state.workspaceIndex = 1;
        seedColumnSkeletons();
        render();
        loopResetPrepared = true;
      }
      applyKey(key);
      const greenImagePause = key === "r" && state.workspaceIndex === 0 && state.voiceActive === false;
      const bluePatchPause = key === "r" && state.workspaceIndex === 1 && state.voiceActive === false;
      index = (index + 1) % sequence.length;
      const delay = greenImagePause ? 4180 : bluePatchPause ? 3130 : key === "r" && nextKey === "r" ? 1800 : key === "r" ? 2300 : key === "q" && nextKey === "q" ? 230 : index === 0 ? 1300 : 620;
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
