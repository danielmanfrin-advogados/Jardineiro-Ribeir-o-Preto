/**
 * =========================================================================================
 * Jardineiro em Ribeirão Preto - Registro Automático de Leads na Planilha Google
 * =========================================================================================
 */

// Webhook central do Google Apps Script configurado para a planilha do usuário
const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzNOf1W0H8qo7UEY0AGEyLIF3ksLYgj2YELKy9OytgORZ_3Zs6PmRGl_a2p9w-myqdnlg/exec';
const SITE_NAME = 'Jardineiro em Ribeirão Preto';
const SITE_CITY = 'Ribeirão Preto';
const WHATSAPP_NUMBER = '5516999999999';

/**
 * Envia o registro do clique (WhatsApp ou Ligação) para a Planilha Google
 */
function registrarClique(tipo, botaoNome) {
  const agora = new Date();
  const dataHora = agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const dados = {
    site: SITE_NAME,
    cidade: SITE_CITY,
    servico: SITE_NAME,
    dominio: window.location.origin || 'https://www.jardineiroribeiraopreto.com.br',
    tipo: tipo, // 'WhatsApp' ou 'Ligação'
    acao: tipo === 'WhatsApp' ? 'clique_whatsapp' : 'clique_ligacao',
    canal: tipo.toLowerCase(),
    botao: botaoNome || ('Botão ' + tipo),
    pagina: window.location.pathname || '/',
    data: dataHora,
    data_hora: dataHora,
    dispositivo: isMobile ? 'Celular' : 'Computador',
    url: window.location.href,
    referrer: document.referrer || 'Direto',
    user_agent: navigator.userAgent
  };

  // 1. Armazena no localStorage do navegador para histórico local
  try {
    const historico = JSON.parse(localStorage.getItem('registro_cliques_leads') || '[]');
    historico.push(dados);
    if (historico.length > 50) historico.shift();
    localStorage.setItem('registro_cliques_leads', JSON.stringify(historico));
  } catch (err) {}

  // 2. Envio local (quando executando o servidor de teste)
  try {
    fetch('/api/registrar-clique', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
      keepalive: true
    }).catch(() => {});
  } catch (err) {}

  // 3. Envio para a Planilha Google no formato form-urlencoded esperado pelo Apps Script
  try {
    const params = new URLSearchParams(dados);
    const bodyStr = params.toString();
    let enviado = false;

    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyStr], { type: 'application/x-www-form-urlencoded;charset=UTF-8' });
        enviado = navigator.sendBeacon(GOOGLE_SHEETS_WEBHOOK_URL, blob);
      } catch (e) {
        enviado = false;
      }
    }

    if (!enviado) {
      fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyStr,
        keepalive: true
      }).catch(err => {
        console.warn('Registro de clique enviado em segundo plano.');
      });
    }
  } catch (err) {
    console.error('Erro ao enviar lead para a planilha:', err);
  }

  console.log('[LEAD REGISTRADO NA PLANILHA]:', dados.tipo, '-', dados.botao, 'em', dados.pagina);
}

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

  // 2. Rastreamento Automático de Cliques em WhatsApp e Telefone
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    const classList = link.className || '';
    const texto = link.innerText.trim();

    if (href.startsWith('tel:') || classList.includes('btn-outline-call')) {
      link.addEventListener('click', () => {
        let identificador = 'Ligue agora';
        if (link.closest('.site-header')) {
          identificador = 'Ligue agora - Cabeçalho';
        } else if (link.closest('.mobile-fixed-bottom-bar')) {
          identificador = 'Ligar - Barra Fixa Mobile';
        } else if (link.closest('.hero-section')) {
          identificador = 'Ligue agora - Hero';
        } else if (link.closest('.final-cta-section')) {
          identificador = 'Ligue agora - Banner Final';
        } else if (texto) {
          identificador = 'Ligar: ' + texto;
        }

        registrarClique('Ligação', identificador);
      });
    } else if (href.includes('wa.me') || href.includes('whatsapp') || classList.includes('btn-whatsapp')) {
      link.addEventListener('click', () => {
        let identificador = 'WhatsApp';
        if (link.closest('.hero-section')) {
          identificador = 'WhatsApp - Hero';
        } else if (link.closest('.mobile-fixed-bottom-bar')) {
          identificador = 'WhatsApp - Barra Fixa Mobile';
        } else if (link.closest('.service-card')) {
          const tituloServico = link.closest('.service-card').querySelector('h3')?.innerText || 'Serviço';
          identificador = 'WhatsApp - Card ' + tituloServico;
        } else if (link.closest('.final-cta-section')) {
          identificador = 'WhatsApp - Banner Final';
        } else if (link.closest('.highlight-box')) {
          identificador = 'WhatsApp - Caixa de Destaque';
        } else if (texto) {
          identificador = 'WhatsApp: ' + texto;
        }

        registrarClique('WhatsApp', identificador);
      });
    }
  });

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
