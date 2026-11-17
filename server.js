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
catch { state = Engine.newState({ pepe: '/art/pepe.webp', plum: '/art/plum.webp', dog: '/art/dog.webp', arm: '/art/arm.webp', minedog: '/art/minedog.webp', slotplum: '/art/slotplum.webp' }); }
state.mods = state.mods || []; state.modLog = state.modLog || [];
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
const engine = Engine.create({ autoPay: (r, it) => autoPay(r, it), state, roll, rand: () => crypto.randomBytes(6).readUIntBE(0, 6) / 281474976710656, now: Date.now, save: markDirty, fairInfo, rotate, tonAddress: TON, allowTest: DEV, notify });
setInterval(() => { try { engine.tick(); } catch (e) { console.error('tick', e.message); } }, 1000).unref(); // ракета идёт круглосуточно, история копится сама
// ---- платежи: Telegram Stars (счёт + вебхук бота) и TON (перевод с комментарием lunoID, проверка через toncenter) ----
const tg = async (m, b) => (await fetch('https://api.telegram.org/bot' + BOT + '/' + m, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })).json();
if (BOT && PUBLIC) tg('setWebhook', { url: PUBLIC.replace(/\/$/, '') + '/bot/' + HOOK, allowed_updates: ['pre_checkout_query', 'message', 'business_connection'] }).then(r => console.log('Webhook бота:', r.ok ? 'ok' : r.description)).catch(e => console.error(e.message));
else if (BOT) console.warn('PUBLIC_URL не задан: оплата Stars не будет зачисляться (нужен https-адрес сайта).');

