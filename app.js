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

  // Аренда
  {w:'daire',      ru:'квартира',         cat:'аренда'},
  {w:'büyük',      ru:'большой',          cat:'аренда'},
  {w:'küçük',      ru:'маленький',        cat:'аренда'},
  {w:'tamirli',    ru:'с ремонтом',       cat:'аренда'},
  {w:'eski',       ru:'старый',           cat:'аренда'},
  {w:'yeni',       ru:'новый',            cat:'аренда'},
  {w:'eşyalı',     ru:'с мебелью',        cat:'аренда'},
  {w:'merkez',     ru:'центр',            cat:'аренда'},
  {w:'mahalle',    ru:'район',            cat:'аренда'},
  {w:'apartman',   ru:'многоквартирный дом', cat:'аренда'},
  {w:'kira',       ru:'аренда',           cat:'аренда'},
  {w:'sözleşme',   ru:'договор',          cat:'аренда'},
  {w:'metrekare',  ru:'кв. метр',         cat:'аренда'},

  // Напитки
  {w:'içki',       ru:'напиток',          cat:'напитки'},
  {w:'alkollü',    ru:'алкогольный',      cat:'напитки'},
  {w:'alkolsüz',   ru:'безалкогольный',   cat:'напитки'},
  {w:'soda suyu',  ru:'газированная вода', cat:'напитки'},
  {w:'maden suyu', ru:'минеральная вода', cat:'напитки'},
  {w:'yeşil çay',  ru:'зелёный чай',      cat:'напитки'},
  {w:'siyah çay',  ru:'чёрный чай',       cat:'напитки'},
  {w:'sade kahve', ru:'чёрный кофе',      cat:'напитки'},

  // Отель
  {w:'rezervasyon',ru:'бронирование',     cat:'отель'},
  {w:'pasaport',   ru:'паспорт',          cat:'отель'},
  {w:'kimlik',     ru:'удостоверение',    cat:'отель'},
  {w:'evrak',      ru:'документ',         cat:'отель'},
  {w:'boş',        ru:'свободный/пустой', cat:'отель'},
  {w:'kişi',       ru:'человек',          cat:'отель'},

  // Кафе и еда
  {w:'börek',      ru:'пирог/бёрек',      cat:'кафе'},
  {w:'reçel',      ru:'джем',             cat:'кафе'},
  {w:'salata',     ru:'салат',            cat:'кафе'},
  {w:'pasta',      ru:'торт',             cat:'кафе'},
  {w:'kurabiye',   ru:'печенье',          cat:'кафе'},
  {w:'yemek',      ru:'еда/блюдо',        cat:'кафе'},
  {w:'sipariş',    ru:'заказ',            cat:'кафе'},
  {w:'masa',       ru:'стол',             cat:'кафе'},
  {w:'fişi',       ru:'чек',              cat:'кафе'},
  {w:'üstü',       ru:'сдача',            cat:'кафе'},
  {w:'poşet',      ru:'пакет',            cat:'кафе'},
  {w:'lütfen',     ru:'пожалуйста',       cat:'кафе'},
  {w:'sakız',      ru:'жвачка',           cat:'кафе'},

  // Фрукты
  {w:'çilek',      ru:'клубника',         cat:'фрукты'},
  {w:'kavun',      ru:'дыня',             cat:'фрукты'},
  {w:'karpuz',     ru:'арбуз',            cat:'фрукты'},
  {w:'kiraz',      ru:'вишня/черешня',    cat:'фрукты'},
  {w:'ahududu',    ru:'малина',           cat:'фрукты'},
  {w:'böğürtlen',  ru:'ежевика',          cat:'фрукты'},
  {w:'portakal',   ru:'апельсин',         cat:'фрукты'},
  {w:'üzüm',       ru:'виноград',         cat:'фрукты'},
  {w:'armut',      ru:'груша',            cat:'фрукты'},
  {w:'şeftali',    ru:'персик',           cat:'фрукты'},

  // Цвета
  {w:'kırmızı',    ru:'красный',          cat:'цвета'},
  {w:'sarı',       ru:'жёлтый',           cat:'цвета'},
  {w:'yeşil',      ru:'зелёный',          cat:'цвета'},
  {w:'siyah',      ru:'чёрный',           cat:'цвета'},
  {w:'beyaz',      ru:'белый',            cat:'цвета'},
  {w:'mavi',       ru:'синий/голубой',    cat:'цвета'},
  {w:'turuncu',    ru:'оранжевый',        cat:'цвета'},
  {w:'mor',        ru:'фиолетовый',       cat:'цвета'},
  {w:'pembe',      ru:'розовый',          cat:'цвета'},
  {w:'gri',        ru:'серый',            cat:'цвета'},
  {w:'koyu kırmızı',ru:'тёмно-красный',   cat:'цвета'},
  {w:'açık mavi',  ru:'светло-голубой',   cat:'цвета'},

  // Аптека/Магазин
  {w:'ilaç',       ru:'лекарство',        cat:'аптека'},
  {w:'fiyat',      ru:'цена',             cat:'аптека'},
  {w:'lira',       ru:'лира',             cat:'аптека'},
  {w:'nakit',      ru:'наличными',        cat:'аптека'},
  {w:'indirimli',  ru:'со скидкой',       cat:'аптека'},
  {w:'kartla',     ru:'картой',           cat:'аптека'},
  {w:'nereden',    ru:'откуда',           cat:'аптека'},
  {w:'nerede',     ru:'где',              cat:'аптека'},
  {w:'nasıl',      ru:'как',              cat:'аптека'},
  {w:'kaça',       ru:'за сколько',       cat:'аптека'},
  {w:'eczane',     ru:'аптека',           cat:'аптека'},
  {w:'şampuan',    ru:'шампунь',          cat:'аптека'},
  {w:'diş macunu', ru:'зубная паста',     cat:'аптека'},
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
  catFilter: null,     // null = all categories
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
    const allW = getFilteredWords();
    if (!allW.length) return null;
    word = allW[Math.floor(Math.random()*allW.length)];
    cas  = cases[Math.floor(Math.random()*cases.length)];
    tries++;
  } while (tries < 20 && prev && word.w === prev.word.w && cas.id === prev.cas.id);
  return { word, cas };
}

