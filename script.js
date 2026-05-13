(function () {
  "use strict";

  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileLinks = document.querySelectorAll(".mobile-panel a");
  const cursorGlow = document.querySelector(".cursor-glow");

  document.documentElement.classList.add("js");

  window.addEventListener("load", () => {
    body.classList.add("loaded");
    initCounters();
    initGsap();
  });

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }, { passive: true });

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const open = body.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("menu-open");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      cursorGlow.style.setProperty("--x", `${event.clientX}px`);
      cursorGlow.style.setProperty("--y", `${event.clientY}px`);
    }, { passive: true });
  }

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const answer = item.querySelector(".faq-answer");
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : "0px";
    });
  });

  document.querySelectorAll(".accordion button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".accordion-item");
      item.classList.toggle("is-open");
    });
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");

      document.querySelectorAll("[data-category]").forEach((card) => {
        const show = filter === "all" || card.dataset.category.includes(filter);
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  document.querySelectorAll(".before-after").forEach((slider) => {
    const input = slider.querySelector("input");
    const update = () => slider.style.setProperty("--pos", `${input.value}%`);
    input.addEventListener("input", update);
    update();
  });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .2;
      const y = (event.clientY - rect.top - rect.height / 2) * .2;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  /* --- Contact Form → Google Apps Script via fetch (no-cors) --- */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      formStatus.textContent = 'Sending...';
      formStatus.style.color = 'var(--cyan)';   // matches your cyan accent

      // Gather ALL field values
      const payload = {
        name:    document.getElementById('name').value,
        phone:   document.getElementById('phone').value,
        email:   document.getElementById('email').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value
      };

      // Replace with your deployed Web App URL
      const scriptURL = 'https://script.google.com/macros/s/AKfycbxqGtEvRSVXyc6T6BTt74kpKbCdV5bhqN0_ANRfB1K56vOe7gnf-OMGGRz3KA78g0Rs/exec';

      fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(() => {
        formStatus.textContent = 'Thank you. Your inquiry has been submitted.';
        formStatus.style.color = '#4CAF50';   // green success
        contactForm.reset();
      })
      .catch(err => {
        console.error('Submission error:', err);
        formStatus.textContent = 'Error sending. Please try again or call us directly.';
        formStatus.style.color = '#f51313';   // red error
      });
    });
  }

  // === Newsletter to separate Google Sheet ===
  const newsletterScriptURL = 'https://script.google.com/macros/s/AKfycbzotYUnX5gq2_7ZTpg_5gDsuB4SzayMPRQC2k0Lhlhn2P-nf4lFdcj30ldeqNhkuWfaFg/exec';

  document.querySelectorAll('form.newsletter').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = this.querySelector('input[type="email"]');
      if (!input || !input.value.trim()) return;

      const email = input.value.trim();
      const page = window.location.pathname.split('/').pop() || 'home';

      fetch(newsletterScriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, page })
      })
      .then(() => {
        input.value = '';
        const note = document.createElement('span');
        note.textContent = '✓ Subscribed';
        note.style.cssText = 'color:#7ccbff;margin-left:8px;font-size:0.82rem;font-weight:700;';
        this.appendChild(note);
        setTimeout(() => note.remove(), 3000);
      })
      .catch(err => console.error('Newsletter signup error:', err));
    });
  });

  // === GSAP Animations & ScrollTrigger (with Lenis smooth scrolling support) ===
  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    const animate = (node) => {
      const target = Number(node.dataset.count);
      const suffix = node.dataset.suffix || "";
      const duration = 1400;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = `${Math.round(target * eased).toLocaleString("en-IN")}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.done) return;
        entry.target.dataset.done = "true";
        animate(entry.target);
      });
    }, { threshold: .45 });

    counters.forEach((counter) => observer.observe(counter));
  }

  function splitHeadlines() {
    document.querySelectorAll("[data-split]").forEach((heading) => {
      if (heading.dataset.splitDone) return;
      const lines = heading.innerHTML.split("<br>");
      heading.innerHTML = lines.map((line) => `<span class="split-line">${line}</span>`).join("");
      heading.dataset.splitDone = "true";
    });
  }

  function initGsap() {
    splitHeadlines();

    const hasGsap = window.gsap && window.ScrollTrigger;
    if (!hasGsap) {
      document.querySelectorAll("[data-reveal]").forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (window.Lenis) {
      const lenis = new Lenis({ lerp: .075, wheelMultiplier: .85, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    gsap.set("[data-reveal]", { y: 34, opacity: 0, filter: "blur(10px)" });
    gsap.utils.toArray("[data-reveal]").forEach((element) => {
      gsap.to(element, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: .95,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 86%" }
      });
    });

    gsap.from(".hero .split-line, .page-hero .split-line", {
      yPercent: 120,
      opacity: 0,
      duration: 1.1,
      stagger: .08,
      ease: "expo.out",
      delay: .12
    });

    gsap.utils.toArray(".hero-media img, .page-hero-media img").forEach((image) => {
      gsap.to(image, {
        scale: 1.08,
        yPercent: 7,
        ease: "none",
        scrollTrigger: {
          trigger: image.closest("section"),
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    });

    gsap.utils.toArray(".image-reveal").forEach((wrap) => {
      gsap.fromTo(wrap.querySelector("img"), { scale: 1.15 }, {
        scale: 1,
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: { trigger: wrap, start: "top 80%" }
      });
    });

    gsap.utils.toArray(".service-card, .project-card, .gallery-item, .brand-tile, .client-tile").forEach((card) => {
      gsap.from(card, {
        y: 36,
        opacity: 0,
        duration: .8,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%" }
      });
    });
  }

  window.addEventListener("load", function() {
  setTimeout(() => document.body.classList.add("loaded"), 1000);
});

})();
