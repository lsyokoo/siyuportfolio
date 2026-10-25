
document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     HERO WATER RIPPLE
     Opening ripple + interactive refraction
  ===================================================== */

  const container = document.querySelector("#home .hero-image");
  const image = container?.querySelector(".hero-image-base");

  if (!container || !image) return;

  const pointerMedia = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const motionMedia = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (motionMedia.matches) return;

  /* =====================================================
     SETTINGS
  ===================================================== */

  const SETTINGS = {
    resolution: 0.85,
    strength: 5.5,
    speed: 0.115,
    waveWidth: 19,
    duration: 2400, 

    spawnInterval: 105,
    spawnDistance: 24,
    maxWaves: 4,
    frameInterval: 1000 / 30,

    // Opening animation — plays once
    openingEnabled: true,
    openingStrength: 0.75,
    openingStartDelay: 600, // 0.6s
openingSecondWaveDelay: 280
  };

  /* =====================================================
     CANVAS SETUP
  ===================================================== */

  const canvas = document.createElement("canvas");
  canvas.className = "hero-water-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const context = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: true
  });

  if (!context) return;

  container.appendChild(canvas);

  const sourceCanvas = document.createElement("canvas");

  const sourceContext = sourceCanvas.getContext("2d", {
    willReadFrequently: true
  });

  if (!sourceContext) {
    canvas.remove();
    return;
  }

  let sourcePixels = null;
  let framePixels = null;

  let width = 0;
  let height = 0;

  let waves = [];
  let animationFrame = null;
  let lastFrameTime = 0;

  let lastSpawnTime = 0;
  let lastSpawnX = null;
  let lastSpawnY = null;

  let openingTimer = null;
  let openingPlayed = false;

  let available = false;

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  /* =====================================================
     READ ORIGINAL IMAGE
  ===================================================== */

  function prepareImage() {
    if (!image.complete || !image.naturalWidth) {
      return false;
    }

    const rect = image.getBoundingClientRect();
    const parentRect = container.getBoundingClientRect();

    if (!rect.width || !rect.height) return false;

    width = Math.max(
      1,
      Math.round(rect.width * SETTINGS.resolution)
    );

    height = Math.max(
      1,
      Math.round(rect.height * SETTINGS.resolution)
    );

    canvas.width = width;
    canvas.height = height;

    canvas.style.left =
      `${rect.left - parentRect.left}px`;

    canvas.style.top =
      `${rect.top - parentRect.top}px`;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    sourceCanvas.width = width;
    sourceCanvas.height = height;

    sourceContext.clearRect(0, 0, width, height);
    sourceContext.drawImage(image, 0, 0, width, height);

    try {
      sourcePixels = sourceContext.getImageData(
        0, 0, width, height
      ).data;

      framePixels = context.createImageData(
        width,
        height
      );

      available = true;
      return true;

    } catch (error) {
      console.warn(
        "Water ripple unavailable; original image remains visible.",
        error
      );

      available = false;
      return false;
    }
  }

  /* =====================================================
     ADD WAVE
  ===================================================== */

  function addWave(x, y, time, intensity = 1) {
    if (!available) return;

    waves.push({
      x,
      y,
      startTime: time,
      intensity
    });

    if (waves.length > SETTINGS.maxWaves) {
      waves.shift();
    }

    startAnimation();
  }

  function addWaveFromPointer(clientX, clientY, time) {
    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x =
      ((clientX - rect.left) / rect.width) * width;

    const y =
      ((clientY - rect.top) / rect.height) * height;

    if (
      x < 0 || x > width ||
      y < 0 || y > height
    ) {
      return;
    }

    addWave(x, y, time, 1);
  }

  /* =====================================================
     RENDER REFRACTION
  ===================================================== */

  function render(time) {
    if (!available || !sourcePixels || !framePixels) {
      return;
    }

    const output = framePixels.data;
    output.fill(0);

    const scale = SETTINGS.resolution;

    const waveWidth = SETTINGS.waveWidth * scale;
    const strength = SETTINGS.strength * scale;
    const waveSpeed = SETTINGS.speed * scale;

    const activeWaves = [];

    for (const wave of waves) {
      const age = time - wave.startTime;

      if (age < 0 || age >= SETTINGS.duration) {
        continue;
      }

      activeWaves.push(wave);

      const progress = age / SETTINGS.duration;
      const radius = age * waveSpeed;
      const fade = Math.pow(1 - progress, 1.5);

      const waveStrength =
        strength * wave.intensity;

      const extent =
        radius + waveWidth * 2.5 + waveStrength;

      const minX = clamp(
        Math.floor(wave.x - extent),
        0,
        width - 1
      );

      const maxX = clamp(
        Math.ceil(wave.x + extent),
        0,
        width - 1
      );

      const minY = clamp(
        Math.floor(wave.y - extent),
        0,
        height - 1
      );

      const maxY = clamp(
        Math.ceil(wave.y + extent),
        0,
        height - 1
      );

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const dx = x - wave.x;
          const dy = y - wave.y;

          const distance = Math.hypot(dx, dy);

          if (distance < 0.001) continue;

          const delta = distance - radius;

          const envelope = Math.exp(
            -(delta * delta) /
            (2 * waveWidth * waveWidth)
          );

          if (envelope < 0.012) continue;

          const phase = delta * 0.28;

          const displacement =
            Math.cos(phase) *
            envelope *
            waveStrength *
            fade;

          if (Math.abs(displacement) < 0.08) {
            continue;
          }

          const directionX = dx / distance;
          const directionY = dy / distance;

          const sampleX = clamp(
            Math.round(
              x + directionX * displacement
            ),
            0,
            width - 1
          );

          const sampleY = clamp(
            Math.round(
              y + directionY * displacement
            ),
            0,
            height - 1
          );

          const sourceIndex =
            (sampleY * width + sampleX) * 4;

          const targetIndex =
            (y * width + x) * 4;

          output[targetIndex] = sourcePixels[sourceIndex];
          output[targetIndex + 1] = sourcePixels[sourceIndex + 1];
          output[targetIndex + 2] = sourcePixels[sourceIndex + 2];

          const blend = Math.min(
            1,
            Math.abs(displacement) / 1.8
          );

          output[targetIndex + 3] =
            sourcePixels[sourceIndex + 3] * blend;
        }
      }
    }

    waves = activeWaves;

    context.clearRect(0, 0, width, height);

    if (waves.length) {
      context.putImageData(framePixels, 0, 0);
    }
  }

  /* =====================================================
     ANIMATION LOOP
  ===================================================== */

  function animate(time) {
    animationFrame = null;

    if (!waves.length) {
      context.clearRect(0, 0, width, height);
      return;
    }

    if (
      time - lastFrameTime >= SETTINGS.frameInterval
    ) {
      lastFrameTime = time;
      render(time);
    }

    if (waves.length) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      context.clearRect(0, 0, width, height);
    }
  }

  function startAnimation() {
    if (animationFrame !== null) return;

    animationFrame = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    waves = [];

    if (width && height) {
      context.clearRect(0, 0, width, height);
    }
  }

  /* =====================================================
     OPENING WATER RIPPLE
     Runs only once after image is ready
  ===================================================== */

  function playOpeningRipple() {
    if (
      openingPlayed ||
      !SETTINGS.openingEnabled ||
      !available ||
      motionMedia.matches ||
      document.hidden
    ) {
      return;
    }

    openingPlayed = true;

    const now = performance.now();

    // Gentle first touch near the artwork center
    addWave(
      width * 0.43,
      height * 0.48,
      now,
      SETTINGS.openingStrength
    );

    // A softer second wave creates an organic feel
    openingTimer = window.setTimeout(() => {
      openingTimer = null;

      if (
        !available ||
        motionMedia.matches ||
        document.hidden
      ) {
        return;
      }

      addWave(
        width * 0.61,
        height * 0.57,
        performance.now(),
        SETTINGS.openingStrength * 0.65
      );

    }, SETTINGS.openingSecondWaveDelay);
  }

  function cancelOpeningTimer() {
    if (openingTimer !== null) {
      clearTimeout(openingTimer);
      openingTimer = null;
    }
  }

  /* =====================================================
     MOUSE INTERACTION
  ===================================================== */

  function handlePointerEnter(event) {
    if (!pointerMedia.matches || motionMedia.matches) {
      return;
    }

    if (event.pointerType !== "mouse") return;
    if (!available) return;

    cancelOpeningTimer();

    lastSpawnX = null;
    lastSpawnY = null;
    lastSpawnTime = performance.now();

    addWaveFromPointer(
      event.clientX,
      event.clientY,
      lastSpawnTime
    );
  }

  function handlePointerMove(event) {
    if (!pointerMedia.matches || motionMedia.matches) {
      return;
    }

    if (event.pointerType !== "mouse") return;
    if (!available) return;

    const now = performance.now();

    if (
      now - lastSpawnTime < SETTINGS.spawnInterval
    ) {
      return;
    }

    const rect = image.getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      return;
    }

    if (
      lastSpawnX !== null &&
      lastSpawnY !== null
    ) {
      const distance = Math.hypot(
        event.clientX - lastSpawnX,
        event.clientY - lastSpawnY
      );

      if (distance < SETTINGS.spawnDistance) {
        return;
      }
    }

    cancelOpeningTimer();

    lastSpawnTime = now;
    lastSpawnX = event.clientX;
    lastSpawnY = event.clientY;

    addWaveFromPointer(
      event.clientX,
      event.clientY,
      now
    );
  }

  /* =====================================================
     INITIALIZATION
  ===================================================== */