function getFilteredWords() {
  const all = getAllWords();
  if (!state.catFilter) return all;
  return all.filter(w => w.cat === state.catFilter);
}

function getCategories() {
  const cats = new Set();
  getAllWords().forEach(w => cats.add(w.cat));
  return Array.from(cats);
}

function renderCatFilter() {
  const el = $('cat-filter');
  if (!el) return;
  const cats = getCategories();
  let html = '<button class="cat-btn' + (!state.catFilter ? ' active' : '') + '" data-cat="">\u0412\u0441\u0435</button>';
  cats.forEach(c => {
    html += '<button class="cat-btn' + (state.catFilter === c ? ' active' : '') + '" data-cat="' + c + '">' + c + '</button>';
  });
  el.innerHTML = html;
  el.querySelectorAll('.cat-btn').forEach(b => {
    b.addEventListener('click', () => {
      state.catFilter = b.dataset.cat || null;
      const q = pickQuestion(null);
      if (q) { state.word = q.word; state.cas = q.cas; state.phase = 'q'; }
      $('answer-input').value = '';
      render();
    });
  });
}

// ─── RENDER ────────────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function render() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $('page-'+state.page).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  $('nav-'+state.page).classList.add('active');

  if (state.page === 'trainer') { renderCatFilter(); renderTrainer(); }
  if (state.page === 'stats')   renderStats();
  if (state.page === 'sent')    renderSentences();
  if (state.page === 'words')   renderMyWords();
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
  ['trainer','stats','sent','words','ref'].forEach(p =>
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

  // Sentences
  initSentences();

  // Dialogs
  initDialogs();

  // My Words
  loadMyWords();
  $('btn-add-word').addEventListener('click', addMyWord);
  $('new-word-tr').addEventListener('keydown', e => { if (e.key==='Enter') $('new-word-ru').focus(); });
  $('new-word-ru').addEventListener('keydown', e => { if (e.key==='Enter') addMyWord(); });

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
    navigator.serviceWorker.register('/magarram/sw.js').catch(()=>{});
});

