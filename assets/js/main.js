/**
 * =========================================================================================
 * Jardineiro em Ribeirão Preto - Comportamentos de UI
 * (Menu mobile, observador de animação na rolagem)
 * O rastreamento de cliques é gerenciado de forma limpa pelo tracker.js
 * =========================================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Menu Mobile Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNavPanel = document.querySelector('.mobile-nav-panel');

  if (mobileMenuBtn && mobileNavPanel) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNavPanel.classList.toggle('is-open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    const mobileLinks = mobileNavPanel.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavPanel.classList.remove('is-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Animações Discretas com IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }
});