function initialize() {
  if (!prepareImage()) return;

  window.setTimeout(() => {
    if (!motionMedia.matches && !document.hidden) {
      playOpeningRipple();
    }
  }, SETTINGS.openingStartDelay);
}

  if (image.complete && image.naturalWidth) {
    initialize();
  } else {
    image.addEventListener(
      "load",
      initialize,
      { once: true }
    );
  }

  container.addEventListener(
    "pointerenter",
    handlePointerEnter
  );

  container.addEventListener(
    "pointermove",
    handlePointerMove
  );

  container.addEventListener("pointerleave", () => {
    lastSpawnX = null;
    lastSpawnY = null;
  });

  /* =====================================================
     CLEANUP
  ===================================================== */

  window.addEventListener(
    "resize",
    () => {
      cancelOpeningTimer();
      stopAnimation();
      prepareImage();
      // No replay on resize.
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      cancelOpeningTimer();
      stopAnimation();
    },
    { passive: true }
  );

  window.addEventListener("blur", () => {
    cancelOpeningTimer();
    stopAnimation();
  });

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        cancelOpeningTimer();
        stopAnimation();
      }
    }
  );

  motionMedia.addEventListener("change", (event) => {
    if (event.matches) {
      cancelOpeningTimer();
      stopAnimation();
    }
  });
});