// ─── SENTENCES ────────────────────────────────────────────────────────────────
const SENTENCES = [{"ru": "Я иду домой", "tr": "Eve gidiyorum", "hint": "дательный (eve)", "level": 1}, {"ru": "Кошка на столе", "tr": "Kedi masada", "hint": "местный (masada)", "level": 1}, {"ru": "Книга друга", "tr": "Arkadaşın kitabı", "hint": "родительный (arkadaşın) + притяжательный", "level": 1}, {"ru": "Я иду в школу", "tr": "Okula gidiyorum", "hint": "дательный (okula)", "level": 1}, {"ru": "Мама дома", "tr": "Anne evde", "hint": "местный (evde)", "level": 1}, {"ru": "Я вижу кошку", "tr": "Kediyi görüyorum", "hint": "винительный (kediyi)", "level": 1}, {"ru": "Я иду в парк", "tr": "Parka gidiyorum", "hint": "дательный (parka)", "level": 1}, {"ru": "Друг в школе", "tr": "Arkadaş okulda", "hint": "местный (okulda)", "level": 1}, {"ru": "Я читаю книгу", "tr": "Kitabı okuyorum", "hint": "винительный (kitabı)", "level": 1}, {"ru": "Я иду к врачу", "tr": "Doktora gidiyorum", "hint": "дательный (doktora)", "level": 1}, {"ru": "Машина друга", "tr": "Arkadaşın arabası", "hint": "родительный (arkadaşın) + притяжательный", "level": 1}, {"ru": "Кошка на стуле", "tr": "Kedi sandalyede", "hint": "местный (sandalyede)", "level": 1}, {"ru": "Я пью чай", "tr": "Çayı içiyorum", "hint": "винительный (çayı)", "level": 1}, {"ru": "Я иду из дома", "tr": "Evden gidiyorum", "hint": "исходный (evden)", "level": 1}, {"ru": "Кошка выходит из дома", "tr": "Kedi evden çıkıyor", "hint": "исходный (evden)", "level": 1}, {"ru": "Я даю воду кошке", "tr": "Kediye su veriyorum", "hint": "дательный (kediye)", "level": 1}, {"ru": "Стул у стола", "tr": "Sandalye masanın yanında", "hint": "родительный (masanın) + притяжательный", "level": 1}, {"ru": "Я в городе", "tr": "Şehirdeyim", "hint": "местный (şehirde)", "level": 1}, {"ru": "Я еду в город", "tr": "Şehre gidiyorum", "hint": "дательный (şehre)", "level": 1}, {"ru": "Я еду из города", "tr": "Şehirden geliyorum", "hint": "исходный (şehirden)", "level": 1}, {"ru": "Я вижу машину", "tr": "Arabayı görüyorum", "hint": "винительный (arabayı)", "level": 1}, {"ru": "Книга на столе", "tr": "Kitap masada", "hint": "местный (masada)", "level": 1}, {"ru": "Я покупаю воду", "tr": "Su satın alıyorum", "hint": "винительный (su — без суффикса, неопределённый)", "level": 1}, {"ru": "Я выхожу из школы", "tr": "Okuldan çıkıyorum", "hint": "исходный (okuldan)", "level": 1}, {"ru": "Мама готовит чай", "tr": "Anne çay yapıyor", "hint": "винительный (çay — без суффикса, неопределённый)", "level": 1}, {"ru": "Крыша дома", "tr": "Evin çatısı", "hint": "родительный (evin) + притяжательный", "level": 1}, {"ru": "Дверь школы", "tr": "Okulun kapısı", "hint": "родительный (okulun) + притяжательный", "level": 1}, {"ru": "Я иду к другу", "tr": "Arkadaşa gidiyorum", "hint": "дательный (arkadaşa)", "level": 1}, {"ru": "Кошка у врача", "tr": "Kedi doktorda", "hint": "местный (doktorda)", "level": 1}, {"ru": "Я беру книгу", "tr": "Kitabı alıyorum", "hint": "винительный (kitabı)", "level": 1}, {"ru": "Я иду на стул", "tr": "Sandalyeye oturuyorum", "hint": "дательный (sandalyeye)", "level": 1}, {"ru": "Врач в больнице", "tr": "Doktor hastanede", "hint": "местный (hastanede)", "level": 1}, {"ru": "Я беру стул", "tr": "Sandalyeyi alıyorum", "hint": "винительный (sandalyeyi)", "level": 1}, {"ru": "Мама читает книгу", "tr": "Anne kitabı okuyor", "hint": "винительный (kitabı)", "level": 1}, {"ru": "Я выхожу из парка", "tr": "Parktan çıkıyorum", "hint": "исходный (parktan)", "level": 1}, {"ru": "Вода на столе", "tr": "Su masada", "hint": "местный (masada)", "level": 1}, {"ru": "Я даю книгу другу", "tr": "Arkadaşa kitap veriyorum", "hint": "дательный (arkadaşa)", "level": 1}, {"ru": "Кот прыгает со стула", "tr": "Kedi sandalyeden atlıyor", "hint": "исходный (sandalyeden)", "level": 1}, {"ru": "Я смотрю на город", "tr": "Şehre bakıyorum", "hint": "дательный (şehre)", "level": 1}, {"ru": "Вода из реки", "tr": "Nehirden su", "hint": "исходный (nehirden)", "level": 1}, {"ru": "Дети идут из школы в парк", "tr": "Çocuklar okuldan parka gidiyor", "hint": "исходный (okuldan) + дательный (parka)", "level": 2}, {"ru": "Мама ставит чай на стол", "tr": "Anne çayı masaya koyuyor", "hint": "винительный (çayı) + дательный (masaya)", "level": 2}, {"ru": "Друг едет из города домой", "tr": "Arkadaş şehirden eve gidiyor", "hint": "исходный (şehirden) + дательный (eve)", "level": 2}, {"ru": "Я несу книгу в школу", "tr": "Kitabı okula götürüyorum", "hint": "винительный (kitabı) + дательный (okula)", "level": 2}, {"ru": "Кошка пьёт воду из миски", "tr": "Kedi kaseden su içiyor", "hint": "исходный (kaseden) + именительный (su)", "level": 2}, {"ru": "Врач читает книгу в парке", "tr": "Doktor parkta kitap okuyor", "hint": "местный (parkta)", "level": 2}, {"ru": "Мама кладёт книгу на стол", "tr": "Anne kitabı masaya koyuyor", "hint": "винительный (kitabı) + дательный (masaya)", "level": 2}, {"ru": "Я вижу машину друга", "tr": "Arkadaşın arabasını görüyorum", "hint": "родительный (arkadaşın) + винительный (arabasını)", "level": 2}, {"ru": "Мы идём из парка в школу", "tr": "Parktan okula gidiyoruz", "hint": "исходный (parktan) + дательный (okula)", "level": 2}, {"ru": "Я пью чай дома", "tr": "Evde çay içiyorum", "hint": "местный (evde)", "level": 2}, {"ru": "Дети играют в парке", "tr": "Çocuklar parkta oynuyor", "hint": "местный (parkta)", "level": 2}, {"ru": "Я еду из дома в город", "tr": "Evden şehre gidiyorum", "hint": "исходный (evden) + дательный (şehre)", "level": 2}, {"ru": "Мама даёт воду кошке", "tr": "Anne kediye su veriyor", "hint": "дательный (kediye)", "level": 2}, {"ru": "Я ставлю стул у стола", "tr": "Sandalyeyi masanın yanına koyuyorum", "hint": "винительный (sandalyeyi) + родительный (masanın)", "level": 2}, {"ru": "Друг берёт книгу со стола", "tr": "Arkadaş kitabı masadan alıyor", "hint": "винительный (kitabı) + исходный (masadan)", "level": 2}, {"ru": "Мы едем в город на машине", "tr": "Şehre arabayla gidiyoruz", "hint": "дательный (şehre) + творительный инструм. (arabayla)", "level": 2}, {"ru": "Врач выходит из больницы", "tr": "Doktor hastaneden çıkıyor", "hint": "исходный (hastaneden)", "level": 2}, {"ru": "Я вижу парк из окна", "tr": "Pencereden parkı görüyorum", "hint": "исходный (pencereden) + винительный (parkı)", "level": 2}, {"ru": "Кошка прыгает на стол", "tr": "Kedi masaya atlıyor", "hint": "дательный (masaya)", "level": 2}, {"ru": "Я читаю книгу друга", "tr": "Arkadaşın kitabını okuyorum", "hint": "родительный (arkadaşın) + винительный (kitabını)", "level": 2}, {"ru": "Мама идёт к врачу с другом", "tr": "Anne arkadaşıyla doktora gidiyor", "hint": "дательный (doktora) + инструм. (arkadaşıyla)", "level": 2}, {"ru": "Я беру воду из холодильника", "tr": "Buzdolabından suyu alıyorum", "hint": "исходный (buzdolabından) + винительный (suyu)", "level": 2}, {"ru": "Книга лежит на стуле", "tr": "Kitap sandalyede duruyor", "hint": "местный (sandalyede)", "level": 2}, {"ru": "Дети бегут из парка домой", "tr": "Çocuklar parktan eve koşuyor", "hint": "исходный (parktan) + дательный (eve)", "level": 2}, {"ru": "Я даю маме чай", "tr": "Anneye çay veriyorum", "hint": "дательный (anneye)", "level": 2}, {"ru": "Машина стоит у дома", "tr": "Araba evin önünde duruyor", "hint": "родительный (evin) + притяжательный", "level": 2}, {"ru": "Я покупаю книгу для друга", "tr": "Arkadaşım için kitap alıyorum", "hint": "послелог için + родительный (arkadaşım)", "level": 2}, {"ru": "Мы едем из школы в парк", "tr": "Okuldan parka gidiyoruz", "hint": "исходный (okuldan) + дательный (parka)", "level": 2}, {"ru": "Мама ставит воду на стол", "tr": "Anne suyu masaya koyuyor", "hint": "винительный (suyu) + дательный (masaya)", "level": 2}, {"ru": "Я вижу кошку на столе", "tr": "Masadaki kediyi görüyorum", "hint": "местный (masadaki) + винительный (kediyi)", "level": 2}, {"ru": "Врач говорит маме о болезни", "tr": "Doktor anneye hastalık hakkında söylüyor", "hint": "дательный (anneye)", "level": 2}, {"ru": "Друг едет из парка к маме", "tr": "Arkadaş parktan anneye gidiyor", "hint": "исходный (parktan) + дательный (anneye)", "level": 2}, {"ru": "Я несу чай маме", "tr": "Anneye çay götürüyorum", "hint": "дательный (anneye)", "level": 2}, {"ru": "Кошка выходит из комнаты", "tr": "Kedi odadan çıkıyor", "hint": "исходный (odadan)", "level": 2}, {"ru": "Я ставлю книгу на стул", "tr": "Kitabı sandalyeye koyuyorum", "hint": "винительный (kitabı) + дательный (sandalyeye)", "level": 2}, {"ru": "Мама читает книгу в комнате", "tr": "Anne odada kitap okuyor", "hint": "местный (odada)", "level": 2}, {"ru": "Я смотрю на машину друга", "tr": "Arkadaşın arabasına bakıyorum", "hint": "родительный (arkadaşın) + дательный (arabasına)", "level": 2}, {"ru": "Врач пьёт чай в парке", "tr": "Doktor parkta çay içiyor", "hint": "местный (parkta)", "level": 2}, {"ru": "Я еду из города к другу", "tr": "Şehirden arkadaşa gidiyorum", "hint": "исходный (şehirden) + дательный (arkadaşa)", "level": 2}, {"ru": "Кошка лежит на книге", "tr": "Kedi kitabın üzerinde yatıyor", "hint": "родительный (kitabın) + притяжательный", "level": 2}];

