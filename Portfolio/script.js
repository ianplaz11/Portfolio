const themeToggle = document.querySelector(".theme-toggle");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const projectDialog = document.querySelector(".project-dialog");
const dialogClose = document.querySelector(".dialog-close");
const themeColor = document.querySelector('meta[name="theme-color"]');

function getSavedTheme() {
  try {
    return localStorage.getItem("portfolio-theme");
  } catch (error) {
    console.warn("Theme preference could not be read from storage.", error);
    return null;
  }
}

function setTheme(isLight) {
  document.body.classList.toggle("light-theme", isLight);
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  themeColor.content = isLight ? "#f3f2ee" : "#09090d";
  try {
    localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
  } catch (error) {
    console.warn("Theme preference could not be saved to storage.", error);
  }
}

const savedTheme = getSavedTheme();
setTheme(savedTheme !== "dark");

themeToggle.addEventListener("click", () => {
  setTheme(!document.body.classList.contains("light-theme"));
});

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  navigation.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  if (isOpen) navigation.querySelector("a").focus();
});

navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("click", (event) => {
  if (
    menuToggle.getAttribute("aria-expanded") === "true"
    && !navigation.contains(event.target)
    && !menuToggle.contains(event.target)
  ) {
    closeMenu();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuToggle.focus();
  }
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 620) closeMenu();
});

function openProject(index) {
  const project = document.querySelectorAll("[data-project-card]")[index];
  if (!project) return;
  projectDialog.querySelector(".dialog-category").textContent = project.dataset.category;
  projectDialog.querySelector("#dialog-title").textContent = project.dataset.title;
  projectDialog.querySelector(".dialog-description").textContent = project.dataset.description;
  projectDialog.querySelector(".dialog-technology-list").textContent = project.dataset.technologies;
  projectDialog.showModal();
}

document.querySelectorAll("[data-project]").forEach((button) => {
  button.addEventListener("click", () => openProject(Number(button.dataset.project)));
});

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const images = Array.from(carousel.querySelectorAll(".project-image"));
  const indicators = Array.from(carousel.querySelectorAll(".project-carousel-dots button"));
  const pauseButton = carousel.querySelector(".project-carousel-toggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = images.findIndex((image) => image.classList.contains("is-active"));
  let isPaused = reducedMotion;
  let autoplay;

  function showSlide(index) {
    activeIndex = (index + images.length) % images.length;
    images.forEach((image, imageIndex) => {
      const isActive = imageIndex === activeIndex;
      image.classList.toggle("is-active", isActive);
      image.setAttribute("aria-hidden", String(!isActive));
    });
    indicators.forEach((indicator, indicatorIndex) => indicator.setAttribute("aria-current", String(indicatorIndex === activeIndex)));
  }

  function stopAutoplay() {
    window.clearInterval(autoplay);
    autoplay = undefined;
  }

  function startAutoplay() {
    if (autoplay || isPaused || images.length < 2 || document.visibilityState === "hidden") return;
    autoplay = window.setInterval(() => {
      if (document.visibilityState === "visible") showSlide(activeIndex + 1);
    }, 5000);
  }

  indicators.forEach((indicator, index) => indicator.addEventListener("click", () => showSlide(index)));
  if (pauseButton) {
    pauseButton.hidden = reducedMotion || images.length < 2;
    pauseButton.addEventListener("click", () => {
      isPaused = !isPaused;
      pauseButton.setAttribute("aria-pressed", String(isPaused));
      pauseButton.setAttribute("aria-label", isPaused ? "Play slideshow" : "Pause slideshow");
      pauseButton.textContent = isPaused ? "Play" : "Pause";
      if (isPaused) stopAutoplay();
      else startAutoplay();
    });
  }

  carousel.addEventListener("pointerenter", stopAutoplay);
  carousel.addEventListener("pointerleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoplay();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopAutoplay();
    else startAutoplay();
  });

  showSlide(activeIndex);
  if (pauseButton && reducedMotion) {
    pauseButton.setAttribute("aria-pressed", "true");
    pauseButton.setAttribute("aria-label", "Play slideshow");
    pauseButton.textContent = "Play";
  }
  startAutoplay();
});

dialogClose.addEventListener("click", () => projectDialog.close());
projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});

const copyEmailButton = document.querySelector(".copy-email");
copyEmailButton.addEventListener("click", async () => {
  const status = document.querySelector(".copy-status");
  try {
    await navigator.clipboard.writeText(copyEmailButton.dataset.email);
    status.textContent = "EMAIL COPIED TO CLIPBOARD";
  } catch {
    status.textContent = `COPY UNAVAILABLE — EMAIL ${copyEmailButton.dataset.email.toUpperCase()}`;
  }
});

document.querySelector("#current-year").textContent = new Date().getFullYear();

const revealObserver = "IntersectionObserver" in window
  && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ? new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 })
  : null;

if (revealObserver) {
  document.documentElement.classList.add("has-motion");
  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
}
