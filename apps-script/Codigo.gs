/**
 * =========================================================================================
 * REGISTRADOR DE CLIQUES E LEADS - JARDINEIRO EM RIBEIRÃO PRETO
 * Google Apps Script para receber cliques nos botões "WhatsApp" e "Ligue agora"
 * =========================================================================================
 *
 * COMO INSTALAR EM 2 MINUTOS:
 * 1. Crie uma planilha em branco no Google Sheets (ex: "Leads - Jardineiro Ribeirão").
 * 2. No menu superior da planilha, clique em: Extensões > Apps Script.
 * 3. Apague o código que estiver lá e cole todo o conteúdo deste arquivo.
 * 4. Clique no botão azul "Implantar" (canto superior direito) > "Nova implantação".
 * 5. Clique no ícone de engrenagem ao lado de "Selecione o tipo" e escolha "App da Web".
 * 6. Preencha:
 *    - Descrição: Webhook de Cliques do Site
 *    - Executar como: "Eu (seu-email@gmail.com)"
 *    - Quem pode acessar: "Qualquer pessoa" (MUITO IMPORTANTE para funcionar sem login!)
 * 7. Clique em "Implantar", autorize o acesso à sua planilha e copie a "URL do app da Web".
 * 8. Cole a URL copiada no arquivo assets/js/main.js na variável GOOGLE_SHEETS_WEBHOOK_URL.
 * =========================================================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Cria os cabeçalhos automaticamente se a planilha for nova/vazia
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Data e Hora",
        "Tipo de Ação",
        "Botão Clicado",
        "Página de Origem",
        "Dispositivo",
        "Navegador (User Agent)"
      ]);

      // Formatação visual profissional
      var headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight("bold")
                 .setBackground("#15803D")
                 .setFontColor("#FFFFFF")
                 .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, 6);
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var dataHora = data.data_hora || Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss");
    var tipo = data.tipo || "Ação";
    var botao = data.botao || "Não especificado";
    var pagina = data.pagina || "/";
    var dispositivo = data.dispositivo || "Não identificado";
    var userAgent = data.user_agent || "-";

    // Adiciona a linha de registro
    sheet.appendRow([
      dataHora,
      tipo,
      botao,
      pagina,
      dispositivo,
      userAgent
    ]);

    // Resposta de sucesso em JSON com cabeçalhos CORS
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", mensagem: "Clique registrado com sucesso" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", mensagem: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("Webhook de Cliques ativo e funcionando perfeitamente! Use requisições POST para registrar os cliques.")
    .setMimeType(ContentService.MimeType.TEXT);
}