let sentState = {
  current: null,
  phase: 'q',
  levelFilter: 0, // 0=all, 1=simple, 2=medium
  session: { total: 0, right: 0 }
};

function pickSentence() {
  const pool = sentState.levelFilter === 0 ? SENTENCES
    : SENTENCES.filter(s => s.level === sentState.levelFilter);
  if (!pool.length) return null;
  let s;
  let tries = 0;
  do {
    s = pool[Math.floor(Math.random() * pool.length)];
    tries++;
  } while (tries < 15 && sentState.current && s.ru === sentState.current.ru);
  return s;
}

function normalizeTr(s) {
  return s.trim().toLowerCase()
    .replace(/[.,!?;:]+/g, '')
    .replace(/\s+/g, ' ');
}

function renderSentences() {
  if (!sentState.current) sentState.current = pickSentence();
  const s = sentState.current;
  if (!s) return;

  $('sent-ru').textContent = s.ru;
  $('sent-hint').textContent = s.hint;
  $('sent-hint').style.display = 'none';
  $('btn-sent-hint').style.display = '';

  const acc = sentState.session.total > 0
    ? Math.round(sentState.session.right / sentState.session.total * 100) : null;
  $('ss-total').textContent = sentState.session.total;
  $('ss-right').textContent = sentState.session.right;
  $('ss-acc').textContent = acc !== null ? acc + '%' : '—';

  if (sentState.phase === 'q') {
    $('sent-input-area').style.display = '';
    $('sent-result-area').style.display = 'none';
    $('sent-answer').value = '';
    setTimeout(() => $('sent-answer').focus(), 50);
  } else {
    $('sent-input-area').style.display = 'none';
    $('sent-result-area').style.display = '';
  }

  // Level filter buttons
  document.querySelectorAll('.sent-lvl').forEach(b => b.classList.remove('active'));
  if (sentState.levelFilter === 0) $('sent-lvl-all').classList.add('active');
  else if (sentState.levelFilter === 1) $('sent-lvl-1').classList.add('active');
  else $('sent-lvl-2').classList.add('active');
}

