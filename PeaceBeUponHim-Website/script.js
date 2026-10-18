/* Peace Be Upon Him – landing page behaviour. Vanilla JS, no dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var progress = document.querySelector(".scroll-progress");
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a")) : [];
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobile menu ---- */
  function isOpen() { return !!toggle && toggle.getAttribute("aria-expanded") === "true"; }

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(!isOpen()); });

    // Close after choosing a link
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });

    // Tapping anywhere outside the header closes the menu
    document.addEventListener("click", function (e) {
      if (isOpen() && header && !header.contains(e.target)) setMenu(false);
    });

    // Escape closes the menu and returns focus to the button
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Reset when the layout returns to desktop width
    var desktop = window.matchMedia("(min-width: 861px)");
    var onChange = function (e) { if (e.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---- Header shadow + scroll progress bar (one rAF-throttled handler) ---- */
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (progress) {
      var max = root.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  /* ---- Highlight the nav link for the section in view ---- */
  var sectionIds = ["home", "about", "features", "preview", "download", "contact"];
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Scroll reveal ----
     Elements are only hidden once this script has run, and never when the visitor
     prefers reduced motion, so the page is always readable. */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var groups = [
      [".about-grid > *", "from-left"],
      [".section-head", ""],
      [".card", "pop"],
      [".preview-marquee", "pop"],
      [".download-id", "from-left"],
      [".download-actions", ""],
      [".install", ""],
      [".privacy-list li", "from-left"],
      [".contact-grid > div", "from-left"],
      [".contact-list li", "pop"],
      [".footer-grid > *", ""]
    ];

    var targets = [];
    groups.forEach(function (g) {
      var seen = new Map();
      Array.prototype.forEach.call(document.querySelectorAll(g[0]), function (el) {
        var parent = el.parentNode;
        var i = seen.get(parent) || 0;
        seen.set(parent, i + 1);
        el.classList.add("reveal");
        if (g[1]) el.classList.add(g[1]);
        el.style.setProperty("--d", Math.min(i * 70, 350) + "ms");
        targets.push(el);
      });
    });

    var reveal = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -3% 0px", threshold: 0.01 });

    targets.forEach(function (el) { reveal.observe(el); });
    root.classList.add("reveal-ready");

    // Safety net: never leave anything hidden if observation is somehow delayed
    window.setTimeout(function () {
      targets.forEach(function (el) { el.classList.add("is-in"); });
    }, 6000);
  }

  /* ---- App Preview Infinite Marquee & Scroll Interaction ---- */
  var marquee = document.getElementById("preview-marquee");
  var track = document.getElementById("preview-track");
  var group = track ? track.querySelector(".phones-group") : null;

  if (marquee && track && group) {
    var posX = 0;
    var baseSpeed = 0.85; // Auto drift in pixels per frame
    var isHovered = false;
    var isDragging = false;
    var lastTouchX = 0;
    var isPreviewVisible = false;
    var lastScrollY = window.scrollY || window.pageYOffset || 0;

    // Observe when preview is near viewport so we only run animation when relevant
    if ("IntersectionObserver" in window) {
      var previewObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          isPreviewVisible = entry.isIntersecting;
        });
      }, { rootMargin: "250px 0px 250px 0px" });
      previewObs.observe(marquee);
    } else {
      isPreviewVisible = true;
    }

    // Scroll linkage: as user scrolls down/up, advance marquee dynamically
    window.addEventListener("scroll", function () {
      var currentScrollY = window.scrollY || window.pageYOffset || 0;
      var diffY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      if (isPreviewVisible) {
        posX -= diffY * 0.45;
      }
    }, { passive: true });

    // Pause auto-movement on hover
    marquee.addEventListener("mouseenter", function () { isHovered = true; });
    marquee.addEventListener("mouseleave", function () {
      isHovered = false;
      isDragging = false;
    });

    // Touch / swipe / mouse drag support
    function startDrag(clientX) {
      isDragging = true;
      lastTouchX = clientX;
    }
    function moveDrag(clientX) {
      if (!isDragging) return;
      var delta = clientX - lastTouchX;
      lastTouchX = clientX;
      posX += delta;
    }
    function endDrag() {
      isDragging = false;
    }

    marquee.addEventListener("touchstart", function (e) {
      if (e.touches && e.touches[0]) startDrag(e.touches[0].clientX);
    }, { passive: true });
    marquee.addEventListener("touchmove", function (e) {
      if (e.touches && e.touches[0]) moveDrag(e.touches[0].clientX);
    }, { passive: true });
    marquee.addEventListener("touchend", endDrag);
    marquee.addEventListener("touchcancel", endDrag);

    marquee.addEventListener("mousedown", function (e) {
      startDrag(e.clientX);
    });
    window.addEventListener("mousemove", function (e) {
      if (isDragging) moveDrag(e.clientX);
    });
    window.addEventListener("mouseup", function () {
      if (isDragging) endDrag();
    });

    // Smooth animation tick
    function marqueeTick() {
      if (isPreviewVisible) {
        if (!isHovered && !isDragging) {
          posX -= baseSpeed;
        }
        var gap = window.innerWidth <= 680 ? 16 : 28;
        var groupWidth = group.offsetWidth + gap;
        if (groupWidth > 0) {
          if (posX <= -groupWidth) {
            posX += groupWidth;
          } else if (posX > 0) {
            posX -= groupWidth;
          }
          track.style.transform = "translate3d(" + posX.toFixed(2) + "px, 0, 0)";
        }
      }
      window.requestAnimationFrame(marqueeTick);
    }
    window.requestAnimationFrame(marqueeTick);
  }

  /* ---- Footer year ---- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
