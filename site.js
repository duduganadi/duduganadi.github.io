/* ─────────────────────────────────────────────────────────
   이시현 · github.io — interactions
   - mouse-follow cursor
   - hero typing animation (cycle)
   - scroll fade-in (IntersectionObserver)
   - project card expand
   - theme toggle (persists)
   - nav scrollspy
   ───────────────────────────────────────────────────────── */

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ───── 1. mouse-follow cursor ───── */
  const cursor = document.querySelector(".cursor");
  if (cursor && matchMedia("(hover: hover)").matches) {
    let tx = -100, ty = -100, cx = -100, cy = -100;
    document.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
    });
    const tick = () => {
      // ease towards target
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx - 11}px, ${cy - 11}px)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // grow on hover targets
    const hoverables = "a, button, .project-bar, [data-cursor='hover']";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove("is-hover");
    });

    // hide when leaving viewport
    document.addEventListener("mouseleave", () => cursor.style.opacity = "0");
    document.addEventListener("mouseenter", () => cursor.style.opacity = "1");
  }

  /* ───── 2. hero typing animation ───── */
  const typedEl = document.querySelector(".typed");
  if (typedEl && !reduceMotion) {
    const words = ["duganadi", "DUGANADI", "@duganadi", "duganadi."];
    // Start by keeping the initial word visible briefly, then begin deleting
    // it before cycling — feels like a natural rewrite instead of a snap.
    let wi = 0, ci = words[0].length, deleting = true;
    const tick = () => {
      const word = words[wi];
      if (!deleting) {
        ci++;
        typedEl.textContent = word.slice(0, ci);
        if (ci === word.length) {
          deleting = true;
          return setTimeout(tick, 1800);
        }
        setTimeout(tick, 90 + Math.random() * 60);
      } else {
        ci--;
        typedEl.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
          return setTimeout(tick, 360);
        }
        setTimeout(tick, 45 + Math.random() * 30);
      }
    };
    setTimeout(tick, 1800);
  }

  /* ───── 3. reveal on scroll ───── */
  // Anything already in (or above) the initial viewport reveals immediately
  // so the page never lands on an empty screen. Below-the-fold elements use
  // IntersectionObserver to fade in as the user scrolls.
  const reveals = [...document.querySelectorAll(".reveal")];
  const vh = window.innerHeight;
  reveals.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < vh * 0.85) el.classList.add("is-in");
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    reveals.forEach((el) => {
      if (!el.classList.contains("is-in")) io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ───── 4. project card expand ───── */
  document.querySelectorAll("[data-project]").forEach((card) => {
    const bar = card.querySelector(".project-bar");
    if (!bar) return;
    bar.addEventListener("click", () => {
      const open = card.classList.toggle("is-open");
      const toggle = bar.querySelector(".p-toggle");
      if (toggle) toggle.textContent = open ? "+" : "+";
      bar.setAttribute("aria-expanded", String(open));
    });
  });

  /* ───── 5. theme toggle ───── */
  const root = document.documentElement;
  const themeBtn = document.querySelector(".theme-toggle");
  const themeLabel = themeBtn && themeBtn.querySelector(".theme-label");

  // Restore persisted preference (defaults to dark).
  const saved = (() => {
    try { return localStorage.getItem("lee-theme"); } catch (e) { return null; }
  })();
  if (saved === "light") root.setAttribute("data-theme", "light");

  const applyLabel = () => {
    if (!themeLabel) return;
    const mode = root.getAttribute("data-theme") === "light" ? "LIGHT" : "DARK";
    themeLabel.textContent = mode;
    themeBtn.setAttribute("aria-label",
      mode === "DARK" ? "라이트 모드로 전환" : "다크 모드로 전환");
  };
  applyLabel();

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const now = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      if (now === "light") root.setAttribute("data-theme", "light");
      else root.removeAttribute("data-theme");
      // keep data-theme="dark" as default state by removing it; saved key always reflects choice
      try { localStorage.setItem("lee-theme", now); } catch (e) {}
      applyLabel();
    });
  }

  /* ───── 6. scrollspy: highlight current nav item ───── */
  const navLinks = [...document.querySelectorAll(".sb-nav a")];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const id = "#" + en.target.id;
          navLinks.forEach((a) => {
            a.classList.toggle("is-current", a.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }
})();