function checkSentAnswer() {
  const s = sentState.current;
  if (!s) return;
  const answer = normalizeTr($('sent-answer').value);
  const correct = normalizeTr(s.tr);
  const isRight = answer === correct;

  sentState.session.total++;
  if (isRight) sentState.session.right++;
  sentState.phase = 'result';

  $('sent-res-icon').textContent = isRight ? '✅' : '❌';
  $('sent-res-verdict').textContent = isRight ? 'Правильно!' : 'Неверно';
  $('sent-res-verdict').className = 'res-verdict ' + (isRight ? 'c-ok' : 'c-err');

  if (!isRight) {
    $('sent-res-your').style.display = '';
    $('sent-res-your').textContent = 'Ваш ответ: ' + ($('sent-answer').value || '—');
  } else {
    $('sent-res-your').style.display = 'none';
  }

  $('sent-res-correct').innerHTML = '<b>' + s.tr + '</b>';
  $('sent-res-hint').textContent = s.hint;
  renderSentences();
}

function nextSentence() {
  sentState.current = pickSentence();
  sentState.phase = 'q';
  renderSentences();
}

function initSentences() {
  sentState.current = pickSentence();

  $('btn-sent-check').addEventListener('click', checkSentAnswer);
  $('btn-sent-skip').addEventListener('click', () => {
    sentState.session.total++;
    sentState.phase = 'result';
    const s = sentState.current;
    $('sent-res-icon').textContent = '⏭️';
    $('sent-res-verdict').textContent = 'Пропущено';
    $('sent-res-verdict').className = 'res-verdict c-skip';
    $('sent-res-your').style.display = 'none';
    $('sent-res-correct').innerHTML = '<b>' + s.tr + '</b>';
    $('sent-res-hint').textContent = s.hint;
    renderSentences();
  });
  $('btn-sent-next').addEventListener('click', nextSentence);
  $('btn-sent-hint').addEventListener('click', () => {
    $('sent-hint').style.display = '';
    $('btn-sent-hint').style.display = 'none';
  });
  $('sent-answer').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (sentState.phase === 'q') checkSentAnswer();
      else nextSentence();
    }
  });

  // Level filter
  $('sent-lvl-all').addEventListener('click', () => { sentState.levelFilter = 0; sentState.current = pickSentence(); sentState.phase = 'q'; renderSentences(); });
  $('sent-lvl-1').addEventListener('click',   () => { sentState.levelFilter = 1; sentState.current = pickSentence(); sentState.phase = 'q'; renderSentences(); });
  $('sent-lvl-2').addEventListener('click',   () => { sentState.levelFilter = 2; sentState.current = pickSentence(); sentState.phase = 'q'; renderSentences(); });
}

// ─── MY WORDS ──────────────────────────────────────────────────────────────────
let myWords = [];

function loadMyWords() {
  try {
    const saved = JSON.parse(LS.getItem('tc_mywords') || '[]');
    myWords = saved.filter(w => w.w && w.ru);
  } catch(e) { myWords = []; }
}

function saveMyWords() {
  try { LS.setItem('tc_mywords', JSON.stringify(myWords)); } catch(e){}
}

function getAllWords() {
  return WORDS.concat(myWords.map(w => ({...w, cat: 'мои слова'})));
}

function addMyWord() {
  const tr = $('new-word-tr').value.trim().toLowerCase();
  const ru = $('new-word-ru').value.trim();
  const msg = $('add-word-msg');

  if (!tr) { showMsg(msg, 'Введите турецкое слово', 'err'); return; }
  if (!ru) { showMsg(msg, 'Введите перевод', 'err'); return; }

  // Проверка — только латиница и турецкие буквы
  if (!/^[a-zçğıöşüâîû ]+$/.test(tr)) {
    showMsg(msg, 'Слово должно быть на турецком (латинскими буквами)', 'err'); return;
  }

  // Дубликат?
  if (myWords.some(w => w.w === tr) || WORDS.some(w => w.w === tr)) {
    showMsg(msg, 'Это слово уже есть в базе', 'err'); return;
  }

  myWords.push({ w: tr, ru });
  saveMyWords();
  $('new-word-tr').value = '';
  $('new-word-ru').value = '';
  showMsg(msg, '✓ Слово «' + tr + '» добавлено!', 'ok');
  renderMyWords();
  setTimeout(() => { msg.textContent = ''; msg.className = 'add-word-msg'; }, 3000);
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = 'add-word-msg ' + type;
}

function deleteMyWord(w) {
  myWords = myWords.filter(x => x.w !== w);
  saveMyWords();
  renderMyWords();
}

