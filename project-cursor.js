
document.addEventListener("DOMContentLoaded", () => {
  const projects = document.querySelectorAll(
    "[data-project-cursor]"
  );

  if (!projects.length) return;

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  if (!finePointer.matches) return;

  const cursor = document.createElement("div");

  cursor.className = "project-view-cursor";
  cursor.textContent = "View";
  cursor.setAttribute("aria-hidden", "true");

  document.body.appendChild(cursor);

  let activeProject = null;

  function hideCursor() {
    cursor.classList.remove("is-visible");

    if (activeProject) {
      activeProject.classList.remove(
        "project-cursor-active"
      );
    }

    activeProject = null;
  }

  function updateCursor(event, project) {
    if (event.pointerType && event.pointerType !== "mouse") {
      hideCursor();
      return;
    }

    const rect = project.getBoundingClientRect();

    const x = event.clientX;
    const y = event.clientY;

    // Read the actual circle size from CSS.
    const radius = cursor.getBoundingClientRect().width / 2;

    // The entire circle must stay inside the image.
    const isFullyInside =
      x - radius >= rect.left &&
      x + radius <= rect.right &&
      y - radius >= rect.top &&
      y + radius <= rect.bottom;

    if (!isFullyInside) {
      hideCursor();
      return;
    }

    if (activeProject && activeProject !== project) {
      activeProject.classList.remove(
        "project-cursor-active"
      );
    }

    activeProject = project;

    // Each thumbnail can have a different label.
    const label = project.dataset.cursorLabel || "View";

    cursor.textContent = label;

    cursor.classList.toggle(
      "is-coming-soon",
      label === "Coming Soon"
    );

    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    project.classList.add("project-cursor-active");
    cursor.classList.add("is-visible");
  }

  projects.forEach((project) => {
    project.addEventListener("pointerenter", (event) => {
      updateCursor(event, project);
    });

    project.addEventListener("pointermove", (event) => {
      updateCursor(event, project);
    });

    project.addEventListener("pointerleave", hideCursor);
    project.addEventListener("pointercancel", hideCursor);
  });

  // Hide immediately when scrolling.
  window.addEventListener("scroll", hideCursor, {
    passive: true
  });

  window.addEventListener("wheel", hideCursor, {
    passive: true
  });

  window.addEventListener("blur", hideCursor);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hideCursor();
    }
  });
});
