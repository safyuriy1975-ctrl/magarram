'use strict';

// ─── VOWEL HARMONY ────────────────────────────────────────────────────────────
const VOWELS = new Set(['a','e','ı','i','o','ö','u','ü']);
const BACK   = new Set(['a','ı','o','u']);
const FRONT  = new Set(['e','i','ö','ü']);
const ROUND  = new Set(['o','u','ö','ü']);
const VOICELESS = new Set(['ç','f','h','k','p','s','ş','t']);
const SOFTEN = {ç:'c', p:'b', t:'d'};

function lastVowel(w) {
  for (let i = w.length-1; i >= 0; i--)
    if (VOWELS.has(w[i])) return w[i];
  return '';
}
function harmony4(w) {
  const v = lastVowel(w);
  if (!v) return 'i';
  if (BACK.has(v) && !ROUND.has(v)) return 'ı';
  if (FRONT.has(v) && !ROUND.has(v)) return 'i';
  if (BACK.has(v) && ROUND.has(v))  return 'u';
  return 'ü';
}
function harmony2(w) {
  return BACK.has(lastVowel(w)) ? 'a' : 'e';
}
function endsVowel(w) { return VOWELS.has(w[w.length-1]); }

function buildCase(word, cas) {
  const w = word.trim();
  switch(cas) {
    case 'nom':
      return { form: w, suffix: '—', rule: 'Именительный — начальная форма, без аффикса.' };
    case 'gen': {
      const h = harmony4(w);
      const buf = endsVowel(w) ? 'n' : '';
      const suf = buf + h + 'n';
      return { form: w + suf, suffix: suf,
        rule: `Родительный -(n)ın/in/un/ün. Гласная «${h}» (4-ступ.). ${buf?'Буфер «н» (основа на гласную).':''}` };
    }
    case 'acc': {
      const h = harmony4(w);
      const buf = endsVowel(w) ? 'y' : '';
      const suf = buf + h;
      return { form: w + suf, suffix: suf,
        rule: `Винительный -(y)ı/i/u/ü. Гласная «${h}» (4-ступ.). ${buf?'Буфер «й» (основа на гласную).':''}` };
    }
    case 'dat': {
      const h = harmony2(w);
      const buf = endsVowel(w) ? 'y' : '';
      const last = w[w.length-1];
      let base = w;
      if (!buf && SOFTEN[last]) base = w.slice(0,-1) + SOFTEN[last];
      const suf = buf + h;
      return { form: base + suf, suffix: suf,
        rule: `Дательный -(y)a/e. Гласная «${h}» (2-ступ.). ${base!==w?'Озвончение: '+last+'→'+SOFTEN[last]+'.':''} ${buf?'Буфер «й» (основа на гласную).':''}` };
    }
    case 'loc': {
      const h = harmony2(w);
      const v = lastVowel(w); // not used but for reference
      const last = w[w.length-1];
      const hard = VOICELESS.has(last);
      const cons = hard ? 't' : 'd';
      const suf = cons + h;
      return { form: w + suf, suffix: suf,
        rule: `Местный -da/de/ta/te. ${hard?'После глухой согл. → «т».':'После звонкой согл. → «д».'} Гласная «${h}» (2-ступ.).` };
    }
    case 'abl': {
      const h = harmony2(w);
      const last = w[w.length-1];
      const hard = VOICELESS.has(last);
      const cons = hard ? 't' : 'd';
      const suf = cons + h + 'n';
      return { form: w + suf, suffix: suf,
        rule: `Исходный -dan/den/tan/ten. ${hard?'После глухой согл. → «т».':'После звонкой согл. → «д».'} Гласная «${h}» (2-ступ.).` };
    }
  }
}