function renderMyWords() {
  const list = $('my-words-list');
  if (!myWords.length) {
    list.innerHTML = '<div class="my-words-empty">Пока нет своих слов.<br>Добавь первое слово выше.</div>';
    return;
  }
  list.innerHTML = myWords.map(w => `
    <div class="my-word-item">
      <div>
        <div class="my-word-tr">${w.w}</div>
        <div class="my-word-ru">${w.ru}</div>
      </div>
      <button class="my-word-del" onclick="deleteMyWord('${w.w}')">удалить</button>
    </div>
  `).join('');
}

// ─── DIALOGS ─────────────────────────────────────────────────────────────────────────
const DIALOGS = [
  // Отель
  {topic:'отель', q_ru:'Есть свободный номер?', q_tr:'Bo\u015f odan\u0131z var m\u0131?', a_tr:'Evet, bo\u015f odam\u0131z var', hint:'боş = свободный, oda = номер'},
  {topic:'отель', q_ru:'На сколько человек?', q_tr:'Ka\u00e7 ki\u015fi i\u00e7in?', a_tr:'\u0130ki ki\u015fi i\u00e7in', hint:'ka\u00e7 = сколько, ki\u015fi = человек'},
  {topic:'отель', q_ru:'Паспорт можно?', q_tr:'Pasaportunuzu alabilir miyim?', a_tr:'Tabii, buyurun', hint:'pasaport = паспорт, alabilir miyim = могу взять?'},
  {topic:'отель', q_ru:'Бронирование есть?', q_tr:'Rezervasyonunuz var m\u0131?', a_tr:'Evet, rezervasyonum var', hint:'rezervasyon = бронирование'},
  {topic:'отель', q_ru:'Кахвалты включен?', q_tr:'Kahvalt\u0131 dahil mi?', a_tr:'Evet, kahvalt\u0131 dahil', hint:'kahvalt\u0131 = завтрак, dahil = включено'},
  {topic:'отель', q_ru:'Сколько стоит номер?', q_tr:'Oda fiyat\u0131 ne kadar?', a_tr:'Bir gecelik \u00fc\u00e7 bin lira', hint:'fiyat = цена, ne kadar = сколько'},
  {topic:'отель', q_ru:'Всё оплачено?', q_tr:'Her \u015feyi \u00f6dediniz mi?', a_tr:'Evet, her \u015feyi \u00f6dedim', hint:'\u00f6demek = оплатить, her \u015fey = всё'},

  // Кафе / Ресторан
  {topic:'кафе', q_ru:'Могу я заказать?', q_tr:'Sipari\u015f edebilir miyim?', a_tr:'Tabii, buyurun', hint:'sipari\u015f = заказ'},
  {topic:'кафе', q_ru:'Могу попробовать?', q_tr:'Tadabilir miyim?', a_tr:'Tabii, buyurun', hint:'tatmak = пробовать'},
  {topic:'кафе', q_ru:'Можете принести?', q_tr:'Getirebilir misiniz?', a_tr:'Tabii, hemen getiriyorum', hint:'getirmek = принести'},
  {topic:'кафе', q_ru:'Можете дать?', q_tr:'Verebilir misiniz?', a_tr:'Tabii, buyurun', hint:'vermek = дать'},
  {topic:'кафе', q_ru:'Могу сесть за этот стол?', q_tr:'Bu masaya oturabilir miyim?', a_tr:'Tabii, oturabilirsiniz', hint:'masa = стол, oturmak = сидеть, -ya дательный'},
  {topic:'кафе', q_ru:'Что будете пить?', q_tr:'Ne i\u00e7eceksiniz?', a_tr:'Bir \u00e7ay l\u00fctfen', hint:'и\u00e7mek = пить, ne = что'},
  {topic:'кафе', q_ru:'Что порекомендуете?', q_tr:'Ne tavsiye edersiniz?', a_tr:'Bug\u00fcn\u00fcn \u00f6zel yeme\u011fi \u00e7ok g\u00fczel', hint:'tavsiye = рекомендация'},
  {topic:'кафе', q_ru:'Счёт, пожалуйста', q_tr:'Hesap l\u00fctfen', a_tr:'Tabii, hemen getiriyorum', hint:'hesap = счёт'},
  {topic:'кафе', q_ru:'Сколько это стоит?', q_tr:'Bunun fiyat\u0131 ne kadar?', a_tr:'Y\u00fcz elli lira', hint:'bunun = этого (род.), fiyat = цена'},
  {topic:'кафе', q_ru:'Хочу зелёный чай', q_tr:'Ye\u015fil \u00e7ay istiyorum', a_tr:'Tabii, hemen getiriyorum', hint:'ye\u015fil = зелёный, \u00e7ay = чай'},

  // Аптека / Магазин
  {topic:'магазин', q_ru:'У вас есть такая вещь?', q_tr:'Sizde b\u00f6yle \u015fey var m\u0131?', a_tr:'Evet, var', hint:'sizde = у вас (местный), b\u00f6yle = такой'},
  {topic:'магазин', q_ru:'Сколько стоит лекарство?', q_tr:'Bu ila\u00e7\u0131n fiyat\u0131 ne kadar?', a_tr:'Y\u00fcz lira', hint:'ila\u00e7 = лекарство, fiyat = цена (родительный)'},
  {topic:'магазин', q_ru:'Могу купить это?', q_tr:'Bunu alabilir miyim?', a_tr:'Tabii, alabilirsiniz', hint:'bunu = это (вин.), almak = купить'},
  {topic:'магазин', q_ru:'Могу оплатить?', q_tr:'\u00d6deyebilir miyim?', a_tr:'Tabii', hint:'\u00f6demek = оплатить'},
  {topic:'магазин', q_ru:'Картой можно?', q_tr:'Kartla \u00f6deyebilir miyim?', a_tr:'Evet, kartla \u00f6deyebilirsiniz', hint:'kartla = картой'},
  {topic:'магазин', q_ru:'Наличными можно?', q_tr:'Nakit \u00f6deyebilir miyim?', a_tr:'Evet, nakit de olur', hint:'nakit = наличными'},
  {topic:'магазин', q_ru:'Скидка есть?', q_tr:'\u0130ndirim var m\u0131?', a_tr:'Evet, y\u00fczde yirmi indirim var', hint:'indirim = скидка'},
  {topic:'магазин', q_ru:'Я хочу купить такую вещь', q_tr:'Ben b\u00f6yle \u015feyi almak istiyorum', a_tr:'Buyurun, hangi renk istersiniz?', hint:'\u015feyi = вещь (вин.), almak = купить'},
  {topic:'магазин', q_ru:'Пакет нужен?', q_tr:'Po\u015fet ister misiniz?', a_tr:'Evet, bir po\u015fet l\u00fctfen', hint:'po\u015fet = пакет'},
  {topic:'магазин', q_ru:'Чек нужен?', q_tr:'Fi\u015f ister misiniz?', a_tr:'Evet, fi\u015f l\u00fctfen', hint:'fi\u015f = чек'},

  // Аренда
  {topic:'аренда', q_ru:'Хотите арендовать квартиру?', q_tr:'Daire kiralamak istiyor musunuz?', a_tr:'Evet, daire kiralamak istiyorum', hint:'daire = квартира, kiralamak = арендовать'},
  {topic:'аренда', q_ru:'Эту квартиру могу арендовать?', q_tr:'Bu daireyi kiralayabilir miyim?', a_tr:'Evet, kiralayabilirsiniz', hint:'daireyi = квартиру (вин.)'},
  {topic:'аренда', q_ru:'За 15 тыс. лир могу арендовать?', q_tr:'On be\u015f bin liraya kiralayabilir miyim?', a_tr:'Evet, kiralayabilirsiniz', hint:'liraya = дат. (за ... лир)'},
  {topic:'аренда', q_ru:'Договор составим?', q_tr:'Kira s\u00f6zle\u015fmesi yapabilir miyiz?', a_tr:'Tabii, yapabiliriz', hint:'s\u00f6zle\u015fme = договор, yapmak = делать'},
  {topic:'аренда', q_ru:'Квартира в центре?', q_tr:'Daire merkezde mi?', a_tr:'Evet, merkezde', hint:'merkez = центр, -de = местный'},
  {topic:'аренда', q_ru:'Квартира с мебелью?', q_tr:'Daire e\u015fyal\u0131 m\u0131?', a_tr:'Evet, e\u015fyal\u0131', hint:'e\u015fyal\u0131 = с мебелью'},
  {topic:'аренда', q_ru:'Сколько комнат?', q_tr:'Ka\u00e7 oda?', a_tr:'\u00dc\u00e7 oda bir salon', hint:'oda = комната, salon = гостиная'},

  // Приветствие / Общее
  {topic:'общее', q_ru:'Как дела?', q_tr:'Nas\u0131ls\u0131n\u0131z?', a_tr:'\u0130yiyim, te\u015fekk\u00fcr ederim', hint:'nas\u0131l = как'},
  {topic:'общее', q_ru:'Откуда вы?', q_tr:'Nerelisiniz?', a_tr:'Rusyal\u0131y\u0131m', hint:'nereli = откуда'},
  {topic:'общее', q_ru:'Говорите по-русски?', q_tr:'Rus\u00e7a biliyor musunuz?', a_tr:'Hay\u0131r, T\u00fcrk\u00e7e \u00f6\u011freniyorum', hint:'Rus\u00e7a = по-русски, bilmek = знать'},
  {topic:'общее', q_ru:'Помогите, пожалуйста', q_tr:'Yard\u0131m edebilir misiniz?', a_tr:'Tabii, nas\u0131l yard\u0131m edebilirim?', hint:'yard\u0131m = помощь'},
  {topic:'общее', q_ru:'Где туалет?', q_tr:'Tuvalet nerede?', a_tr:'D\u00fczg\u00fcn gidince solda', hint:'nerede = где'},
  {topic:'общее', q_ru:'Это сколько стоит?', q_tr:'Bu ne kadar?', a_tr:'Elli lira', hint:'ne kadar = сколько'},
];

