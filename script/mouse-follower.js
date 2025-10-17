document.addEventListener("DOMContentLoaded", () => {
  //if (!followers.length) return;
  const followers = document.querySelectorAll(".follower");
  // Cache tous les followers au départ
  followers.forEach((follower) => {
    follower.style.opacity = "0";
  });

  // Gestion pour chaque follower
  followers.forEach((follower) => {
    const parent = follower.parentNode;
    let isMouseOver = false;

    // Fonction pour mettre à jour la position
    const updatePosition = (e) => {
      const rect = parent.getBoundingClientRect();
      const posX = e.clientX - rect.left;
      const posY = e.clientY - rect.top;

      follower.style.left = `${posX}px`;
      follower.style.top = `${posY}px`;
      follower.style.opacity = "1";
      follower.style.pointerEvents = "auto";
    };

    // Mouse enter - affiche le follower
    parent.addEventListener("mouseenter", () => {
      isMouseOver = true;
      // Positionne au centre si la souris est déjà dans le parent
      const rect = parent.getBoundingClientRect();
      follower.style.left = `${rect.width / 2}px`;
      follower.style.top = `${rect.height / 2}px`;
      follower.style.opacity = ".5";
    });

    // Mouse move - déplace le follower
    parent.addEventListener("mousemove", (e) => {
      if (isMouseOver) updatePosition(e);
    });

    // Mouse leave - cache le follower
    parent.addEventListener("mouseleave", () => {
      isMouseOver = false;
      follower.style.opacity = "0";
      follower.style.pointerEvents = "none";
    });

    // Effets au clic
    parent.addEventListener("mousedown", () => {
      if (isMouseOver) follower.classList.add("active");
    });

    parent.addEventListener("mouseup", () => {
      follower.classList.remove("active");
    });
  });

  // Redimensionnement
  window.addEventListener("resize", () => {
    followers.forEach((follower) => {
      const parent = follower.parentNode;
      if (follower.style.opacity === ".5") {
        // Si visible
        follower.style.left = `${parent.offsetWidth / 2}px`;
        follower.style.top = `${parent.offsetHeight / 2}px`;
      }
    });
  });
});
