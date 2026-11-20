// LunoCase: игровой движок. Один и тот же код работает на сервере и в демо-режиме в браузере.
(function (root) {
  'use strict';
  function Err(m) { this.message = m; }
  var SKINS = [
    ['card_rocket', 'Ракетка: картинка на главной'], ['card_modes1', 'Режимы: NFT 1 на карточке «Режимы»'], ['card_modes2', 'Режимы: NFT 2 на карточке «Режимы»'], ['card_slots', 'Спины: картинка на главной'], ['card_slots3', 'Слоты: картинка на главной (вместо крутящихся слив)'],
    ['card_mines', 'Мины: картинка на главной'], ['mines_closed', 'Мины: закрытая клетка (по умолчанию твоя собака)'], ['mines_safe', 'Мины: безопасная клетка (по умолчанию звезда)'], ['mines_bomb', 'Мины: мина (по умолчанию взрыв)'], ['card_upgrade', 'Апгрейд: картинка на главной'], ['card_coin', 'Монетка: картинка на главной'], ['card_plinko', 'Plinko: картинка на главной'],
    ['sprite_rocket', 'Ракетка: пилот в иллюминаторе'], ['rocket_body', 'Ракетка: своя картинка ракеты (вместо нарисованной)'],
    ['plinko_ball', 'Plinko: шарик'], ['slot_s1', 'Спины: символ 1 (самый дешёвый)'], ['slot_s2', 'Спины: символ 2'], ['slot_s3', 'Спины: символ 3'], ['slot_s4', 'Спины: символ 4'], ['slot_s5', 'Спины: символ 5'], ['slot_s6', 'Спины: символ 6'], ['slot_s7', 'Спины: символ 7'], ['slot_s8', 'Спины: символ 8'], ['slot_s9', 'Спины: символ 9 (самый дорогой)'], ['slot_sc', 'Спины: скаттер (3 штуки дают фриспины)'], ['slot_cr', 'Спины: кристалл-множитель'], ['coin_a', 'Монетка: сторона «Луна»'], ['coin_b', 'Монетка: сторона «Звезда»'], ['upgrade_idle', 'Апгрейд: картинка в центре колеса']
  ];
  function defaultConfig(art) {
    art = art || {};
    var W = function (k, w) { return { k: k, weight: w }; };
    return {
      settings: { edge: 0.03, minBet: 10, maxBet: 1000, maxPayout: 20000, maxCaseRtp: 0.99, revPct: 0.1, revMonths: 0, slotsMaxX: 40, pickMaxX: 50, startBalance: 1000, demoBalance: 10000, tonToStars: 200, minDeposit: 10, refPercent: 0.05, botUsername: '', supportUsername: '',
        toon: 1, crashMax: 50, crashSpeed: 0.7, minesMin: 5, minesMaxMult: 8, upMinChance: 0.05, upMinMult: 1.5, upMaxChance: 0.75, wdFeeFixed: 25, wdStarsFrom: 100, wdFeeStars: 25, autoPay: 0, starsFeePct: 0, rlZeros: 3, blMax: 50, blMin: 1, twMaxMult: 50, cupsMult: 2.7, bjOn: 1, bjMin: 10, bjMax: 10000, bjPay: 1.2, bjH17: 1, bjP22: 0, duOn: 1, duFee: 0.05,
        edges: { crash: 0.07, mines: 0.12, plinko: 0.08, coin: 0.05, upgrade: 0.06, slots: 0.05, tower: 0.08, hilo: 0.07, balloon: 0.08, slots3: 0.10, pick: 0.05 }, modes: { rocket: 1, mines: 1, upgrade: 1, slots: 1, plinko: 1, wheel: 1, coin: 1, tower: 1, bj: 1, du: 1, hilo: 1, roulette: 0, balloon: 1, cups: 1, pick: 1 }, tonAddress: '', giftDepositTo: '', giftDepositNote: 'Начисляем в течение 24 часов.', channelUrl: '', channelText: 'Наш канал', wdFeePct: 0, wdMinValue: 50, wdWagerMult: 1, wdNote: 'в течение 24 часов' },
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
        card_rocket: '', card_slots: '', card_slots3: '', card_mines: '', mines_closed: art.minedog || '', mines_safe: '', mines_bomb: '', card_upgrade: '', card_coin: '', card_plinko: '',
        sprite_rocket: art.minedog || art.pepe || '', rocket_body: '', plinko_ball: art.plum || '', slot_s6: art.arm || '', slot_s7: art.dog || '', slot_s8: art.plum || '', slot_sc: art.pepe || '', coin_a: '', coin_b: '', upgrade_idle: art.pepe || ''
      },
      promos: { LUNO: { caseId: 'free', uses: 1000 } },
      slots3: defaultSlots3(art),
      wheel: defaultWheel()
    };
  }
  // Колесо фортуны: все секторы одинакового размера, шанс каждого = 1 / число секторов. RTP = средний множитель.
  var WHEEL_MAX_RTP = 0.97;
  var WHEEL_OLD = [0,1.2,0,0.5,2,0,0.5,1.2,0,3,0,0.5,1.2,0,2,0.5,0,7,0,0.5,1.2,0,2,0,0.5,3,0,1.2,0.5,0];
  function defaultWheel() { return { on: 1, secs: [0.5, 1.2, 0.8, 0, 1.5, 0.5, 1.2, 0.8, 0.5, 2, 0, 1.2, 0.5, 0.8, 1.5, 0, 1.2, 5, 0.8, 0, 1.2, 0.5, 1.5, 0, 0.8, 2, 0.5, 1.2, 0, 0.5] }; }
  function wheelRtp(secs) { var t = 0; secs.forEach(function (m) { t += +m || 0; }); return secs.length ? t / secs.length : 0; }

  function defaultSlots3(art) {
    return { bets: [10, 25, 50, 100, 250, 500, 1000], pair: 2, symbols: [
      { id: 'clover', name: 'Клевер', img: '', icon: 'clover', mult: 5, count: 10 }, { id: 'gem', name: 'Кристалл', img: '', icon: 'gem', mult: 10, count: 8 },
      { id: 'hat', name: 'Шляпа мага', img: '', icon: 'hat', mult: 20, count: 6 }, { id: 'ring', name: 'Кольцо', img: '', icon: 'ring', mult: 40, count: 3 },
      { id: 'plum', name: 'Слива', img: art.slotplum || art.plum || '', icon: 'star', mult: 80, count: 2 }, { id: 'dog', name: 'Пёс в худи', img: art.dog || '', icon: 'star', mult: 150, count: 1 },
      { id: 'pepe', name: 'Жаба с сердцем', img: art.pepe || '', icon: 'star', mult: 400, count: 1 }] };
  }
  // ---- Слоты 3x3: 3 барабана, 5 линий (3 горизонтали и 2 диагонали). Выплата = ставка × множитель линии.
  var S3LINES = [[1, 1, 1], [0, 0, 0], [2, 2, 2], [0, 1, 2], [2, 1, 0]];
  function s3strip(sy) {
    var L = 0; sy.forEach(function (x) { L += x.count; }); var strip = new Array(L);
    sy.map(function (x, i) { return i; }).sort(function (a, b) { return sy[b].count - sy[a].count || a - b; }).forEach(function (i) {
      var c = sy[i].count; for (var j = 0; j < c; j++) { var p = Math.floor((j + 0.37 + i * 0.11) * L / c) % L; while (strip[p] !== undefined) p = (p + 1) % L; strip[p] = i; }
    });
    return strip;
  }
  function s3wins(mults, pairM, w) {
    var res = [];
    for (var l = 0; l < 5; l++) {
      var ln = S3LINES[l], x = w[0][ln[0]], y = w[1][ln[1]], z = w[2][ln[2]];
      if (x === y && y === z) res.push({ line: l, sym: x, mult: mults[x] });
      else if (pairM > 0 && x === 0 && y === 0) res.push({ line: l, sym: 0, mult: pairM, pair: true });
    }
    return res;
  }
  function s3calc(c3, edge) {
    var sy = c3.symbols, strip = s3strip(sy), L = strip.length, pair = +c3.pair || 0, raw = sy.map(function (x) { return +x.mult; }), W = [], a, b, c, tot = 0, hit = 0, n = L * L * L;
    for (a = 0; a < L; a++) W.push([strip[(a + L - 1) % L], strip[a], strip[(a + 1) % L]]);
    for (a = 0; a < L; a++) for (b = 0; b < L; b++) for (c = 0; c < L; c++) { var r = s3wins(raw, pair, [W[a], W[b], W[c]]); if (r.length) { hit++; for (var k = 0; k < r.length; k++) tot += r[k].mult; } }
    var rtp0 = tot / n, scale = rtp0 > 0 ? (1 - edge) / rtp0 : 0, rd = function (m) { return Math.round(m * scale * 100) / 100; };
    return { strip: strip, L: L, rtp0: rtp0, scale: scale, hit: hit / n, mults: raw.map(rd), pair: rd(pair) };
  }

  // ---- Слоты: кластерные выплаты (6+ одинаковых подарков где угодно), каскады, фриспины, кристаллы ----
  var SW = [12, 12, 11, 11, 11, 10, 10, 10, 9], SWS = SW.reduce(function (a, x) { return a + x; }, 0);
  var BASEPAY = [0.075, 0.125, 0.2, 0.3, 0.5, 0.75, 1.25, 2, 3], FN = [0, 0, 0, 0, 0, 0, 1, 1.6, 2.6, 4.2, 7, 11, 18];
  var CRM = [2, 3, 5, 10, 20, 50, 100], CRW = [40, 28, 16, 9, 4, 2, 1];
  var SLOT = { scW: 1.25, scDC: 1.8, crP: 0.03, rtp0: 0.851, buyX: 44 }; // значения подобраны симуляцией (миллионы спинов)
var SLTAB = {"CG":[3,5,8,12,20,35,60,100,200,1000],"SG":[0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2,2.1,2.2,2.3,2.4,2.5,2.6,2.7,2.8,2.9,3,3.1,3.2],"base":[[0.44206,0.48404,0.52197,0.55456,0.5818,0.60743,0.6314,0.65376,0.67431,0.69048,0.70616,0.72124,0.73586,0.74993,0.76351,0.77658,0.78908,0.80098,0.8109,0.82019,0.82936,0.83836,0.84714,0.85577,0.86417,0.87241],[0.49225,0.55175,0.60768,0.6596,0.70688,0.75128,0.79325,0.83283,0.86995,0.90366,0.93356,0.96083,0.98701,1.01238,1.03659,1.06,1.08238,1.10368,1.12385,1.14014,1.15608,1.17175,1.18711,1.20206,1.21675,1.23123],[0.5112,0.57986,0.6472,0.71255,0.7753,0.8359,0.89429,0.95044,1.00435,1.05536,1.10335,1.14916,1.1934,1.23613,1.27735,1.31704,1.35531,1.39193,1.42668,1.45836,1.48813,1.51569,1.54266,1.56885,1.59458,1.61981],[0.52137,0.59213,0.66244,0.73216,0.8013,0.86979,0.93739,1.00389,1.06883,1.13195,1.19363,1.25385,1.31262,1.36987,1.42566,1.47996,1.53263,1.58304,1.63166,1.67816,1.72373,1.76824,1.81168,1.8542,1.89563,1.93616],[0.53471,0.60698,0.67885,0.75036,0.82159,0.89259,0.96335,1.03387,1.10407,1.17393,1.24338,1.31253,1.38131,1.44966,1.51744,1.58465,1.65117,1.7168,1.78138,1.84486,1.90731,1.96899,2.02984,2.08976,2.14882,2.207],[0.54967,0.62423,0.69823,0.77176,0.84486,0.9176,0.99004,1.06221,1.13416,1.20591,1.27743,1.34878,1.42,1.49108,1.56203,1.63284,1.70352,1.77406,1.84445,1.91461,1.98461,2.05437,2.12389,2.19324,2.26241,2.33138],[0.56256,0.63949,0.71588,0.79177,0.86724,0.94228,1.01696,1.0913,1.16533,1.23906,1.31255,1.38577,1.45874,1.53152,1.60412,1.67654,1.74881,1.82093,1.89292,1.9648,2.03656,2.10819,2.17968,2.25108,2.32238,2.39361],[0.57292,0.65183,0.7303,0.80837,0.88601,0.96332,1.04024,1.11685,1.19314,1.26911,1.34484,1.42029,1.49552,1.57047,1.64522,1.71976,1.79411,1.86824,1.94222,2.016,2.08963,2.16311,2.23645,2.30962,2.38262,2.45552],[0.58301,0.66455,0.7457,0.82643,0.90679,0.9868,1.06647,1.14585,1.2249,1.30366,1.38223,1.46061,1.53877,1.61674,1.69448,1.77203,1.84943,1.92663,2.00363,2.08047,2.15718,2.23371,2.31006,2.38627,2.46232,2.53822],[0.58905,0.6731,0.75716,0.84121,0.92527,1.00929,1.09325,1.17715,1.26095,1.34464,1.42814,1.51153,1.59482,1.67798,1.76107,1.84409,1.92706,2.00992,2.09271,2.17537,2.25796,2.34047,2.42289,2.50516,2.58732,2.6694]],"dc":[[0.37779,0.41644,0.45145,0.48395,0.51394,0.54084,0.5638,0.58473,0.60474,0.62362,0.64163,0.65849,0.67359,0.6862,0.69851,0.71049,0.72212,0.73351,0.74452,0.75525,0.76562,0.77566,0.78534,0.79467,0.80245,0.80987],[0.41322,0.46379,0.51186,0.55782,0.60165,0.64323,0.6819,0.71793,0.75242,0.7854,0.81689,0.84693,0.87536,0.90141,0.92523,0.9468,0.96773,0.98805,1.0079,1.02693,1.04554,1.06348,1.08082,1.09749,1.11336,1.12694],[0.43608,0.49094,0.54501,0.59835,0.65079,0.7021,0.75186,0.80006,0.84694,0.89252,0.93673,0.97963,1.02108,1.06062,1.09839,1.1345,1.16968,1.20388,1.23715,1.26946,1.30088,1.33134,1.3609,1.38946,1.41683,1.44225],[0.45748,0.51442,0.5707,0.62645,0.68168,0.73641,0.7906,0.84431,0.89752,0.95012,1.00207,1.05316,1.1032,1.1521,1.20009,1.2472,1.29341,1.33877,1.38322,1.42678,1.46945,1.51115,1.55172,1.59092,1.62902,1.66578],[0.48727,0.5478,0.60733,0.66605,0.7241,0.78155,0.83849,0.89501,0.95117,1.00701,1.06256,1.11779,1.17272,1.22735,1.28163,1.33564,1.38934,1.44276,1.49587,1.54859,1.60094,1.6529,1.70436,1.75526,1.80549,1.85516],[0.51918,0.58506,0.64969,0.71319,0.77572,0.83742,0.89836,0.95864,1.01837,1.0776,1.13636,1.19472,1.25273,1.31038,1.36772,1.42475,1.48153,1.53807,1.5944,1.65054,1.70648,1.76226,1.81788,1.87332,1.92857,1.98365],[0.54518,0.6164,0.68634,0.75516,0.82301,0.89003,0.95618,1.02157,1.08624,1.15025,1.21361,1.2764,1.33868,1.40048,1.46181,1.52272,1.58324,1.64339,1.70322,1.76275,1.822,1.88097,1.93968,1.99815,2.05641,2.11446],[0.56394,0.63944,0.71399,0.78773,0.86057,0.93254,1.00376,1.0742,1.1439,1.21294,1.28134,1.34917,1.41653,1.48339,1.54969,1.61553,1.68091,1.74586,1.8104,1.87454,1.93829,2.00165,2.06466,2.12733,2.1897,2.2518],[0.58127,0.66131,0.74057,0.8193,0.89737,0.97478,1.05159,1.12788,1.20364,1.27888,1.35367,1.42798,1.50192,1.57546,1.64851,1.72115,1.79332,1.86509,1.93649,2.00752,2.07815,2.1484,2.21828,2.2878,2.357,2.42588],[0.58927,0.67337,0.75745,0.84145,0.92539,1.00929,1.09315,1.17698,1.26079,1.34439,1.42791,1.51133,1.59463,1.67782,1.7608,1.84368,1.9264,2.00896,2.09135,2.17353,2.25553,2.3374,2.41913,2.50071,2.58217,2.66349]],"buy":[[0.52253,0.58317,0.6411,0.6966,0.74974,0.80071,0.8496,0.89655,0.94173,0.98519,1.02697,1.06711,1.10575,1.14298,1.17887,1.21347,1.2469,1.27921,1.31041,1.34055,1.3697,1.39791,1.42521,1.45164,1.47723,1.50203],[0.55969,0.63024,0.69859,0.76486,0.82909,0.89148,0.95211,1.01108,1.0685,1.12448,1.17903,1.23216,1.28398,1.33452,1.38381,1.4319,1.47885,1.52472,1.56956,1.61336,1.65614,1.69791,1.73869,1.77852,1.81745,1.85551],[0.5791,0.65706,0.73344,0.80818,0.88112,0.95237,1.02225,1.09072,1.15788,1.22378,1.28839,1.35176,1.41405,1.47522,1.53532,1.59438,1.65247,1.70961,1.76585,1.8212,1.87566,1.92923,1.98193,2.03383,2.08492,2.13523],[0.58634,0.66823,0.74919,0.82912,0.90789,0.98558,1.06224,1.13781,1.21227,1.28552,1.35757,1.42856,1.49865,1.56785,1.63609,1.70344,1.76997,1.83567,1.9005,1.96447,2.02764,2.0901,2.15185,2.21283,2.2731,2.33267],[0.58861,0.67246,0.75609,0.83939,0.92225,1.00465,1.08655,1.16789,1.24866,1.3288,1.40827,1.48706,1.56514,1.64264,1.71952,1.79573,1.87129,1.94622,2.02045,2.09395,2.1667,2.23875,2.31013,2.38093,2.45119,2.52095],[0.58884,0.67294,0.75702,0.84108,0.9251,1.00908,1.09298,1.17681,1.2605,1.34402,1.42734,1.51044,1.59327,1.67583,1.75814,1.84015,1.92185,2.00324,2.08428,2.16501,2.24541,2.3254,2.40502,2.48425,2.56309,2.6415],[0.58885,0.67297,0.75709,0.84121,0.92533,1.00944,1.09354,1.17764,1.26172,1.3458,1.42984,1.51387,1.59789,1.68188,1.76582,1.84972,1.93358,2.01739,2.10111,2.18474,2.26827,2.35169,2.43498,2.51816,2.60117,2.68404],[0.58885,0.67297,0.75709,0.84121,0.92533,1.00945,1.09358,1.1777,1.26182,1.34594,1.43006,1.51418,1.59829,1.6824,1.76651,1.85061,1.9347,2.01879,2.10287,2.18694,2.27102,2.35506,2.43909,2.52312,2.60714,2.69115],[0.58885,0.67297,0.75709,0.84121,0.92533,1.00945,1.09358,1.1777,1.26182,1.34594,1.43006,1.51418,1.5983,1.68242,1.76655,1.85067,1.93479,2.01891,2.10303,2.18715,2.27127,2.35539,2.43952,2.52364,2.60776,2.69188],[0.58885,0.67297,0.75709,0.84121,0.92533,1.00945,1.09358,1.1777,1.26182,1.34594,1.43006,1.51418,1.5983,1.68242,1.76655,1.85067,1.93479,2.01891,2.10303,2.18715,2.27127,2.35539,2.43952,2.52364,2.60776,2.69188]]};
  function slotScale(mode, C, target) {
    var tb = SLTAB[mode], CG = SLTAB.CG, SG = SLTAB.SG;
    function sAt(j) { var row = tb[j]; if (target >= row[row.length - 1]) return SG[SG.length - 1]; if (target <= row[0]) return SG[0]; for (var i = 1; i < row.length; i++) if (row[i] >= target) { var a = row[i - 1], b = row[i]; return SG[i - 1] + (SG[i] - SG[i - 1]) * (target - a) / (b - a); } return SG[SG.length - 1]; }
    if (C <= CG[0]) return sAt(0); if (C >= CG[CG.length - 1]) return sAt(CG.length - 1);
    for (var j = 1; j < CG.length; j++) if (C <= CG[j]) { var t = (Math.log(C) - Math.log(CG[j - 1])) / (Math.log(CG[j]) - Math.log(CG[j - 1])); return sAt(j - 1) + (sAt(j) - sAt(j - 1)) * t; }
    return 1;
  }
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
    var S = o.state; S.wd = S.wd || []; S.gdep = S.gdep || []; S.gseq = S.gseq || 0; S.wdSeq = S.wdSeq || 0; S.daily = S.daily || {}; S.fees = S.fees || 0; S.sys = S.sys || {}; S.hist = S.hist || []; S.paid = S.paid || {}; S.deposited = S.deposited || 0; S.live = S.live || []; var now = o.now || Date.now, save = o.save || function () {}, roll = o.roll;
    var cfg = function () { return S.cfg; }, set = function (k) { return Number(S.cfg.settings[k]); };
    (function migrate() {
      var DS = defaultConfig({}).settings, st = S.cfg.settings; Object.keys(DS).forEach(function (k) { if (st[k] === undefined || (typeof DS[k] === 'number' && (st[k] === null || st[k] === '' || isNaN(+st[k])))) st[k] = DS[k]; });
      st.edges = st.edges || {}; Object.keys(DS.edges).forEach(function (g) { if (st.edges[g] === undefined) st.edges[g] = DS.edges[g]; });
      S.flags = S.flags || {}; if (!S.flags.m10) { S.flags.m10 = 1; var ed0 = S.cfg.settings.edges || {}; if (ed0.mines === 0.06) ed0.mines = 0.10; var sk1 = S.cfg.skins || {}; if (!sk1.sprite_rocket || /pepe\.webp$/.test(sk1.sprite_rocket)) sk1.sprite_rocket = '/art/minedog.webp'; }
      var sk0 = S.cfg.skins = S.cfg.skins || {}; if (sk0.mines_closed === undefined) sk0.mines_closed = '/art/minedog.webp'; ['mines_safe', 'mines_bomb', 'card_mines'].forEach(function (k) { if (sk0[k] === undefined) sk0[k] = ''; });
      if (!S.flags.lr1) { S.flags.lr1 = 1; var edL = S.cfg.settings.edges || {}; if (edL.tower === 0.08) edL.tower = 0.12; if (edL.balloon === 0.08) edL.balloon = 0.12; if (+S.cfg.settings.wdWagerMult === 1) S.cfg.settings.wdWagerMult = 3; }
      if (!S.flags.lr4) { S.flags.lr4 = 1; var ed4 = S.cfg.settings.edges || (S.cfg.settings.edges = {}); if (ed4.pick === undefined) ed4.pick = 0.05; if (S.cfg.settings.modes && S.cfg.settings.modes.pick === undefined) S.cfg.settings.modes.pick = 1; }
      if (!S.flags.lr3) { S.flags.lr3 = 1; if (+S.cfg.settings.maxCaseRtp === 0.95) S.cfg.settings.maxCaseRtp = 0.99; } // кейсы: прибыль от 1%
      if (!S.flags.lr2) { S.flags.lr2 = 1; if (+S.cfg.settings.blMin === 1.5) S.cfg.settings.blMin = 1; } // шарик: убрали минимальный множитель ×1.5
      if (S.bj) { var oldBj = false; ['real', 'demo'].forEach(function (k) { var Ab = S.bj[k]; if (Ab) Object.keys(Ab).forEach(function (id) { var Tb = Ab[id]; if (Tb.stake !== undefined) { oldBj = true; (Tb.seats || []).forEach(function (sb) { if (!sb) return; var ub = S.users[sb.uid]; if (!ub) return; if (Tb.phase !== 'done') { var back = sb.hands && sb.hands.length ? sb.hands.reduce(function (a, h) { return a + h.bet; }, 0) : (sb.bet || 0); ub.balance += back; } ub.bjt = ''; }); } }); }); if (oldBj) S.bj = {}; } // столы со своей ставкой: старые столы закрываются, ставки возвращаются
      Object.keys(S.cfg.items).forEach(function (k) { var it = S.cfg.items[k]; if (it.wd === undefined) it.wd = !!it.img; if (it.up === undefined) it.up = true; });
      if (!S.cfg.slots3) S.cfg.slots3 = defaultSlots3({ slotplum: '/art/slotplum.webp', dog: '/art/dog.webp', pepe: '/art/pepe.webp' }); if (S.cfg.skins.card_slots3 === undefined) S.cfg.skins.card_slots3 = ''; if (S.cfg.skins.card_modes1 === undefined) S.cfg.skins.card_modes1 = ''; if (S.cfg.skins.card_modes2 === undefined) S.cfg.skins.card_modes2 = '';
      (function () { var st9 = S.cfg.settings; if (st9.giftDepositTo === undefined) st9.giftDepositTo = ''; if (st9.giftDepositNote === undefined) st9.giftDepositNote = 'Начисляем в течение 24 часов.'; st9.edges = st9.edges || {}; if (st9.edges.slots3 === undefined) st9.edges.slots3 = 0.10; })();
      (function () { S.flags = S.flags || {}; if (!S.flags.s3v3) { S.flags.s3v3 = 1; var c3b = S.cfg.slots3; if (c3b && JSON.stringify(c3b.bets) === JSON.stringify([10, 25, 50, 100, 250])) { var mnB = +S.cfg.settings.minBet || 10, mxB = +S.cfg.settings.maxBet || 1000, nb = [10, 25, 50, 100, 250, 500, 1000].filter(function (x) { return x >= mnB && x <= mxB; }); if (nb.length >= 2) c3b.bets = nb; } } })();
      (function () { S.flags = S.flags || {}; if (!S.flags.s3v2) { S.flags.s3v2 = 1; var c3 = S.cfg.slots3, ed = S.cfg.settings.edges; if (c3 && +c3.pair === 2) c3.pair = 0; if (ed && +ed.slots3 === 0.06) ed.slots3 = 0.10; } })();
      (function () { S.flags = S.flags || {}; if (!S.flags.s3v4) { S.flags.s3v4 = 1; var c3d = S.cfg.slots3; if (c3d && +c3d.pair === 0) c3d.pair = 2; } })();
      (function () { S.flags = S.flags || {}; if (!S.flags.mn2) { S.flags.mn2 = 1; var s9 = S.cfg.settings; s9.edges = s9.edges || {}; if (s9.edges.mines === undefined || +s9.edges.mines <= 0.10) s9.edges.mines = 0.12; if (!(+s9.minesMaxMult <= 8)) s9.minesMaxMult = 8; } })();
      (function () { S.flags = S.flags || {}; if (!S.flags.s3v5) { S.flags.s3v5 = 1; var c5 = S.cfg.slots3; if (c5 && c5.symbols && c5.symbols.length === 7) { var cn = c5.symbols.map(function (x) { return x.count; }).join(','), ml = c5.symbols.map(function (x) { return x.mult; }).join(','); if (cn === '8,7,5,4,3,2,1' && ml === '5,10,20,40,100,200,500') { var nc = [10, 8, 6, 3, 2, 1, 1], nm = [5, 10, 20, 40, 80, 150, 400]; c5.symbols.forEach(function (x, i) { x.count = nc[i]; x.mult = nm[i]; }); } } } })();
      (function () { S.flags = S.flags || {}; if (!S.flags.nobots) { S.flags.nobots = 1; S.live = (S.live || []).filter(function (x) { return String(x).indexOf('b:') !== 0; }); delete S.botNext; } })();
      if (S.cfg.settings.toon === undefined) S.cfg.settings.toon = 1; if (S.cfg.settings.wdStarsFrom === undefined) S.cfg.settings.wdStarsFrom = 100; if (S.cfg.settings.wdFeeStars === undefined) S.cfg.settings.wdFeeStars = 25;
      var ST0 = S.cfg.settings; ST0.edges = ST0.edges || {}; if (ST0.edges.tower === undefined) ST0.edges.tower = 0.06; if (ST0.edges.hilo === undefined) ST0.edges.hilo = 0.05;
      ST0.modes = ST0.modes || {}; ['rocket', 'mines', 'upgrade', 'slots', 'plinko', 'wheel', 'coin', 'tower', 'bj', 'du', 'hilo'].forEach(function (k) { if (ST0.modes[k] === undefined) ST0.modes[k] = 1; });
      if (ST0.tonAddress === undefined) ST0.tonAddress = ''; if (ST0.channelUrl === undefined) ST0.channelUrl = ''; if (ST0.channelText === undefined) ST0.channelText = 'Наш канал';
      if (ST0.edges.balloon === undefined) ST0.edges.balloon = 0.08; ['roulette', 'balloon'].forEach(function (k) { if (ST0.modes[k] === undefined) ST0.modes[k] = 1; }); if (ST0.rlZeros === undefined) ST0.rlZeros = 3; if (ST0.cupsMult === undefined) ST0.cupsMult = 2.7; if (ST0.upMinMult === undefined) ST0.upMinMult = 1.5; if (!S.flags.m14) { S.flags.m14 = 1; ST0.modes.roulette = 0; ST0.modes.cups = 1; } // рулетку заменили колпачками if (ST0.blMax === undefined) ST0.blMax = 50;
      if (!S.flags.m13) { S.flags.m13 = 1; if (ST0.wdFeeFixed === undefined) ST0.wdFeeFixed = 25; if (+ST0.wdFeePct === 0.05) ST0.wdFeePct = 0; if (ST0.autoPay === undefined) ST0.autoPay = 0; } // комиссия за вывод: фиксированные 25★
      if (!S.flags.wd25) { S.flags.wd25 = 1; ST0.wdFeeFixed = 25; ST0.wdFeePct = 0; }
      if (!S.flags.m12) { S.flags.m12 = 1; if (+ST0.edges.tower === 0.06) ST0.edges.tower = 0.08; if (+ST0.edges.hilo === 0.05) ST0.edges.hilo = 0.07; } // Башня и Hi-Lo: больше прибыли
      if (!S.flags.m11) { S.flags.m11 = 1; var sk2 = S.cfg.skins = S.cfg.skins || {}; if (!sk2.sprite_rocket || !/\/uploads\//.test(sk2.sprite_rocket) || /pepe/i.test(sk2.sprite_rocket)) sk2.sprite_rocket = '/art/minedog.webp'; } // в ракете сидит тёмный мишка
      if (!S.cfg.wheel || !Array.isArray(S.cfg.wheel.secs) || S.cfg.wheel.secs.length < 2 || S.cfg.wheel.secs.join() === WHEEL_OLD.join()) S.cfg.wheel = { on: S.cfg.wheel && S.cfg.wheel.on === 0 ? 0 : 1, secs: defaultWheel().secs }; // старое колесо с 40% «−100%» заменяется новым
    })();
    var edgeOf = function (g) { var e = S.cfg.settings.edges && S.cfg.settings.edges[g]; return e !== undefined && !isNaN(+e) ? +e : set('edge'); };
    function weekStart() { var d = new Date(now()); d.setUTCHours(0, 0, 0, 0); return d.getTime() - ((d.getUTCDay() + 6) % 7) * 864e5; }
    function user(id, name, username, demo) {
      if (demo) id = 'd' + id;
      var u = S.users[id];
      if (!u) u = S.users[id] = { id: id, t0: now(), demo: !!demo, name: name || 'Игрок', username: '', wagered: 0, balance: (demo ? set('demoBalance') : set('startBalance')) || 0, inv: [], nid: 1, tickets: {}, redeemed: {}, round: null, stats: { opened: 0, profit: 0 }, week: { start: 0, profit: 0 } };
      if (name && u.name !== name) u.name = name; if (username !== undefined && u.username !== username) u.username = username || '';
      return u;
    }
    function book(u, game, bet, payout) {
      if (u.demo) return; // демо-игры не попадают ни в статистику, ни в лидеры, ни в Live
      var bl = S.betlog || (S.betlog = []); bl.unshift({ t: now(), u: u.id, n: u.name || u.username || String(u.id), g: game, b: bet, p: payout }); if (bl.length > 400) bl.length = 400; // журнал последних ставок (виден только владельцу в админке)
      var t = S.totals[game] || (S.totals[game] = { n: 0, wagered: 0, paid: 0 }); t.n++; t.wagered += bet; t.paid += payout;
      u.wagered = (u.wagered || 0) + bet; var day = new Date(now()).toISOString().slice(0, 10), dd = S.daily[day] || (S.daily[day] = { wagered: 0, paid: 0, deposited: 0 }); dd.wagered += bet; dd.paid += payout;
      if (u.ref && S.users[u.ref] && !S.users[u.ref].demo) { // RevShare: партнёр получает процент с реальной прибыли от своего друга
        var rp = +set('revPct') || 0, rm = +set('revMonths') || 0;
        if (rp > 0 && (!rm || now() - (u.t0 || 0) <= rm * 30 * 86400e3)) {
          u.revPool = (u.revPool || 0) + (bet - payout);
          if (u.revPool > 0) { u.revAcc = (u.revAcc || 0) + u.revPool * rp; u.revPool = 0; var whole = Math.floor(u.revAcc); if (whole >= 1) { var rf2 = S.users[u.ref]; rf2.balance += whole; rf2.revEarned = (rf2.revEarned || 0) + whole; u.revGen = (u.revGen || 0) + whole; u.revAcc -= whole; } }
        }
      }
      var ws = weekStart(); if (u.week.start !== ws) u.week = { start: ws, profit: 0, wagered: 0 }; u.week.profit += payout - bet; u.week.wagered = (u.week.wagered || 0) + bet;
    }
    function take(u, bet, free) {
      bet = Math.floor(+bet);
      if (!(bet >= set('minBet')) || bet > set('maxBet')) throw new Err('Ставка от ★' + set('minBet') + ' до ★' + set('maxBet'));
      if (u.balance < bet) throw new Err('Не хватает звёзд'); u.balance -= bet; return bet;
    }
    function pay(u, game, bet, payout) { payout = Math.min(Math.floor(payout), set('maxPayout')); u.balance += payout; book(u, game, bet, payout); u.stats.profit += payout - bet; return payout; }
    var mmult = function (k, M) { var r = (1 - edgeOf('mines')) * Math.pow(0.98, k); for (var j = 0; j < k; j++) r *= (25 - j) / (25 - M - j); return Math.min(r, set('minesMaxMult') || 10); };
    var mnext = function (k, M) { var cap = set('minesMaxMult') || 10; return (k >= 25 - M || mmult(k, M) >= cap) ? 0 : mmult(k + 1, M); };
    var s3c = { key: '', val: null };
    function s3info() { var c3 = cfg().slots3, ed = edgeOf('slots3'), key = JSON.stringify(c3) + '|' + ed; if (s3c.key !== key) s3c = { key: key, val: s3calc(c3, ed) }; return s3c.val; }
    function s3pub() { var c3 = cfg().slots3, i = s3info(); return { maxPay: set('maxPayout'), symbols: c3.symbols.map(function (x, k) { return { name: x.name, img: x.img, icon: x.icon, mult: i.mults[k], count: x.count }; }), bets: c3.bets, pair: i.pair, strip: i.strip, hit: i.hit, rtp: 1 - edgeOf('slots3') }; }
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
    function wdCheck(u, it, iid) {
      // Подарки дешевле порога: комиссия ★wdFeeFixed списывается с игрового баланса.
      // Подарки от порога (по умолчанию ★100): комиссия оплачивается отдельно звёздами Telegram, как пополнение.
      var big = it.value >= (set('wdStarsFrom') || 100), reasons = [], fee = big ? Math.ceil(set('wdFeeStars') || 0) : Math.ceil(set('wdFeeFixed') || 0), need = Math.ceil((u.deposited || 0) * set('wdWagerMult')), have = Math.floor(u.wagered || 0);
      if (!it.wd) reasons.push('Этот предмет нельзя вывести, его можно продать за звёзды или использовать в апгрейде');
      if (it.value < set('wdMinValue')) reasons.push('Минимальная стоимость подарка для вывода ★' + set('wdMinValue'));
      if (!u.username) reasons.push('Для вывода нужен username в Telegram. Укажи его в Настройки → Имя пользователя и открой приложение заново');
      if (have < need) reasons.push('Сначала нужно отыграть пополнения: сделай ставок ещё на ★' + (need - have));
      if (!big && u.balance < fee) reasons.push('Для комиссии за вывод (★' + fee + ') не хватает звёзд на балансе');
      var paid = big && !!(u.wdPaid && u.wdPaid[iid]);
      return { ok: !reasons.length, reasons: reasons, fee: fee, big: big, paid: paid };
    }
    function wdPayOnce(key, uid, iid) { // комиссия за вывод оплачена звёздами Telegram (вызывает сервер после successful_payment)
      if (S.paid[key]) return false; var u = S.users[String(uid)]; if (!u) return false; u.wdPaid = u.wdPaid || {}; u.wdPaid[iid] = now(); S.paid[key] = 1; save(); return true;
    }

    // ---- Блэкджек: живые столы с реальными игроками, дилер играет по правилам на сервере ----
    var BJ_TN = ['Луна', 'Орбита', 'Сатурн', 'Комета', 'Квазар', 'Пульсар', 'Зенит', 'Аврора', 'Нептун', 'Венера'], BJ_BET = 9000, BJ_TURN = 15000, BJ_IDLE = 40000;
    function bjMin() { return Math.max(1, Math.floor(set('bjMin') || 10)); }
    function bjMax() { return Math.max(bjMin(), Math.floor(set('bjMax') || 10000)); }
    function bjAll(demo) {
      var B = S.bj || (S.bj = {}), k = demo ? 'demo' : 'real';
      if (!B[k]) { B[k] = {}; BJ_TN.forEach(function (n, i) { var id = (demo ? 'd' : 'r') + 't' + i; B[k][id] = { id: id, name: n, seats: [null, null, null, null, null], phase: 'wait', dl: 0, dealer: [], hole: false, shoe: [], round: 0, turn: -1, th: 0 }; }); }
      return B[k];
    }
    function bjTable(id) { var B = S.bj || {}; return (B.real && B.real[id]) || (B.demo && B.demo[id]) || null; }
    function bjSolo(u) { // личный стол один на один с дилером: в лобби не виден, сесть может только владелец
      var B = bjAll(u.demo), id = 'p' + u.id;
      if (!B[id]) B[id] = { id: id, priv: u.id, name: 'Один на один', seats: [null, null, null, null, null], phase: 'wait', dl: 0, dealer: [], hole: false, shoe: [], round: 0, turn: -1, th: 0 };
      return B[id];
    }
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
      T.phase = 'play'; bjNext(T, t); if (T.phase === 'play') T.dl += 400 * (act.length + 1) * 2; // время на анимацию раздачи
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
          if (nat && dn) p = h.bet; else if (nat) p = h.bet + Math.floor(h.bet * bp); else if (dn || v > 21) p = 0; else if (d === 22 && set('bjP22')) p = h.bet; else if (d > 21 || v > d) p = h.bet * 2; else if (v === d) p = h.bet;
          h.pay = p; h.res = p > h.bet ? 'w' : p === h.bet ? 'p' : 'l'; h.done = true;
          if (u) { u.balance += p; book(u, 'blackjack', h.bet, p); u.stats.profit += p - h.bet; }
        });
        s.bet = 0;
      });
      T.phase = 'done'; T.turn = -1; T.dl = t + 4500 + 750 * Math.max(0, T.dealer.length - 2);
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
      ['real', 'demo'].forEach(function (k) { var A = B[k]; if (A) Object.keys(A).forEach(function (id) { var T = A[id]; if (T.phase !== 'wait' || T.seats.some(Boolean)) bjAdvance(T, t); if (T.priv && T.phase === 'wait' && !T.seats.some(Boolean)) delete A[id]; }); });
    }
    function bjLeaveU(u) {
      var T = u.bjt && bjTable(u.bjt); u.bjt = ''; if (!T) return; var i = bjSeatOf(T, u.id); if (i < 0) return; var s = T.seats[i];
      if (T.phase === 'play' && s.hands.length) { s.left = true; s.hands.forEach(function (h) { h.done = true; }); if (T.turn === i) bjNext(T, now()); return; }
      if (s.bet > 0) { u.balance += s.bet; s.bet = 0; } // ставка ещё не сыграла: возвращаем
      T.seats[i] = null;
    }
    function bjView(u, T) {
      var t = now(), me = bjSeatOf(T, u.id); if (me >= 0) T.seats[me].seen = t;
      return { bj: { id: T.id, name: T.name, min: bjMin(), max: bjMax(), phase: T.phase, dl: T.dl, now: t, round: T.round, turn: T.turn, th: T.th, me: me, pay: set('bjPay') || 1.2, h17: !!set('bjH17'), p22: !!set('bjP22'),
        solo: !!T.priv, dealer: T.hole && T.dealer.length > 1 ? [T.dealer[0], '??'] : T.dealer.slice(),
        seats: T.seats.map(function (s) { return s ? { name: s.uid === u.id ? s.name : maskName(s.name), me: s.uid === u.id, bet: s.bet, hands: s.hands.map(function (h) { return { c: h.c.slice(), bet: h.bet, done: !!h.done, res: h.res || '', pay: h.pay || 0, split: !!h.split }; }) } : null; }) } };
    }
    function bjMine(u) { var T = u.bjt && bjTable(u.bjt), i = T ? bjSeatOf(T, u.id) : -1; if (i < 0) throw new Err('Сначала сядь за стол'); return { T: T, i: i, s: T.seats[i] }; }

    // ---- Дурак подкидной: игроки играют между собой на ставку, платформа берёт комиссию с проигрыша ----
    var DU_ST = [10, 50, 100, 500, 1000, 5000, 10000], DU_SZ = [2, 3, 4], DU_R = '6789TJQKA', DU_MOVE = 30000, DU_THROW = 9000, DU_TAKE = 6000, DU_START = 4000, DU_IDLE = 45000, DU_END = 12000;
    function duAll(demo) { var D = S.du || (S.du = {}), k = demo ? 'demo' : 'real'; return D[k] || (D[k] = { seq: 0, t: {} }); }
    function duFind(id) { var D = S.du || {}; return (D.real && D.real.t[id]) || (D.demo && D.demo.t[id]) || null; }
    var duRk = function (c) { return DU_R.indexOf(c[0]); };
    var duBeats = function (d, a, tr) { return d[1] === a[1] ? duRk(d) > duRk(a) : (d[1] === tr && a[1] !== tr); };
    function duSeat(T, uid) { for (var i = 0; i < T.size; i++) if (T.seats[i] && T.seats[i].uid === uid) return i; return -1; }
    function duNext(T, i) { for (var k = 1; k <= T.size; k++) { var j = (i + k) % T.size; if (T.act[j]) return j; } return -1; }
    function duRanks(T) { var r = {}; T.tbl.forEach(function (p) { r[p.a[0]] = 1; if (p.d) r[p.d[0]] = 1; }); return r; }
    var duUnb = function (T) { return T.tbl.filter(function (p) { return !p.d; }).length; };
    function duCanThrow(T, i) {
      if (!T.act[i] || i === T.def || !T.tbl.length || T.tbl.length >= T.lim) return false;
      if (!T.taking && duUnb(T) >= T.hands[T.def].length) return false;
      var r = duRanks(T); return T.hands[i].some(function (c) { return r[c[0]]; });
    }
    function duStart(T, t) {
      T.seats.forEach(function (s, i) { var u = s && S.users[s.uid]; if (s && (!u || u.balance < T.stake)) { if (u) u.dut = ''; T.seats[i] = null; } });
      if (T.seats.some(function (s) { return !s; })) { T.phase = 'wait'; return; }
      var d = [], i, j; for (i = 0; i < 9; i++) for (j = 0; j < 4; j++) d.push(DU_R[i] + 'shdc'[j]);
      var R0 = o.rand || function () { return roll(S.sys); }; for (var pass = 0; pass < 3; pass++) for (i = d.length - 1; i > 0; i--) { j = Math.floor(R0() * (i + 1)); var x = d[i]; d[i] = d[j]; d[j] = x; } // тройная тасовка криптогенератором
      T.deck = d; T.trump = d[0]; T.disc = 0; T.hands = []; T.act = []; T.miss = []; T.out = [];
      for (i = 0; i < T.size; i++) { var u = S.users[T.seats[i].uid]; u.balance -= T.stake; T.hands.push([]); T.act.push(true); T.miss.push(0); }
      for (j = 0; j < 6; j++) for (i = 0; i < T.size; i++) T.hands[i].push(T.deck.pop());
      var tr = T.trump[1], best = -1, br = 99; // первым ходит тот, у кого младший козырь
      for (i = 0; i < T.size; i++) T.hands[i].forEach(function (c) { if (c[1] === tr && duRk(c) < br) { br = duRk(c); best = i; } });
      T.att = best >= 0 ? best : Math.floor(roll(S.sys) * T.size); T.def = duNext(T, T.att);
      T.tbl = []; T.taking = false; T.passed = {}; T.lim = Math.min(6, T.hands[T.def].length); T.phase = 'play'; T.round = (T.round || 0) + 1; T.ev = (T.ev || 0) + 1; T.last = { k: T.ev, type: 'deal' };
      T.dl = t + DU_MOVE + 3500; T.res = null; T.durak = -1;
    }
    function duFinish(T, t, durak) {
      T.phase = 'done'; T.dl = t + DU_END; T.durak = durak; var S0 = T.stake, n = T.size, fee = durak >= 0 ? Math.min(S0, Math.ceil(S0 * set('duFee'))) : 0, share = durak >= 0 && n > 1 ? Math.floor((S0 - fee) / (n - 1)) : 0, res = [];
      T.seats.forEach(function (s, i) {
        var p = durak < 0 ? S0 : i === durak ? 0 : S0 + share, u = s && S.users[s.uid]; res.push(p - S0);
        if (u) { u.balance += p; book(u, 'durak', S0, p); u.stats.profit += p - S0; }
      });
      T.res = res; T.ev++; T.last = { k: T.ev, type: 'end' };
    }
    function duEndBout(T, t) {
      var cards = []; T.tbl.forEach(function (p) { cards.push(p.a); if (p.d) cards.push(p.d); });
      var took = T.taking, def = T.def; T.ev++; T.last = { k: T.ev, type: took ? 'take' : 'bito', seat: def };
      if (took) T.hands[def] = T.hands[def].concat(cards); else T.disc += cards.length;
      T.tbl = []; T.taking = false; T.passed = {};
      var order = [T.att], k; for (k = 1; k < T.size; k++) { var j = (T.att + k) % T.size; if (j !== def) order.push(j); } order.push(def); // добор: сначала ходивший, защитник последним
      order.forEach(function (i) { if (!T.act[i]) return; while (T.hands[i].length < 6 && T.deck.length) T.hands[i].push(T.deck.pop()); });
      if (!T.deck.length) for (k = 0; k < T.size; k++) if (T.act[k] && !T.hands[k].length) { T.act[k] = false; T.out.push(k); }
      var left = []; for (k = 0; k < T.size; k++) if (T.act[k]) left.push(k);
      if (left.length <= 1) return duFinish(T, t, left.length ? left[0] : -1);
      var na = took ? duNext(T, def) : (T.act[def] ? def : duNext(T, def));
      T.att = na; T.def = duNext(T, na); T.lim = Math.min(6, T.hands[T.def].length); T.dl = t + DU_MOVE + 1200;
    }
    function duCheck(T, t) { // бито или взял, когда подкидывать больше никто не может или все сказали «хватит»
      if (T.phase !== 'play' || !T.tbl.length) return;
      if (!T.taking && duUnb(T)) return;
      for (var i = 0; i < T.size; i++) if (T.act[i] && i !== T.def && !T.passed[i] && duCanThrow(T, i)) return;
      duEndBout(T, t);
    }
    function duMiss(T, t, i) { T.miss[i] = (T.miss[i] || 0) + 1; if (T.miss[i] >= 3) { duFinish(T, t, i); return true; } return false; } // три пропуска хода подряд = поражение
    function duAdvance(T, t) {
      T.seats.forEach(function (s, i) { if (s && (T.phase === 'wait' || T.phase === 'start') && t - s.seen > DU_IDLE) { var u = S.users[s.uid]; if (u && u.dut === T.id) u.dut = ''; T.seats[i] = null; if (T.phase === 'start') T.phase = 'wait'; } });
      if (T.phase === 'start' && t >= T.dl) duStart(T, t);
      if (T.phase === 'play' && t >= T.dl) {
        if (!T.tbl.length) { var h = T.hands[T.att], tr = T.trump[1]; if (duMiss(T, t, T.att)) return; var c = h.slice().sort(function (a, b) { return ((a[1] === tr) - (b[1] === tr)) || duRk(a) - duRk(b); })[0];
          h.splice(h.indexOf(c), 1); T.tbl.push({ a: c, d: null, by: T.att }); T.dl = t + DU_MOVE; }
        else if (duUnb(T) && !T.taking) { if (duMiss(T, t, T.def)) return; T.taking = true; T.passed = {}; T.dl = t + DU_TAKE; duCheck(T, t); }
        else duEndBout(T, t);
      }
    }
    function duTick() {
      var t = now(), D = S.du || {};
      ['real', 'demo'].forEach(function (k) { var A = D[k]; if (!A) return; Object.keys(A.t).forEach(function (id) { var T = A.t[id];
        if (T.phase === 'done' && t >= T.dl) { T.seats.forEach(function (s) { var u = s && S.users[s.uid]; if (u && u.dut === id) u.dut = ''; }); delete A.t[id]; return; }
        if (T.phase !== 'done') duAdvance(T, t);
        if (T.phase === 'wait' && !T.seats.some(Boolean)) delete A.t[id]; }); });
    }
    function duLeaveU(u) {
      var T = u.dut && duFind(u.dut); if (!T) { u.dut = ''; return; } var i = duSeat(T, u.id); if (i < 0) { u.dut = ''; return; }
      if (T.phase === 'wait' || T.phase === 'start') { T.seats[i] = null; T.phase = 'wait'; u.dut = ''; return; }
      if (T.phase === 'play' && T.act[i]) { T.seats[i].left = true; duFinish(T, now(), i); return; } // сдался: остаётся за столом, чтобы увидеть итог
      u.dut = '';
    }
    function duSort(h, tr) { return h.slice().sort(function (a, b) { return ((a[1] === tr) - (b[1] === tr)) || duRk(a) - duRk(b) || ('shdc'.indexOf(a[1]) - 'shdc'.indexOf(b[1])); }); }
    function duView(u, T) {
      var t = now(), me = duSeat(T, u.id); if (me >= 0) T.seats[me].seen = t; var pl = T.phase === 'play' || T.phase === 'done';
      return { du: { id: T.id, stake: T.stake, size: T.size, phase: T.phase, dl: T.dl, now: t, me: me, fee: set('duFee'), round: T.round || 0,
        trump: pl ? T.trump : '', deck: pl ? T.deck.length : 0, disc: T.disc || 0, tbl: pl ? T.tbl.map(function (p) { return { a: p.a, d: p.d, by: p.by }; }) : [],
        att: pl ? T.att : -1, def: pl ? T.def : -1, taking: !!T.taking, lim: T.lim || 0, last: T.last || null, durak: T.durak, res: T.res || null,
        hand: pl && me >= 0 ? duSort(T.hands[me], T.trump[1]) : [], can: pl && me >= 0 && T.phase === 'play' ? duCanThrow(T, me) : false,
        seats: T.seats.map(function (s, i) { return s ? { name: s.uid === u.id ? s.name : maskName(s.name), me: s.uid === u.id, n: pl ? T.hands[i].length : 0, act: pl ? !!T.act[i] : true, out: pl ? T.out.indexOf(i) : -1, passed: !!(T.passed && T.passed[i]), left: !!s.left } : null; }) } };
    }
    function duMine(u) { var T = u.dut && duFind(u.dut), i = T ? duSeat(T, u.id) : -1; if (i < 0) throw new Err('Ты не за столом'); return { T: T, i: i }; }

    // ---- включение режимов из админки ----
    var MODE_OF = { 'crash/bet': 'rocket', 'mines/start': 'mines', 'upgrade': 'upgrade', 'slots/spin': 'slots', 'plinko': 'plinko', wheel: 'wheel', coin: 'coin', 'tower/start': 'tower', 'hilo/start': 'hilo', roulette: 'roulette', 'balloon/start': 'balloon', 'cups/start': 'cups', 'pick/start': 'pick', 'bj/sit': 'bj', 'bj/solo': 'bj', 'bj/bet': 'bj', 'du/join': 'du' };
    function modeOn(k) { var m = cfg().settings.modes || {}; return m[k] !== 0 && m[k] !== '0' && m[k] !== false; }

    // ---- Кирка: бесконечная шахта из блоков-кнопок. Кирка падает сверху, ломает блоки, пока не кончится прочность. Весь раунд считает сервер ----
    var PK = {
      COLS: 7, DOWN: 0.84, R1: 0.9851, PRICE: [0, 1.9, 3.6, 6.4],
      TIER: [{ hp: 100, m: 1, p: 0.635 }, { hp: 150, m: 1.25, p: 0.25 }, { hp: 200, m: 1.5, p: 0.088 }, { hp: 400, m: 2, p: 0.027 }],
      PAY: { red: 0.02, gold: 0.04, emerald: 0.075, diamond: 0.18 }, COST: { stone: 5, red: 6, gold: 7, emerald: 8, diamond: 9, bed: 12, bump: 3 },
      P: { f: 0.20695, red: 0.24, gold: 0.09, em: 0.04, di: 0.012, tnt: 0.03, jelly: 0.02, crate: 0.01, bed: 0.02, bedFrom: 16, rb: 1, gb: 1, ee: 0.9, de: 1.1, bo: 2.6, bor: 14 }
    };
    var PK_CH = { stone: 's', red: 'r', gold: 'g', emerald: 'e', diamond: 'd', tnt: 't', jelly: 'j', crate: 'c', bed: 'b', air: '.' };
    var pk2 = function (v) { return Math.round(v * 100) / 100; };
    function pkPlay(R, ti, K) { // K — множитель в звёздах: ставка × коэффициент прибыли
      var g = [], orig = [], genTo = 0, P = PK.P, ks = ['red', 'gold', 'emerald', 'diamond'], COLS = PK.COLS;
      function row(r) { while (g.length <= r) { var a = []; for (var c = 0; c < COLS; c++) a.push('stone'); g.push(a); } return g[r]; }
      function genRow(r) {
        var bo = 1 + P.bo * Math.max(0, 1 - r / P.bor), d = r / 30, w = { red: bo * P.f * P.red * P.rb, gold: bo * P.f * P.gold * (P.gb + Math.min(d, 3)), emerald: bo * P.f * P.em * (0.25 + Math.pow(Math.min(d, 3.2), P.ee)), diamond: P.f * P.di * (0.05 + Math.pow(Math.min(d, 3.4), P.de)) };
        for (var c = 0; c < COLS; c++) {
          if (row(r)[c] !== 'stone') continue;
          var x = R(), t = null, acc = 0, q;
          for (q = 0; q < 4; q++) { acc += w[ks[q]]; if (x < acc) { t = ks[q]; break; } }
          if (t && r >= 1) { var sz = 1 + Math.floor(R() * 3), cr = r, cc = c, i; for (i = 0; i < sz; i++) { if (cc < COLS) row(cr)[cc] = t; if (R() < 0.5) cc++; else cr++; } }
          else { var y = R(); if (r >= 1 && y < P.tnt * bo) row(r)[c] = 'tnt'; else if (r >= 1 && y < (P.tnt + P.jelly) * bo) row(r)[c] = 'jelly'; else if (r >= 2 && y < (P.tnt + P.jelly + P.crate) * bo) row(r)[c] = 'crate'; else if (r >= P.bedFrom && y < (P.tnt + P.jelly + P.crate) * bo + P.bed * Math.min(1, (r - P.bedFrom) / 25)) row(r)[c] = 'bed'; }
        }
        orig[r] = row(r).map(function (v) { return PK_CH[v]; }).join('');
      }
      function ensure(r) { while (genTo < r + 14) { genRow(genTo); genTo++; } }
      function vein(r, c, t) { var out = [], st = [[r, c]]; while (st.length) { var p = st.pop(), y = p[0], x = p[1]; if (y < 0 || x < 0 || x >= COLS) continue; ensure(y); if (row(y)[x] !== t) continue; row(y)[x] = 'air'; out.push([y, x]); st.push([y + 1, x], [y - 1, x], [y, x + 1], [y, x - 1]); } return out; }
      ensure(0);
      var hp = PK.TIER[ti].hp, cur = ti, m = PK.TIER[ti].m, bets = 0, r = -1, c = 3, steps = 0, ev = [], maxR = 0;
      while (hp > 0 && steps++ < 1500) {
        var x = R(), nr = r + 1, nc = c; if (r >= 0 && x >= PK.DOWN) nc = c + (x < PK.DOWN + (1 - PK.DOWN) / 2 ? -1 : 1); // всегда вниз; отскок может сдвинуть на соседнюю колонку (диагональ)
        if (nc < 0 || nc >= COLS) nc = c; ensure(nr + 1); var b = row(nr)[nc];
        if (b === 'air') { r = nr; c = nc; ev.push({ e: 'mv', r: r, c: c }); if (r > maxR) maxR = r; continue; }
        if (b === 'bed') {
          if (cur === 3) { hp -= PK.COST.bed; row(nr)[nc] = 'air'; r = nr; c = nc; ev.push({ e: 'bbrk', h0: hp + PK.COST.bed, r: r, c: c, hp: Math.max(0, hp) }); if (r > maxR) maxR = r; }
          else { hp -= PK.COST.bump; if (x < 0.5) c = Math.max(0, Math.min(COLS - 1, c + (R() < 0.5 ? -1 : 1))); ev.push({ e: 'bed', h0: hp + PK.COST.bump, r: nr, c: nc, pc: c, hp: Math.max(0, hp) }); }
          continue;
        }
        if (b === 'stone') { hp -= PK.COST.stone; row(nr)[nc] = 'air'; r = nr; c = nc; ev.push({ e: 'st', h0: hp + PK.COST.stone, r: r, c: c, hp: Math.max(0, hp) }); if (r > maxR) maxR = r; continue; }
        if (b === 'jelly') { row(nr)[nc] = 'air'; r = Math.max(-1, r - 2); ev.push({ e: 'jelly', r: nr, c: nc, pr: r, pc: c, hp: hp }); continue; }
        if (b === 'crate') { row(nr)[nc] = 'air'; if (cur < 3) { cur++; hp = PK.TIER[cur].hp; m = PK.TIER[cur].m; } else hp = Math.min(PK.TIER[3].hp, hp + 120); r = nr; c = nc; ev.push({ e: 'crate', r: r, c: c, ti: cur, hp: hp }); if (r > maxR) maxR = r; continue; }
        if (b === 'tnt') {
          row(nr)[nc] = 'air'; var cells = [], y, xx;
          for (y = nr - 1; y <= nr + 1; y++) for (xx = nc - 1; xx <= nc + 1; xx++) {
            if (y < 0 || xx < 0 || xx >= COLS) continue; ensure(y); var t2 = row(y)[xx];
            if (t2 === 'stone' || t2 === 'tnt' || t2 === 'jelly' || t2 === 'crate' || (t2 === 'bed' && cur === 3)) { row(y)[xx] = 'air'; cells.push([y, xx, PK_CH[t2], 0]); }
            else if (PK.PAY[t2]) { var o = vein(y, xx, t2), pp = pk2(PK.PAY[t2] * m * K); bets += o.length * PK.PAY[t2] * m; o.forEach(function (q) { cells.push([q[0], q[1], PK_CH[t2], pp]); }); }
          }
          r = nr; c = nc; ev.push({ e: 'tnt', r: r, c: c, hp: hp, cells: cells }); if (r > maxR) maxR = r; continue;
        }
        if (PK.PAY[b]) { hp -= PK.COST[b]; var vo = vein(nr, nc, b); bets += vo.length * PK.PAY[b] * m; r = nr; c = nc; ev.push({ e: 'ore', h0: hp + PK.COST[b], r: r, c: c, k: PK_CH[b], hp: Math.max(0, hp), p: pk2(PK.PAY[b] * m * K), cells: vo }); if (r > maxR) maxR = r; continue; }
      }
      ensure(maxR + 12);
      return { ev: ev, bets: bets, rows: orig.slice(0, maxR + 11) };
    }
    function pkPub() { return { cols: PK.COLS, tiers: PK.TIER.map(function (t) { return { hp: t.hp, m: t.m, p: t.p }; }), price: PK.PRICE, pay: PK.PAY }; }
    // ---- Башня: 8 этажей, на каждом одна или две ловушки ----
    var TW_LV = { easy: { c: 3, t: 1 }, mid: { c: 2, t: 1 }, hard: { c: 3, t: 2 }, pro: { c: 4, t: 3 } }, TW_F = 8;
    var twMult = function (lv, k) { var L = TW_LV[lv], r = 1 - edgeOf('tower'); for (var j = 0; j < k; j++) r *= L.c / (L.c - L.t); return Math.min(Math.floor(r * 100) / 100, Math.max(2, set('twMaxMult') || 50)); };
    function twTable(lv) { var a = []; for (var k = 1; k <= TW_F; k++) a.push(twMult(lv, k)); return a; }
    // ---- Hi-Lo: угадай, следующая карта выше или ниже. Комиссия берётся один раз, поэтому длинные серии честные ----
    var HL_R = 'A23456789TJQK';
    function hlCard(u) { return HL_R[Math.floor(roll(u) * 13)] + 'shdc'[Math.floor(roll(u) * 4)]; }
    var hlRank = function (c) { return HL_R.indexOf(c[0]) + 1; };
    function hlOdds(c) { var r = hlRank(c); return { hi: (14 - r) / 13, lo: r / 13 }; }
    var HL_MIN = 1.15; // слишком безопасный вариант (меньше ×1.15 за угадывание) недоступен: нужно рисковать
    function hlNext(F, c) { var o = hlOdds(c), e = 1 - edgeOf('hilo'); var f = function (p) { return p >= 1 || e / p < HL_MIN ? 0 : Math.floor(F * e / p * 100) / 100; }; return { hi: f(o.hi), lo: f(o.lo) }; }
    function hlState(r) { var e = 1 - edgeOf('hilo'); return { skipsLeft: 2 - (r.skips || 0), card: r.card, hist: r.hist, steps: r.steps, mult: r.steps ? Math.floor(r.F * e * 100) / 100 : 1, next: hlNext(r.F, r.card), bet: r.bet }; }

    // ---- Рулетка: стандартные выплаты (35:1, 17:1, 8:1, 2:1, 1:1). Прибыль даёт число зеро: 1 зеро — RTP 97.3%, 0 и 00 — 94.7%, 0, 00 и 000 — 92.3% ----
    var RL_RED = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    function cupsMult() { var m = +set('cupsMult') || 2.7; return Math.min(2.95, Math.max(1.5, m)); }
    function rlZeros() { var z = Math.round(set('rlZeros')) || 3; return Math.min(3, Math.max(1, z)); }
    function rlCover(b) { // какие числа покрывает ставка (37 = «00», 38 = «000»)
      var t = String(b.t || ''), v = b.v, a = [], i, z = rlZeros();
      if (t === 'n') { v = Math.floor(+v); if (v >= 0 && v <= 36 || (v === 37 && z >= 2) || (v === 38 && z >= 3)) return [v]; return null; }
      if (t === 'sp') { var x = Math.floor(+(v && v[0])), y = Math.floor(+(v && v[1])); if (x > y) { var q = x; x = y; y = q; } if (x >= 1 && y <= 36 && ((y - x === 1 && x % 3 !== 0) || y - x === 3)) return [x, y]; return null; }
      if (t === 'co') { v = Math.floor(+v); if (v >= 1 && v <= 32 && v % 3 !== 0) return [v, v + 1, v + 3, v + 4]; return null; }
      for (i = 1; i <= 36; i++) {
        if ((t === 'red' && RL_RED.indexOf(i) >= 0) || (t === 'black' && RL_RED.indexOf(i) < 0) || (t === 'even' && i % 2 === 0) || (t === 'odd' && i % 2 === 1) || (t === 'low' && i <= 18) || (t === 'high' && i >= 19) ||
          (t === 'dz' && Math.ceil(i / 12) === +v) || (t === 'col' && ((i - 1) % 3) + 1 === +v)) a.push(i);
      }
      return a.length ? a : null;
    }
    // ---- Шарик: держишь — надувается, отпустил — забрал. Шанс дожить до ×X = (1 − прибыль) / X ----
    var BL_K = 0.22; // скорость роста: ×2 примерно за 3 секунды
    var blM = function (dt) { return Math.floor(Math.exp(BL_K * Math.max(0, dt) / 1000) * 100) / 100; };
    function blCap() { return Math.max(2, Math.min(1000, set('blMax') || 50)); }
    function blResolve(u, t) { // раунд, брошенный без «отпустить»: считается, что кнопку держали до конца
      var r = u.bln; if (!r) return null; u.bln = null;
      if (r.cp >= r.cap) return { done: true, mult: r.cap, payout: pay(u, 'balloon', r.bet, r.bet * r.cap) };
      book(u, 'balloon', r.bet, 0); u.stats.profit -= r.bet; return { pop: true, cp: r.cp };
    }
    var REF_NEED = 5; // сколько друзей нужно пригласить за одно бесплатное открытие
    function refFreeAvail(u) { return Math.max(0, Math.floor((u.refCount || 0) / REF_NEED) - (u.refUsed || 0)); }
    var H = {
      me: function (u, b) {
        if (b.ref && !u.refSet) { u.refSet = 1; var rf = S.users[String(b.ref)]; if (rf && rf.id !== u.id && !u.demo && !rf.demo && u.t0 && now() - u.t0 < 3600e3) { u.ref = rf.id; rf.refCount = (rf.refCount || 0) + 1; } } // считаем только новых игроков, пришедших по ссылке
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
        var cost = Math.ceil(bet * (buy ? SLOT.buyX : dc ? 1.25 : 1)), mode = buy ? 'buy' : dc ? 'dc' : 'base', Cx = Math.min(+set('slotsMaxX') || 40, set('maxPayout') / cost);
        if (Cx < 5) throw new Err(buy ? 'Для такой ставки покупка бонуса недоступна. Уменьши ставку до ★' + Math.max(1, Math.floor(set('maxPayout') / (SLOT.buyX * 5))) : 'Ставка слишком большая для лимита выплат');
        if (u.balance < cost) throw new Err('Не хватает звёзд'); u.balance -= cost;
        var g = slotGame(function () { return roll(u); }, { buy: buy, dc: dc }, slotScale(mode, Cx, 1 - edgeOf('slots'))), payout = pay(u, 'slots', cost, Math.min(Math.round(bet * g.total), Math.floor(Cx * cost)));
        return { spins: g.spins, total: g.total, payout: payout, cost: cost };
      },
      'pick/start': function (u, b) {
        var bet = Math.floor(+b.bet), buy = Math.floor(+b.buy) || 0; if (!(bet >= set('minBet')) || bet > set('maxBet')) throw new Err('Ставка от ★' + set('minBet') + ' до ★' + set('maxBet'));
        if (buy < 0 || buy > 3) buy = 0; var ti = 3, cost = bet, i;
        if (buy >= 1) { ti = buy; cost = Math.ceil(bet * PK.PRICE[buy]); } else { var x0 = roll(u), a0 = 0; for (i = 0; i < 4; i++) { a0 += PK.TIER[i].p; if (x0 < a0) { ti = i; break; } } }
        var Cx = Math.min(+set('pickMaxX') || 50, set('maxPayout') / cost); if (Cx < 5) throw new Err(buy >= 1 ? 'Для этой бонуски ставка слишком большая. Максимум ★' + Math.max(set('minBet'), Math.floor(set('maxPayout') / (5 * PK.PRICE[buy]))) : 'Ставка слишком большая для лимита выплат. Уменьши ставку');
        if (u.balance < cost) throw new Err('Не хватает звёзд'); u.balance -= cost;
        var kk = (1 - edgeOf('pick')) / PK.R1, rr = pkPlay(function () { return roll(u); }, ti, bet * kk), pf = Math.min(rr.bets * bet * kk, Cx * cost), fl = Math.floor(pf), pi = fl + (roll(u) < pf - fl ? 1 : 0), payout = pay(u, 'pick', cost, pi);
        return { tier: ti, buy: buy, cost: cost, payout: payout, total: pk2(pf), hp0: PK.TIER[ti].hp, rows: rr.rows, ev: rr.ev };
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
      ref: function (u) {
        var fr = []; Object.keys(S.users).forEach(function (id) { var f = S.users[id]; if (f && f.ref === u.id && !f.demo) { var nm = String(f.name || f.username || id); fr.push({ n: nm.charAt(0) + '***', w: Math.floor(f.wagered || 0), e: f.revGen || 0 }); } });
        fr.sort(function (a, b) { return b.e - a.e || b.w - a.w; });
        return { count: u.refCount || 0, earned: u.refEarned || 0, percent: set('refPercent'), revPct: set('revPct') || 0, revMonths: set('revMonths') || 0, revEarned: Math.floor(u.revEarned || 0), friends: fr.slice(0, 30) };
      },
      'deposit/info': function (u) { return { starsFee: set('starsFeePct') || 0, tonAddress: tonAddr(), comment: 'luno' + u.id, tonToStars: set('tonToStars'), minDeposit: set('minDeposit'), test: !!o.allowTest }; },
      'deposit/test': function (u, b) { if (!o.allowTest) throw new Err('Недоступно'); var a = Math.floor(+b.amount); if (!(a >= 1 && a <= 10000)) throw new Err('От 1 до 10000'); credit(u.id, a); return { added: a }; },
      // ---- Колпачки: шарик под одним из трёх, позицию знает только сервер. Шанс 1 из 3, выплата ×cupsMult (по умолчанию ×2.7 = 90% игрокам) ----
      'cups/start': function (u, b) {
        if (u.cup) { book(u, 'cups', u.cup.bet, 0); u.stats.profit -= u.cup.bet; u.cup = null; } // брошенная партия без выбора — проигрыш
        var bet = take(u, b.bet); u.cup = { bet: bet, pos: Math.floor(roll(u) * 3) }; return { ok: true, mult: cupsMult() };
      },
      'cups/state': function (u) { return u.cup ? { active: true, bet: u.cup.bet, mult: cupsMult() } : { active: false }; },
      'cups/pick': function (u, b) {
        var r = u.cup; if (!r) throw new Err('Сначала нажми «Играть»'); var i = Math.floor(+b.i); if (!(i >= 0 && i <= 2)) throw new Err('Выбери стаканчик'); u.cup = null;
        if (i === r.pos) return { pos: r.pos, win: true, mult: cupsMult(), payout: pay(u, 'cups', r.bet, r.bet * cupsMult()) };
        book(u, 'cups', r.bet, 0); u.stats.profit -= r.bet; return { pos: r.pos, win: false, payout: 0 };
      },
      roulette: function (u, b) {
        var bets = Array.isArray(b.bets) ? b.bets : []; if (!bets.length || bets.length > 80) throw new Err('Сделай ставку на поле');
        var list = [], total = 0; bets.forEach(function (x) { var a = Math.floor(+x.a), c = rlCover(x); if (!c || !(a >= 1)) throw new Err('Неверная ставка'); total += a; list.push({ c: c, a: a }); });
        total = take(u, total); var z = rlZeros(), N = 36 + z, i = Math.floor(roll(u) * N), n = i;
        var win = 0; list.forEach(function (x) { if (x.c.indexOf(n) >= 0) win += x.a * 36 / x.c.length; });
        return { n: n, zeros: z, total: total, payout: pay(u, 'roulette', total, win) };
      },
      'balloon/start': function (u, b) {
        if (u.bln) blResolve(u, now()); var bet = take(u, b.bet), e = edgeOf('balloon'), r = roll(u), cap = blCap();
        var cp = Math.max(1, Math.floor((1 - e) / Math.max(1e-9, 1 - r) * 100) / 100); u.bln = { bet: bet, cp: cp, t0: now(), cap: cap };
        return { t0: u.bln.t0, now: now(), k: BL_K, cap: cap, bet: bet };
      },
      'balloon/tick': function (u) {
        var r = u.bln; if (!r) return { none: true }; var t = now(), m = blM(t - r.t0);
        if (m >= r.cp && r.cp < r.cap) { u.bln = null; book(u, 'balloon', r.bet, 0); u.stats.profit -= r.bet; return { pop: true, cp: r.cp }; }
        if (m >= r.cap) { u.bln = null; return { done: true, mult: r.cap, payout: pay(u, 'balloon', r.bet, r.bet * r.cap) }; }
        return { m: m, now: t };
      },
      'balloon/cashout': function (u) {
        var r = u.bln; if (!r) throw new Err('Шарик не надувается'); var t = now(), m = Math.min(blM(t - r.t0), r.cap), mn = Math.min(r.cap, Math.max(1, set('blMin') || 1)); if (m < mn) m = mn; u.bln = null;
        if (m >= r.cp && r.cp < r.cap) { book(u, 'balloon', r.bet, 0); u.stats.profit -= r.bet; return { pop: true, cp: r.cp }; }
        if (m <= 1) { book(u, 'balloon', r.bet, r.bet); u.balance += r.bet; return { mult: 1, payout: r.bet }; }
        return { mult: m, payout: pay(u, 'balloon', r.bet, r.bet * m) };
      },
      'tower/start': function (u, b) {
        if (u.tw) throw new Err('Башня уже идёт, продолжи подъём'); var lv = String(b.lv || 'mid'); if (!TW_LV[lv]) throw new Err('Нет такой сложности');
        var bet = take(u, b.bet), L = TW_LV[lv], traps = [];
        for (var f = 0; f < TW_F; f++) { var cols = []; for (var i = 0; i < L.c; i++) cols.push(i); for (i = L.c - 1; i > 0; i--) { var j = Math.floor(roll(u) * (i + 1)), x = cols[i]; cols[i] = cols[j]; cols[j] = x; } traps.push(cols.slice(0, L.t)); }
        u.tw = { game: 'tower', bet: bet, lv: lv, traps: traps, picks: [] }; return { started: true, lv: lv, cols: L.c, table: twTable(lv) };
      },
      'tower/state': function (u) { var r = u.tw; if (!r || r.game !== 'tower') return { active: false }; return { active: true, lv: r.lv, bet: r.bet, cols: TW_LV[r.lv].c, picks: r.picks, table: twTable(r.lv) }; },
      'tower/pick': function (u, b) {
        var r = u.tw; if (!r || r.game !== 'tower') throw new Err('Нет игры'); var L = TW_LV[r.lv], c = Math.floor(+b.c), f = r.picks.length; if (!(c >= 0 && c < L.c)) throw new Err('Нет такой клетки');
        if (r.traps[f].indexOf(c) >= 0) { book(u, 'tower', r.bet, 0); u.stats.profit -= r.bet; u.tw = null; return { boom: true, floor: f, col: c, traps: r.traps }; }
        r.picks.push(c); var k = r.picks.length, mult = twMult(r.lv, k);
        if (k >= TW_F || mult >= Math.max(2, set('twMaxMult') || 50)) { u.tw = null; return { safe: true, done: true, floor: f, col: c, mult: mult, payout: pay(u, 'tower', r.bet, r.bet * mult), traps: r.traps }; }
        return { safe: true, floor: f, col: c, mult: mult, next: twMult(r.lv, k + 1) };
      },
      'tower/cashout': function (u) { var r = u.tw; if (!r || r.game !== 'tower' || !r.picks.length) throw new Err('Сначала пройди хотя бы один этаж'); var mult = twMult(r.lv, r.picks.length); u.tw = null; return { mult: mult, payout: pay(u, 'tower', r.bet, r.bet * mult), traps: r.traps }; },
      'hilo/start': function (u, b) { if (u.hl) throw new Err('Игра уже идёт, угадай следующую карту'); var bet = take(u, b.bet), c = hlCard(u); u.hl = { game: 'hilo', bet: bet, card: c, F: 1, steps: 0, hist: [c] }; return hlState(u.hl); },
      'hilo/state': function (u) { var r = u.hl; if (!r || r.game !== 'hilo') return { active: false }; var st = hlState(r); st.active = true; return st; },
      'hilo/guess': function (u, b) {
        var r = u.hl; if (!r || r.game !== 'hilo') throw new Err('Нет игры'); var d = b.d === 'lo' ? 'lo' : 'hi', o = hlOdds(r.card), p = o[d]; if (!hlNext(1, r.card)[d]) throw new Err('Слишком безопасный вариант, выбери другой или пропусти карту');
        var prev = r.card, c = hlCard(u), rk = hlRank(c), pr = hlRank(prev), ok = d === 'hi' ? rk >= pr : rk <= pr; r.hist.push(c); if (r.hist.length > 14) r.hist.shift();
        if (!ok) { book(u, 'hilo', r.bet, 0); u.stats.profit -= r.bet; u.hl = null; return { lose: true, card: c, prev: prev }; }
        r.F *= 1 / p; r.steps++; r.card = c; var st = hlState(r); st.win = true; st.prev = prev;
        if (st.mult * r.bet >= set('maxPayout')) { u.hl = null; st.done = true; st.payout = pay(u, 'hilo', r.bet, r.bet * st.mult); }
        return st;
      },
      'hilo/skip': function (u) { var r = u.hl; if (!r || r.game !== 'hilo') throw new Err('Нет игры'); if ((r.skips || 0) >= 2) throw new Err('Пропустить можно не больше 2 карт за игру'); r.skips = (r.skips || 0) + 1; var c = hlCard(u); r.card = c; r.hist.push(c); if (r.hist.length > 14) r.hist.shift(); return hlState(r); },
      'hilo/cashout': function (u) { var r = u.hl; if (!r || r.game !== 'hilo' || !r.steps) throw new Err('Сначала угадай хотя бы одну карту'); var st = hlState(r); u.hl = null; return { mult: st.mult, payout: pay(u, 'hilo', r.bet, r.bet * st.mult) }; },
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
      'du/lobby': function (u) {
        var A = duAll(u.demo); return { on: !!set('duOn'), fee: set('duFee'), at: u.dut || '', stakes: DU_ST.map(function (st) { return { stake: st, sizes: DU_SZ.map(function (sz) {
          var w = 0, g = 0; Object.keys(A.t).forEach(function (id) { var T = A.t[id]; if (T.stake !== st || T.size !== sz) return; if (T.phase === 'wait' || T.phase === 'start') w += T.seats.filter(Boolean).length; else if (T.phase === 'play') g++; });
          return { size: sz, waiting: w, games: g }; }) }; }) };
      },
      'du/join': function (u, b) {
        if (!set('duOn')) throw new Err('Дурак временно закрыт');
        var st = Math.floor(+b.stake), sz = Math.floor(+b.size); if (DU_ST.indexOf(st) < 0 || DU_SZ.indexOf(sz) < 0) throw new Err('Нет такого стола');
        if (u.balance < st) throw new Err('Не хватает звёзд на ставку');
        var cur = u.dut && duFind(u.dut); if (cur && duSeat(cur, u.id) >= 0 && cur.phase !== 'done') { if (cur.phase === 'play') return duView(u, cur); duLeaveU(u); }
        if (u.bjt) bjLeaveU(u);
        var A = duAll(u.demo), T = null; Object.keys(A.t).some(function (id) { var x = A.t[id]; if (x.stake === st && x.size === sz && x.phase === 'wait' && x.seats.some(function (s) { return !s; })) { T = x; return true; } return false; });
        if (!T) { var id = (u.demo ? 'dd' : 'dr') + (++A.seq); T = A.t[id] = { id: id, stake: st, size: sz, seats: [], phase: 'wait', dl: 0, tbl: [], round: 0, ev: 0 }; for (var k = 0; k < sz; k++) T.seats.push(null); }
        var i = T.seats.indexOf(null); T.seats[i] = { uid: u.id, name: u.name, seen: now() }; u.dut = T.id;
        if (T.seats.every(Boolean)) { T.phase = 'start'; T.dl = now() + DU_START; }
        return duView(u, T);
      },
      'du/state': function (u) { var T = u.dut && duFind(u.dut); if (!T || duSeat(T, u.id) < 0) { u.dut = ''; return { gone: true }; } return duView(u, T); },
      'du/leave': function (u) { duLeaveU(u); return { ok: true }; },
      'du/act': function (u, b) {
        var m = duMine(u), T = m.T, i = m.i, t = now(), a = String(b.a || ''), c = String(b.c || ''); if (T.phase !== 'play') throw new Err('Партия ещё не идёт');
        if (!T.act[i]) throw new Err('Ты уже вышел из игры'); var h = T.hands[i], tr = T.trump[1]; T.miss[i] = 0;
        if (a === 'attack') {
          if (i === T.def) throw new Err('Ты отбиваешься'); if (h.indexOf(c) < 0) throw new Err('Нет такой карты');
          if (!T.tbl.length) { if (i !== T.att) throw new Err('Сейчас ходит другой игрок'); }
          else { if (!duRanks(T)[c[0]]) throw new Err('Подкинуть можно только карту того же достоинства, что на столе'); if (T.tbl.length >= T.lim) throw new Err('Больше подкидывать нельзя');
            if (!T.taking && duUnb(T) >= T.hands[T.def].length) throw new Err('У защитника не хватит карт'); }
          h.splice(h.indexOf(c), 1); T.tbl.push({ a: c, d: null, by: i }); T.passed = {}; T.dl = T.taking ? t + DU_TAKE : t + DU_MOVE;
        } else if (a === 'defend') {
          if (i !== T.def || T.taking) throw new Err('Сейчас ты не отбиваешься'); var p = T.tbl[Math.floor(+b.i)];
          if (!p || p.d) throw new Err('Эту карту уже побили'); if (h.indexOf(c) < 0) throw new Err('Нет такой карты'); if (!duBeats(c, p.a, tr)) throw new Err('Этой картой не побить');
          h.splice(h.indexOf(c), 1); p.d = c; T.dl = duUnb(T) ? t + DU_MOVE : t + DU_THROW;
        } else if (a === 'take') {
          if (i !== T.def || T.taking || !duUnb(T)) throw new Err('Сейчас нельзя взять'); T.taking = true; T.passed = {}; T.dl = t + DU_TAKE;
        } else if (a === 'pass') {
          if (i === T.def || !T.tbl.length || (!T.taking && duUnb(T))) throw new Err('Сейчас нельзя'); T.passed[i] = 1;
        } else throw new Err('Неизвестное действие');
        duCheck(T, t); return duView(u, T);
      },
      'bj/lobby': function (u) {
        var B = bjAll(u.demo), p = u.demo ? 'd' : 'r';
        return { on: !!set('bjOn'), at: u.bjt || '', solo: true, min: bjMin(), max: bjMax(), tables: BJ_TN.map(function (n, i) { var T = B[p + 't' + i]; return { id: T.id, name: T.name, players: T.seats.filter(Boolean).length }; }) };
      },
      'bj/sit': function (u, b) {
        if (!set('bjOn')) throw new Err('Блэкджек временно закрыт');
        var T = bjAll(u.demo)[String(b.id || '')]; if (!T || (T.priv && T.priv !== u.id)) throw new Err('Стол не найден');
        if (u.bjt && u.bjt !== T.id) bjLeaveU(u);
        if (bjSeatOf(T, u.id) < 0) { var free = [2, 1, 3, 0, 4].filter(function (i) { return !T.seats[i]; }); if (!free.length) throw new Err('За этим столом нет свободных мест'); T.seats[free[0]] = { uid: u.id, name: u.name, seen: now(), bet: 0, hands: [] }; }
        u.bjt = T.id; return bjView(u, T);
      },
      'bj/solo': function (u, b) {
        if (!set('bjOn')) throw new Err('Блэкджек временно закрыт');
        var T = bjSolo(u); if (u.bjt && u.bjt !== T.id) bjLeaveU(u);
        if (bjSeatOf(T, u.id) < 0) T.seats[2] = { uid: u.id, name: u.name, seen: now(), bet: 0, hands: [] };
        u.bjt = T.id; return bjView(u, T);
      },
      'bj/leave': function (u) { bjLeaveU(u); return { ok: true }; },
      wheel: function (u, b) {
        var W = cfg().wheel || defaultWheel(); if (!W.on) throw new Err('Колесо временно выключено');
        var bet = take(u, b.bet), n = W.secs.length, i = Math.min(n - 1, Math.floor(roll(u) * n)), m = +W.secs[i] || 0;
        return { i: i, mult: m, payout: pay(u, 'wheel', bet, bet * m) };
      },
      'bj/state': function (u) { var T = u.bjt && bjTable(u.bjt); if (!T || bjSeatOf(T, u.id) < 0) { u.bjt = ''; return { gone: true }; } return bjView(u, T); },
      'bj/bet': function (u, b) {
        if (!set('bjOn')) throw new Err('Блэкджек временно закрыт');
        var m = bjMine(u), T = m.T, s = m.s; if (T.phase !== 'wait' && T.phase !== 'bet') throw new Err('Дождись следующей раздачи'); if (s.bet > 0) throw new Err('Ставка уже сделана');
        var amt = Math.floor(+(b && b.amount)); if (!(amt >= bjMin())) throw new Err('Минимальная ставка ★' + bjMin()); if (amt > bjMax()) throw new Err('Максимальная ставка ★' + bjMax());
        if (u.balance < amt) throw new Err('Не хватает звёзд'); u.balance -= amt; s.bet = amt; s.seen = now();
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
      upgrade: function (u, b) { // можно поставить до 4 своих подарков и выбрать до 4 целей: шанс считается по сумме цен
        var UPN = 4, ids = (Array.isArray(b.stakes) ? b.stakes : [b.stake]).map(function (x) { return +x; }).filter(function (x, i, a) { return isFinite(x) && a.indexOf(x) === i; }), tks = (Array.isArray(b.targets) ? b.targets : [b.target]).map(String).filter(function (x, i, a) { return a.indexOf(x) === i; });
        if (!ids.length || !tks.length) throw new Err('Выбери подарки'); if (ids.length > UPN) throw new Err('Можно поставить не больше ' + UPN + ' подарков'); if (tks.length > 1) throw new Err('Получить можно только один подарок');
        var idx = ids.map(function (id) { return inv(u, id); }); if (idx.some(function (i) { return i < 0; })) throw new Err('Выбери подарки');
        var tl = tks.map(function (k) { return cfg().items[k]; }); if (tl.some(function (t) { return !t; })) throw new Err('Выбери подарки');
        var sv = idx.reduce(function (a, i) { return a + cfg().items[u.inv[i].k].value; }, 0), tv = tl.reduce(function (a, t) { return a + t.value; }, 0);
        if (sv < set('minBet')) throw new Err('Для апгрейда нужен подарок стоимостью от ★' + set('minBet')); if (!(tv > sv)) throw new Err('Цель должна быть дороже');
        if (tl.some(function (t) { return t.up === false; })) throw new Err('Эту цель выбрать нельзя'); if (tv < sv * (set('upMinMult') || 1) - 1e-9) throw new Err('Цель должна быть минимум в ×' + set('upMinMult') + ' дороже подарка'); var ed = 1 - edgeOf('upgrade'), base = sv / tv * ed; if (base < (set('upMinChance') || 0) - 1e-9) throw new Err('Цель слишком дорогая для этого подарка, выбери подешевле');
        var add = Math.max(0, Math.floor(+b.add || 0)); // звёзды с баланса, которые повышают шанс; шанс не может стать выше upMaxChance (по умолчанию 75%)
        if (add > 0) { var capC = Math.min(0.95, Math.max(0.2, set('upMaxChance') || 0.75)), maxAdd = Math.max(0, Math.floor(capC * tv / ed - sv + 1e-9)); if (add > maxAdd) throw new Err(maxAdd > 0 ? 'Больше ★' + maxAdd + ' добавить нельзя: максимум шанса ' + Math.round(capC * 100) + '%' : 'Звёзды добавлять не нужно: шанс уже высокий'); if (u.balance < add) throw new Err('Не хватает звёзд'); }
        var chance = (sv + add) / tv * ed, win = roll(u) < chance; u.balance -= add; idx.slice().sort(function (x, y) { return y - x; }).forEach(function (i) { u.inv.splice(i, 1); });
        if (win) tks.forEach(function (k) { u.inv.push({ id: u.nid++, k: k }); });
        book(u, 'upgrade', sv + add, win ? tv : 0); u.stats.profit += (win ? tv : 0) - sv - add; return { win: win, chance: chance, add: add, n: tks.length };
      },
      'case/open': function (u, b) {
        var c = cfg().cases.filter(function (x) { return x.id === b.id && x.active; })[0]; if (!c) throw new Err('Кейс недоступен');
        var n = Math.floor(+b.count) || 1; if (n < 1 || n > 5) throw new Err('Можно открыть от 1 до 5 кейсов сразу'); if (c.free) n = 1;
        if (c.free) { if (!u.demo) { if (u.tickets[c.id] > 0) u.tickets[c.id]--; else if (refFreeAvail(u) > 0) u.refUsed = (u.refUsed || 0) + 1; else throw new Err('Нужен промокод или ' + REF_NEED + ' приглашённых друзей'); } }
        else { if (u.balance < c.price * n) throw new Err('Не хватает звёзд'); u.balance -= c.price * n; }
        var tot = 0, items = []; c.items.forEach(function (x) { tot += x.weight; });
        for (var q = 0; q < n; q++) {
          var t = roll(u) * tot, got = c.items[c.items.length - 1].k;
          for (var j = 0; j < c.items.length; j++) { if (t < c.items[j].weight) { got = c.items[j].k; break; } t -= c.items[j].weight; }
          var v = cfg().items[got].value, id = u.nid++; u.inv.push({ id: id, k: got }); items.push({ id: id, k: got }); u.stats.opened++; u.stats.profit += v - c.price;
          book(u, 'case:' + c.id, c.price, v); if (!u.demo) { S.live.push(got); if (S.live.length > 30) S.live.shift(); }
        }
        return { item: items[0], items: items };
      },
      'inv/sellmany': function (u, b) { var ids = (b.ids || []).slice(0, 10), t = 0; ids.forEach(function (id) { var i = inv(u, +id); if (i >= 0) { t += cfg().items[u.inv[i].k].value; u.inv.splice(i, 1); } }); u.balance += t; return { sold: t }; },
      's3/spin': function (u, b) {
        var inf = s3info(), c3 = cfg().slots3, bet = take(u, b.bet), L = inf.L, stops = [0, 1, 2].map(function () { return Math.floor(roll(u) * L); });
        var grid = stops.map(function (s) { return [inf.strip[(s + L - 1) % L], inf.strip[s], inf.strip[(s + 1) % L]]; });
        var wins = s3wins(inf.mults, inf.pair, grid), total = 0; wins.forEach(function (w) { w.amount = Math.round(bet * w.mult); total += w.amount; });
        var paid = pay(u, 'slots3', bet, total); return { stops: stops, grid: grid, wins: wins, payout: paid, bet: bet };
      },
      'gdep/info': function (u) { var s = cfg().settings; return { to: s.giftDepositTo || '', note: s.giftDepositNote || '', code: 'luno' + u.id }; },
      'gdep/request': function (u, b) {
        var s = cfg().settings; if (!s.giftDepositTo) throw new Err('Пополнение подарками пока не настроено владельцем');
        var name = String(b.name || '').trim().slice(0, 60), link = String(b.link || '').trim().slice(0, 200); if (name.length < 2) throw new Err('Напиши название подарка');
        if (S.gdep.filter(function (x) { return x.uid === u.id && x.status === 'pending'; }).length >= 5) throw new Err('Уже есть 5 заявок в обработке, дождись начисления');
        var r = { id: ++S.gseq, uid: u.id, name: name, link: link, user: u.name, username: u.username || '', status: 'pending', t: now(), credited: 0, note: '' }; S.gdep.push(r); save(); return { ok: true, req: r };
      },
      'gdep/list': function (u) { return { list: S.gdep.filter(function (x) { return x.uid === u.id; }).slice(-20).reverse().map(function (x) { return { id: x.id, name: x.name, status: x.status, credited: x.credited, note: x.note, t: x.t }; }) }; },
      'wd/info': function (u, b) { var i = inv(u, +b.id); if (i < 0) throw new Err('Нет такого подарка'); var it = cfg().items[u.inv[i].k], c = wdCheck(u, it, u.inv[i].id);
        return { ok: c.ok, reasons: c.reasons, fee: c.fee, feeMode: c.big ? 'stars' : 'balance', needPay: c.big && !c.paid, iid: u.inv[i].id, starsFrom: set('wdStarsFrom') || 100, test: !!o.allowTest, username: u.username || '', value: it.value, name: it.name, k: u.inv[i].k, eta: cfg().settings.wdNote, feePct: set('wdFeePct'), noUser: !u.username }; },
      'wd/testpay': function (u, b) { if (!o.allowTest) throw new Err('Недоступно'); var i = inv(u, +b.id); if (i < 0) throw new Err('Нет такого подарка'); u.wdPaid = u.wdPaid || {}; u.wdPaid[u.inv[i].id] = now(); return { ok: true }; },
      'wd/request': function (u, b) { var i = inv(u, +b.id); if (i < 0) throw new Err('Нет такого подарка'); var k = u.inv[i].k, it = cfg().items[k], iid = u.inv[i].id, c = wdCheck(u, it, iid); if (!c.ok) throw new Err(c.reasons[0]);
        if (c.big) { if (!c.paid) throw new Err('Сначала оплати комиссию ★' + c.fee + ' звёздами Telegram'); delete u.wdPaid[iid]; S.starsFees = (S.starsFees || 0) + c.fee; } else { u.balance -= c.fee; S.fees += c.fee; }
        u.inv.splice(i, 1); var r = { id: ++S.wdSeq, uid: u.id, username: u.username, name: u.name, k: k, item: it.name, value: it.value, fee: c.fee, feeStars: !!c.big, status: 'pending', t: now() }; S.wd.push(r);
        if (o.notify) o.notify('Новая заявка на вывод #' + r.id + ': ' + it.name + ' (★' + it.value + ') для @' + u.username + ', ID ' + u.id); if (o.autoPay && set('autoPay') && it.tg) setTimeout(function () { o.autoPay(r, it); }, 0); return { id: r.id, eta: cfg().settings.wdNote, auto: !!(o.autoPay && set('autoPay') && it.tg) }; },
      'wd/list': function (u) { return { list: S.wd.filter(function (x) { return x.uid === u.id; }).slice(-20).reverse().map(function (x) { return { id: x.id, item: x.item, k: x.k, value: x.value, status: x.status, t: x.t, note: x.note || '' }; }) }; },
      'inv/sell': function (u, b) { var i = inv(u, +b.id); if (i < 0) throw new Err('Нет такого подарка'); var v = cfg().items[u.inv[i].k].value; u.inv.splice(i, 1); u.balance += v; return { sold: v }; },
      'inv/sellall': function (u) { var t = 0; u.inv.forEach(function (x) { t += cfg().items[x.k].value; }); u.inv = []; u.balance += t; return { sold: t }; },
      promo: function (u, b) {
        var code = String(b.code || '').trim().toUpperCase(), p = cfg().promos[code];
        if (!p || !(p.uses > 0)) throw new Err('Промокод недействителен'); if (u.redeemed[code]) throw new Err('Промокод уже использован');
        u.redeemed[code] = 1; p.uses--; u.tickets[p.caseId] = (u.tickets[p.caseId] || 0) + 1; return { caseId: p.caseId };
      },
      leaders: function () {
        var ws = weekStart(), rows = Object.keys(S.users).map(function (k) { return S.users[k]; }).filter(function (u) { return !u.demo && !u.banned && u.week.start === ws && (u.week.wagered || 0) > 0; })
          .sort(function (a, b) { return (b.week.wagered || 0) - (a.week.wagered || 0); }).slice(0, 30).map(function (u) { return { name: maskName(u.name), profit: u.week.profit, wagered: u.week.wagered || 0 }; });
        return { rows: rows, endsAt: ws + 7 * 864e5, now: now() };
      }
    };
    var DEMO_NO = ['gdep/info', 'gdep/request', 'wd/info', 'wd/request', 'deposit/info', 'deposit/test', 'ref', 'seed/rotate', 'promo'];
    function handle(path, id, body, name, username, demo) {
      try {
        advance(); bjTick(); duTick(); var u = user(id, name, username, demo), f = H[path]; if (u.round && (u.round.game === 'tower' || u.round.game === 'hilo')) { if (u.round.game === 'tower') u.tw = u.round; else u.hl = u.round; u.round = null; } // свои раунды у Башни и Hi-Lo if (!f) throw new Err('Нет такого метода');
        if (MODE_OF[path] && !modeOn(MODE_OF[path])) throw new Err('Этот режим временно выключен'); if (u.demo && DEMO_NO.indexOf(path) >= 0) throw new Err('В демо-режиме это недоступно. Переключись на реальный счёт');
        if (u.banned && ['me', 'live', 'crash/state', 'leaders', 'wd/list'].indexOf(path) < 0) throw new Err('Аккаунт заблокирован. Напиши в поддержку.');
        var r = f(u, body || {}) || {}; r.balance = u.balance; r.inv = u.inv; r.stats = u.stats; if (!u.demo) { r.refCount = u.refCount || 0; r.refFree = refFreeAvail(u); r.refNeed = REF_NEED; r.tickets = u.tickets; } save(); return r;
      } catch (e) { if (e instanceof Err) return { error: e.message }; throw e; }
    }
    function tonAddr() { return o.tonAddress || String(cfg().settings.tonAddress || '').trim(); }
    function publicConfig() {
      var c = cfg(); return {
        items: c.items, skins: c.skins, settings: { toon: +set('toon') === 0 ? 0 : 1, edge: set('edge'), crashMax: set('crashMax'), minesMin: set('minesMin'), minesMaxMult: set('minesMaxMult'), edges: cfg().settings.edges, demoBalance: set('demoBalance'), upMinChance: set('upMinChance'), upMinMult: set('upMinMult') || 1, upMaxChance: Math.max(0.2, Math.min(0.95, set('upMaxChance') || 0.75)), rlZeros: rlZeros(), blMax: blCap(), blMin: Math.max(1, set('blMin') || 1), cupsMult: cupsMult(), bjOn: set('bjOn'), bjPay: set('bjPay'), bjH17: set('bjH17'), bjP22: set('bjP22'), duOn: set('duOn'), duFee: set('duFee'), minBet: set('minBet'), maxBet: set('maxBet'), minDeposit: set('minDeposit'), tonToStars: set('tonToStars'), wdFeePct: set('wdFeePct'), wdMinValue: set('wdMinValue'), wdNote: cfg().settings.wdNote || '', modes: cfg().settings.modes || {}, channelUrl: cfg().settings.channelUrl || '', channelText: cfg().settings.channelText || '', towerTables: { easy: twTable('easy'), mid: twTable('mid'), hard: twTable('hard'), pro: twTable('pro') }, refPercent: set('refPercent') || 0, revPct: set('revPct') || 0, revMonths: set('revMonths') || 0, botUsername: cfg().settings.botUsername || '', supportUsername: cfg().settings.supportUsername || '' }, plinko: plinkoTable(), slots3: s3pub(), pick: pkPub(),
        cases: c.cases.filter(function (x) { return x.active; }).map(function (x) { return { id: x.id, name: x.name, img: x.img, hue: x.hue, price: x.price, free: x.free, items: x.items.map(function (y) { return { k: y.k, weight: y.weight }; }) }; }),
        slots: slotInfo(), wheel: { on: (c.wheel || {}).on ? 1 : 0, secs: ((c.wheel || defaultWheel()).secs).slice() }
      };
    }
    function slotInfo() {
      var sc = (1 - edgeOf('slots')) / SLOT.rtp0, t = BASEPAY.map(function (p) { var r = []; for (var n = 6; n <= 12; n++) r.push(Math.round(p * FN[n] * sc * 1000) / 1000); return r; });
      return { pay: t, buyX: SLOT.buyX, dcX: 1.25 };
    }
    function setBiz(b) { S.biz = { id: b.id, user: b.user ? (b.user.username ? '@' + b.user.username : b.user.first_name || '') : '', uid: b.user ? b.user.id : 0, enabled: !!b.is_enabled, rights: b.rights || {}, t: now() }; save(); }
    function bizInfo() { return S.biz || null; }
    function adminConfig() { var c = JSON.parse(JSON.stringify(cfg())); c.wheelMaxRtp = WHEEL_MAX_RTP; c.biz = S.biz || null; c.rtp = {}; c.cases.forEach(function (x) { c.rtp[x.id] = caseRtp(x, c.items); }); c.skinList = SKINS; c.s3 = s3info(); return c; }
    function putConfig(n) {
      var s = n.settings || {}, items = n.items || {}, out = { settings: {}, items: {}, cases: [], skins: {}, promos: {} };
      var DS0 = defaultConfig({}).settings, LBL = { edge: 'общий процент прибыли', minBet: 'минимальная ставка', maxBet: 'максимальная ставка', demoBalance: 'демо-баланс', maxPayout: 'максимальная выплата', maxCaseRtp: 'максимальный RTP кейса', startBalance: 'стартовый баланс', tonToStars: 'курс TON', minDeposit: 'минимальное пополнение', refPercent: 'реферальный процент', wdFeePct: 'комиссия за вывод', wdMinValue: 'минимальная стоимость вывода', wdWagerMult: 'отыгрыш пополнений', crashMax: 'максимум ракеты', crashSpeed: 'скорость ракеты', minesMin: 'минимум мин', minesMaxMult: 'потолок в минах', bjOn: 'блэкджек включён', bjPay: 'выплата за блэкджек', bjH17: 'дилер на мягких 17', bjP22: 'перебор дилера на 22', duOn: 'дурак включён', duFee: 'комиссия в дураке', upMinChance: 'минимальный шанс апгрейда', upMinMult: 'минимальный множитель апгрейда', wdFeeFixed: 'фиксированная комиссия за вывод', starsFeePct: 'комиссия за пополнение звёздами', rlZeros: 'число зеро в рулетке', cupsMult: 'выплата в колпачках', blMax: 'потолок шарика', autoPay: 'автовыплата подарков', toon: 'мультяшный дизайн', bjMin: 'блэкджек: минимальная ставка', bjMax: 'блэкджек: максимальная ставка', upMaxChance: 'апгрейд: максимальный шанс со звёздами', blMin: 'шарик: минимальный множитель', twMaxMult: 'башня: потолок множителя', revPct: 'RevShare: процент с прибыли друга', pickMaxX: 'Кирка: потолок выигрыша', revMonths: 'RevShare: срок в месяцах', slotsMaxX: 'Спины: потолок выигрыша', wdStarsFrom: 'порог: комиссия звёздами отдельно', wdFeeStars: 'комиссия звёздами за дорогие подарки' };
      Object.keys(LBL).forEach(function (k) {
        var raw = s[k], cur = set(k); if (!(cur >= 0)) cur = Number(DS0[k]); // поле не пришло или пустое: оставляем текущее значение
        var v = (raw === undefined || raw === null || raw === '' || isNaN(+raw)) ? cur : +raw; if (!(v >= 0)) throw new Err('Неверная настройка: ' + LBL[k]); out.settings[k] = v;
      });
      out.settings.toon = +out.settings.toon === 0 ? 0 : 1; out.settings.bjMin = Math.max(1, Math.min(1000000, Math.floor(+out.settings.bjMin || 10))); out.settings.bjMax = Math.max(out.settings.bjMin, Math.min(10000000, Math.floor(+out.settings.bjMax || 10000))); out.settings.upMaxChance = Math.max(0.2, Math.min(0.95, +out.settings.upMaxChance || 0.75)); out.settings.blMin = Math.max(1, Math.min(20, +out.settings.blMin || 1)); out.settings.twMaxMult = Math.max(2, Math.min(100000, +out.settings.twMaxMult || 50)); out.settings.bjOn = out.settings.bjOn ? 1 : 0; out.settings.autoPay = out.settings.autoPay ? 1 : 0; out.settings.bjP22 = out.settings.bjP22 ? 1 : 0; out.settings.duOn = out.settings.duOn ? 1 : 0; out.settings.rlZeros = Math.min(3, Math.max(1, Math.round(out.settings.rlZeros) || 3)); if (out.settings.cupsMult < 1.5 || out.settings.cupsMult > 2.95) throw new Err('Выплата в колпачках от ×1.5 до ×2.95 (×3 — это уже ноль прибыли)'); if (out.settings.blMax < 2 || out.settings.blMax > 1000) throw new Err('Потолок шарика от 2 до 1000'); if (out.settings.starsFeePct > 0.3) throw new Err('Комиссия за пополнение звёздами не больше 0.3 (30%)'); if (out.settings.upMinMult < 1 || out.settings.upMinMult > 5) throw new Err('Минимальный множитель апгрейда от 1 до 5'); if (out.settings.upMinChance > 0.5) throw new Err('Минимальный шанс апгрейда не больше 0.5 (50%)'); if (out.settings.duFee > 0.2) throw new Err('Комиссия в дураке не больше 0.2 (20%)'); out.settings.bjH17 = out.settings.bjH17 ? 1 : 0;
      if (!(out.settings.bjPay >= 1 && out.settings.bjPay <= 1.5)) throw new Err('Выплата за блэкджек от 1 до 1.5 (6 к 5 = 1.2, 3 к 2 = 1.5)');
      ['botUsername', 'supportUsername', 'giftDepositTo'].forEach(function (k) { var v = String(s[k] || '').replace(/^@/, '').trim(); if (!/^[A-Za-z0-9_]{0,32}$/.test(v)) throw new Err('Имя в Telegram: латиница, цифры, _ (' + k + ')'); out.settings[k] = v; });
      out.settings.wdNote = String(s.wdNote || '').slice(0, 80); out.settings.giftDepositNote = String(s.giftDepositNote === undefined ? (cfg().settings.giftDepositNote || '') : s.giftDepositNote).slice(0, 500); out.settings.edges = {};
      var mo = s.modes || cfg().settings.modes || {}; out.settings.modes = {}; ['rocket', 'mines', 'upgrade', 'slots', 'plinko', 'wheel', 'coin', 'tower', 'bj', 'du', 'hilo', 'roulette', 'balloon', 'cups', 'pick'].forEach(function (k) { out.settings.modes[k] = mo[k] === 0 || mo[k] === '0' || mo[k] === false ? 0 : 1; });
      var ta = String(s.tonAddress === undefined ? (cfg().settings.tonAddress || '') : s.tonAddress).trim(); if (ta && !/^[A-Za-z0-9_\-:]{40,70}$/.test(ta)) throw new Err('Адрес кошелька Gram (TON) выглядит неправильно'); out.settings.tonAddress = ta;
      var cu = String(s.channelUrl === undefined ? (cfg().settings.channelUrl || '') : s.channelUrl).trim(); if (cu && /^@?[A-Za-z0-9_]{4,32}$/.test(cu)) cu = 'https://t.me/' + cu.replace(/^@/, ''); if (cu && !/^https:\/\/[^\s"'<>]{4,200}$/.test(cu)) throw new Err('Ссылка на канал должна начинаться с https:// или быть @username'); out.settings.channelUrl = cu;
      out.settings.channelText = String(s.channelText === undefined ? (cfg().settings.channelText || 'Наш канал') : s.channelText).slice(0, 40) || 'Наш канал';
      ['crash', 'mines', 'plinko', 'coin', 'upgrade', 'slots', 'tower', 'hilo', 'balloon', 'slots3', 'pick'].forEach(function (g) { var rv = (s.edges || {})[g], v = (rv === undefined || rv === null || rv === '') ? edgeOf(g) : +rv; if (!(v >= 0 && v <= 0.25)) throw new Err('Преимущество казино по игре ' + g + ' должно быть от 0 до 0.25'); out.settings.edges[g] = v; });
      if (out.settings.minesMin < 1 || out.settings.minesMin > 20) throw new Err('Минимум мин от 1 до 20');
      if (out.settings.minesMaxMult < 1.1 || out.settings.minesMaxMult > 1000) throw new Err('Потолок выигрыша в минах от ×1.1 до ×1000');
      if (out.settings.crashMax < 2 || out.settings.crashMax > 100) throw new Err('Максимум ракеты должен быть от ×2 до ×100');
      if (out.settings.crashSpeed < 0.2 || out.settings.crashSpeed > 2) throw new Err('Скорость ракеты от 0.2 до 2 (1 = базовая)');
      if (out.settings.wdFeePct > 0.5) throw new Err('Комиссия за вывод не больше 0.5');
      if (!(out.settings.minBet >= 1) || out.settings.minBet > out.settings.maxBet) throw new Err('Минимальная ставка должна быть от 1 и не больше максимальной');
      if (out.settings.refPercent > 0.5) throw new Err('Реферальный процент не больше 0.5');
      if (!(out.settings.revPct >= 0 && out.settings.revPct <= 0.8)) throw new Err('RevShare от 0 до 0.8 (0.1 = 10% от прибыли с друга)');
      if (!(out.settings.revMonths >= 0 && out.settings.revMonths <= 120)) throw new Err('Срок RevShare от 0 (пожизненно) до 120 месяцев');
      if (!(out.settings.pickMaxX >= 5 && out.settings.pickMaxX <= 1000)) throw new Err('Потолок выигрыша в Кирке от ×5 до ×1000 от ставки');
      if (!(out.settings.slotsMaxX >= 5 && out.settings.slotsMaxX <= 1000)) throw new Err('Потолок выигрыша в Спинах от ×5 до ×1000 от стоимости спина');
      if (out.settings.edge > 0.2) throw new Err('Преимущество казино не больше 20%'); if (out.settings.maxCaseRtp > 1) throw new Err('RTP кейса не больше 100%');
      Object.keys(items).forEach(function (k) {
        var it = items[k]; if (!/^[a-z0-9_]{1,24}$/.test(k)) throw new Err('Ключ предмета: латиница, цифры, _ (' + k + ')');
        if (!(+it.value >= 0) || !String(it.name || '').trim()) throw new Err('У предмета ' + k + ' нужны название и цена'); if (!okImg(it.img || '')) throw new Err('Неверная картинка у предмета ' + k);
        out.items[k] = { name: String(it.name).slice(0, 40), img: it.img || '', value: Math.floor(+it.value), wd: it.wd !== false && it.wd !== 'false', up: it.up !== false && it.up !== 'false', tg: String(it.tg || '').trim().slice(0, 60) };
      });
      var s3 = n.slots3 || {}, o3 = { symbols: [], bets: [], pair: 0 }, sid = {}, L3 = 0;
      if (!Array.isArray(s3.symbols) || s3.symbols.length < 3 || s3.symbols.length > 10) throw new Err('В слотах нужно от 3 до 10 символов');
      s3.symbols.forEach(function (x, i) {
        var id = String(x.id || ('s' + i)).replace(/[^a-z0-9_]/gi, '').slice(0, 12) || ('s' + i); if (sid[id]) id += i; sid[id] = 1;
        var nm = String(x.name || 'Символ').slice(0, 24); if (!(+x.mult > 0 && +x.mult <= 100000)) throw new Err('Слоты: у символа «' + nm + '» множитель должен быть больше 0');
        var cnt = Math.floor(+x.count); if (!(cnt >= 1 && cnt <= 12)) throw new Err('Слоты: у символа «' + nm + '» количество на барабане от 1 до 12'); L3 += cnt;
        if (!okImg(x.img || '')) throw new Err('Слоты: неверная картинка у символа «' + nm + '»');
        o3.symbols.push({ id: id, name: nm, img: x.img || '', icon: String(x.icon || '').replace(/[^a-z0-9]/gi, '').slice(0, 16), mult: +x.mult, count: cnt });
      });
      if (L3 > 60) throw new Err('Слоты: всего на барабане не больше 60 позиций (сейчас ' + L3 + ')');
      var bl = (s3.bets || []).map(function (x) { return Math.floor(+x); }).filter(function (x, i, a) { return x >= out.settings.minBet && x <= out.settings.maxBet && a.indexOf(x) === i; }).sort(function (a, b) { return a - b; });
      if (bl.length < 2 || bl.length > 8) throw new Err('Слоты: нужно от 2 до 8 ставок в пределах от ★' + out.settings.minBet + ' до ★' + out.settings.maxBet); o3.bets = bl;
      o3.pair = Math.max(0, Math.min(100, +s3.pair || 0)); out.slots3 = o3;
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
      var nw = n.wheel || cfg().wheel || defaultWheel(), ws = Array.isArray(nw.secs) ? nw.secs.map(function (x) { return Math.round((+x) * 100) / 100; }) : [];
      if (ws.length < 4 || ws.length > 60) throw new Err('В колесе должно быть от 4 до 60 секторов');
      if (ws.some(function (x) { return !(x >= 0 && x <= 1000); })) throw new Err('Множитель сектора колеса от 0 до 1000');
      var wr = wheelRtp(ws); if (wr > WHEEL_MAX_RTP) throw new Err('Колесо слишком щедрое: RTP ' + (wr * 100).toFixed(1) + '%, максимум ' + (WHEEL_MAX_RTP * 100) + '%. Уменьши множители или добавь секторы ×0');
      out.wheel = { on: nw.on === 0 || nw.on === false || nw.on === '0' ? 0 : 1, secs: ws };
      S.cfg = out; Object.keys(S.users).forEach(function (k) { var u = S.users[k]; u.inv = u.inv.filter(function (x) { return out.items[x.k]; }); }); save(); return { ok: true };
    }
    function stats() {
      var g = Object.keys(S.totals).map(function (k) { var t = S.totals[k]; return { game: k, n: t.n, wagered: t.wagered, paid: t.paid, profit: t.wagered - t.paid, rtp: t.wagered ? t.paid / t.wagered : null }; });
      var tot = g.reduce(function (a, x) { a.n += x.n; a.wagered += x.wagered; a.paid += x.paid; a.profit += x.profit; return a; }, { n: 0, wagered: 0, paid: 0, profit: 0 });
      var days = Object.keys(S.daily).sort().slice(-14).map(function (d) { var x = S.daily[d]; return { day: d, wagered: x.wagered, paid: x.paid, profit: x.wagered - x.paid, deposited: x.deposited }; });
      var now2 = S.wd.filter(function (x) { return x.status === 'pending'; });
      return { total: tot, byGame: g, players: Object.keys(S.users).filter(function (k) { return !S.users[k].demo; }).length, deposited: S.deposited, fees: S.fees, days: days, gdepPending: S.gdep.filter(function (x) { return x.status === 'pending'; }).length, wdPending: now2.length, wdPendingValue: now2.reduce(function (a, x) { return a + x.value; }, 0) };
    }
    function wdList(st) { return S.wd.filter(function (x) { return !st || x.status === st; }).slice().reverse().slice(0, 100); }
    function wdResolve(id, action, note) {
      var r = S.wd.filter(function (x) { return x.id === +id; })[0]; if (!r || r.status !== 'pending') throw new Err('Заявка не найдена или уже обработана');
      if (action === 'done') r.status = 'done';
      else if (action === 'reject') { var u = S.users[r.uid]; if (u) { u.inv.push({ id: u.nid++, k: r.k }); u.balance += r.fee; S.fees -= r.fee; } r.status = 'rejected'; }
      else throw new Err('Неверное действие'); r.note = String(note || '').slice(0, 200); r.tr = now(); save(); return { req: r };
    }
    function gdepList(st) { return S.gdep.filter(function (x) { return !st || x.status === st; }).slice().reverse().slice(0, 100); }
    function gdepResolve(id, action, amount, note) {
      var r = S.gdep.filter(function (x) { return x.id === +id; })[0]; if (!r || r.status !== 'pending') throw new Err('Заявка не найдена или уже обработана');
      if (action === 'done') { amount = Math.floor(+amount); if (!(amount > 0)) throw new Err('Укажи, сколько звёзд начислить'); if (!credit(r.uid, amount)) throw new Err('Игрок не найден'); r.status = 'done'; r.credited = amount; }
      else if (action === 'reject') r.status = 'rejected'; else throw new Err('Неверное действие');
      r.note = String(note || '').slice(0, 200); r.tr = now(); save(); return { req: r };
    }
    function usersList(q) {
      q = String(q || '').toLowerCase().replace(/^@/, '');
      return Object.keys(S.users).map(function (k) { return S.users[k]; }).filter(function (u) { return !u.demo && (!q || String(u.id).indexOf(q) >= 0 || String(u.name || '').toLowerCase().indexOf(q) >= 0 || String(u.username || '').toLowerCase().indexOf(q) >= 0); })
        .sort(function (a, b) { return (b.wagered || 0) - (a.wagered || 0); }).slice(0, 50).map(function (u) { return { id: u.id, name: u.name, username: u.username || '', balance: u.balance, deposited: u.deposited || 0, wagered: u.wagered || 0, profit: u.stats.profit, inv: u.inv.length, banned: !!u.banned }; });
    }
    function userAdjust(id, delta) { var u = S.users[String(id)]; if (!u) throw new Err('Игрок не найден'); delta = Math.floor(+delta); if (!delta) throw new Err('Укажи сумму'); u.balance = Math.max(0, u.balance + delta); save(); return { balance: u.balance }; }
    function userBan(id, flag) { var u = S.users[String(id)]; if (!u) throw new Err('Игрок не найден'); u.banned = !!flag; save(); return { banned: u.banned }; }
    function tick() { advance(); bjTick(); duTick(); save(); }
    function seedHistory(n) { if (S.hist.length) return; for (var i = 0; i < n; i++) S.hist.push(Math.max(1, Math.min(set('crashMax') || 50, Math.floor(100 * (1 - edgeOf('crash')) / (1 - roll(S.sys))) / 100))); }
    return { gdepList: gdepList, gdepResolve: gdepResolve, setBiz: setBiz, bizInfo: bizInfo, tonAddr: tonAddr, tick: tick, seedHistory: seedHistory, wdList: wdList, wdResolve: wdResolve, usersList: usersList, userAdjust: userAdjust, userBan: userBan, credit: credit, creditOnce: creditOnce, wdPayOnce: wdPayOnce, setting: set, handle: handle, publicConfig: publicConfig, adminConfig: adminConfig, putConfig: putConfig, stats: stats, Err: Err };
  }
  var api = { _s3: { calc: s3calc, lines: S3LINES, wins: s3wins }, _slots: { slotGame: slotGame, SLOT: SLOT }, create: create, newState: newState, defaultConfig: defaultConfig, SKINS: SKINS, Err: Err };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Engine = api;
})(typeof self !== 'undefined' ? self : this);
