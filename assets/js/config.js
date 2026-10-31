/**
 * CONFIGURAÇÃO DO SITE - JARDINEIRO EM RIBEIRÃO PRETO
 * 
 * É aqui que o proprietário do site edita os dados de contato.
 * O tracker.js lerá estes dados e atualizará automaticamente todos
 * os botões de WhatsApp e telefone no site.
 */

window.SITE_CONFIG = {
  // Identificador exclusivo deste site (usado para separar na planilha)
  site: "jardineiro-ribeirao-preto",

  // Nicho / termo do serviço
  nicho: "Jardineiro em Ribeirão Preto",

  // NÚMERO DO WHATSAPP (55 + DDD + número, APENAS DÍGITOS):
  // Exemplo: "5516999999999"
  whatsapp: "5516900000000",

  // NÚMERO DE TELEFONE PARA LIGAÇÃO DIRETA (55 + DDD + número, APENAS DÍGITOS):
  // Exemplo: "5516999999999"
  telefone: "5516900000000",

  // Mensagem padrão caso o botão não tenha uma data-msg específica
  mensagem: "Olá! Vim pelo site e gostaria de um orçamento de jardinagem em Ribeirão Preto.",

  // Cidade de atendimento
  cidade: "Ribeirão Preto",

  // Endpoint do Google Apps Script publicado como aplicativo da web
  endpoint: "https://script.google.com/macros/s/AKfycbzNOf1W0H8qo7UEY0AGEyLIF3ksLYgj2YELKy9OytgORZ_3Zs6PmRGl_a2p9w-myqdnlg/exec"
};
