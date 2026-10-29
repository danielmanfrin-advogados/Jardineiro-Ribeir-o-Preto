/**
 * =========================================================================================
 * Jardineiro em Ribeirão Preto - Lógica Principal e Registro de Leads na Planilha
 * =========================================================================================
 *
 * Para conectar com sua Planilha Google:
 * 1. Siga o passo a passo em: apps-script/LEIA-ME.txt
 * 2. Cole a URL da sua implantação web do Apps Script na constante abaixo:
 */
const GOOGLE_SHEETS_WEBHOOK_URL = ''; // Cole aqui a URL terminada em /exec (ex: 'https://script.google.com/macros/s/.../exec')

/**
 * Função para enviar o registro de clique para a Planilha Google
 */
function registrarClique(tipo, botaoNome) {
  const agora = new Date();
  const dataHora = agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const payload = {
    tipo: tipo, // 'WhatsApp' ou 'Ligação'
    botao: botaoNome || ('Botão ' + tipo),
    pagina: window.location.pathname || '/',
    data_hora: dataHora,
    dispositivo: isMobile ? 'Celular' : 'Computador',
    user_agent: navigator.userAgent
  };

  // 1. Armazena no localStorage do navegador para consulta ou histórico local
  try {
    const historico = JSON.parse(localStorage.getItem('registro_cliques_leads') || '[]');
    historico.push(payload);
    if (historico.length > 50) historico.shift();
    localStorage.setItem('registro_cliques_leads', JSON.stringify(historico));
  } catch (err) {}

  // 2. Envio local (útil quando executando o servidor de teste)
  try {
    fetch('/api/registrar-clique', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  } catch (err) {}

  // 3. Envio para a Planilha Google via Apps Script Web App
  if (GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL.startsWith('http')) {
    const jsonStr = JSON.stringify(payload);
    let beaconEnviado = false;

    // Utiliza sendBeacon quando suportado para máxima confiabilidade
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([jsonStr], { type: 'text/plain;charset=UTF-8' });
        beaconEnviado = navigator.sendBeacon(GOOGLE_SHEETS_WEBHOOK_URL, blob);
      } catch (e) {
        beaconEnviado = false;
      }
    }

    if (!beaconEnviado) {
      fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: jsonStr,
        keepalive: true
      }).catch(err => {
        console.warn('Registro de clique enviado em background.');
      });
    }
  }

  console.log('[LEAD REGISTRADO]:', payload.tipo, '-', payload.botao, 'em', payload.pagina);
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

    // Fechar menu mobile ao clicar em um link interno
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