let dlgState = {
  current: null,
  phase: 'q',
  topicFilter: null, // null = all
  session: { total: 0, right: 0 },
  sentMode: 'phrases', // phrases | dialogs
};

function getDlgTopics() {
  const ts = new Set();
  DIALOGS.forEach(d => ts.add(d.topic));
  return Array.from(ts);
}

function pickDialog() {
  const pool = dlgState.topicFilter
    ? DIALOGS.filter(d => d.topic === dlgState.topicFilter)
    : DIALOGS;
  if (!pool.length) return null;
  let d, tries = 0;
  do {
    d = pool[Math.floor(Math.random() * pool.length)];
    tries++;
  } while (tries < 15 && dlgState.current && d.q_ru === dlgState.current.q_ru);
  return d;
}

function renderDlgTopicFilter() {
  const el = $('dlg-topic-filter');
  if (!el) return;
  const topics = getDlgTopics();
  let html = '<button class="cat-btn' + (!dlgState.topicFilter ? ' active' : '') + '" data-topic="">Все</button>';
  topics.forEach(t => {
    html += '<button class="cat-btn' + (dlgState.topicFilter === t ? ' active' : '') + '" data-topic="' + t + '">' + t + '</button>';
  });
  el.innerHTML = html;
  el.querySelectorAll('.cat-btn').forEach(b => {
    b.addEventListener('click', () => {
      dlgState.topicFilter = b.dataset.topic || null;
      dlgState.current = pickDialog();
      dlgState.phase = 'q';
      renderDialogs();
    });
  });
}