// ─── WORD BANK ─────────────────────────────────────────────────────────────────
const WORDS = [
  {w:'kedi',   ru:'кошка',      cat:'животные'},
  {w:'köpek',  ru:'собака',     cat:'животные'},
  {w:'at',     ru:'лошадь',     cat:'животные'},
  {w:'kuş',    ru:'птица',      cat:'животные'},
  {w:'balık',  ru:'рыба',       cat:'животные'},
  {w:'aslan',  ru:'лев',        cat:'животные'},
  {w:'fare',   ru:'мышь',       cat:'животные'},
  {w:'tavuk',  ru:'курица',     cat:'животные'},
  {w:'adam',   ru:'мужчина',    cat:'люди'},
  {w:'kadın',  ru:'женщина',    cat:'люди'},
  {w:'çocuk',  ru:'ребёнок',    cat:'люди'},
  {w:'anne',   ru:'мама',       cat:'люди'},
  {w:'baba',   ru:'папа',       cat:'люди'},
  {w:'arkadaş',ru:'друг',       cat:'люди'},
  {w:'öğrenci',ru:'студент',    cat:'люди'},
  {w:'doktor', ru:'врач',       cat:'люди'},
  {w:'ev',     ru:'дом',        cat:'места'},
  {w:'okul',   ru:'школа',      cat:'места'},
  {w:'şehir',  ru:'город',      cat:'места'},
  {w:'köy',    ru:'деревня',    cat:'места'},
  {w:'ülke',   ru:'страна',     cat:'места'},
  {w:'deniz',  ru:'море',       cat:'места'},
  {w:'dağ',    ru:'гора',       cat:'места'},
  {w:'park',   ru:'парк',       cat:'места'},
  {w:'masa',   ru:'стол',       cat:'предметы'},
  {w:'sandalye',ru:'стул',      cat:'предметы'},
  {w:'kitap',  ru:'книга',      cat:'предметы'},
  {w:'kalem',  ru:'ручка',      cat:'предметы'},
  {w:'telefon',ru:'телефон',    cat:'предметы'},
  {w:'araba',  ru:'машина',     cat:'предметы'},
  {w:'çanta',  ru:'сумка',      cat:'предметы'},
  {w:'kapı',   ru:'дверь',      cat:'предметы'},
  {w:'pencere',ru:'окно',       cat:'предметы'},
  {w:'ekmek',  ru:'хлеб',       cat:'еда'},
  {w:'su',     ru:'вода',       cat:'еда'},
  {w:'çay',    ru:'чай',        cat:'еда'},
  {w:'elma',   ru:'яблоко',     cat:'еда'},
  {w:'et',     ru:'мясо',       cat:'еда'},
  {w:'peynir', ru:'сыр',        cat:'еда'},
  {w:'zaman',  ru:'время',      cat:'абстр.'},
  {w:'iş',     ru:'работа',     cat:'абстр.'},
  {w:'yol',    ru:'дорога',     cat:'абстр.'},
  {w:'güneş',  ru:'солнце',     cat:'природа'},
  {w:'gece',   ru:'ночь',       cat:'природа'},
  {w:'rüzgar', ru:'ветер',      cat:'природа'},

  // Животные
  {w:'inek',   ru:'корова',     cat:'животные'},
  {w:'koyun',  ru:'овца',       cat:'животные'},
  {w:'keçi',   ru:'коза',       cat:'животные'},
  {w:'domuz',  ru:'свинья',     cat:'животные'},
  {w:'fil',    ru:'слон',       cat:'животные'},
  {w:'kaplan', ru:'тигр',       cat:'животные'},
  {w:'ayı',    ru:'медведь',    cat:'животные'},
  {w:'kurt',   ru:'волк',       cat:'животные'},
  {w:'tilki',  ru:'лиса',       cat:'животные'},
  {w:'tavşan', ru:'кролик',     cat:'животные'},
  {w:'yılan',  ru:'змея',       cat:'животные'},
  {w:'kaplumbağa',ru:'черепаха',cat:'животные'},
  {w:'kartal', ru:'орёл',       cat:'животные'},
  {w:'papağan',ru:'попугай',    cat:'животные'},
  {w:'kurbağa',ru:'лягушка',    cat:'животные'},

  // Транспорт
  {w:'otobüs', ru:'автобус',    cat:'транспорт'},
  {w:'tren',   ru:'поезд',      cat:'транспорт'},
  {w:'uçak',   ru:'самолёт',    cat:'транспорт'},
  {w:'gemi',   ru:'корабль',    cat:'транспорт'},
  {w:'bisiklet',ru:'велосипед', cat:'транспорт'},
  {w:'taksi',  ru:'такси',      cat:'транспорт'},
  {w:'metro',  ru:'метро',      cat:'транспорт'},
  {w:'kamyon', ru:'грузовик',   cat:'транспорт'},
  {w:'motosiklet',ru:'мотоцикл',cat:'транспорт'},
  {w:'vapur',  ru:'паром',      cat:'транспорт'},

  // Дом
  {w:'oda',    ru:'комната',    cat:'дом'},
  {w:'mutfak', ru:'кухня',      cat:'дом'},
  {w:'banyo',  ru:'ванная',     cat:'дом'},
  {w:'salon',  ru:'гостиная',   cat:'дом'},
  {w:'yatak',  ru:'кровать',    cat:'дом'},
  {w:'dolap',  ru:'шкаф',       cat:'дом'},
  {w:'koltuk', ru:'кресло',     cat:'дом'},
  {w:'lamba',  ru:'лампа',      cat:'дом'},
  {w:'ayna',   ru:'зеркало',    cat:'дом'},
  {w:'halı',   ru:'ковёр',      cat:'дом'},
  {w:'tavan',  ru:'потолок',    cat:'дом'},
  {w:'duvar',  ru:'стена',      cat:'дом'},
  {w:'zemin',  ru:'пол',        cat:'дом'},
  {w:'merdiven',ru:'лестница',  cat:'дом'},
  {w:'bahçe',  ru:'сад',        cat:'дом'},

  // Одежда
  {w:'gömlek', ru:'рубашка',    cat:'одежда'},
  {w:'pantolon',ru:'брюки',     cat:'одежда'},
  {w:'elbise', ru:'платье',     cat:'одежда'},
  {w:'ceket',  ru:'пиджак',     cat:'одежда'},
  {w:'kazak',  ru:'свитер',     cat:'одежда'},
  {w:'ayakkabı',ru:'ботинок',   cat:'одежда'},
  {w:'çorap',  ru:'носок',      cat:'одежда'},
  {w:'şapka',  ru:'шапка',      cat:'одежда'},
  {w:'elbise', ru:'платье',     cat:'одежда'},
  {w:'kemer',  ru:'ремень',     cat:'одежда'},
  {w:'eldiven',ru:'перчатка',   cat:'одежда'},
  {w:'palto',  ru:'пальто',     cat:'одежда'},

  // Профессии
  {w:'öğretmen',ru:'учитель',   cat:'профессии'},
  {w:'mühendis',ru:'инженер',   cat:'профессии'},
  {w:'avukat', ru:'адвокат',    cat:'профессии'},
  {w:'pilot',  ru:'пилот',      cat:'профессии'},
  {w:'aşçı',   ru:'повар',      cat:'профессии'},
  {w:'hemşire',ru:'медсестра',  cat:'профессии'},
  {w:'polis',  ru:'полицейский',cat:'профессии'},
  {w:'asker',  ru:'солдат',     cat:'профессии'},
  {w:'gazeteci',ru:'журналист', cat:'профессии'},
  {w:'aktör',  ru:'актёр',      cat:'профессии'},
  {w:'müzisyen',ru:'музыкант',  cat:'профессии'},
  {w:'ressam', ru:'художник',   cat:'профессии'},

  // Природа
  {w:'orman',  ru:'лес',        cat:'природа'},
  {w:'nehir',  ru:'река',       cat:'природа'},
  {w:'göl',    ru:'озеро',      cat:'природа'},
  {w:'bulut',  ru:'облако',     cat:'природа'},
  {w:'yağmur', ru:'дождь',      cat:'природа'},
  {w:'kar',    ru:'снег',       cat:'природа'},
  {w:'ateş',   ru:'огонь',      cat:'природа'},
  {w:'toprak', ru:'земля',      cat:'природа'},
  {w:'taş',    ru:'камень',     cat:'природа'},
  {w:'kum',    ru:'песок',      cat:'природа'},
  {w:'çiçek',  ru:'цветок',     cat:'природа'},
  {w:'ağaç',   ru:'дерево',     cat:'природа'},
  {w:'yaprak', ru:'лист',       cat:'природа'},
  {w:'meyve',  ru:'фрукт',      cat:'природа'},
  {w:'sebze',  ru:'овощ',       cat:'природа'},

  // Еда и напитки
  {w:'süt',    ru:'молоко',     cat:'еда'},
  {w:'yumurta',ru:'яйцо',       cat:'еда'},
  {w:'tavuk',  ru:'курица (еда)',cat:'еда'},
  {w:'pilav',  ru:'рис',        cat:'еда'},
  {w:'makarna',ru:'макароны',   cat:'еда'},
  {w:'sebze',  ru:'овощи',      cat:'еда'},
  {w:'meyve',  ru:'фрукты',     cat:'еда'},
  {w:'tuz',    ru:'соль',       cat:'еда'},
  {w:'şeker',  ru:'сахар',      cat:'еда'},
  {w:'yağ',    ru:'масло',      cat:'еда'},
  {w:'kahve',  ru:'кофе',       cat:'еда'},
  {w:'meyve suyu',ru:'сок',     cat:'еда'},
  {w:'bira',   ru:'пиво',       cat:'еда'},
  {w:'şarap',  ru:'вино',       cat:'еда'},
  {w:'çorba',  ru:'суп',        cat:'еда'},

  // Тело
  {w:'baş',    ru:'голова',     cat:'тело'},
  {w:'el',     ru:'рука',       cat:'тело'},
  {w:'ayak',   ru:'нога',       cat:'тело'},
  {w:'göz',    ru:'глаз',       cat:'тело'},
  {w:'kulak',  ru:'ухо',        cat:'тело'},
  {w:'burun',  ru:'нос',        cat:'тело'},
  {w:'ağız',   ru:'рот',        cat:'тело'},
  {w:'diş',    ru:'зуб',        cat:'тело'},
  {w:'saç',    ru:'волосы',     cat:'тело'},
  {w:'yüz',    ru:'лицо',       cat:'тело'},
  {w:'kalp',   ru:'сердце',     cat:'тело'},
  {w:'omuz',   ru:'плечо',      cat:'тело'},
  {w:'diz',    ru:'колено',     cat:'тело'},
  {w:'parmak', ru:'палец',      cat:'тело'},
  {w:'boyun',  ru:'шея',        cat:'тело'},

  // Места
  {w:'hastane',ru:'больница',   cat:'места'},
  {w:'market', ru:'магазин',    cat:'места'},
  {w:'otel',   ru:'отель',      cat:'места'},
  {w:'restoran',ru:'ресторан',  cat:'места'},
  {w:'kütüphane',ru:'библиотека',cat:'места'},
  {w:'müze',   ru:'музей',      cat:'места'},
  {w:'plaj',   ru:'пляж',       cat:'места'},
  {w:'havalimanı',ru:'аэропорт',cat:'места'},
  {w:'istasyon',ru:'станция',   cat:'места'},
  {w:'cadde',  ru:'улица',      cat:'места'},
  {w:'köprü',  ru:'мост',       cat:'места'},
  {w:'meydan', ru:'площадь',    cat:'места'},

  // Люди
  {w:'kardeş', ru:'брат/сестра',cat:'люди'},
  {w:'dede',   ru:'дедушка',    cat:'люди'},
  {w:'nine',   ru:'бабушка',    cat:'люди'},
  {w:'amca',   ru:'дядя',       cat:'люди'},
  {w:'teyze',  ru:'тётя',       cat:'люди'},
  {w:'komşu',  ru:'сосед',      cat:'люди'},
  {w:'patron', ru:'начальник',  cat:'люди'},
  {w:'müşteri',ru:'клиент',     cat:'люди'},
  {w:'misafir',ru:'гость',      cat:'люди'},
  {w:'yolcu',  ru:'пассажир',   cat:'люди'},

  // Абстрактные
  {w:'hayat',  ru:'жизнь',      cat:'абстр.'},
  {w:'aşk',    ru:'любовь',     cat:'абстр.'},
  {w:'mutluluk',ru:'счастье',   cat:'абстр.'},
  {w:'başarı', ru:'успех',      cat:'абстр.'},
  {w:'problem',ru:'проблема',   cat:'абстр.'},
  {w:'fikir',  ru:'идея',       cat:'абстр.'},
  {w:'bilgi',  ru:'знание',     cat:'абстр.'},
  {w:'dil',    ru:'язык',       cat:'абстр.'},
  {w:'isim',   ru:'имя',        cat:'абстр.'},
  {w:'tarih',  ru:'история',    cat:'абстр.'},
  {w:'müzik',  ru:'музыка',     cat:'абстр.'},
  {w:'sanat',  ru:'искусство',  cat:'абстр.'},
  {w:'spor',   ru:'спорт',      cat:'абстр.'},
  {w:'para',   ru:'деньги',     cat:'абстр.'},
  {w:'haber',  ru:'новость',    cat:'абстр.'},
  {w:'soru',   ru:'вопрос',     cat:'абстр.'},
  {w:'cevap',  ru:'ответ',      cat:'абстр.'},
  {w:'karar',  ru:'решение',    cat:'абстр.'},
  {w:'plan',   ru:'план',       cat:'абстр.'},
  {w:'rüya',   ru:'мечта/сон',  cat:'абстр.'},

  // Предметы
  {w:'bilgisayar',ru:'компьютер',cat:'предметы'},
  {w:'ekran',  ru:'экран',      cat:'предметы'},
  {w:'kamera', ru:'камера',     cat:'предметы'},
  {w:'anahtar',ru:'ключ',       cat:'предметы'},
  {w:'para',   ru:'монета',     cat:'предметы'},
  {w:'şişe',   ru:'бутылка',    cat:'предметы'},
  {w:'bardak', ru:'стакан',     cat:'предметы'},
  {w:'tabak',  ru:'тарелка',    cat:'предметы'},
  {w:'kaşık',  ru:'ложка',      cat:'предметы'},
  {w:'çatal',  ru:'вилка',      cat:'предметы'},
  {w:'bıçak',  ru:'нож',        cat:'предметы'},
  {w:'torba',  ru:'пакет',      cat:'предметы'},
  {w:'kutu',   ru:'коробка',    cat:'предметы'},
  {w:'kağıt',  ru:'бумага',     cat:'предметы'},
  {w:'kalem',  ru:'карандаш',   cat:'предметы'},
];

