/* =====================================================
   SIYU PORTFOLIO
   HERO — TEMPORARY AVATAR CURSOR
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const hero = document.querySelector("#home");
  const heroImage = document.querySelector("#home .hero-image-base");

  if (!hero || !heroImage) return;

  const AVATAR_SRC = "assets/avatar.png";
  const DURATION = 3000;

  let avatarCursor = null;
  let resetTimer = null;

  // Preload avatar
  const preload = new Image();
  preload.src = AVATAR_SRC;


  /* =====================================================
     UPDATE CURSOR POSITION
  ===================================================== */

  function moveAvatar(event) {
    if (!avatarCursor) return;

    avatarCursor.style.left = `${event.clientX}px`;
    avatarCursor.style.top = `${event.clientY}px`;
  }


  /* =====================================================
     RESET CURSOR
  ===================================================== */

  function resetCursor() {

    if (resetTimer !== null) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }

    hero.classList.remove("avatar-cursor-active");

    if (avatarCursor) {
      avatarCursor.remove();
      avatarCursor = null;
    }
  }


  /* =====================================================
     ACTIVATE AVATAR CURSOR
  ===================================================== */

  function activateCursor(event) {

    if (event.pointerType === "touch") return;

    resetCursor();

    avatarCursor = document.createElement("img");

    avatarCursor.src = AVATAR_SRC;
    avatarCursor.alt = "";
    avatarCursor.draggable = false;
    avatarCursor.className = "hero-avatar-cursor";

    avatarCursor.setAttribute("aria-hidden", "true");

    document.body.appendChild(avatarCursor);

    moveAvatar(event);

    hero.classList.add("avatar-cursor-active");

    resetTimer = setTimeout(resetCursor, DURATION);
  }


  /* =====================================================
     CLICK IMAGE → ACTIVATE
  ===================================================== */

  heroImage.addEventListener("pointerdown", activateCursor);


  /* =====================================================
     MOVE THROUGHOUT ENTIRE HERO
  ===================================================== */

  hero.addEventListener(
    "pointermove",
    moveAvatar,
    { passive: true }
  );


  /* =====================================================
     LEAVE ENTIRE HERO → RESET
  ===================================================== */

  hero.addEventListener("pointerleave", resetCursor);


  /* =====================================================
     WINDOW / TAB RECOVERY
  ===================================================== */

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) resetCursor();
  });

  window.addEventListener("blur", resetCursor);

});