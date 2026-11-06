// LunoCase: сервер без внешних пакетов (нужен Node.js 22.5+). Запуск: node server.js
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const Engine = require('./engine.js');
const PORT = +process.env.PORT || 3000, DATA = process.env.DATA || path.join(__dirname, 'data.json'), PUB = path.join(__dirname, 'public'), UP = process.env.UPLOADS || path.join(PUB, 'uploads');
const BOT = process.env.BOT_TOKEN || '', ADMIN = process.env.ADMIN_TOKEN || '', DEV = !!process.env.DEV;
if (!BOT && !DEV) console.warn('Задай BOT_TOKEN (боевой режим) или DEV=1 (тест). Сейчас авторизация закрыта.');
if (!ADMIN) console.warn('ADMIN_TOKEN не задан: админка выключена.');

// ---- состояние: хранится в памяти и сохраняется в data.json (запись атомарная) ----
try { fs.mkdirSync(path.dirname(DATA), { recursive: true }); } catch {}
let state;
try { state = JSON.parse(fs.readFileSync(DATA, 'utf8')); }
catch { state = Engine.newState({ pepe: '/art/pepe.webp', plum: '/art/plum.webp', dog: '/art/dog.webp', arm: '/art/arm.webp' }); }
let dirty = false;
const markDirty = () => { dirty = true; };
setInterval(() => { if (!dirty) return; dirty = false; const tmp = DATA + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(state)); fs.renameSync(tmp, DATA); }, 1000).unref();
const bye = () => { try { fs.writeFileSync(DATA, JSON.stringify(state)); } catch {} process.exit(0); };
process.on('SIGINT', bye); process.on('SIGTERM', bye);

// ---- честный рандом (provably fair): HMAC-SHA256(server_seed, client_seed:nonce) ----
function ensureSeed(u) { if (!u.seed) { u.seed = crypto.randomBytes(32).toString('hex'); u.cseed = 'luno'; u.nonce = 0; } }
function roll(u) {
  ensureSeed(u); const h = crypto.createHmac('sha256', u.seed).update(u.cseed + ':' + u.nonce++).digest('hex');
  return parseInt(h.slice(0, 13), 16) / 2 ** 52;
}
const fairInfo = u => { ensureSeed(u); return { seedHash: crypto.createHash('sha256').update(u.seed).digest('hex'), clientSeed: u.cseed, nonce: u.nonce }; };
function rotate(u, cs) { ensureSeed(u); const old = u.seed, n = u.nonce; u.seed = crypto.randomBytes(32).toString('hex'); u.cseed = String(cs || 'luno').slice(0, 32); u.nonce = 0; return { revealedSeed: old, lastNonce: n }; }
const TON = process.env.TON_ADDRESS || '', PUBLIC = process.env.PUBLIC_URL || '', HOOK = crypto.createHash('sha256').update('hook' + BOT).digest('hex').slice(0, 32);
const ADMIN_CHAT = process.env.ADMIN_CHAT_ID || '';
const notify = text => { if (BOT && ADMIN_CHAT) tg('sendMessage', { chat_id: ADMIN_CHAT, text }).catch(() => {}); else console.log('[админу]', text); };
const engine = Engine.create({ state, roll, now: Date.now, save: markDirty, fairInfo, rotate, tonAddress: TON, allowTest: DEV, notify });
setInterval(() => { try { engine.tick(); } catch (e) { console.error('tick', e.message); } }, 1000).unref(); // ракета идёт круглосуточно, история копится сама
// ---- платежи: Telegram Stars (счёт + вебхук бота) и TON (перевод с комментарием lunoID, проверка через toncenter) ----
const tg = async (m, b) => (await fetch('https://api.telegram.org/bot' + BOT + '/' + m, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })).json();
if (BOT && PUBLIC) tg('setWebhook', { url: PUBLIC.replace(/\/$/, '') + '/bot/' + HOOK, allowed_updates: ['pre_checkout_query', 'message'] }).then(r => console.log('Webhook бота:', r.ok ? 'ok' : r.description)).catch(e => console.error(e.message));
else if (BOT) console.warn('PUBLIC_URL не задан: оплата Stars не будет зачисляться (нужен https-адрес сайта).');
async function pollTon() {
  if (!TON) return;
  try {
    const r = await fetch('https://toncenter.com/api/v2/getTransactions?address=' + TON + '&limit=40' + (process.env.TON_API_KEY ? '&api_key=' + process.env.TON_API_KEY : '')), j = await r.json();
    (j.result || []).forEach(tx => { const m = tx.in_msg; if (!m || !m.value || !m.message) return; const mm = /^luno(\d+)$/.exec(String(m.message).trim()); if (!mm) return;
      const stars = Math.floor(Number(m.value) / 1e9 * engine.setting('tonToStars')); if (stars >= engine.setting('minDeposit')) engine.creditOnce('ton:' + tx.transaction_id.hash, mm[1], stars); });
  } catch (e) { console.error('TON:', e.message); }
}
if (TON) { setInterval(pollTon, 20000).unref(); pollTon(); }