const CASES = [
  {id:'nom', ru:'Именительный', tr:'Yalın',    q:'Кто? Что?',      color:'#2B5BD7'},
  {id:'gen', ru:'Родительный',  tr:'Tamlayan', q:'Чего? Кого?',    color:'#7B2FBE'},
  {id:'acc', ru:'Винительный',  tr:'Belirtme', q:'Кого? Что?',     color:'#C0392B'},
  {id:'dat', ru:'Дательный',    tr:'Yönelme',  q:'Кому? Куда?',    color:'#1E8449'},
  {id:'loc', ru:'Местный',      tr:'Bulunma',  q:'Где?',           color:'#B7770D'},
  {id:'abl', ru:'Исходный',     tr:'Uzaklaşma',q:'Откуда?',        color:'#1A7A8A'},
];

// ─── STATE ─────────────────────────────────────────────────────────────────────
let state = {
  page: 'trainer',     // trainer | stats | ref
  word: null,
  cas:  null,
  phase: 'q',          // q | result
  correct: false,
  session: { total:0, right:0, streak:0 },
  history: [],         // last 30 attempts
  byCas: {},           // {casId: {t,r}}
  enabledCases: new Set(['nom','gen','acc','dat','loc','abl']),
};

// Persist with graceful localStorage fallback
const LS = (function() {
  try { const s = window['local'+'Storage']; s.setItem('_t','1'); s.removeItem('_t'); return s; }
  catch(e) { return { getItem:()=>null, setItem:()=>{}, removeItem:()=>{} }; }
})();

