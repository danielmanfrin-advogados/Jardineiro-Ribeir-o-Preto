// Servidor nativo Node.js (sem dependências externas) para desenvolvimento e visualização
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Rota de registro local de cliques e leads (para teste em desenvolvimento)
  if (req.method === 'POST' && (req.url === '/api/registrar-clique' || req.url === '/api/lead')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        console.log('[REGISTRO DE CLIQUE]', new Date().toISOString(), payload);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ status: 'success', recebido: payload }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', mensagem: err.message }));
      }
    });
    return;
  }

  // Tratamento de CORS para requisições OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Resolução de arquivos estáticos
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') {
    urlPath = '/index.html';
  } else if (!path.extname(urlPath)) {
    // Tenta carregar pasta/index.html ou pasta.html
    const potentialDir = path.join(__dirname, urlPath, 'index.html');
    if (fs.existsSync(potentialDir)) {
      urlPath = path.join(urlPath, 'index.html');
    } else if (fs.existsSync(path.join(__dirname, urlPath + '.html'))) {
      urlPath = urlPath + '.html';
    }
  }

  let filePath = path.join(__dirname, urlPath);

  // Se não encontrar na raiz, tenta na pasta public ou dist
  if (!fs.existsSync(filePath)) {
    const publicPath = path.join(__dirname, 'public', urlPath);
    if (fs.existsSync(publicPath)) {
      filePath = publicPath;
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - Página não encontrada');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor estático rodando em http://${HOST}:${PORT}`);
});