// ---- авторизация Telegram ----
function verify(init) {
  const p = new URLSearchParams(init), hash = p.get('hash'); if (!hash) return null; p.delete('hash');
  const str = [...p.entries()].map(([k, v]) => k + '=' + v).sort().join('\n');
  const key = crypto.createHmac('sha256', 'WebAppData').update(BOT).digest();
  const calc = crypto.createHmac('sha256', key).update(str).digest('hex');
  if (calc.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return null;
  if (Date.now() / 1000 - (+p.get('auth_date') || 0) > 86400) return null;
  try { const u = JSON.parse(p.get('user') || 'null'); return u && { id: String(u.id), name: u.first_name || 'Игрок', username: u.username || '', sp: p.get('start_param') || '' }; } catch { return null; }
}
function authUser(req) {
  if (BOT) return verify(req.headers['x-init-data'] || '');
  if (DEV) return { id: String(req.headers['x-dev-user'] || '1'), name: 'Dev ' + (req.headers['x-dev-user'] || '1'), username: req.headers['x-dev-un'] === undefined ? 'dev' + (req.headers['x-dev-user'] || '1') : String(req.headers['x-dev-un']) };
  return null;
}

// ---- утилиты ----
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.json': 'application/json' };
const send = (res, code, obj) => { const b = JSON.stringify(obj); res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(b); };
function body(req, max) {
  return new Promise((ok, bad) => { const ch = []; let n = 0;
    req.on('data', d => { n += d.length; if (n > max) { bad(new Error('Слишком большой файл')); req.destroy(); } else ch.push(d); });
    req.on('end', () => ok(Buffer.concat(ch))); req.on('error', bad); });
}
function imgExt(b) {
  if (b.length > 12 && b[0] === 0x89 && b.slice(1, 4).toString() === 'PNG') return 'png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') return 'webp';
  if (b.slice(0, 4).toString() === 'GIF8') return 'gif'; return null;
}
const adminOk = req => ADMIN && crypto.timingSafeEqual(crypto.createHash('sha256').update(String(req.headers['x-admin-token'] || '')).digest(), crypto.createHash('sha256').update(ADMIN).digest());
const hits = new Map(); // простой лимит запросов: 20 в секунду на игрока
const limited = id => { const t = Date.now(), a = (hits.get(id) || []).filter(x => t - x < 1000); a.push(t); hits.set(id, a); return a.length > 20; };

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x'), p = url.pathname;
    if (BOT && p === '/bot/' + HOOK && req.method === 'POST') {
      let up = {}; try { up = JSON.parse((await body(req, 100000)).toString() || '{}'); } catch {} res.writeHead(200); res.end('ok');
      const q = up.pre_checkout_query; if (q) tg('answerPreCheckoutQuery', { pre_checkout_query_id: q.id, ok: q.currency === 'XTR' && /^dep:\d+:\d+$/.test(q.invoice_payload || '') }).catch(() => {});
      const sp = up.message && up.message.successful_payment, m = sp && /^dep:(\d+):(\d+)$/.exec(sp.invoice_payload || '');
      if (sp && m && sp.currency === 'XTR' && +m[2] === sp.total_amount && String(up.message.from.id) === m[1]) engine.creditOnce('stars:' + sp.telegram_payment_charge_id, m[1], sp.total_amount);
      return;
    }
    if (p === '/health') { res.writeHead(200); return res.end('ok'); }
    if (p === '/api/config' && req.method === 'GET') return send(res, 200, engine.publicConfig());
    if (p.startsWith('/api/') && req.method === 'POST') {
      const u = authUser(req); if (!u) return send(res, 401, { error: 'Открой приложение из Telegram' });
      if (limited(u.id)) return send(res, 429, { error: 'Слишком часто' });
      let b = {}; try { b = JSON.parse((await body(req, 20000)).toString() || '{}'); } catch { return send(res, 400, { error: 'Неверный запрос' }); }
      if (p === '/api/me' && /^ref_\d+$/.test(u.sp || '')) b.ref = u.sp.slice(4);
      if (p === '/api/deposit/stars') {
        const a = Math.floor(+b.amount), min = engine.setting('minDeposit');
        if (!BOT) return send(res, 400, { error: 'Оплата Stars работает только в боевом режиме' });
        if (!(a >= min && a <= 50000)) return send(res, 400, { error: 'Сумма от ' + min + ' до 50000 ★' });
        let r; try { r = await tg('createInvoiceLink', { title: 'Пополнение LunoCase', description: a + ' ★ на игровой баланс', payload: 'dep:' + u.id + ':' + a, currency: 'XTR', prices: [{ label: a + ' ★', amount: a }] }); } catch (e) { console.error('createInvoiceLink', e.message); return send(res, 502, { error: 'Не удалось связаться с Telegram. Проверь BOT_TOKEN на Render' }); }
        return r.ok ? send(res, 200, { link: r.result }) : send(res, 502, { error: 'Telegram: ' + r.description });
      }
      const r = engine.handle(p.slice(5), u.id, b, u.name, u.username); return send(res, r.error ? 400 : 200, r);
    }
    if (p.startsWith('/admin/')) {
      if (!adminOk(req)) return send(res, 403, { error: 'Неверный токен' });
      if (p === '/admin/config' && req.method === 'GET') return send(res, 200, engine.adminConfig());
      if (p === '/admin/config' && req.method === 'PUT') {
        let n; try { n = JSON.parse((await body(req, 500000)).toString()); } catch { return send(res, 400, { error: 'Неверный JSON' }); }
        try { return send(res, 200, engine.putConfig(n)); } catch (e) { if (e instanceof Engine.Err) return send(res, 400, { error: e.message }); throw e; }
      }
      if (p === '/admin/stats') return send(res, 200, engine.stats());
      if (p === '/admin/withdrawals' && req.method === 'GET') return send(res, 200, { list: engine.wdList(url.searchParams.get('status') || '') });
      if (p === '/admin/withdrawals' && req.method === 'POST') {
        let b2 = {}; try { b2 = JSON.parse((await body(req, 5000)).toString() || '{}'); } catch {}
        try { const r = engine.wdResolve(b2.id, b2.action, b2.note); const q = r.req;
          if (BOT) tg('sendMessage', { chat_id: q.uid, text: b2.action === 'done' ? 'Подарок «' + q.item + '» отправлен на @' + q.username + '. Проверь входящие подарки в Telegram.' : 'Заявка на вывод «' + q.item + '» отклонена' + (q.note ? ': ' + q.note : '') + '. Подарок вернулся в инвентарь, комиссия возвращена.' }).catch(() => {});
          return send(res, 200, { ok: true }); } catch (e) { if (e instanceof Engine.Err) return send(res, 400, { error: e.message }); throw e; }
      }
      if (p === '/admin/users' && req.method === 'GET') return send(res, 200, { list: engine.usersList(url.searchParams.get('q') || '') });
      if (p === '/admin/users' && req.method === 'POST') {
        let b2 = {}; try { b2 = JSON.parse((await body(req, 5000)).toString() || '{}'); } catch {}
        try { if (b2.ban !== undefined) return send(res, 200, engine.userBan(b2.id, b2.ban)); return send(res, 200, engine.userAdjust(b2.id, b2.delta)); } catch (e) { if (e instanceof Engine.Err) return send(res, 400, { error: e.message }); throw e; }
      }
      if (p === '/admin/upload' && req.method === 'POST') {
        const b = await body(req, 3 * 1024 * 1024), ext = imgExt(b); if (!ext) return send(res, 400, { error: 'Нужен PNG, JPG, WEBP или GIF' });
        const name = crypto.randomBytes(8).toString('hex') + '.' + ext; fs.mkdirSync(UP, { recursive: true });
        fs.writeFileSync(path.join(UP, name), b); return send(res, 200, { url: '/uploads/' + name });
      }
      return send(res, 404, { error: 'Нет такого метода' });
    }
    // статика
    let f = p === '/' ? '/index.html' : p === '/admin' ? '/admin.html' : decodeURIComponent(p);
    const isUp = f.startsWith('/uploads/'), root = isUp ? UP : PUB, full = path.normalize(path.join(root, isUp ? f.slice(9) : f)); if (!full.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    // запасной вариант: если при загрузке на GitHub папки public/art потерялись и файлы лежат в корне, берём их оттуда (только страницы и картинки)
    let target = full;
    if (!isUp && !fs.existsSync(target)) { const bn = path.basename(f); if (/^(index|admin)\.html$|^[\w-]+\.webp$/.test(bn) && fs.existsSync(path.join(__dirname, bn))) target = path.join(__dirname, bn); }
    fs.readFile(target, (e, d) => {
      if (e) { res.writeHead(404); return res.end('Not found'); }
      if (/\.html$/.test(target) && /index\.html$/.test(target)) { // скрипт Telegram нужен, чтобы приложение получило данные игрока от бота
        const t = d.toString().replace(/<script src="https:\/\/telegram\.org[^>]*><\/script>/g, ''); d = Buffer.from(t.replace('<head>', '<head><script src="https://telegram.org/js/telegram-web-app.js"></script>'));
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': /^\/(art|uploads)\//.test(f) ? 'public, max-age=86400' : 'no-cache' }); res.end(d);
    });
  } catch (e) { console.error(e); send(res, 500, { error: 'Ошибка сервера' }); }
}).listen(PORT, () => console.log('LunoCase: http://localhost:' + PORT));