function saveState() {
  try { LS.setItem('tc_session', JSON.stringify({ session: state.session, history: state.history.slice(0,30), byCas: state.byCas })); } catch(e){}
}
function loadState() {
  try { const s = JSON.parse(LS.getItem('tc_session') || '{}'); if (s.session) state.session = s.session; if (s.history) state.history = s.history; if (s.byCas) state.byCas = s.byCas; } catch(e){}
}

function pickQuestion(prev) {
  const cases = CASES.filter(c => state.enabledCases.has(c.id));
  if (!cases.length) return null;
  let word, cas;
  let tries = 0;
  do {
    word = WORDS[Math.floor(Math.random()*WORDS.length)];
    cas  = cases[Math.floor(Math.random()*cases.length)];
    tries++;
  } while (tries < 20 && prev && word.w === prev.word.w && cas.id === prev.cas.id);
  return { word, cas };
}

// ─── RENDER ────────────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function render() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $('page-'+state.page).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  $('nav-'+state.page).classList.add('active');

  if (state.page === 'trainer') renderTrainer();
  if (state.page === 'stats')   renderStats();
  if (state.page === 'ref')     renderRef();
}

function renderTrainer() {
  const s = state;
  // session bar
  const acc = s.session.total > 0 ?
    Math.round(s.session.right/s.session.total*100) : null;

  $('s-total').textContent  = s.session.total;
  $('s-right').textContent  = s.session.right;
  $('s-acc').textContent    = acc !== null ? acc+'%' : '—';
  $('s-streak').textContent = s.session.streak >= 3 ? '🔥'+s.session.streak : '';

  if (!s.word) {
    const q = pickQuestion(null);
    if (!q) return;
    s.word = q.word; s.cas = q.cas; s.phase = 'q';
  }

  const cas = s.cas;
  const result = buildCase(s.word.w, cas.id);

  // Set case badge
  const badge = $('case-badge');
  badge.textContent = cas.ru + ' — ' + cas.tr;
  badge.style.background = cas.color;

  $('case-q').textContent   = cas.q;
  $('word-tr').textContent  = s.word.w;
  $('word-ru').textContent  = '«' + s.word.ru + '»';
  $('word-cat').textContent = s.word.cat;
  $('task-prompt').innerHTML= `Поставьте <b>${s.word.w}</b> в <b>${cas.ru.toLowerCase()} падеж</b>`;

  // Card border color
  $('question-card').style.borderColor = cas.color;

  // Cheatsheet
  const cs = $('cheatsheet-grid');
  cs.innerHTML = '';
  CASES.forEach(c => {
    const r = buildCase(s.word.w, c.id);
    const el = document.createElement('div');
    el.className = 'cheat-item' + (c.id === cas.id ? ' cheat-active' : '');
    el.style.borderColor = c.id === cas.id ? c.color : 'transparent';
    el.innerHTML = `<span class="cheat-case" style="background:${c.color}">${c.ru.slice(0,3)}.</span>
      <span class="cheat-form">${r.form}</span>
      <span class="cheat-suf">${r.suffix}</span>`;
    cs.appendChild(el);
  });

  // Phase
  $('input-area').style.display  = s.phase === 'q'      ? 'flex' : 'none';
  $('result-area').style.display = s.phase === 'result'  ? 'flex' : 'none';

  if (s.phase === 'result') {
    const ok = s.correct;
    const ra = $('result-area');
    ra.className = 'result-area ' + (ok ? 'res-ok' : 'res-fail');
    $('res-icon').textContent   = ok ? '✅' : '❌';
    $('res-verdict').textContent = ok ? 'Верно!' : 'Неверно';
    $('res-verdict').className  = ok ? 'res-verdict ok' : 'res-verdict fail';
    $('res-correct').innerHTML  = `Правильно: <b>${s.word.w}<span style="color:#f59e0b">${result.suffix === '—' ? '' : result.suffix}</span></b>`;
    $('res-rule').textContent   = result.rule;
    $('res-your').style.display = ok ? 'none' : 'block';
    if (!ok) $('res-your').innerHTML = `Ваш ответ: <s>${$('answer-input').value || '(пропущено)'}</s>`;
  }
}