function renderDialogs() {
  if (!dlgState.current) dlgState.current = pickDialog();
  const d = dlgState.current;
  if (!d) return;

  renderDlgTopicFilter();

  // Topic badge
  $('dlg-topic-badge').textContent = d.topic;

  // Question
  $('dlg-question').textContent = d.q_ru;
  $('dlg-question-tr').textContent = d.q_tr;
  $('dlg-hint').textContent = d.hint;
  $('dlg-hint').style.display = 'none';
  $('btn-dlg-hint').style.display = '';

  // Stats
  const acc = dlgState.session.total > 0
    ? Math.round(dlgState.session.right / dlgState.session.total * 100) : null;
  $('ds-total').textContent = dlgState.session.total;
  $('ds-right').textContent = dlgState.session.right;
  $('ds-acc').textContent = acc !== null ? acc + '%' : '\u2014';

  if (dlgState.phase === 'q') {
    $('dlg-input-area').style.display = '';
    $('dlg-result-area').style.display = 'none';
    $('dlg-answer').value = '';
    setTimeout(() => $('dlg-answer').focus(), 50);
  } else {
    $('dlg-input-area').style.display = 'none';
    $('dlg-result-area').style.display = '';
  }
}

function checkDlgAnswer() {
  const d = dlgState.current;
  if (!d) return;
  const answer = normalizeTr($('dlg-answer').value);
  const correct = normalizeTr(d.a_tr);
  const isRight = answer === correct;

  dlgState.session.total++;
  if (isRight) dlgState.session.right++;
  dlgState.phase = 'result';

  $('dlg-res-icon').textContent = isRight ? '\u2705' : '\u274C';
  $('dlg-res-verdict').textContent = isRight ? '\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e!' : '\u041d\u0435\u0432\u0435\u0440\u043d\u043e';
  $('dlg-res-verdict').className = 'res-verdict ' + (isRight ? 'c-ok' : 'c-err');

  if (!isRight) {
    $('dlg-res-your').style.display = '';
    $('dlg-res-your').textContent = '\u0412\u0430\u0448 \u043e\u0442\u0432\u0435\u0442: ' + ($('dlg-answer').value || '\u2014');
  } else {
    $('dlg-res-your').style.display = 'none';
  }

  $('dlg-res-correct').innerHTML = '<b>' + d.a_tr + '</b>';
  $('dlg-res-hint').textContent = d.hint;
  renderDialogs();
}

function nextDialog() {
  dlgState.current = pickDialog();
  dlgState.phase = 'q';
  renderDialogs();
}

function switchSentMode(mode) {
  dlgState.sentMode = mode;
  $('phrases-section').style.display = mode === 'phrases' ? '' : 'none';
  $('dialogs-section').style.display = mode === 'dialogs' ? '' : 'none';
  $('mode-phrases').classList.toggle('active', mode === 'phrases');
  $('mode-dialogs').classList.toggle('active', mode === 'dialogs');
  if (mode === 'dialogs') renderDialogs();
  else renderSentences();
}

function initDialogs() {
  dlgState.current = pickDialog();

  // Mode switch
  $('mode-phrases').addEventListener('click', () => switchSentMode('phrases'));
  $('mode-dialogs').addEventListener('click', () => switchSentMode('dialogs'));

  // Dialog buttons
  $('btn-dlg-check').addEventListener('click', checkDlgAnswer);
  $('btn-dlg-skip').addEventListener('click', () => {
    dlgState.session.total++;
    dlgState.phase = 'result';
    const d = dlgState.current;
    $('dlg-res-icon').textContent = '\u23ED\uFE0F';
    $('dlg-res-verdict').textContent = '\u041f\u0440\u043e\u043f\u0443\u0449\u0435\u043d\u043e';
    $('dlg-res-verdict').className = 'res-verdict c-skip';
    $('dlg-res-your').style.display = 'none';
    $('dlg-res-correct').innerHTML = '<b>' + d.a_tr + '</b>';
    $('dlg-res-hint').textContent = d.hint;
    renderDialogs();
  });
  $('btn-dlg-next').addEventListener('click', nextDialog);
  $('btn-dlg-hint').addEventListener('click', () => {
    $('dlg-hint').style.display = '';
    $('btn-dlg-hint').style.display = 'none';
  });
  $('dlg-answer').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (dlgState.phase === 'q') checkDlgAnswer();
      else nextDialog();
    }
  });
}