// ---- Автовыплата NFT: бот передаёт подарок с твоего аккаунта (Telegram Business) игроку ----
const busyGifts = new Set();
async function autoPay(r, it) {
  const fail = why => notify('Заявка #' + r.id + ' (' + it.name + ' для @' + r.username + ') не выплачена автоматически: ' + why + '. Выдай вручную в админке');
  try {
    const B = engine.bizInfo(); if (!BOT || !B || !B.enabled) return fail('бизнес-аккаунт не подключён к боту');
    const want = it.tg.toLowerCase(); let offset = '', found = null;
    for (let page = 0; page < 20 && !found; page++) {
      const j = await tg('getBusinessAccountGifts', { business_connection_id: B.id, exclude_unlimited: true, exclude_limited: true, limit: 100, offset });
      if (!j.ok) return fail(j.description || 'Telegram не отдал список подарков');
      const list = (j.result && j.result.gifts) || [], t = Math.floor(Date.now() / 1000);
      found = list.find(g => g.type === 'unique' && g.gift && String(g.gift.base_name || '').toLowerCase() === want && g.can_be_transferred && !busyGifts.has(g.owned_gift_id) && (!g.next_transfer_date || g.next_transfer_date <= t));
      offset = j.result && j.result.next_offset; if (!offset) break;
    }
    if (!found) return fail('на аккаунте нет свободного подарка из коллекции «' + it.tg + '»');
    busyGifts.add(found.owned_gift_id);
    const tr = await tg('transferGift', { business_connection_id: B.id, owned_gift_id: found.owned_gift_id, new_owner_chat_id: Number(r.uid), star_count: found.transfer_star_count || 0 });
    busyGifts.delete(found.owned_gift_id);
    if (!tr.ok) return fail(tr.description || 'Telegram отказал в передаче');
    engine.wdResolve(r.id, 'done', 'автовыплата: ' + (found.gift.name || it.tg));
    notify('Заявка #' + r.id + ' выплачена автоматически: ' + (found.gift.name || it.tg) + ' → @' + r.username);
  } catch (e) { fail(e.message); }
}
// Gram (бывший TON): адрес берётся из переменной TON_ADDRESS или из админки («Настройки» → «Пополнение»)
const tonA = () => TON || engine.tonAddr();
async function pollTon() {
  const A = tonA(); if (!A) return;
  try {
    const r = await fetch('https://toncenter.com/api/v2/getTransactions?address=' + encodeURIComponent(A) + '&limit=50' + (process.env.TON_API_KEY ? '&api_key=' + process.env.TON_API_KEY : '')), j = await r.json();
    (j.result || []).forEach(tx => { const m = tx.in_msg; if (!m || !m.value || !m.message) return; const mm = /^luno(\d+)$/i.exec(String(m.message).trim()); if (!mm) return;
      const stars = Math.floor(Number(m.value) / 1e9 * engine.setting('tonToStars')); if (stars >= engine.setting('minDeposit')) engine.creditOnce('ton:' + tx.transaction_id.hash, mm[1], stars); });
  } catch (e) { console.error('TON:', e.message); }
}
setInterval(pollTon, 20000).unref(); setTimeout(pollTon, 3000);

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
  if (DEV) return { id: String(req.headers['x-dev-user'] || '1'), name: 'Dev ' + (req.headers['x-dev-user'] || '1'), username: req.headers['x-dev-un'] === undefined ? 'dev' + (req.headers['x-dev-user'] || '1') : String(req.headers['x-dev-un']), sp: String(req.headers['x-dev-sp'] || '') };
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
const shaB = s => crypto.createHash('sha256').update(String(s)).digest();
const pwHash = (pw, salt) => crypto.scryptSync(String(pw), salt, 32).toString('hex');
const modCache = new Map(); // sha256(пароль) -> { id, until }: чтобы не считать scrypt на каждый запрос
const adminFails = new Map(); // подбор паролей: не больше 15 неудачных попыток за 15 минут с одного адреса
const ipOf = req => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
function adminAuth(req) {
  const t = String(req.headers['x-admin-token'] || ''); if (!t) return null;
  if (ADMIN && crypto.timingSafeEqual(shaB(t), shaB(ADMIN))) return { role: 'owner', name: 'Владелец' };
  const key = shaB(t).toString('hex'), c = modCache.get(key), now0 = Date.now();
  if (c && c.until > now0) { const m = state.mods.find(x => x.id === c.id && x.active !== false); if (m) return { role: 'mod', id: m.id, name: m.name }; modCache.delete(key); }
  for (const m of state.mods) {
    if (m.active === false) continue;
    if (crypto.timingSafeEqual(Buffer.from(pwHash(t, m.salt), 'hex'), Buffer.from(m.hash, 'hex'))) {
      modCache.set(key, { id: m.id, until: now0 + 5 * 60 * 1000 }); if (!m.last || now0 - m.last > 5 * 60 * 1000) { m.last = now0; markDirty(); }
      return { role: 'mod', id: m.id, name: m.name };
    }
  }
  return null;
}
const adminOk = req => !!adminAuth(req);
function modLog(name, text) { state.modLog.unshift({ t: Date.now(), mod: name, text }); if (state.modLog.length > 100) state.modLog.length = 100; markDirty(); }
function cfgDiff(a, b, label) { // что именно поменялось (для журнала владельца)
  a = a || {}; b = b || {}; const ks = new Set([...Object.keys(a), ...Object.keys(b)]); let add = 0, del = 0, chg = 0;
  ks.forEach(k => { if (!(k in a)) add++; else if (!(k in b)) del++; else if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) chg++; });
  return (add || del || chg) ? label + ': +' + add + ' −' + del + ' ~' + chg : '';
}
const hits = new Map(); // простой лимит запросов: 20 в секунду на игрока
const limited = id => { const t = Date.now(), a = (hits.get(id) || []).filter(x => t - x < 1000); a.push(t); hits.set(id, a); return a.length > 20; };

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x'), p = url.pathname;
    if (BOT && p === '/bot/' + HOOK && req.method === 'POST') {
      let up = {}; try { up = JSON.parse((await body(req, 100000)).toString() || '{}'); } catch {} res.writeHead(200); res.end('ok');
      if (up.business_connection) { engine.setBiz(up.business_connection); notify(up.business_connection.is_enabled ? 'Бизнес-аккаунт подключён к боту: автовыплата подарков может работать' : 'Бизнес-аккаунт отключён от бота: автовыплата не работает'); }
      const q = up.pre_checkout_query; if (q) tg('answerPreCheckoutQuery', { pre_checkout_query_id: q.id, ok: q.currency === 'XTR' && /^(dep:\d+:\d+(:\d+)?|wdf:\d+:\d+:\d+)$/.test(q.invoice_payload || '') }).catch(() => {});
      const sp = up.message && up.message.successful_payment, m = sp && /^dep:(\d+):(\d+)(?::(\d+))?$/.exec(sp.invoice_payload || '');
      if (sp && m && sp.currency === 'XTR' && +(m[3] || m[2]) === sp.total_amount && String(up.message.from.id) === m[1]) engine.creditOnce('stars:' + sp.telegram_payment_charge_id, m[1], +m[2]);
      const wf = sp && /^wdf:(\d+):(\d+):(\d+)$/.exec(sp.invoice_payload || ''); // комиссия за вывод подарка оплачена звёздами
      if (sp && wf && sp.currency === 'XTR' && +wf[3] === sp.total_amount && String(up.message.from.id) === wf[1]) engine.wdPayOnce('wdf:' + sp.telegram_payment_charge_id, wf[1], +wf[2]);
      return;
    }
    if (p === '/health') { res.writeHead(200); return res.end('ok'); }
    if (p === '/tonconnect-manifest.json') { const base = (PUBLIC || ('https://' + req.headers.host)).replace(/\/$/, ''); res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache' }); return res.end(JSON.stringify({ url: base, name: 'LunoCase', iconUrl: base + '/icon.png' })); }
    if (p === '/api/config' && req.method === 'GET') return send(res, 200, engine.publicConfig());
    if (p.startsWith('/api/') && req.method === 'POST') {
      const u = authUser(req); if (!u) return send(res, 401, { error: 'Открой приложение из Telegram' });
      if (limited(u.id)) return send(res, 429, { error: 'Слишком часто' });
      let b = {}; try { b = JSON.parse((await body(req, 20000)).toString() || '{}'); } catch { return send(res, 400, { error: 'Неверный запрос' }); }
      if (p === '/api/me' && /^ref_\d+$/.test(u.sp || '')) b.ref = u.sp.slice(4);
      if (p === '/api/deposit/stars') {
        if (req.headers['x-demo'] === '1') return send(res, 400, { error: 'В демо-режиме пополнение недоступно' });
        const a = Math.floor(+b.amount), min = engine.setting('minDeposit');
        if (!BOT) return send(res, 400, { error: 'Оплата Stars работает только в боевом режиме' });
        if (!(a >= min && a <= 50000)) return send(res, 400, { error: 'Сумма от ' + min + ' до 50000 ★' });
        const fee = Math.min(0.3, Math.max(0, engine.setting('starsFeePct') || 0)), price = Math.ceil(a * (1 + fee)); // комиссия за пополнение звёздами
        let r; try { r = await tg('createInvoiceLink', { title: 'Пополнение LunoCase', description: a + ' ★ на игровой баланс' + (price > a ? ' (включая комиссию ' + (price - a) + ' ⭐)' : ''), payload: 'dep:' + u.id + ':' + a + ':' + price, currency: 'XTR', prices: [{ label: a + ' ★' + (price > a ? ' + комиссия' : ''), amount: price }] }); } catch (e) { console.error('createInvoiceLink', e.message); return send(res, 502, { error: 'Не удалось связаться с Telegram. Проверь BOT_TOKEN на Render' }); }
        return r.ok ? send(res, 200, { link: r.result }) : send(res, 502, { error: 'Telegram: ' + r.description });
      }
      if (p === '/api/wd/invoice') { // оплата комиссии за вывод дорогого подарка звёздами (отдельно от баланса)
        if (req.headers['x-demo'] === '1') return send(res, 400, { error: 'В демо-режиме вывод недоступен' });
        if (!BOT) return send(res, 400, { error: 'Оплата Stars работает только в боевом режиме' });
        const ir = engine.handle('wd/info', u.id, { id: b.id }, u.name, u.username, false);
        if (ir.error) return send(res, 400, { error: ir.error });
        if (ir.feeMode !== 'stars') return send(res, 400, { error: 'Для этого подарка комиссия списывается с баланса' });
        if (ir.reasons && ir.reasons.length) return send(res, 400, { error: ir.reasons[0] });
        if (!ir.needPay) return send(res, 200, { paid: true });
        let wr; try { wr = await tg('createInvoiceLink', { title: 'Комиссия за вывод подарка', description: ir.name + ' (★' + ir.value + '): комиссия ' + ir.fee + ' ⭐ за отправку подарка', payload: 'wdf:' + u.id + ':' + ir.iid + ':' + ir.fee, currency: 'XTR', prices: [{ label: 'Комиссия за вывод', amount: ir.fee }] }); } catch (e2) { console.error('createInvoiceLink wd', e2.message); return send(res, 502, { error: 'Не удалось связаться с Telegram. Проверь BOT_TOKEN на Render' }); }
        return wr.ok ? send(res, 200, { link: wr.result }) : send(res, 502, { error: 'Telegram: ' + wr.description });
      }
      const r = engine.handle(p.slice(5), u.id, b, u.name, u.username, req.headers['x-demo'] === '1');
      if (p === '/api/gdep/request' && r.ok && r.req) notify('Новая заявка на пополнение подарком #' + r.req.id + ': «' + r.req.name + '» от ' + u.name + (u.username ? ' @' + u.username : '') + ' (ID ' + u.id + '). Открой админку, вкладка «Пополнение подарками».');
      return send(res, r.error ? 400 : 200, r);
    }
    if (p.startsWith('/admin/')) {
      const ip = ipOf(req), fl = adminFails.get(ip); if (fl && fl.n >= 15 && Date.now() - fl.t < 15 * 60 * 1000) return send(res, 429, { error: 'Слишком много неверных попыток. Подожди 15 минут' });
      const au = adminAuth(req);
      if (!au) { const f = adminFails.get(ip); if (!f || Date.now() - f.t > 15 * 60 * 1000) adminFails.set(ip, { n: 1, t: Date.now() }); else f.n++; return send(res, 403, { error: 'Неверный пароль' }); }
      adminFails.delete(ip);
      const owner = au.role === 'owner';
      if (p === '/admin/whoami') return send(res, 200, { role: au.role, name: au.name });
      // модератору доступны только: чтение настроек, сохранение NFT и кейсов, загрузка картинок
      const modOk = (p === '/admin/config') || (p === '/admin/upload' && req.method === 'POST');
      if (!owner && !modOk) return send(res, 403, { error: 'Нет прав: это может делать только владелец' });
      if (p === '/admin/mods') {
        if (req.method === 'GET') return send(res, 200, { list: state.mods.map(m => ({ id: m.id, name: m.name, created: m.created, last: m.last || 0, active: m.active !== false })), log: state.modLog.slice(0, 50) });
        let b2 = {}; try { b2 = JSON.parse((await body(req, 5000)).toString() || '{}'); } catch {}
        const pwOk = pw => { pw = String(pw || ''); if (pw.length < 6 || pw.length > 64) return 'Пароль от 6 до 64 символов'; if (ADMIN && crypto.timingSafeEqual(shaB(pw), shaB(ADMIN))) return 'Этот пароль совпадает с паролем владельца'; if (state.mods.some(m => crypto.timingSafeEqual(Buffer.from(pwHash(pw, m.salt), 'hex'), Buffer.from(m.hash, 'hex')))) return 'Такой пароль уже у другого модератора'; return ''; };
        if (b2.action === 'add') {
          const name = String(b2.name || '').trim().slice(0, 30); if (name.length < 2) return send(res, 400, { error: 'Имя модератора от 2 символов' });
          const bad = pwOk(b2.password); if (bad) return send(res, 400, { error: bad });
          const salt = crypto.randomBytes(16).toString('hex'); state.mods.push({ id: crypto.randomBytes(4).toString('hex'), name, salt, hash: pwHash(b2.password, salt), created: Date.now(), active: true }); markDirty();
          return send(res, 200, { ok: true });
        }
        const m = state.mods.find(x => x.id === b2.id); if (!m) return send(res, 404, { error: 'Модератор не найден' });
        if (b2.action === 'del') { state.mods = state.mods.filter(x => x.id !== m.id); modCache.clear(); markDirty(); return send(res, 200, { ok: true }); }
        if (b2.action === 'pass') { const bad = pwOk(b2.password); if (bad) return send(res, 400, { error: bad }); m.salt = crypto.randomBytes(16).toString('hex'); m.hash = pwHash(b2.password, m.salt); modCache.clear(); markDirty(); return send(res, 200, { ok: true }); }
        return send(res, 400, { error: 'Неизвестное действие' });
      }
      if (p === '/admin/config' && req.method === 'GET') return send(res, 200, engine.adminConfig());
      if (p === '/admin/config' && req.method === 'PUT') {
        let n; try { n = JSON.parse((await body(req, 500000)).toString()); } catch { return send(res, 400, { error: 'Неверный JSON' }); }
        if (!owner) { // модератор меняет только NFT и кейсы, всё остальное берётся из текущих настроек
          const cur = engine.adminConfig(), m2 = Object.assign({}, cur, { items: n.items || cur.items, cases: n.cases || cur.cases });
          const note = [cfgDiff(cur.items, m2.items, 'NFT'), cfgDiff((cur.cases || []).reduce((o, c) => (o[c.id] = c, o), {}), (m2.cases || []).reduce((o, c) => (o[c.id] = c, o), {}), 'кейсы')].filter(Boolean).join('; ');
          try { const r = engine.putConfig(m2); if (note) modLog(au.name, note); return send(res, 200, r); } catch (e) { if (e instanceof Engine.Err) return send(res, 400, { error: e.message }); throw e; }
        }
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
      if (p === '/admin/gdep' && req.method === 'GET') return send(res, 200, { list: engine.gdepList(url.searchParams.get('status') || '') });
      if (p === '/admin/gdep' && req.method === 'POST') {
        let b2 = {}; try { b2 = JSON.parse((await body(req, 5000)).toString() || '{}'); } catch {}
        try { const r = engine.gdepResolve(b2.id, b2.action, b2.amount, b2.note); const q = r.req;
          if (BOT) tg('sendMessage', { chat_id: q.uid, text: b2.action === 'done' ? 'Подарок «' + q.name + '» засчитан: на баланс начислено ' + q.credited + ' ★.' : 'Заявка на пополнение подарком «' + q.name + '» отклонена' + (q.note ? ': ' + q.note : '.') }).catch(() => {});
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
    if (!isUp && !fs.existsSync(target)) { const bn = path.basename(f); if (/^(index|admin)\.html$|^engine\.js$|^icon\.png$|^[\w-]+\.webp$/.test(bn) && fs.existsSync(path.join(__dirname, bn))) target = path.join(__dirname, bn); }
    fs.readFile(target, (e, d) => {
      if (e) { res.writeHead(404); return res.end('Not found'); }
      if (/\.html$/.test(target) && /index\.html$/.test(target)) { // скрипт Telegram нужен, чтобы приложение получило данные игрока от бота
        const t = d.toString().replace(/<script src="https:\/\/telegram\.org[^>]*><\/script>/g, ''); d = Buffer.from(t.replace('<head>', '<head><script src="https://telegram.org/js/telegram-web-app.js"></script><script async src="https://cdn.jsdelivr.net/npm/@tonconnect/ui@2.0.9/dist/tonconnect-ui.min.js"></script>'));
      }
      const hd = { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': /^\/(art|uploads)\//.test(f) ? 'public, max-age=86400' : 'no-cache' }; if (/icon\.png$/.test(target)) hd['Access-Control-Allow-Origin'] = '*'; res.writeHead(200, hd); res.end(d);
    });
  } catch (e) { console.error(e); send(res, 500, { error: 'Ошибка сервера' }); }
}).listen(PORT, () => console.log('LunoCase: http://localhost:' + PORT));