function checkAnswer() {
  const input = $('answer-input').value.trim().toLowerCase();
  if (!input || state.phase === 'result') return;
  const result = buildCase(state.word.w, state.cas.id);
  const ok = input === result.form.toLowerCase();
  state.correct = ok;
  state.phase = 'result';
  state.session.total++;
  if (ok) { state.session.right++; state.session.streak++; }
  else      state.session.streak = 0;

  // Record
  const rec = {w:state.word.w, cas:state.cas.id, ok, ts: Date.now()};
  state.history.unshift(rec);
  if (state.history.length > 50) state.history.pop();
  if (!state.byCas[state.cas.id]) state.byCas[state.cas.id] = {t:0,r:0};
  state.byCas[state.cas.id].t++;
  if (ok) state.byCas[state.cas.id].r++;
  saveState();
  render();
}

function skipQuestion() {
  if (state.phase === 'result') return;
  state.correct = false;
  state.phase = 'result';
  state.session.total++;
  state.session.streak = 0;
  const rec = {w:state.word.w, cas:state.cas.id, ok:false, skipped:true, ts:Date.now()};
  state.history.unshift(rec);
  if (state.history.length > 50) state.history.pop();
  if (!state.byCas[state.cas.id]) state.byCas[state.cas.id] = {t:0,r:0};
  state.byCas[state.cas.id].t++;
  saveState();
  render();
}

