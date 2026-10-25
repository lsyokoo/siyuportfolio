document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#home .hero-image");
  const image = container?.querySelector("img");

  if (!container || !image) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  // If user prefers reduced motion, keep static image.
  if (prefersReducedMotion) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-dust-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  container.appendChild(canvas);

  const offscreen = document.createElement("canvas");
  const offscreenCtx = offscreen.getContext("2d", {
    willReadFrequently: true
  });
  if (!offscreenCtx) return;

  const SETTINGS = {
    /* Initial dust assembly */
    assembleMaxParticles: 1800,
    assembleSpring: 0.022,
    assembleFriction: 0.86,
    assembleMinSize: 0.7,
    assembleMaxSize: 1.35,
    assembleSettleFrames: 14,

    /* Hover dust brush */
    brushRadius: 26,
    brushSpawnInterval: 22, // ms
    brushParticlesPerStamp: 22,
    brushMinSize: 0.55,
    brushMaxSize: 1.2,

    /* Hover particle motion */
    hoverFriction: 0.95,
    hoverGravity: 0.012,
    hoverMinLife: 18,
    hoverMaxLife: 34
  };

  let dpr = 1;
  let displayWidth = 0;
  let displayHeight = 0;

  let pixelData = null;
  let sourceWidth = 0;
  let sourceHeight = 0;

  let assembleParticles = [];
  let hoverParticles = [];

  let isAssembling = false;
  let settledFrames = 0;

  let rafId = null;
  let clearAfterAssembleTimer = null;

  let lastBrushTime = 0;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function ensureImageReady(callback) {
    if (image.complete && image.naturalWidth > 0) {
      callback();
      return;
    }

    image.addEventListener("load", callback, { once: true });
  }

  function syncCanvasToImage() {
    const imgRect = image.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    displayWidth = imgRect.width;
    displayHeight = imgRect.height;

    if (!displayWidth || !displayHeight) return false;

    canvas.style.left = `${imgRect.left - containerRect.left}px`;
    canvas.style.top = `${imgRect.top - containerRect.top}px`;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sourceWidth = Math.max(1, Math.round(displayWidth));
    sourceHeight = Math.max(1, Math.round(displayHeight));

    offscreen.width = sourceWidth;
    offscreen.height = sourceHeight;

    offscreenCtx.clearRect(0, 0, sourceWidth, sourceHeight);
    offscreenCtx.drawImage(image, 0, 0, sourceWidth, sourceHeight);

    try {
      pixelData = offscreenCtx.getImageData(
        0,
        0,
        sourceWidth,
        sourceHeight
      ).data;
    } catch (error) {
      console.warn("Dust effect unavailable; using static image.", error);
      return false;
    }

    return true;
  }

  function getPixelAt(x, y) {
    const px = clamp(Math.round(x), 0, sourceWidth - 1);
    const py = clamp(Math.round(y), 0, sourceHeight - 1);

    const index = (py * sourceWidth + px) * 4;

    return {
      r: pixelData[index],
      g: pixelData[index + 1],
      b: pixelData[index + 2],
      a: pixelData[index + 3]
    };
  }

  function buildAssembleParticles() {
    assembleParticles = [];
    settledFrames = 0;

    const step = Math.max(
      3,
      Math.floor(
        Math.sqrt((sourceWidth * sourceHeight) / SETTINGS.assembleMaxParticles)
      )
    );

    const centerX = sourceWidth / 2;
    const centerY = sourceHeight / 2;
    const scatterRadius = Math.max(sourceWidth, sourceHeight) * 0.75;

    for (let y = 0; y < sourceHeight; y += step) {
      for (let x = 0; x < sourceWidth; x += step) {
        const jitterX = random(0, step);
        const jitterY = random(0, step);

        const sampleX = Math.min(sourceWidth - 1, Math.floor(x + jitterX));
        const sampleY = Math.min(sourceHeight - 1, Math.floor(y + jitterY));

        const pixel = getPixelAt(sampleX, sampleY);
        if (pixel.a < 72) continue;

        const angle = Math.random() * Math.PI * 2;
        const radius = random(scatterRadius * 0.45, scatterRadius);

        const startX =
          centerX + Math.cos(angle) * radius + random(-28, 28);
        const startY =
          centerY + Math.sin(angle) * radius + random(-28, 28);

        assembleParticles.push({
          x: startX,
          y: startY,
          homeX: sampleX,
          homeY: sampleY,
          vx: 0,
          vy: 0,
          size: random(
            SETTINGS.assembleMinSize,
            SETTINGS.assembleMaxSize
          ),
          color: `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a / 255})`,
          alpha: 0,
          targetAlpha: pixel.a / 255
        });
      }
    }
  }

  function drawDot(x, y, size, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function startLoop() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(loop);
  }

  function stopLoopIfIdle() {
    if (isAssembling || hoverParticles.length > 0) {
      startLoop();
      return;
    }

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    ctx.clearRect(0, 0, displayWidth, displayHeight);
  }

  function loop() {
    rafId = null;

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    let needsNextFrame = false;

    if (isAssembling) {
      let settledCount = 0;

      assembleParticles.forEach((particle) => {
        particle.vx +=
          (particle.homeX - particle.x) * SETTINGS.assembleSpring;
        particle.vy +=
          (particle.homeY - particle.y) * SETTINGS.assembleSpring;

        particle.vx *= SETTINGS.assembleFriction;
        particle.vy *= SETTINGS.assembleFriction;

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.alpha += (particle.targetAlpha - particle.alpha) * 0.11;

        drawDot(
          particle.x,
          particle.y,
          particle.size,
          particle.color,
          particle.alpha
        );

        const distance = Math.hypot(
          particle.homeX - particle.x,
          particle.homeY - particle.y
        );
        const velocity = Math.hypot(particle.vx, particle.vy);

        if (distance < 0.6 && velocity < 0.18) {
          settledCount++;
        }
      });

      needsNextFrame = true;

      if (
        settledCount / Math.max(1, assembleParticles.length) > 0.965
      ) {
        settledFrames++;
      } else {
        settledFrames = 0;
      }

      if (settledFrames >= SETTINGS.assembleSettleFrames) {
        isAssembling = false;
        container.classList.remove("is-dust-loading");

        clearTimeout(clearAfterAssembleTimer);
        clearAfterAssembleTimer = window.setTimeout(() => {
          ctx.clearRect(0, 0, displayWidth, displayHeight);
          stopLoopIfIdle();
        }, 240);
      }
    }

    if (hoverParticles.length > 0) {
      const nextParticles = [];

      hoverParticles.forEach((particle) => {
        particle.life += 1;

        particle.vx *= SETTINGS.hoverFriction;
        particle.vy *= SETTINGS.hoverFriction;
        particle.vy += SETTINGS.hoverGravity;

        particle.x += particle.vx;
        particle.y += particle.vy;

        const progress = particle.life / particle.maxLife;
        if (progress >= 1) return;

        let alpha = 1 - progress;
        if (progress < 0.18) {
          alpha = progress / 0.18;
        }

        drawDot(
          particle.x,
          particle.y,
          particle.size,
          particle.color,
          alpha * particle.baseAlpha
        );

        nextParticles.push(particle);
      });

      hoverParticles = nextParticles;
      needsNextFrame = true;
    }

    if (needsNextFrame) {
      rafId = requestAnimationFrame(loop);
    } else {
      stopLoopIfIdle();
    }
  }

  function beginInitialAssembly() {
    if (!syncCanvasToImage()) return;

    buildAssembleParticles();

    if (!assembleParticles.length) return;

    clearTimeout(clearAfterAssembleTimer);
    hoverParticles = [];

    container.classList.add("is-dust-loading");
    isAssembling = true;

    startLoop();
  }

  function spawnDustBrush(clientX, clientY) {
    if (!finePointer) return;
    if (!pixelData) return;
    if (isAssembling) return;

    const now = performance.now();
    if (now - lastBrushTime < SETTINGS.brushSpawnInterval) return;
    lastBrushTime = now;

    const rect = canvas.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * sourceWidth;
    const localY = ((clientY - rect.top) / rect.height) * sourceHeight;

    for (let i = 0; i < SETTINGS.brushParticlesPerStamp; i++) {
      let attempts = 0;
      let sampleX = localX;
      let sampleY = localY;
      let pixel = null;

      while (attempts < 8) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * SETTINGS.brushRadius;

        sampleX = localX + Math.cos(angle) * radius;
        sampleY = localY + Math.sin(angle) * radius;

        if (
          sampleX < 0 ||
          sampleX >= sourceWidth ||
          sampleY < 0 ||
          sampleY >= sourceHeight
        ) {
          attempts++;
          continue;
        }

        pixel = getPixelAt(sampleX, sampleY);

        if (pixel.a >= 72) break;
        attempts++;
      }

      if (!pixel || pixel.a < 72) continue;

      const dx = sampleX - localX;
      const dy = sampleY - localY;
      const distance = Math.hypot(dx, dy) || 1;

      const dirX = dx / distance;
      const dirY = dy / distance;

      hoverParticles.push({
        x: sampleX,
        y: sampleY,
        vx:
          dirX * random(0.7, 2.2) +
          random(-0.6, 0.6),
        vy:
          dirY * random(0.5, 1.8) -
          random(0.1, 1.0),
        size: random(
          SETTINGS.brushMinSize,
          SETTINGS.brushMaxSize
        ),
        color: `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a / 255})`,
        life: 0,
        maxLife: random(
          SETTINGS.hoverMinLife,
          SETTINGS.hoverMaxLife
        ),
        baseAlpha: random(0.7, 1)
      });
    }

    startLoop();
  }

  function resetDust() {
    clearTimeout(clearAfterAssembleTimer);

    isAssembling = false;
    hoverParticles = [];
    assembleParticles = [];

    container.classList.remove("is-dust-loading");

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (displayWidth && displayHeight) {
      ctx.clearRect(0, 0, displayWidth, displayHeight);
    }
  }

  ensureImageReady(() => {
    beginInitialAssembly();
  });

  if (finePointer) {
    container.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      spawnDustBrush(event.clientX, event.clientY);
    });

    container.addEventListener("pointerleave", () => {
      // Let existing hover particles fade naturally.
    });

    container.addEventListener("pointercancel", () => {
      // Let existing hover particles fade naturally.
    });
  }

  window.addEventListener(
    "resize",
    () => {
      resetDust();
      ensureImageReady(() => {
        beginInitialAssembly();
      });
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      // Don’t replay the full loading animation on scroll,
      // just clear any active hover dust.
      hoverParticles = [];
    },
    { passive: true }
  );

  window.addEventListener("blur", () => {
    hoverParticles = [];
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hoverParticles = [];
    }
  });
});