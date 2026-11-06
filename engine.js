// LunoCase: игровой движок. Один и тот же код работает на сервере и в демо-режиме в браузере.
(function (root) {
  'use strict';
  function Err(m) { this.message = m; }
  var SKINS = [
    ['card_rocket', 'Ракетка: картинка на главной'], ['card_slots', 'Спины: картинка на главной'],
    ['card_mines', 'Мины: картинка на главной'], ['mines_closed', 'Мины: закрытая клетка (по умолчанию твоя собака)'], ['mines_safe', 'Мины: безопасная клетка (по умолчанию звезда)'], ['mines_bomb', 'Мины: мина (по умолчанию взрыв)'], ['card_upgrade', 'Апгрейд: картинка на главной'], ['card_coin', 'Монетка: картинка на главной'], ['card_plinko', 'Plinko: картинка на главной'],
    ['sprite_rocket', 'Ракетка: пилот в иллюминаторе'], ['rocket_body', 'Ракетка: своя картинка ракеты (вместо нарисованной)'],
    ['plinko_ball', 'Plinko: шарик'], ['slot_s1', 'Спины: символ 1 (самый дешёвый)'], ['slot_s2', 'Спины: символ 2'], ['slot_s3', 'Спины: символ 3'], ['slot_s4', 'Спины: символ 4'], ['slot_s5', 'Спины: символ 5'], ['slot_s6', 'Спины: символ 6'], ['slot_s7', 'Спины: символ 7'], ['slot_s8', 'Спины: символ 8'], ['slot_s9', 'Спины: символ 9 (самый дорогой)'], ['slot_sc', 'Спины: скаттер (3 штуки дают фриспины)'], ['slot_cr', 'Спины: кристалл-множитель'], ['coin_a', 'Монетка: сторона «Луна»'], ['coin_b', 'Монетка: сторона «Звезда»'], ['upgrade_idle', 'Апгрейд: картинка в центре колеса']
  ];
  function defaultConfig(art) {
    art = art || {};
    var W = function (k, w) { return { k: k, weight: w }; };
    return {
      settings: { edge: 0.03, minBet: 10, maxBet: 1000, maxPayout: 20000, maxCaseRtp: 0.95, startBalance: 1000, demoBalance: 10000, tonToStars: 200, minDeposit: 10, refPercent: 0.05, botUsername: '', supportUsername: '',
        crashMax: 50, crashSpeed: 0.7, minesMin: 5, minesMaxMult: 10, bjOn: 1, bjPay: 1.2, bjH17: 1,
        edges: { crash: 0.07, mines: 0.10, plinko: 0.08, coin: 0.05, upgrade: 0.06, slots: 0.05 }, wdFeePct: 0.05, wdMinValue: 50, wdWagerMult: 1, wdNote: 'в течение 24 часов' },
      items: {
        clover: { name: 'Клевер', img: '', value: 5, wd: false, up: true }, gem: { name: 'Кристалл', img: '', value: 15, wd: false, up: true },
        hat: { name: 'Шляпа мага', img: '', value: 30, wd: false, up: true }, ring: { name: 'Кольцо', img: '', value: 60, wd: false, up: true },
        plum: { name: 'Слива', img: art.plum || '', value: 120, wd: true, up: true }, dog: { name: 'Пёс в худи', img: art.dog || '', value: 300, wd: true, up: true },
        arm: { name: 'Силач', img: art.arm || '', value: 600, wd: true, up: true }, pepe: { name: 'Жаба с сердцем', img: art.pepe || '', value: 1500, wd: true, up: true }
      },
      cases: [
        { id: 'free', name: 'Бесплатный', img: '', hue: 0, price: 0, free: true, active: true, items: [W('clover', 60), W('gem', 28), W('hat', 9), W('ring', 2.5), W('plum', 0.5)] },
        { id: 'farm', name: 'Farm', img: '', hue: -140, price: 10, free: false, active: true, items: [W('clover', 78), W('gem', 15), W('hat', 5), W('ring', 1.7), W('plum', 0.3)] },
        { id: 'neko', name: 'Neko', img: '', hue: 60, price: 50, free: false, active: true, items: [W('gem', 25), W('hat', 38), W('ring', 27), W('plum', 9), W('dog', 1)] },
        { id: 'power', name: 'Power', img: '', hue: 100, price: 150, free: false, active: true, items: [W('hat', 19.5), W('ring', 36), W('plum', 25), W('dog', 14), W('arm', 5), W('pepe', 0.5)] }
      ],
      skins: {
        card_rocket: '', card_slots: '', card_mines: '', mines_closed: art.minedog || '', mines_safe: '', mines_bomb: '', card_upgrade: '', card_coin: '', card_plinko: '',
        sprite_rocket: art.minedog || art.pepe || '', rocket_body: '', plinko_ball: art.plum || '', slot_s6: art.arm || '', slot_s7: art.dog || '', slot_s8: art.plum || '', slot_sc: art.pepe || '', coin_a: '', coin_b: '', upgrade_idle: art.pepe || ''
      },
      promos: { LUNO: { caseId: 'free', uses: 1000 } }
    };
  }

  // ---- Слоты: кластерные выплаты (6+ одинаковых подарков где угодно), каскады, фриспины, кристаллы ----
  var SW = [12, 12, 11, 11, 11, 10, 10, 10, 9], SWS = SW.reduce(function (a, x) { return a + x; }, 0);
  var BASEPAY = [0.075, 0.125, 0.2, 0.3, 0.5, 0.75, 1.25, 2, 3], FN = [0, 0, 0, 0, 0, 0, 1, 1.6, 2.6, 4.2, 7, 11, 18];
  var CRM = [2, 3, 5, 10, 20, 50, 100], CRW = [40, 28, 16, 9, 4, 2, 1];
  var SLOT = { scW: 1.25, scDC: 1.8, crP: 0.03, rtp0: 0.851, buyX: 44 }; // значения подобраны симуляцией (миллионы спинов)
  function slotSpin(R, gold, scw, scale) {
    function nw() {
      if (gold && R() < SLOT.crP) { var q = R() * 100, i = 0; while (i < CRW.length - 1 && q >= CRW[i]) { q -= CRW[i]; i++; } return 100 + CRM[i]; }
      var r = R() * (SWS + scw); if (r >= SWS) return 9; for (var j = 0; j < 9; j++) { if (r < SW[j]) return j; r -= SW[j]; } return 8;
    }
    var b = [], st = [], i, total = 0, wins = 0, sc = 0;
    for (i = 0; i < 25; i++) b.push(nw()); b.forEach(function (v) { if (v === 9) sc++; });
    for (;;) {
      var cnt = [0, 0, 0, 0, 0, 0, 0, 0, 0], win = 0, mark = []; b.forEach(function (v) { if (v < 9) cnt[v]++; });
      for (var s2 = 0; s2 < 9; s2++) if (cnt[s2] >= 6) { win += BASEPAY[s2] * FN[Math.min(cnt[s2], 12)] * scale; b.forEach(function (v, k) { if (v === s2) mark.push(k); }); }
      st.push({ b: b.slice(), w: Math.round(win * 1e4) / 1e4, c: mark }); if (!win) break; total += win; wins++; if (wins >= 6) break;
      var nb = new Array(25); for (var col = 0; col < 5; col++) { var keep = []; for (var rw = 0; rw < 5; rw++) { var idx = rw * 5 + col; if (mark.indexOf(idx) < 0) keep.push(b[idx]); } while (keep.length < 5) keep.unshift(nw()); for (rw = 0; rw < 5; rw++) nb[rw * 5 + col] = keep[rw]; }
      b = nb;
    }
    var ms = 0; if (gold) b.forEach(function (v) { if (v >= 100) ms += v - 100; });
    var mult = gold && total > 0 && ms > 0 ? ms : 1; return { stages: st, win: Math.round(total * mult * 1e4) / 1e4, mult: mult, sc: sc, gold: gold };
  }
  function slotGame(R, opt, scale) {
    var spins = [], tot = 0, fs = 0, n = 0, s;
    if (opt.buy) fs = 10; else { s = slotSpin(R, false, opt.dc ? SLOT.scDC : SLOT.scW, scale); spins.push(s); tot += s.win; if (s.sc >= 3) fs = 10; }
    while (fs > 0 && n < 60) { s = slotSpin(R, true, SLOT.scW, scale); fs--; n++; if (s.sc >= 3) fs += 5; spins.push(s); tot += s.win; }
    return { spins: spins, total: tot };
  }
  function newState(art) { return { cfg: defaultConfig(art), users: {}, totals: {}, live: [], sys: {}, hist: [], paid: {}, deposited: 0, crash: null }; }
  function caseRtp(c, items) {
    var w = 0, ev = 0; c.items.forEach(function (x) { w += x.weight; ev += x.weight * (items[x.k] ? items[x.k].value : 0); });
    return c.price > 0 && w > 0 ? ev / w / c.price : null;
  }
  var okImg = function (s) { return s === '' || /^\/(uploads|art)\/[\w.-]+$/.test(s) || /^data:image\/(png|webp|jpeg|gif);base64,[A-Za-z0-9+\/=]+$/.test(s); };

  function create(o) {
    var S = o.state; S.wd = S.wd || []; S.wdSeq = S.wdSeq || 0; S.daily = S.daily || {}; S.fees = S.fees || 0; S.sys = S.sys || {}; S.hist = S.hist || []; S.paid = S.paid || {}; S.deposited = S.deposited || 0; S.live = S.live || []; var now = o.now || Date.now, save = o.save || function () {}, roll = o.roll;
    var cfg = function () { return S.cfg; }, set = function (k) { return Number(S.cfg.settings[k]); };
    (function migrate() {
      var DS = defaultConfig({}).settings, st = S.cfg.settings; Object.keys(DS).forEach(function (k) { if (st[k] === undefined || (typeof DS[k] === 'number' && (st[k] === null || st[k] === '' || isNaN(+st[k])))) st[k] = DS[k]; });
      st.edges = st.edges || {}; Object.keys(DS.edges).forEach(function (g) { if (st.edges[g] === undefined) st.edges[g] = DS.edges[g]; });
      S.flags = S.flags || {}; if (!S.flags.m10) { S.flags.m10 = 1; var ed0 = S.cfg.settings.edges || {}; if (ed0.mines === 0.06) ed0.mines = 0.10; var sk1 = S.cfg.skins || {}; if (!sk1.sprite_rocket || /pepe\.webp$/.test(sk1.sprite_rocket)) sk1.sprite_rocket = '/art/minedog.webp'; }
      var sk0 = S.cfg.skins = S.cfg.skins || {}; if (sk0.mines_closed === undefined) sk0.mines_closed = '/art/minedog.webp'; ['mines_safe', 'mines_bomb', 'card_mines'].forEach(function (k) { if (sk0[k] === undefined) sk0[k] = ''; });
      Object.keys(S.cfg.items).forEach(function (k) { var it = S.cfg.items[k]; if (it.wd === undefined) it.wd = !!it.img; if (it.up === undefined) it.up = true; });
    })();
    var edgeOf = function (g) { var e = S.cfg.settings.edges && S.cfg.settings.edges[g]; return e !== undefined && !isNaN(+e) ? +e : set('edge'); };
    function weekStart() { var d = new Date(now()); d.setUTCHours(0, 0, 0, 0); return d.getTime() - ((d.getUTCDay() + 6) % 7) * 864e5; }
    function user(id, name, username, demo) {
      if (demo) id = 'd' + id;
      var u = S.users[id];
      if (!u) u = S.users[id] = { id: id, demo: !!demo, name: name || 'Игрок', username: '', wagered: 0, balance: (demo ? set('demoBalance') : set('startBalance')) || 0, inv: [], nid: 1, tickets: {}, redeemed: {}, round: null, stats: { opened: 0, profit: 0 }, week: { start: 0, profit: 0 } };
      if (name && u.name !== name) u.name = name; if (username !== undefined && u.username !== username) u.username = username || '';
      return u;
    }
    function book(u, game, bet, payout) {
      if (u.demo) return; // демо-игры не попадают ни в статистику, ни в лидеры, ни в Live
      var t = S.totals[game] || (S.totals[game] = { n: 0, wagered: 0, paid: 0 }); t.n++; t.wagered += bet; t.paid += payout;
      u.wagered = (u.wagered || 0) + bet; var day = new Date(now()).toISOString().slice(0, 10), dd = S.daily[day] || (S.daily[day] = { wagered: 0, paid: 0, deposited: 0 }); dd.wagered += bet; dd.paid += payout;
      var ws = weekStart(); if (u.week.start !== ws) u.week = { start: ws, profit: 0, wagered: 0 }; u.week.profit += payout - bet; u.week.wagered = (u.week.wagered || 0) + bet;
    }
    function take(u, bet, free) {
      bet = Math.floor(+bet);
      if (!(bet >= set('minBet')) || bet > set('maxBet')) throw new Err('Ставка от ★' + set('minBet') + ' до ★' + set('maxBet'));
      if (u.balance < bet) throw new Err('Не хватает звёзд'); u.balance -= bet; return bet;
    }
    function pay(u, game, bet, payout) { payout = Math.min(Math.floor(payout), set('maxPayout')); u.balance += payout; book(u, game, bet, payout); u.stats.profit += payout - bet; return payout; }
    var mmult = function (k, M) { var r = 1 - edgeOf('mines'); for (var j = 0; j < k; j++) r *= (25 - j) / (25 - M - j); return Math.min(r, set('minesMaxMult') || 10); };
    var mnext = function (k, M) { var cap = set('minesMaxMult') || 10; return (k >= 25 - M || mmult(k, M) >= cap) ? 0 : mmult(k + 1, M); };
    var growth = function (ms, k) { return Math.exp((k || 0.00009) * ms); };
    var inv = function (u, id) { for (var i = 0; i < u.inv.length; i++) if (u.inv[i].id === id) return i; return -1; };
    var BET_MS = 8000, CRASH_MS = 3500, maskName = function (n) { n = String(n || 'И'); return n.length <= 2 ? n[0] + '*' : n[0] + '***' + n[n.length - 1]; };
    function newRound(tb) {
      var mx = set('crashMax') || 50, k = 0.00009 * (set('crashSpeed') || 0.7), cp = Math.max(1, Math.min(mx, Math.floor(100 * (1 - edgeOf('crash')) / (1 - roll(S.sys))) / 100));
      return { id: (S.crash ? S.crash.id : 0) + 1, tb: tb, t0: tb + BET_MS, cp: cp, k: k, mx: mx, dur: Math.log(cp) / k, bets: {}, settled: false };
    }
    function settleRound(r) {
      Object.keys(r.bets).forEach(function (k) {
        var b = r.bets[k]; if (b.done) return; var u = S.users[b.uid]; b.done = true; if (!u) return;
        if (b.auto && b.auto <= r.cp) { b.mult = b.auto; b.payout = pay(u, 'crash', b.bet, b.bet * b.auto); }
        else { book(u, 'crash', b.bet, 0); u.stats.profit -= b.bet; }
      });
      r.settled = true; S.hist.push(r.cp); if (S.hist.length > 40) S.hist.shift();
    }
    // Общая ракета для всех игроков: раунды идут по времени, независимо от того, есть ли кто-то в игре.
    function advance() {
      var t = now(), r = S.crash || (S.crash = newRound(t));
      for (;;) { var end = r.t0 + r.dur; if (!r.settled && t >= end) settleRound(r); var next = end + CRASH_MS; if (t >= next) r = S.crash = newRound(t - next > 30000 ? t : next); else break; }
      return r;
    }
    function credit(uid, amount) {
      var u = S.users[String(uid)]; amount = Math.floor(amount); if (!u || !(amount > 0)) return false;
      u.balance += amount; u.deposited = (u.deposited || 0) + amount; S.deposited += amount; var dk = new Date(now()).toISOString().slice(0, 10), dy = S.daily[dk] || (S.daily[dk] = { wagered: 0, paid: 0, deposited: 0 }); dy.deposited += amount;
      if (u.ref && S.users[u.ref]) { var bn = Math.floor(amount * set('refPercent')), rf = S.users[u.ref]; if (bn > 0) { rf.balance += bn; rf.refEarned = (rf.refEarned || 0) + bn; } }
      save(); return true;
    }
    function creditOnce(key, uid, amount) { if (S.paid[key]) return false; if (!credit(uid, amount)) return false; S.paid[key] = 1; save(); return true; }
    function plinkoTable() {
      var raw = [14, 3.2, 2.1, 1.55, 1.2, 0.78, 0.48, 0.66, 1.12, 1.45, 1.9, 3.8, 11], e = 0, n = 12, c = 1;
      raw.forEach(function (x, i) { e += x * comb(n, i) / 4096; }); var k = (1 - edgeOf('plinko')) / e; return raw.map(function (x) { return Math.round(x * k * 100) / 100; });
    }
    function comb(n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
    function wdCheck(u, it) {
      var reasons = [], fee = Math.ceil(it.value * set('wdFeePct')), need = Math.ceil((u.deposited || 0) * set('wdWagerMult')), have = Math.floor(u.wagered || 0);
      if (!it.wd) reasons.push('Этот предмет нельзя вывести, его можно продать за звёзды или использовать в апгрейде');
      if (it.value < set('wdMinValue')) reasons.push('Минимальная стоимость подарка для вывода ★' + set('wdMinValue'));
      if (!u.username) reasons.push('Для вывода нужен username в Telegram. Укажи его в Настройки → Имя пользователя и открой приложение заново');
      if (have < need) reasons.push('Сначала нужно отыграть пополнения: сделай ставок ещё на ★' + (need - have));
      if (u.balance < fee) reasons.push('Для комиссии за вывод (★' + fee + ') не хватает звёзд на балансе');
      return { ok: !reasons.length, reasons: reasons, fee: fee };
    }

    // ---- Блэкджек: живые столы с реальными игроками, дилер играет по правилам на сервере ----
    var BJ_ST = [10, 50, 100, 500, 1000, 5000, 10000], BJ_TN = ['Луна', 'Орбита', 'Сатурн'], BJ_BET = 9000, BJ_TURN = 15000, BJ_IDLE = 40000;
    function bjAll(demo) {
      var B = S.bj || (S.bj = {}), k = demo ? 'demo' : 'real';
      if (!B[k]) { B[k] = {}; BJ_ST.forEach(function (st) { BJ_TN.forEach(function (n, i) { var id = (demo ? 'd' : 'r') + st + '_' + i; B[k][id] = { id: id, stake: st, name: n, seats: [null, null, null, null, null], phase: 'wait', dl: 0, dealer: [], hole: false, shoe: [], round: 0, turn: -1, th: 0 }; }); }); }
      return B[k];
    }
    function bjTable(id) { var B = S.bj || {}; return (B.real && B.real[id]) || (B.demo && B.demo[id]) || null; }
    var bjV = function (c) { var r = c[0]; return r === 'A' ? 11 : 'TJQK'.indexOf(r) >= 0 ? 10 : +r; };
    function bjScore(cs) { var t = 0, a = 0; cs.forEach(function (c) { if (c === '??') return; t += bjV(c); if (c[0] === 'A') a++; }); while (t > 21 && a) { t -= 10; a--; } return { t: t, soft: a > 0 }; }
    var bjNat = function (h) { return h.c.length === 2 && !h.split && bjScore(h.c).t === 21; };
    function bjDraw(T) {
      if (!T.shoe || T.shoe.length < 80) { // 6 колод, перемешиваются заново, когда остаётся четверть
        var R = 'A23456789TJQK', sh = [], d, i, j, k; for (d = 0; d < 6; d++) for (i = 0; i < 13; i++) for (j = 0; j < 4; j++) sh.push(R[i] + 'shdc'[j]);
        for (k = sh.length - 1; k > 0; k--) { var x = Math.floor(roll(S.sys) * (k + 1)), tmp = sh[k]; sh[k] = sh[x]; sh[x] = tmp; } T.shoe = sh;
      }
      return T.shoe.pop();
    }
    function bjSeatOf(T, uid) { for (var i = 0; i < 5; i++) if (T.seats[i] && T.seats[i].uid === uid) return i; return -1; }
    function bjDeal(T, t) {
      var act = T.seats.filter(function (s) { return s && s.bet > 0; });
      T.seats.forEach(function (s) { if (s) s.hands = []; });
      if (!act.length) { T.phase = 'wait'; T.dealer = []; return; }
      T.round++; T.dealer = []; T.hole = true;
      act.forEach(function (s) { s.hands = [{ c: [], bet: s.bet }]; });
      for (var p = 0; p < 2; p++) { act.forEach(function (s) { s.hands[0].c.push(bjDraw(T)); }); T.dealer.push(bjDraw(T)); }
      if (bjScore(T.dealer).t === 21) return bjSettle(T, t); // у дилера блэкджек: открывает сразу
      act.forEach(function (s) { if (bjScore(s.hands[0].c).t === 21) s.hands[0].done = true; });
      T.phase = 'play'; bjNext(T, t);
    }
    function bjNext(T, t) {
      for (var i = 0; i < 5; i++) { var s = T.seats[i]; if (!s) continue; for (var j = 0; j < s.hands.length; j++) if (!s.hands[j].done) { T.turn = i; T.th = j; T.dl = t + BJ_TURN; return; } }
      T.turn = -1; bjDealerPlay(T, t);
    }
    function bjDealerPlay(T, t) {
      T.hole = false; var live = false;
      T.seats.forEach(function (s) { if (s) s.hands.forEach(function (h) { if (bjScore(h.c).t <= 21 && !bjNat(h)) live = true; }); });
      if (live) for (;;) { var d = bjScore(T.dealer); if (d.t > 17 || (d.t === 17 && !(d.soft && set('bjH17')))) break; T.dealer.push(bjDraw(T)); }
      bjSettle(T, t);
    }
    function bjSettle(T, t) {
      T.hole = false; var d = bjScore(T.dealer).t, dn = T.dealer.length === 2 && d === 21, bp = set('bjPay') || 1.2;
      T.seats.forEach(function (s) {
        if (!s) return; var u = S.users[s.uid];
        s.hands.forEach(function (h) {
          var v = bjScore(h.c).t, nat = bjNat(h), p = 0;
          if (nat && dn) p = h.bet; else if (nat) p = h.bet + Math.floor(h.bet * bp); else if (dn || v > 21) p = 0; else if (d > 21 || v > d) p = h.bet * 2; else if (v === d) p = h.bet;
          h.pay = p; h.res = p > h.bet ? 'w' : p === h.bet ? 'p' : 'l'; h.done = true;
          if (u) { u.balance += p; book(u, 'blackjack', h.bet, p); u.stats.profit += p - h.bet; }
        });
        s.bet = 0;
      });
      T.phase = 'done'; T.turn = -1; T.dl = t + 3800 + 700 * Math.max(0, T.dealer.length - 2);
    }
    function bjAdvance(T, t) {
      for (var n = 0; n < 8; n++) {
        T.seats.forEach(function (s, i) {
          if (s && (s.left || t - s.seen > BJ_IDLE) && !(s.bet > 0) && !(T.phase === 'play' && s.hands.length)) { var u = S.users[s.uid]; if (u && u.bjt === T.id) u.bjt = ''; T.seats[i] = null; }
        });
        var seated = T.seats.filter(Boolean);
        if (T.phase === 'bet' && (t >= T.dl || seated.every(function (s) { return s.bet > 0; }))) { bjDeal(T, t); continue; }
        if (T.phase === 'play' && t >= T.dl) { var cs = T.seats[T.turn], ch = cs && cs.hands[T.th]; if (ch) ch.done = true; bjNext(T, t); continue; }
        if (T.phase === 'done' && t >= T.dl) { T.phase = 'wait'; T.dealer = []; T.seats.forEach(function (s) { if (s) s.hands = []; }); continue; }
        break;
      }
    }
    function bjTick() {
      var t = now(), B = S.bj || {};
      ['real', 'demo'].forEach(function (k) { var A = B[k]; if (A) Object.keys(A).forEach(function (id) { var T = A[id]; if (T.phase !== 'wait' || T.seats.some(Boolean)) bjAdvance(T, t); }); });
    }
    function bjLeaveU(u) {
      var T = u.bjt && bjTable(u.bjt); u.bjt = ''; if (!T) return; var i = bjSeatOf(T, u.id); if (i < 0) return; var s = T.seats[i];
      if (T.phase === 'play' && s.hands.length) { s.left = true; s.hands.forEach(function (h) { h.done = true; }); if (T.turn === i) bjNext(T, now()); return; }
      if (s.bet > 0) { u.balance += s.bet; s.bet = 0; } // ставка ещё не сыграла: возвращаем
      T.seats[i] = null;
    }
    function bjView(u, T) {
      var t = now(), me = bjSeatOf(T, u.id); if (me >= 0) T.seats[me].seen = t;
      return { bj: { id: T.id, name: T.name, stake: T.stake, phase: T.phase, dl: T.dl, now: t, round: T.round, turn: T.turn, th: T.th, me: me, pay: set('bjPay') || 1.2, h17: !!set('bjH17'),
        dealer: T.hole && T.dealer.length > 1 ? [T.dealer[0], '??'] : T.dealer.slice(),
        seats: T.seats.map(function (s) { return s ? { name: s.uid === u.id ? s.name : maskName(s.name), me: s.uid === u.id, bet: s.bet, hands: s.hands.map(function (h) { return { c: h.c.slice(), bet: h.bet, done: !!h.done, res: h.res || '', pay: h.pay || 0, split: !!h.split }; }) } : null; }) } };
    }
    function bjMine(u) { var T = u.bjt && bjTable(u.bjt), i = T ? bjSeatOf(T, u.id) : -1; if (i < 0) throw new Err('Сначала сядь за стол'); return { T: T, i: i, s: T.seats[i] }; }
    var H = {
      me: function (u, b) {
        if (b.ref && !u.refSet) { u.refSet = 1; var rf = S.users[String(b.ref)]; if (rf && rf.id !== u.id) { u.ref = rf.id; rf.refCount = (rf.refCount || 0) + 1; } }
        return { id: u.demo ? String(u.id).slice(1) : u.id, demo: !!u.demo, name: u.name, username: u.username || '', fair: o.fairInfo ? o.fairInfo(u) : null };
      },
      'demo/refill': function (u) { if (!u.demo) throw new Err('Только для демо-счёта'); u.balance = Math.max(u.balance, set('demoBalance')); return { balance: u.balance }; },
      live: function () { return { live: S.live.slice(-10).reverse() }; },
      'seed/rotate': function (u, b) { if (!o.rotate) throw new Err('Недоступно в демо'); return o.rotate(u, b.clientSeed); },
      coin: function (u, b) {
        var side = b.side ? 1 : 0, bet = take(u, b.bet), res = roll(u) < 0.5 ? 0 : 1, win = res === side;
        return { win: win, result: res, payout: pay(u, 'coin', bet, win ? bet * 2 * (1 - edgeOf('coin')) : 0) };
      },
      'slots/spin': function (u, b) {
        var bet = Math.floor(+b.bet), buy = !!b.buy, dc = !!b.dc && !buy; if (!(bet >= set('minBet')) || bet > set('maxBet')) throw new Err('Ставка от ★' + set('minBet') + ' до ★' + set('maxBet'));
        var cost = Math.ceil(bet * (buy ? SLOT.buyX : dc ? 1.25 : 1)); if (u.balance < cost) throw new Err('Не хватает звёзд'); u.balance -= cost;
        var g = slotGame(function () { return roll(u); }, { buy: buy, dc: dc }, (1 - edgeOf('slots')) / SLOT.rtp0), payout = pay(u, 'slots', cost, bet * g.total);
        return { spins: g.spins, total: g.total, payout: payout, cost: cost };
      },
      'crash/state': function (u) {
        var r = advance(), t = now(), ph = t < r.t0 ? 'bet' : r.settled ? 'crashed' : 'fly', b = r.bets[u.id], ids = Object.keys(r.bets);
        return { rid: r.id, phase: ph, now: t, t0: r.t0, nextAt: r.t0 + r.dur + CRASH_MS, k: r.k, mx: r.mx, mult: ph === 'fly' ? growth(t - r.t0, r.k) : ph === 'crashed' ? r.cp : 1, cp: ph === 'crashed' ? r.cp : undefined,
          hist: S.hist.slice(-10).reverse(), count: ids.length,
          my: b ? { bet: b.bet, auto: b.auto, done: b.done, mult: b.mult, payout: b.payout } : null };
      },
      'crash/bet': function (u, b) {
        var r = advance(); if (now() >= r.t0) throw new Err('Ставки закрыты, дождись следующего раунда'); if (r.bets[u.id]) throw new Err('Ставка уже сделана');
        var bet = take(u, b.bet), au = +b.auto; r.bets[u.id] = { uid: u.id, name: u.name, bet: bet, auto: au > 1 ? Math.min(r.mx || 50, Math.floor(au * 100) / 100) : 0, done: false, mult: 0, payout: 0 }; return { ok: true };
      },
      'crash/cashout': function (u) {
        var r = advance(), bt = r.bets[u.id]; if (!bt || bt.done) throw new Err(r.settled ? 'Ракета уже улетела' : 'Нет активной ставки');
        var t = now(); if (t < r.t0) throw new Err('Раунд ещё не начался');
        var mult = Math.max(1, Math.floor(growth(t - r.t0, r.k) * 100) / 100); bt.done = true; bt.mult = mult; bt.payout = pay(u, 'crash', bt.bet, bt.bet * mult);
        return { mult: mult, payout: bt.payout };
      },
      plinko: function (u, b) {
        var bet = take(u, b.bet), path = [], k = 0; for (var i = 0; i < 12; i++) { var st = roll(u) < 0.5 ? 0 : 1; path.push(st); k += st; }
        var mult = plinkoTable()[k]; return { path: path, slot: k, mult: mult, payout: pay(u, 'plinko', bet, bet * mult) };
      },
      ref: function (u) { return { count: u.refCount || 0, earned: u.refEarned || 0, percent: set('refPercent') }; },
      'deposit/info': function (u) { return { tonAddress: o.tonAddress || '', comment: 'luno' + u.id, tonToStars: set('tonToStars'), minDeposit: set('minDeposit'), test: !!o.allowTest }; },
      'deposit/test': function (u, b) { if (!o.allowTest) throw new Err('Недоступно'); var a = Math.floor(+b.amount); if (!(a >= 1 && a <= 10000)) throw new Err('От 1 до 10000'); credit(u.id, a); return { added: a }; },
      'mines/start': function (u, b) {
        if (u.round) throw new Err('Игра уже идёт'); var M = Math.floor(+b.mines); var mn = Math.max(1, set('minesMin') || 5); if (!(M >= mn && M <= 20)) throw new Err('Мин можно выбрать от ' + mn + ' до 20');
        var bet = take(u, b.bet), c = []; for (var i = 0; i < 25; i++) c.push(i);
        for (i = 24; i > 0; i--) { var j = Math.floor(roll(u) * (i + 1)), t = c[i]; c[i] = c[j]; c[j] = t; }
        u.round = { game: 'mines', bet: bet, M: M, mines: c.slice(0, M), opened: [] }; return { started: true, next: mnext(0, M) };
      },
      'mines/state': function (u) { var r = u.round; if (!r || r.game !== 'mines') return { active: false }; return { active: true, M: r.M, bet: r.bet, opened: r.opened, mult: r.opened.length ? mmult(r.opened.length, r.M) : 1, next: mnext(r.opened.length, r.M) }; },
      'mines/pick': function (u, b) {
        var r = u.round; if (!r || r.game !== 'mines') throw new Err('Нет игры'); var i = Math.floor(+b.i);
        if (!(i >= 0 && i < 25) || r.opened.indexOf(i) >= 0) throw new Err('Неверная клетка');
        if (r.mines.indexOf(i) >= 0) { book(u, 'mines', r.bet, 0); u.stats.profit -= r.bet; u.round = null; return { boom: true, mines: r.mines }; }
        r.opened.push(i); var mult = mmult(r.opened.length, r.M);
        if (r.opened.length === 25 - r.M || mnext(r.opened.length, r.M) === 0) { u.round = null; return { safe: true, done: true, mult: mult, payout: pay(u, 'mines', r.bet, r.bet * mult), mines: r.mines }; }
        return { safe: true, mult: mult, next: mnext(r.opened.length, r.M) };
      },
      'mines/cashout': function (u) {
        var r = u.round; if (!r || r.game !== 'mines' || !r.opened.length) throw new Err('Сначала открой клетку');
        var mult = mmult(r.opened.length, r.M); u.round = null; return { mult: mult, payout: pay(u, 'mines', r.bet, r.bet * mult), mines: r.mines };
      },
      'bj/lobby': function (u) {
        var B = bjAll(u.demo), p = u.demo ? 'd' : 'r';
        return { on: !!set('bjOn'), at: u.bjt || '', stakes: BJ_ST.map(function (st) { return { stake: st, tables: BJ_TN.map(function (n, i) { var T = B[p + st + '_' + i]; return { id: T.id, name: T.name, players: T.seats.filter(Boolean).length }; }) }; }) };
      },
      'bj/sit': function (u, b) {
        if (!set('bjOn')) throw new Err('Блэкджек временно закрыт');
        var T = bjAll(u.demo)[String(b.id || '')]; if (!T) throw new Err('Стол не найден');
        if (u.bjt && u.bjt !== T.id) bjLeaveU(u);
        if (bjSeatOf(T, u.id) < 0) { var free = [2, 1, 3, 0, 4].filter(function (i) { return !T.seats[i]; }); if (!free.length) throw new Err('За этим столом нет свободных мест'); T.seats[free[0]] = { uid: u.id, name: u.name, seen: now(), bet: 0, hands: [] }; }
        u.bjt = T.id; return bjView(u, T);
      },
      'bj/leave': function (u) { bjLeaveU(u); return { ok: true }; },
      'bj/state': function (u) { var T = u.bjt && bjTable(u.bjt); if (!T || bjSeatOf(T, u.id) < 0) { u.bjt = ''; return { gone: true }; } return bjView(u, T); },
      'bj/bet': function (u) {
        if (!set('bjOn')) throw new Err('Блэкджек временно закрыт');
        var m = bjMine(u), T = m.T, s = m.s; if (T.phase !== 'wait' && T.phase !== 'bet') throw new Err('Дождись следующей раздачи'); if (s.bet > 0) throw new Err('Ставка уже сделана');
        if (u.balance < T.stake) throw new Err('Не хватает звёзд'); u.balance -= T.stake; s.bet = T.stake; s.seen = now();
        if (T.phase === 'wait') { T.phase = 'bet'; T.dl = now() + BJ_BET; } bjAdvance(T, now()); return bjView(u, T);
      },
      'bj/act': function (u, b) {
        var m = bjMine(u), T = m.T, s = m.s, t = now(); if (T.phase !== 'play' || T.turn !== m.i) throw new Err('Сейчас не твой ход');
        var h = s.hands[T.th], a = String(b.a || ''), sc = bjScore(h.c); s.seen = t;
        if (a === 'hit') { h.c.push(bjDraw(T)); if (bjScore(h.c).t >= 21) h.done = true; }
        else if (a === 'stand') h.done = true;
        else if (a === 'double') {
          if (h.c.length !== 2 || h.split || sc.soft || sc.t < 9 || sc.t > 11) throw new Err('Удвоить можно на 9, 10 или 11 с первых двух карт'); if (u.balance < h.bet) throw new Err('Не хватает звёзд для удвоения');
          u.balance -= h.bet; h.bet *= 2; h.dbl = true; h.c.push(bjDraw(T)); h.done = true;
        } else if (a === 'split') {
          if (s.hands.length !== 1 || h.c.length !== 2 || h.c[0][0] !== h.c[1][0]) throw new Err('Разделить можно две одинаковые карты, один раз'); if (u.balance < h.bet) throw new Err('Не хватает звёзд для разделения');
          u.balance -= h.bet; var aces = h.c[0][0] === 'A';
          s.hands = [{ c: [h.c[0], bjDraw(T)], bet: h.bet, split: true }, { c: [h.c[1], bjDraw(T)], bet: h.bet, split: true }];
          s.hands.forEach(function (x) { if (aces || bjScore(x.c).t === 21) x.done = true; });
        } else throw new Err('Неизвестное действие');
        if (s.hands[T.th] && !s.hands[T.th].done) T.dl = t + BJ_TURN; else bjNext(T, t);
        return bjView(u, T);
      },
      upgrade: function (u, b) {
        var i = inv(u, +b.stake), t = cfg().items[b.target]; if (i < 0 || !t) throw new Err('Выбери подарки');
        var sv = cfg().items[u.inv[i].k].value; if (sv < set('minBet')) throw new Err('Для апгрейда нужен подарок стоимостью от ★' + set('minBet')); if (!(t.value > sv)) throw new Err('Цель должна быть дороже');
        if (t.up === false) throw new Err('Эту цель выбрать нельзя'); var chance = sv / t.value * (1 - edgeOf('upgrade')), win = roll(u) < chance; u.inv.splice(i, 1);
        if (win) u.inv.push({ id: u.nid++, k: b.target });
        book(u, 'upgrade', sv, win ? t.value : 0); u.stats.profit += (win ? t.value : 0) - sv; return { win: win, chance: chance };
      },
      'case/open': function (u, b) {
        var c = cfg().cases.filter(function (x) { return x.id === b.id && x.active; })[0]; if (!c) throw new Err('Кейс недоступен');
        if (c.free) { if (!u.demo) { if (!(u.tickets[c.id] > 0)) throw new Err('Нужен промокод'); u.tickets[c.id]--; } }
        else { if (u.balance < c.price) throw new Err('Не хватает звёзд'); u.balance -= c.price; }
        var tot = 0; c.items.forEach(function (x) { tot += x.weight; }); var t = roll(u) * tot, got = c.items[c.items.length - 1].k;
        for (var j = 0; j < c.items.length; j++) { if (t < c.items[j].weight) { got = c.items[j].k; break; } t -= c.items[j].weight; }
        var v = cfg().items[got].value, id = u.nid++; u.inv.push({ id: id, k: got }); u.stats.opened++; u.stats.profit += v - c.price;
        book(u, 'case:' + c.id, c.price, v); if (!u.demo) { S.live.push(got); if (S.live.length > 30) S.live.shift(); }
        return { item: { id: id, k: got } };
      },
      'wd/info': function (u, b) { var i = inv(u, +b.id); if (i < 0) throw new Err('Нет такого подарка'); var it = cfg().items[u.inv[i].k], c = wdCheck(u, it);
        return { ok: c.ok, reasons: c.reasons, fee: c.fee, username: u.username || '', value: it.value, name: it.name, k: u.inv[i].k, eta: cfg().settings.wdNote, feePct: set('wdFeePct'), noUser: !u.username }; },
      'wd/request': function (u, b) { var i = inv(u, +b.id); if (i < 0) throw new Err('Нет такого подарка'); var k = u.inv[i].k, it = cfg().items[k], c = wdCheck(u, it); if (!c.ok) throw new Err(c.reasons[0]);
        u.balance -= c.fee; S.fees += c.fee; u.inv.splice(i, 1); var r = { id: ++S.wdSeq, uid: u.id, username: u.username, name: u.name, k: k, item: it.name, value: it.value, fee: c.fee, status: 'pending', t: now() }; S.wd.push(r);
        if (o.notify) o.notify('Новая заявка на вывод #' + r.id + ': ' + it.name + ' (★' + it.value + ') для @' + u.username + ', ID ' + u.id); return { id: r.id, eta: cfg().settings.wdNote }; },
      'wd/list': function (u) { return { list: S.wd.filter(function (x) { return x.uid === u.id; }).slice(-20).reverse().map(function (x) { return { id: x.id, item: x.item, k: x.k, value: x.value, status: x.status, t: x.t, note: x.note || '' }; }) }; },
      'inv/sell': function (u, b) { var i = inv(u, +b.id); if (i < 0) throw new Err('Нет такого подарка'); var v = cfg().items[u.inv[i].k].value; u.inv.splice(i, 1); u.balance += v; return { sold: v }; },
      'inv/sellall': function (u) { var t = 0; u.inv.forEach(function (x) { t += cfg().items[x.k].value; }); u.inv = []; u.balance += t; return { sold: t }; },
      promo: function (u, b) {
        var code = String(b.code || '').trim().toUpperCase(), p = cfg().promos[code];
        if (!p || !(p.uses > 0)) throw new Err('Промокод недействителен'); if (u.redeemed[code]) throw new Err('Промокод уже использован');
        u.redeemed[code] = 1; p.uses--; u.tickets[p.caseId] = (u.tickets[p.caseId] || 0) + 1; return { caseId: p.caseId };
      },
      leaders: function () {
        var ws = weekStart(), rows = Object.keys(S.users).map(function (k) { return S.users[k]; }).filter(function (u) { return !u.demo && u.week.start === ws && u.week.profit > 0; })
          .sort(function (a, b) { return b.week.profit - a.week.profit; }).slice(0, 20).map(function (u) { return { name: maskName(u.name), profit: u.week.profit, wagered: u.week.wagered || 0 }; });
        return { rows: rows, endsAt: ws + 7 * 864e5, now: now() };
      }
    };
    var DEMO_NO = ['wd/info', 'wd/request', 'deposit/info', 'deposit/test', 'ref', 'seed/rotate', 'promo'];
    function handle(path, id, body, name, username, demo) {
      try {
        advance(); bjTick(); var u = user(id, name, username, demo), f = H[path]; if (!f) throw new Err('Нет такого метода');
        if (u.demo && DEMO_NO.indexOf(path) >= 0) throw new Err('В демо-режиме это недоступно. Переключись на реальный счёт');
        if (u.banned && ['me', 'live', 'crash/state', 'leaders', 'wd/list'].indexOf(path) < 0) throw new Err('Аккаунт заблокирован. Напиши в поддержку.');
        var r = f(u, body || {}) || {}; r.balance = u.balance; r.inv = u.inv; r.stats = u.stats; save(); return r;
      } catch (e) { if (e instanceof Err) return { error: e.message }; throw e; }
    }
    function publicConfig() {
      var c = cfg(); return {
        items: c.items, skins: c.skins, settings: { edge: set('edge'), crashMax: set('crashMax'), minesMin: set('minesMin'), minesMaxMult: set('minesMaxMult'), edges: cfg().settings.edges, demoBalance: set('demoBalance'), bjOn: set('bjOn'), bjPay: set('bjPay'), bjH17: set('bjH17'), minBet: set('minBet'), maxBet: set('maxBet'), minDeposit: set('minDeposit'), tonToStars: set('tonToStars'), wdFeePct: set('wdFeePct'), wdMinValue: set('wdMinValue'), wdNote: cfg().settings.wdNote || '', botUsername: cfg().settings.botUsername || '', supportUsername: cfg().settings.supportUsername || '' }, plinko: plinkoTable(),
        cases: c.cases.filter(function (x) { return x.active; }).map(function (x) { return { id: x.id, name: x.name, img: x.img, hue: x.hue, price: x.price, free: x.free, items: x.items.map(function (y) { return { k: y.k, weight: y.weight }; }) }; }),
        slots: slotInfo()
      };
    }
    function slotInfo() {
      var sc = (1 - edgeOf('slots')) / SLOT.rtp0, t = BASEPAY.map(function (p) { var r = []; for (var n = 6; n <= 12; n++) r.push(Math.round(p * FN[n] * sc * 1000) / 1000); return r; });
      return { pay: t, buyX: SLOT.buyX, dcX: 1.25 };
    }
    function adminConfig() { var c = JSON.parse(JSON.stringify(cfg())); c.rtp = {}; c.cases.forEach(function (x) { c.rtp[x.id] = caseRtp(x, c.items); }); c.skinList = SKINS; return c; }
    function putConfig(n) {
      var s = n.settings || {}, items = n.items || {}, out = { settings: {}, items: {}, cases: [], skins: {}, promos: {} };
      var DS0 = defaultConfig({}).settings, LBL = { edge: 'общий процент прибыли', minBet: 'минимальная ставка', maxBet: 'максимальная ставка', demoBalance: 'демо-баланс', maxPayout: 'максимальная выплата', maxCaseRtp: 'максимальный RTP кейса', startBalance: 'стартовый баланс', tonToStars: 'курс TON', minDeposit: 'минимальное пополнение', refPercent: 'реферальный процент', wdFeePct: 'комиссия за вывод', wdMinValue: 'минимальная стоимость вывода', wdWagerMult: 'отыгрыш пополнений', crashMax: 'максимум ракеты', crashSpeed: 'скорость ракеты', minesMin: 'минимум мин', minesMaxMult: 'потолок в минах', bjOn: 'блэкджек включён', bjPay: 'выплата за блэкджек', bjH17: 'дилер на мягких 17' };
      Object.keys(LBL).forEach(function (k) {
        var raw = s[k], cur = set(k); if (!(cur >= 0)) cur = Number(DS0[k]); // поле не пришло или пустое: оставляем текущее значение
        var v = (raw === undefined || raw === null || raw === '' || isNaN(+raw)) ? cur : +raw; if (!(v >= 0)) throw new Err('Неверная настройка: ' + LBL[k]); out.settings[k] = v;
      });
      out.settings.bjOn = out.settings.bjOn ? 1 : 0; out.settings.bjH17 = out.settings.bjH17 ? 1 : 0;
      if (!(out.settings.bjPay >= 1 && out.settings.bjPay <= 1.5)) throw new Err('Выплата за блэкджек от 1 до 1.5 (6 к 5 = 1.2, 3 к 2 = 1.5)');
      ['botUsername', 'supportUsername'].forEach(function (k) { var v = String(s[k] || '').replace(/^@/, '').trim(); if (!/^[A-Za-z0-9_]{0,32}$/.test(v)) throw new Err('Имя в Telegram: латиница, цифры, _ (' + k + ')'); out.settings[k] = v; });
      out.settings.wdNote = String(s.wdNote || '').slice(0, 80); out.settings.edges = {};
      ['crash', 'mines', 'plinko', 'coin', 'upgrade', 'slots'].forEach(function (g) { var rv = (s.edges || {})[g], v = (rv === undefined || rv === null || rv === '') ? edgeOf(g) : +rv; if (!(v >= 0 && v <= 0.25)) throw new Err('Преимущество казино по игре ' + g + ' должно быть от 0 до 0.25'); out.settings.edges[g] = v; });
      if (out.settings.minesMin < 1 || out.settings.minesMin > 20) throw new Err('Минимум мин от 1 до 20');
      if (out.settings.minesMaxMult < 1.1 || out.settings.minesMaxMult > 1000) throw new Err('Потолок выигрыша в минах от ×1.1 до ×1000');
      if (out.settings.crashMax < 2 || out.settings.crashMax > 100) throw new Err('Максимум ракеты должен быть от ×2 до ×100');
      if (out.settings.crashSpeed < 0.2 || out.settings.crashSpeed > 2) throw new Err('Скорость ракеты от 0.2 до 2 (1 = базовая)');
      if (out.settings.wdFeePct > 0.5) throw new Err('Комиссия за вывод не больше 0.5');
      if (!(out.settings.minBet >= 1) || out.settings.minBet > out.settings.maxBet) throw new Err('Минимальная ставка должна быть от 1 и не больше максимальной');
      if (out.settings.refPercent > 0.5) throw new Err('Реферальный процент не больше 0.5');
      if (out.settings.edge > 0.2) throw new Err('Преимущество казино не больше 20%'); if (out.settings.maxCaseRtp > 1) throw new Err('RTP кейса не больше 100%');
      Object.keys(items).forEach(function (k) {
        var it = items[k]; if (!/^[a-z0-9_]{1,24}$/.test(k)) throw new Err('Ключ предмета: латиница, цифры, _ (' + k + ')');
        if (!(+it.value >= 0) || !String(it.name || '').trim()) throw new Err('У предмета ' + k + ' нужны название и цена'); if (!okImg(it.img || '')) throw new Err('Неверная картинка у предмета ' + k);
        out.items[k] = { name: String(it.name).slice(0, 40), img: it.img || '', value: Math.floor(+it.value), wd: it.wd !== false && it.wd !== 'false', up: it.up !== false && it.up !== 'false' };
      });
      var ids = {};
      (n.cases || []).forEach(function (c) {
        if (!/^[a-z0-9_]{1,24}$/.test(c.id) || ids[c.id]) throw new Err('Id кейса должен быть уникальным (латиница): ' + c.id); ids[c.id] = 1;
        if (!String(c.name || '').trim() || !(+c.price >= 0) || !okImg(c.img || '')) throw new Err('Проверь название, цену и картинку кейса ' + c.id);
        if (!Array.isArray(c.items) || !c.items.length) throw new Err('В кейсе ' + c.name + ' нет предметов');
        if (c.active !== false && c.items.length < 5) throw new Err('В кейсе «' + c.name + '» должно быть не меньше 5 подарков (сейчас ' + c.items.length + ')');
        c.items.forEach(function (x) { if (!out.items[x.k] || !(+x.weight > 0)) throw new Err('Кейс ' + c.name + ': неверный предмет или вес'); x.weight = +x.weight; });
        var free = !!c.free, price = free ? 0 : Math.floor(+c.price); if (!free && price < 1) throw new Err('У платного кейса ' + c.name + ' нужна цена');
        var oc = { id: c.id, name: String(c.name).slice(0, 30), img: c.img || '', hue: +c.hue || 0, price: price, free: free, active: c.active !== false, items: c.items.map(function (x) { return { k: x.k, weight: x.weight }; }) };
        var r = caseRtp(oc, out.items); if (r !== null && r > out.settings.maxCaseRtp) throw new Err('Кейс «' + oc.name + '»: RTP ' + (r * 100).toFixed(1) + '% выше лимита ' + (out.settings.maxCaseRtp * 100).toFixed(0) + '%. Сделай предметы дешевле или реже.');
        out.cases.push(oc);
      });
      SKINS.forEach(function (s2) { var v = (n.skins || {})[s2[0]] || ''; if (!okImg(v)) throw new Err('Неверная картинка: ' + s2[1]); out.skins[s2[0]] = v; });
      Object.keys(n.promos || {}).forEach(function (code) {
        var p = n.promos[code], cc = String(code).toUpperCase(); if (!/^[A-Z0-9_-]{2,24}$/.test(cc)) throw new Err('Промокод: латиница и цифры'); 
        if (!ids[p.caseId]) throw new Err('Промокод ' + cc + ': такого кейса нет'); out.promos[cc] = { caseId: p.caseId, uses: Math.max(0, Math.floor(+p.uses || 0)) };
      });
      S.cfg = out; Object.keys(S.users).forEach(function (k) { var u = S.users[k]; u.inv = u.inv.filter(function (x) { return out.items[x.k]; }); }); save(); return { ok: true };
    }
    function stats() {
      var g = Object.keys(S.totals).map(function (k) { var t = S.totals[k]; return { game: k, n: t.n, wagered: t.wagered, paid: t.paid, profit: t.wagered - t.paid, rtp: t.wagered ? t.paid / t.wagered : null }; });
      var tot = g.reduce(function (a, x) { a.n += x.n; a.wagered += x.wagered; a.paid += x.paid; a.profit += x.profit; return a; }, { n: 0, wagered: 0, paid: 0, profit: 0 });
      var days = Object.keys(S.daily).sort().slice(-14).map(function (d) { var x = S.daily[d]; return { day: d, wagered: x.wagered, paid: x.paid, profit: x.wagered - x.paid, deposited: x.deposited }; });
      var now2 = S.wd.filter(function (x) { return x.status === 'pending'; });
      return { total: tot, byGame: g, players: Object.keys(S.users).filter(function (k) { return !S.users[k].demo; }).length, deposited: S.deposited, fees: S.fees, days: days, wdPending: now2.length, wdPendingValue: now2.reduce(function (a, x) { return a + x.value; }, 0) };
    }
    function wdList(st) { return S.wd.filter(function (x) { return !st || x.status === st; }).slice().reverse().slice(0, 100); }
    function wdResolve(id, action, note) {
      var r = S.wd.filter(function (x) { return x.id === +id; })[0]; if (!r || r.status !== 'pending') throw new Err('Заявка не найдена или уже обработана');
      if (action === 'done') r.status = 'done';
      else if (action === 'reject') { var u = S.users[r.uid]; if (u) { u.inv.push({ id: u.nid++, k: r.k }); u.balance += r.fee; S.fees -= r.fee; } r.status = 'rejected'; }
      else throw new Err('Неверное действие'); r.note = String(note || '').slice(0, 200); r.tr = now(); save(); return { req: r };
    }
    function usersList(q) {
      q = String(q || '').toLowerCase().replace(/^@/, '');
      return Object.keys(S.users).map(function (k) { return S.users[k]; }).filter(function (u) { return !u.demo && (!q || String(u.id).indexOf(q) >= 0 || String(u.name || '').toLowerCase().indexOf(q) >= 0 || String(u.username || '').toLowerCase().indexOf(q) >= 0); })
        .sort(function (a, b) { return (b.wagered || 0) - (a.wagered || 0); }).slice(0, 50).map(function (u) { return { id: u.id, name: u.name, username: u.username || '', balance: u.balance, deposited: u.deposited || 0, wagered: u.wagered || 0, profit: u.stats.profit, inv: u.inv.length, banned: !!u.banned }; });
    }
    function userAdjust(id, delta) { var u = S.users[String(id)]; if (!u) throw new Err('Игрок не найден'); delta = Math.floor(+delta); if (!delta) throw new Err('Укажи сумму'); u.balance = Math.max(0, u.balance + delta); save(); return { balance: u.balance }; }
    function userBan(id, flag) { var u = S.users[String(id)]; if (!u) throw new Err('Игрок не найден'); u.banned = !!flag; save(); return { banned: u.banned }; }
    function tick() { advance(); bjTick(); save(); }
    function seedHistory(n) { if (S.hist.length) return; for (var i = 0; i < n; i++) S.hist.push(Math.max(1, Math.min(set('crashMax') || 50, Math.floor(100 * (1 - edgeOf('crash')) / (1 - roll(S.sys))) / 100))); }
    return { tick: tick, seedHistory: seedHistory, wdList: wdList, wdResolve: wdResolve, usersList: usersList, userAdjust: userAdjust, userBan: userBan, credit: credit, creditOnce: creditOnce, setting: set, handle: handle, publicConfig: publicConfig, adminConfig: adminConfig, putConfig: putConfig, stats: stats, Err: Err };
  }
  var api = { _slots: { slotGame: slotGame, SLOT: SLOT }, create: create, newState: newState, defaultConfig: defaultConfig, SKINS: SKINS, Err: Err };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Engine = api;
})(typeof self !== 'undefined' ? self : this);
