/**
 * Jardineiro em Ribeirão Preto - Lógica Principal
 * Otimizado para conversão direta no WhatsApp e ligações
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

    // Fechar menu mobile ao clicar em um link interno
    const mobileLinks = mobileNavPanel.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavPanel.classList.remove('is-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Mini Formulário / Seletor de Bairro e Necessidade (WhatsApp Direto)
  const leadForm = document.getElementById('lead-calc-form');
  const selectBairro = document.getElementById('select-bairro');
  const selectServico = document.getElementById('select-servico');
  const btnCombinar = document.getElementById('btn-combinar-preco');

  const WHATSAPP_NUMBER = '5516999999999';
  const SITE_NAME = 'Jardineiro em Ribeirão Preto';

  function redirectWhatsappLead(e) {
    if (e) e.preventDefault();

    const bairro = selectBairro ? selectBairro.value : 'Ribeirão Preto';
    const servico = selectServico ? selectServico.value : 'manutenção de jardim';

    const texto = `Olá! Vim pelo site ${SITE_NAME}. Estou em ${bairro} e preciso de ${servico}. Pode me passar o valor?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;

    window.open(url, '_blank');
  }

  if (btnCombinar) {
    btnCombinar.addEventListener('click', redirectWhatsappLead);
  }

  if (leadForm) {
    leadForm.addEventListener('submit', redirectWhatsappLead);
  }

  // 3. Animações Discretas com IntersectionObserver
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