function nextQuestion() {
  const prev = {word: state.word, cas: state.cas};
  const q = pickQuestion(prev);
  if (!q) return;
  state.word = q.word; state.cas = q.cas;
  state.phase = 'q'; state.correct = false;
  $('answer-input').value = '';
  render();
  setTimeout(() => $('answer-input').focus(), 80);
}

// ─── STATS ─────────────────────────────────────────────────────────────────────
function renderStats() {
  const s = state.session;
  const acc = s.total > 0 ? Math.round(s.right/s.total*100) : 0;
  $('st-total').textContent = s.total;
  $('st-right').textContent = s.right;
  $('st-acc').textContent   = acc + '%';
  $('st-acc').style.color   = acc >= 70 ? '#22c55e' : acc > 0 ? '#f59e0b' : '#94a3b8';

  const bars = $('case-bars');
  bars.innerHTML = '';
  CASES.forEach(c => {
    const d = state.byCas[c.id] || {t:0,r:0};
    const pct = d.t > 0 ? Math.round(d.r/d.t*100) : 0;
    bars.innerHTML += `
      <div class="bar-row">
        <span class="bar-label" style="background:${c.color}">${c.ru.slice(0,4)}.</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${c.color}"></div></div>
        <span class="bar-pct">${d.t>0 ? pct+'%' : '—'}</span>
        <span class="bar-meta">${d.r}/${d.t}</span>
      </div>`;
  });

  const hist = $('history-list');
  hist.innerHTML = '';
  if (state.history.length === 0) {
    hist.innerHTML = '<p class="empty">Ещё нет попыток. Начните тренировку!</p>';
    return;
  }
  state.history.slice(0,20).forEach(r => {
    const c = CASES.find(x => x.id === r.cas);
    hist.innerHTML += `
      <div class="hist-row ${r.ok?'h-ok':'h-fail'}">
        <span>${r.ok?'✅':'❌'}</span>
        <span class="hist-word">${r.w}</span>
        <span class="hist-case" style="background:${c?.color}">${c?.ru.slice(0,3)}.</span>
        <span class="hist-note">${r.skipped?'пропущено':r.ok?'верно':'неверно'}</span>
      </div>`;
  });
}

// ─── REFERENCE ─────────────────────────────────────────────────────────────────
function renderRef() {
  // Static — rendered in HTML
}

// ─── NAVIGATION ────────────────────────────────────────────────────────────────
function goPage(p) {
  state.page = p;
  render();
}

// ─── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  const q = pickQuestion(null);
  if (q) { state.word = q.word; state.cas = q.cas; }

  // Nav
  ['trainer','stats','ref'].forEach(p =>
    $('nav-'+p).addEventListener('click', () => goPage(p)));

  // Check
  $('btn-check').addEventListener('click', checkAnswer);
  $('btn-skip').addEventListener('click', skipQuestion);
  $('btn-next').addEventListener('click', nextQuestion);

  // Enter key
  $('answer-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (state.phase === 'q') checkAnswer();
      else nextQuestion();
    }
  });

  // Reset
  $('btn-reset').addEventListener('click', () => {
    if (confirm('Сбросить всю статистику?')) {
      state.session = {total:0, right:0, streak:0};
      state.history = [];
      state.byCas   = {};
      saveState();
      render();
    }
  });

  render();

  // SW
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
});
