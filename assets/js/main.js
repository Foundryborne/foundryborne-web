/**
 * Foundryborne Daggerheart Website Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initCarousel();
  initFAQ();
  initLightbox();
  initCopyManifest();
});

/* ==========================================================================
   Theme Switcher (Auto Light/Dark + System Match + LocalStorage Persist)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  // Check stored theme preference or browser preference
  const storedTheme = localStorage.getItem('foundryborne_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = storedTheme ? storedTheme : (systemPrefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);

  // System theme listener if user hasn't explicitly set preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('foundryborne_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || (systemPrefersDark ? 'dark' : 'light');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('foundryborne_theme', newTheme);
      applyTheme(newTheme);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      themeToggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }
  }
}

/* ==========================================================================
   Mobile Navigation Menu Toggle
   ========================================================================== */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');

  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
      const icon = mobileBtn.querySelector('i');
      if (icon) {
        icon.className = navMenu.classList.contains('mobile-open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });

    // Close menu when clicking outside or clicking link
    document.addEventListener('click', (e) => {
      if (!mobileBtn.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('mobile-open');
        const icon = mobileBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      }
    });
  }
}

/* ==========================================================================
   Screenshot Carousel
   ========================================================================== */
function initCarousel() {
  const slidesContainer = document.getElementById('carousel-slides');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  if (!slidesContainer || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayInterval;

  // Create dot indicators
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('carousel-dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(idx));
      dotsContainer.appendChild(dot);
    });
  }

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentIndex = index;
    slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentIndex - 1); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentIndex + 1); resetAutoplay(); });

  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  startAutoplay();
}

/* ==========================================================================
   FAQ Accordion
   ========================================================================== */
function initFAQ() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  const toggleAllBtn = document.getElementById('faq-toggle-all-btn');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq-item');
      item.classList.toggle('active');
      updateToggleAllBtn();
    });
  });

  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
      const items = document.querySelectorAll('.faq-item');
      const allActive = Array.from(items).every(item => item.classList.contains('active'));
      items.forEach(item => {
        if (allActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
      updateToggleAllBtn();
    });
  }

  function updateToggleAllBtn() {
    if (!toggleAllBtn) return;
    const items = document.querySelectorAll('.faq-item');
    const allActive = Array.from(items).every(item => item.classList.contains('active'));
    toggleAllBtn.innerHTML = allActive 
      ? '<i class="fa-solid fa-compress"></i> Collapse All' 
      : '<i class="fa-solid fa-expand"></i> Expand All';
  }
}

/* ==========================================================================
   Image Lightbox Modal
   ========================================================================== */
function initLightbox() {
  const backdrop = document.getElementById('modal-backdrop');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = document.getElementById('modal-close');
  const triggers = document.querySelectorAll('[data-lightbox]');

  if (!backdrop || !modalImg) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const src = trigger.getAttribute('data-lightbox') || trigger.getAttribute('src');
      if (src) {
        modalImg.src = src;
        backdrop.classList.add('active');
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => backdrop.classList.remove('active'));
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove('active');
    }
  });
}

/* ==========================================================================
   Copy Manifest to Clipboard
   ========================================================================== */
function initCopyManifest() {
  const copyBtns = document.querySelectorAll('.copy-manifest-btn');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target') || 'manifest-url';
      const input = document.getElementById(targetId);
      const textToCopy = input ? (input.value || input.innerText) : "https://github.com/Foundryborne/daggerheart/releases/latest/download/system.json";

      navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        btn.classList.add('btn-primary');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('btn-primary');
        }, 2500);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  });
}
