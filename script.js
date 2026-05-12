/* ============================================================
   DO ZERO AO GESTOR — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     AOS — Animate on Scroll
  ---------------------------------------------------------- */
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });


  /* ----------------------------------------------------------
     HEADER — scroll effect
  ---------------------------------------------------------- */
  const header = document.getElementById('header');

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();


  /* ----------------------------------------------------------
     MOBILE MENU TOGGLE
  ---------------------------------------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav  = document.getElementById('mobileNav');

  const closeMobileNav = () => {
    mobileNav.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (mobileNav.classList.contains('open') &&
        !mobileNav.contains(e.target) &&
        !menuToggle.contains(e.target)) {
      closeMobileNav();
    }
  });


  /* ----------------------------------------------------------
     SMOOTH SCROLL for all anchor links
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ----------------------------------------------------------
     COUNTER ANIMATION
  ---------------------------------------------------------- */
  const counters = document.querySelectorAll('.counter');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const step = target / (duration / 16);
    let current = 0;

    const update = () => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        return;
      }
      el.textContent = Math.floor(current);
      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));


  /* ----------------------------------------------------------
     TESTIMONIALS CAROUSEL
  ---------------------------------------------------------- */
  const wrapper    = document.querySelector('.testimonials__wrapper');
  const track      = document.getElementById('testimonialsTrack');
  const dotsWrap   = document.getElementById('testimonialDots');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');
  const cards      = track ? Array.from(track.children) : [];

  const GAP = 24;
  let currentIndex = 0;
  let autoSlide;

  const getVisible = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  const totalSlides = () => Math.max(1, cards.length - getVisible() + 1);

  /* Set each card's explicit pixel width based on wrapper width */
  const setCardWidths = () => {
    const visible  = getVisible();
    const wrapperW = wrapper.offsetWidth;
    const cardW    = (wrapperW - GAP * (visible - 1)) / visible;
    cards.forEach(c => { c.style.width = cardW + 'px'; });
    return cardW;
  };

  const buildDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const btn = document.createElement('button');
      btn.className = 'testimonial__dot' + (i === currentIndex ? ' active' : '');
      btn.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }
  };

  const goTo = (index) => {
    currentIndex = Math.max(0, Math.min(index, totalSlides() - 1));

    const cardW  = setCardWidths();
    const offset = currentIndex * (cardW + GAP);
    track.style.transform = `translateX(-${offset}px)`;

    dotsWrap.querySelectorAll('.testimonial__dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
    });
  };

  const next = () => goTo(currentIndex + 1 >= totalSlides() ? 0 : currentIndex + 1);
  const prev = () => goTo(currentIndex - 1 < 0 ? totalSlides() - 1 : currentIndex - 1);

  const startAuto = () => {
    clearInterval(autoSlide);
    autoSlide = setInterval(next, 4500);
  };

  const initCarousel = () => {
    setCardWidths();
    buildDots();
    goTo(0);
  };

  if (track && cards.length && wrapper) {
    initCarousel();
    startAuto();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { buildDots(); goTo(0); }, 150);
    });

    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoSlide));
    track.addEventListener('mouseleave', startAuto);

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    });
  }


  /* ----------------------------------------------------------
     FAQ ACCORDION
  ---------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    const answer   = item.querySelector('.faq__answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__answer').classList.remove('open');
        i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        answer.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ----------------------------------------------------------
     COUNTDOWN TIMER
  ---------------------------------------------------------- */
  const hoursEl   = document.getElementById('countHours');
  const minutesEl = document.getElementById('countMinutes');
  const secondsEl = document.getElementById('countSeconds');

  if (hoursEl && minutesEl && secondsEl) {
    // Persist timer end time in sessionStorage so it doesn't reset on page reload
    const key = 'dz_timer_end';
    let endTime = sessionStorage.getItem(key);

    if (!endTime) {
      endTime = Date.now() + (23 * 3600 + 59 * 60 + 59) * 1000;
      sessionStorage.setItem(key, endTime);
    } else {
      endTime = parseInt(endTime, 10);
    }

    const pad = n => String(n).padStart(2, '0');

    const tick = () => {
      const remaining = Math.max(0, endTime - Date.now());

      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);

      hoursEl.textContent   = pad(h);
      minutesEl.textContent = pad(m);
      secondsEl.textContent = pad(s);

      if (remaining > 0) {
        requestAnimationFrame(() => setTimeout(tick, 1000));
      }
    };

    tick();
  }


  /* ----------------------------------------------------------
     ACTIVE NAV LINK on scroll
  ---------------------------------------------------------- */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link');
  const headerH   = () => parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--header-h')) || 72;

  const updateActiveLink = () => {
    const scrollY = window.scrollY + headerH() + 20;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollY >= top && scrollY < bottom) {
        const id = section.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

});
