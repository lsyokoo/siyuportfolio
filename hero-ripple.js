
document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     HERO — NATURAL WATER REFRACTION
  ===================================================== */

  const image = document.querySelector(
    "#home .hero-image-base"
  );

  const container = image?.closest(".hero-image");

  if (!image || !container) return;

  const hover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (reducedMotion.matches) return;

  /* SETTINGS */

  const settings = {
    resolution: 0.85,
    strength: 5.5,
    speed: 0.115,
    waveWidth: 19,
    duration: 2400,

    maxWaves: 5,
    spawnInterval: 85,
    frameInterval: 1000 / 30,

    openingDelay: 600,
    secondWaveDelay: 280
  };

  /* CANVAS SETUP */

  const canvas = document.createElement("canvas");
  canvas.className = "hero-water-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.pointerEvents = "none";

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });

  const source = document.createElement("canvas");

  const sourceCtx = source.getContext("2d", {
    willReadFrequently: true
  });

  if (!ctx || !sourceCtx) return;

  container.append(canvas);

  let w = 0;
  let h = 0;

  let pixels = null;
  let frame = null;

  let waves = [];
  let raf = null;

  let lastDraw = -Infinity;
  let lastSpawn = -Infinity;

  let openingTimer = null;
  let secondTimer = null;

  let openingPlayed = false;
  let interacted = false;

  let lastClientX = null;
  let lastClientY = null;

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  /* CLEAR / STOP */

  function clear() {
    if (w && h) {
      ctx.clearRect(0, 0, w, h);
    }
  }

  function stop() {
    if (raf !== null) {
      cancelAnimationFrame(raf);
    }

    raf = null;
    waves = [];
    lastDraw = -Infinity;

    clear();
  }

  function cancelOpening() {
    clearTimeout(openingTimer);
    clearTimeout(secondTimer);

    openingTimer = null;
    secondTimer = null;
  }

  /* SYNCHRONIZE IMAGE */

  function syncImage() {
    if (!image.complete || !image.naturalWidth) {
      return false;
    }

    const bounds = image.getBoundingClientRect();
    const host = container.getBoundingClientRect();

    if (bounds.width < 1 || bounds.height < 1) {
      return false;
    }

    canvas.style.left =
      `${bounds.left - host.left}px`;

    canvas.style.top =
      `${bounds.top - host.top}px`;

    canvas.style.width = `${bounds.width}px`;
    canvas.style.height = `${bounds.height}px`;

    const nextWidth = Math.max(
      1,
      Math.round(bounds.width * settings.resolution)
    );

    const nextHeight = Math.max(
      1,
      Math.round(bounds.height * settings.resolution)
    );

    // Reuse existing pixels when image size is unchanged.
    if (
      pixels &&
      w === nextWidth &&
      h === nextHeight
    ) {
      return true;
    }

    stop();

    w = nextWidth;
    h = nextHeight;

    canvas.width = w;
    canvas.height = h;

    source.width = w;
    source.height = h;

    try {
      sourceCtx.clearRect(0, 0, w, h);
      sourceCtx.drawImage(image, 0, 0, w, h);

      pixels = sourceCtx.getImageData(
        0, 0, w, h
      ).data;

      frame = ctx.createImageData(w, h);

      return true;

    } catch (error) {
      console.warn(
        "Water ripple disabled: could not read image pixels.",
        error
      );

      pixels = null;
      frame = null;

      return false;
    }
  }

  /* CREATE WATER WAVE */

  function ripple(x, y, intensity = 1) {
    if (
      !pixels ||
      document.hidden ||
      reducedMotion.matches
    ) {
      return;
    }

    waves.push({
      x,
      y,
      intensity,
      born: performance.now()
    });

    if (waves.length > settings.maxWaves) {
      waves.shift();
    }

    if (raf === null) {
      raf = requestAnimationFrame(tick);
    }
  }

  /* RIPPLE AT CURSOR */

  function rippleFromPointer(event) {
    if (!syncImage()) return;

    const rect = image.getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      return;
    }

    const x = clamp(
      (event.clientX - rect.left) / rect.width * w,
      0,
      w - 1
    );

    const y = clamp(
      (event.clientY - rect.top) / rect.height * h,
      0,
      h - 1
    );

    ripple(x, y);
  }

  /* RENDER REFRACTION */

  function draw(time) {
    const result = frame.data;
    result.fill(0);

    const scale = settings.resolution;
    const spread = settings.waveWidth * scale;
    const strength = settings.strength * scale;
    const speed = settings.speed * scale;

    for (const wave of waves) {
      const age = time - wave.born;

      if (age < 0 || age >= settings.duration) {
        continue;
      }

      const radius = age * speed;

      const fade = Math.pow(
        1 - age / settings.duration,
        1.5
      );

      const power = strength * wave.intensity;

      const area =
        radius + spread * 2.5 + power;

      const minX = clamp(
        Math.floor(wave.x - area),
        0, w - 1
      );

      const maxX = clamp(
        Math.ceil(wave.x + area),
        0, w - 1
      );

      const minY = clamp(
        Math.floor(wave.y - area),
        0, h - 1
      );

      const maxY = clamp(
        Math.ceil(wave.y + area),
        0, h - 1
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
            (2 * spread * spread)
          );

          if (envelope < 0.012) continue;

          const displacement =
            Math.cos(delta * 0.28) *
            envelope *
            power *
            fade;

          if (Math.abs(displacement) < 0.08) {
            continue;
          }

          const sampleX = clamp(
            Math.round(
              x + dx / distance * displacement
            ),
            0, w - 1
          );

          const sampleY = clamp(
            Math.round(
              y + dy / distance * displacement
            ),
            0, h - 1
          );

          const from =
            (sampleY * w + sampleX) * 4;

          const to =
            (y * w + x) * 4;

          result[to] = pixels[from];
          result[to + 1] = pixels[from + 1];
          result[to + 2] = pixels[from + 2];

          result[to + 3] =
            pixels[from + 3] *
            Math.min(
              1,
              Math.abs(displacement) / 1.8
            );
        }
      }
    }

    ctx.clearRect(0, 0, w, h);
    ctx.putImageData(frame, 0, 0);
  }

  /* ANIMATION LOOP */

  function tick(time) {
    raf = null;

    if (
      document.hidden ||
      reducedMotion.matches ||
      !pixels
    ) {
      stop();
      return;
    }

    waves = waves.filter(wave => {
      return time - wave.born < settings.duration;
    });

    if (!waves.length) {
      clear();
      lastDraw = -Infinity;
      return;
    }

    if (
      time - lastDraw >= settings.frameInterval
    ) {
      lastDraw = time;
      draw(time);
    }

    raf = requestAnimationFrame(tick);
  }

  /* POINTER INTERACTION */

  function interact(event, immediate = false) {
    if (
      !hover.matches ||
      reducedMotion.matches ||
      (
        event.pointerType !== "mouse" &&
        event.pointerType !== "pen"
      )
    ) {
      return;
    }

    const now = performance.now();

    if (
      !immediate &&
      now - lastSpawn < settings.spawnInterval
    ) {
      return;
    }

    if (
      !immediate &&
      lastClientX !== null &&
      Math.hypot(
        event.clientX - lastClientX,
        event.clientY - lastClientY
      ) < 5
    ) {
      return;
    }

    interacted = true;
    cancelOpening();

    lastSpawn = now;
    lastClientX = event.clientX;
    lastClientY = event.clientY;

    rippleFromPointer(event);
  }

  /* IMAGE EVENTS */

  image.addEventListener(
    "pointerenter",
    event => interact(event, true)
  );

  image.addEventListener(
    "pointermove",
    event => interact(event)
  );

  image.addEventListener(
    "pointerdown",
    event => interact(event, true)
  );

  image.addEventListener("pointerleave", () => {
    lastSpawn = -Infinity;
    lastClientX = null;
    lastClientY = null;
  });

  image.addEventListener("dragstart", event => {
    event.preventDefault();
  });

  /* OPENING RIPPLE */

  function playOpening() {
    openingTimer = null;

    if (
      openingPlayed ||
      interacted ||
      document.hidden ||
      !syncImage()
    ) {
      return;
    }

    openingPlayed = true;

    ripple(
      w * 0.43,
      h * 0.48,
      0.75
    );

    secondTimer = setTimeout(() => {
      secondTimer = null;

      if (!interacted && !document.hidden) {
        ripple(
          w * 0.61,
          h * 0.57,
          0.75 * 0.65
        );
      }
    }, settings.secondWaveDelay);
  }

  /* INITIALIZATION */

  function initialize() {
    if (!syncImage()) return;

    if (!openingPlayed && !interacted) {
      openingTimer = setTimeout(
        playOpening,
        settings.openingDelay
      );
    }
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

  /* RESPONSIVE REBUILD */

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(() => {
      syncImage();
    });

    observer.observe(image);
  } else {
    window.addEventListener(
      "resize",
      syncImage,
      { passive: true }
    );
  }

  /* TAB / WINDOW RECOVERY */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        stop();
      } else {
        syncImage();
      }
    }
  );

  window.addEventListener(
    "pageshow",
    () => syncImage()
  );

  reducedMotion.addEventListener(
    "change",
    event => {
      if (event.matches) {
        cancelOpening();
        stop();
      }
    }
  );
});
