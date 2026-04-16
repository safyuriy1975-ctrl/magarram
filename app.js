
function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function highlightAffixWord(word, suffix){
  const w = escapeHtml(word || '');
  const suf = suffix && suffix !== '—' ? escapeHtml(suffix) : '';
  if (!suf) return `<span class="affix-word"><span class="affix-root">${w}</span></span>`;
  return `<span class="affix-word"><span class="affix-root">${w}</span><span class="affix-suffix">${suf}</span></span>`;
}
function guessSentenceAffixToken(token){
  const clean = token.replace(/[.,!?;:]/g,'');
  const suffixes = ['lardan','lerden','daki','deki','taki','teki','nın','nin','nun','nün','dan','den','tan','ten','yı','yi','yu','yü','ya','ye','da','de','ta','te','ım','im','um','üm','ımız','imiz','umuz','ümüz','sı','si','su','sü','ı','i','u','ü','a','e'];
  for (const suf of suffixes.sort((a,b)=>b.length-a.length)) {
    if (clean.length > suf.length + 1 && clean.toLowerCase().endsWith(suf)) {
      const root = clean.slice(0, -suf.length);
      return token.replace(clean, `<span class="affix-root">${escapeHtml(root)}</span><span class="affix-suffix">${escapeHtml(clean.slice(-suf.length))}</span>`);
    }
  }
  return escapeHtml(token);
}
function highlightSentenceAffixes(text){
  return String(text||'').split(/(\s+)/).map(part => /\s+/.test(part) ? part : guessSentenceAffixToken(part)).join('');
}
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

  // Числа
  {w:'bir',        ru:'один',             cat:'числа'},
  {w:'iki',        ru:'два',              cat:'числа'},
  {w:'üç',         ru:'три',              cat:'числа'},
  {w:'dört',       ru:'четыре',           cat:'числа'},
  {w:'beş',        ru:'пять',             cat:'числа'},
  {w:'altı',       ru:'шесть',            cat:'числа'},
  {w:'yedi',       ru:'семь',             cat:'числа'},
  {w:'sekiz',      ru:'восемь',           cat:'числа'},
  {w:'dokuz',      ru:'девять',           cat:'числа'},
  {w:'on',         ru:'десять',           cat:'числа'},
  {w:'yirmi',      ru:'двадцать',         cat:'числа'},
  {w:'otuz',       ru:'тридцать',         cat:'числа'},
  {w:'kırk',       ru:'сорок',            cat:'числа'},
  {w:'elli',       ru:'пятьдесят',        cat:'числа'},
  {w:'altmış',     ru:'шестьдесят',       cat:'числа'},
  {w:'yetmiş',     ru:'семьдесят',        cat:'числа'},
  {w:'seksen',     ru:'восемьдесят',      cat:'числа'},
  {w:'doksan',     ru:'девяносто',        cat:'числа'},
  {w:'yüz',        ru:'сто',              cat:'числа'},
  {w:'bin',        ru:'тысяча',           cat:'числа'},
  {w:'milyon',     ru:'миллион',          cat:'числа'},

  // Местоимения
  {w:'ben',        ru:'я',                cat:'местоимения'},
  {w:'sen',        ru:'ты',               cat:'местоимения'},
  {w:'o',          ru:'он/она/оно',       cat:'местоимения'},
  {w:'biz',        ru:'мы',               cat:'местоимения'},
  {w:'siz',        ru:'вы',               cat:'местоимения'},
  {w:'onlar',      ru:'они',              cat:'местоимения'},
  {w:'bu',         ru:'это/этот/эта',     cat:'местоимения'},
  {w:'şu',         ru:'тот (рядом)',      cat:'местоимения'},
  {w:'bunlar',     ru:'эти',              cat:'местоимения'},
  {w:'şunlar',     ru:'те (рядом)',       cat:'местоимения'},
  {w:'bunu',       ru:'это (вин.)',       cat:'местоимения'},
  {w:'buna',       ru:'на это (дат.)',    cat:'местоимения'},
  {w:'beni',       ru:'меня',             cat:'местоимения'},
  {w:'seni',       ru:'тебя',             cat:'местоимения'},
  {w:'onu',        ru:'его/её',           cat:'местоимения'},
  {w:'bana',       ru:'мне/ко мне',       cat:'местоимения'},
  {w:'sana',       ru:'тебе/к тебе',      cat:'местоимения'},
  {w:'ona',        ru:'ему/ей',           cat:'местоимения'},
  {w:'bizi',       ru:'нас',              cat:'местоимения'},
  {w:'sizi',       ru:'вас',              cat:'местоимения'},
  {w:'onları',     ru:'их',               cat:'местоимения'},
  {w:'bize',       ru:'нам',              cat:'местоимения'},
  {w:'size',       ru:'вам',              cat:'местоимения'},
  {w:'onlara',     ru:'им',               cat:'местоимения'},

  // Грамматика / служебные
  {w:'evet',       ru:'да',               cat:'разговорные'},
  {w:'hayır',      ru:'нет',              cat:'разговорные'},
  {w:'değil',      ru:'не/нет (отриц.)',  cat:'разговорные'},
  {w:'var',        ru:'есть/имеется',     cat:'разговорные'},
  {w:'yok',        ru:'нет/отсутствует',  cat:'разговорные'},
  {w:'tabii',      ru:'конечно',          cat:'разговорные'},
  {w:'buyurun',    ru:'пожалуйста/прошу', cat:'разговорные'},
  {w:'tamam',      ru:'хорошо/ок',        cat:'разговорные'},
  {w:'teşekkürler',ru:'спасибо',          cat:'разговорные'},
  {w:'özür dilerim',ru:'извините',        cat:'разговорные'},
  {w:'bir',        ru:'один/какой-то',    cat:'разговорные'},
  {w:'ne kadar',   ru:'сколько',          cat:'разговорные'},
  {w:'kim',        ru:'кто',              cat:'разговорные'},
  {w:'ne',         ru:'что',              cat:'разговорные'},
  {w:'neden',      ru:'почему',           cat:'разговорные'},
  {w:'ürün',       ru:'продукт/товар',    cat:'разговорные'},
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
  $('word-tr').innerHTML  = highlightAffixWord(s.word.w, result.suffix);
  $('word-ru').textContent  = '«' + s.word.ru + '»';
  $('word-cat').textContent = s.word.cat;
  $('task-prompt').innerHTML= `Поставьте ${highlightAffixWord(s.word.w, result.suffix)} в <b>${cas.ru.toLowerCase()} падеж</b>`;

  // Card border color
  $('question-card').style.borderColor = cas.color;

  // Cheatsheet — формы скрыты, раскрываются по нажатию
  const cs = $('cheatsheet-grid');
  cs.innerHTML = '';
  CASES.forEach(c => {
    const r = buildCase(s.word.w, c.id);
    const el = document.createElement('div');
    el.className = 'cheat-item cheat-hidden' + (c.id === cas.id ? ' cheat-active' : '');
    el.style.borderColor = c.id === cas.id ? c.color : 'transparent';
    el.innerHTML = `<span class="cheat-case" style="background:${c.color}">${c.ru.slice(0,3)}.</span>
      <span class="cheat-form">${highlightAffixWord(s.word.w, r.suffix)}</span>
      <span class="cheat-suf">${r.suffix}</span>
      <span class="cheat-tap">нажми</span>`;
    el.addEventListener('click', () => {
      el.classList.toggle('cheat-hidden');
    });
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
  // Сбрасываем cheatsheet
  const cb = document.getElementById('cheat-body');
  const cbtn = document.getElementById('btn-cheat');
  if (cb) cb.style.display = 'none';
  if (cbtn) cbtn.textContent = '💡 Показать все формы';
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
const SENTENCES = [{"ru": "Я иду домой", "tr": "Eve gidiyorum", "hint": "дательный (eve)", "level": 1, "topic": "дом"}, {"ru": "Кошка на столе", "tr": "Kedi masada", "hint": "местный (masada)", "level": 1, "topic": "животные"}, {"ru": "Книга друга", "tr": "Arkadaşın kitabı", "hint": "родительный (arkadaşın) + притяжательный", "level": 1, "topic": "дом"}, {"ru": "Я иду в школу", "tr": "Okula gidiyorum", "hint": "дательный (okula)", "level": 1, "topic": "город"}, {"ru": "Мама дома", "tr": "Anne evde", "hint": "местный (evde)", "level": 1, "topic": "дом"}, {"ru": "Я вижу кошку", "tr": "Kediyi görüyorum", "hint": "винительный (kediyi)", "level": 1, "topic": "база"}, {"ru": "Я иду в парк", "tr": "Parka gidiyorum", "hint": "дательный (parka)", "level": 1, "topic": "город"}, {"ru": "Друг в школе", "tr": "Arkadaş okulda", "hint": "местный (okulda)", "level": 1, "topic": "город"}, {"ru": "Я читаю книгу", "tr": "Kitabı okuyorum", "hint": "винительный (kitabı)", "level": 1, "topic": "база"}, {"ru": "Я иду к врачу", "tr": "Doktora gidiyorum", "hint": "дательный (doktora)", "level": 1, "topic": "город"}, {"ru": "Машина друга", "tr": "Arkadaşın arabası", "hint": "родительный (arkadaşın) + притяжательный", "level": 1, "topic": "дом"}, {"ru": "Кошка на стуле", "tr": "Kedi sandalyede", "hint": "местный (sandalyede)", "level": 1, "topic": "животные"}, {"ru": "Я пью чай", "tr": "Çayı içiyorum", "hint": "винительный (çayı)", "level": 1, "topic": "кафе"}, {"ru": "Я иду из дома", "tr": "Evden gidiyorum", "hint": "исходный (evden)", "level": 1, "topic": "дом"}, {"ru": "Кошка выходит из дома", "tr": "Kedi evden çıkıyor", "hint": "исходный (evden)", "level": 1, "topic": "животные"}, {"ru": "Я даю воду кошке", "tr": "Kediye su veriyorum", "hint": "дательный (kediye)", "level": 1, "topic": "база"}, {"ru": "Стул у стола", "tr": "Sandalye masanın yanında", "hint": "родительный (masanın) + притяжательный", "level": 1, "topic": "дом"}, {"ru": "Я в городе", "tr": "Şehirdeyim", "hint": "местный (şehirde)", "level": 1, "topic": "город"}, {"ru": "Я еду в город", "tr": "Şehre gidiyorum", "hint": "дательный (şehre)", "level": 1, "topic": "город"}, {"ru": "Я еду из города", "tr": "Şehirden geliyorum", "hint": "исходный (şehirden)", "level": 1, "topic": "город"}, {"ru": "Я вижу машину", "tr": "Arabayı görüyorum", "hint": "винительный (arabayı)", "level": 1, "topic": "база"}, {"ru": "Книга на столе", "tr": "Kitap masada", "hint": "местный (masada)", "level": 1, "topic": "дом"}, {"ru": "Я покупаю воду", "tr": "Su satın alıyorum", "hint": "винительный (su — без суффикса, неопределённый)", "level": 1, "topic": "база"}, {"ru": "Я выхожу из школы", "tr": "Okuldan çıkıyorum", "hint": "исходный (okuldan)", "level": 1, "topic": "город"}, {"ru": "Мама готовит чай", "tr": "Anne çay yapıyor", "hint": "винительный (çay — без суффикса, неопределённый)", "level": 1, "topic": "кафе"}, {"ru": "Крыша дома", "tr": "Evin çatısı", "hint": "родительный (evin) + притяжательный", "level": 1, "topic": "дом"}, {"ru": "Дверь школы", "tr": "Okulun kapısı", "hint": "родительный (okulun) + притяжательный", "level": 1, "topic": "город"}, {"ru": "Я иду к другу", "tr": "Arkadaşa gidiyorum", "hint": "дательный (arkadaşa)", "level": 1, "topic": "база"}, {"ru": "Кошка у врача", "tr": "Kedi doktorda", "hint": "местный (doktorda)", "level": 1, "topic": "город"}, {"ru": "Я беру книгу", "tr": "Kitabı alıyorum", "hint": "винительный (kitabı)", "level": 1, "topic": "база"}, {"ru": "Я иду на стул", "tr": "Sandalyeye oturuyorum", "hint": "дательный (sandalyeye)", "level": 1, "topic": "дом"}, {"ru": "Врач в больнице", "tr": "Doktor hastanede", "hint": "местный (hastanede)", "level": 1, "topic": "город"}, {"ru": "Я беру стул", "tr": "Sandalyeyi alıyorum", "hint": "винительный (sandalyeyi)", "level": 1, "topic": "дом"}, {"ru": "Мама читает книгу", "tr": "Anne kitabı okuyor", "hint": "винительный (kitabı)", "level": 1, "topic": "база"}, {"ru": "Я выхожу из парка", "tr": "Parktan çıkıyorum", "hint": "исходный (parktan)", "level": 1, "topic": "город"}, {"ru": "Вода на столе", "tr": "Su masada", "hint": "местный (masada)", "level": 1, "topic": "кафе"}, {"ru": "Я даю книгу другу", "tr": "Arkadaşa kitap veriyorum", "hint": "дательный (arkadaşa)", "level": 1, "topic": "база"}, {"ru": "Кот прыгает со стула", "tr": "Kedi sandalyeden atlıyor", "hint": "исходный (sandalyeden)", "level": 1, "topic": "животные"}, {"ru": "Я смотрю на город", "tr": "Şehre bakıyorum", "hint": "дательный (şehre)", "level": 1, "topic": "город"}, {"ru": "Вода из реки", "tr": "Nehirden su", "hint": "исходный (nehirden)", "level": 1, "topic": "кафе"}, {"ru": "Дети идут из школы в парк", "tr": "Çocuklar okuldan parka gidiyor", "hint": "исходный (okuldan) + дательный (parka)", "level": 2, "topic": "город"}, {"ru": "Мама ставит чай на стол", "tr": "Anne çayı masaya koyuyor", "hint": "винительный (çayı) + дательный (masaya)", "level": 2, "topic": "кафе"}, {"ru": "Друг едет из города домой", "tr": "Arkadaş şehirden eve gidiyor", "hint": "исходный (şehirden) + дательный (eve)", "level": 2, "topic": "город"}, {"ru": "Я несу книгу в школу", "tr": "Kitabı okula götürüyorum", "hint": "винительный (kitabı) + дательный (okula)", "level": 2, "topic": "город"}, {"ru": "Кошка пьёт воду из миски", "tr": "Kedi kaseden su içiyor", "hint": "исходный (kaseden) + именительный (su)", "level": 2, "topic": "животные"}, {"ru": "Врач читает книгу в парке", "tr": "Doktor parkta kitap okuyor", "hint": "местный (parkta)", "level": 2, "topic": "город"}, {"ru": "Мама кладёт книгу на стол", "tr": "Anne kitabı masaya koyuyor", "hint": "винительный (kitabı) + дательный (masaya)", "level": 2, "topic": "дом"}, {"ru": "Я вижу машину друга", "tr": "Arkadaşın arabasını görüyorum", "hint": "родительный (arkadaşın) + винительный (arabasını)", "level": 2, "topic": "база"}, {"ru": "Мы идём из парка в школу", "tr": "Parktan okula gidiyoruz", "hint": "исходный (parktan) + дательный (okula)", "level": 2, "topic": "город"}, {"ru": "Я пью чай дома", "tr": "Evde çay içiyorum", "hint": "местный (evde)", "level": 2, "topic": "кафе"}, {"ru": "Дети играют в парке", "tr": "Çocuklar parkta oynuyor", "hint": "местный (parkta)", "level": 2, "topic": "город"}, {"ru": "Я еду из дома в город", "tr": "Evden şehre gidiyorum", "hint": "исходный (evden) + дательный (şehre)", "level": 2, "topic": "город"}, {"ru": "Мама даёт воду кошке", "tr": "Anne kediye su veriyor", "hint": "дательный (kediye)", "level": 2, "topic": "база"}, {"ru": "Я ставлю стул у стола", "tr": "Sandalyeyi masanın yanına koyuyorum", "hint": "винительный (sandalyeyi) + родительный (masanın)", "level": 2, "topic": "дом"}, {"ru": "Друг берёт книгу со стола", "tr": "Arkadaş kitabı masadan alıyor", "hint": "винительный (kitabı) + исходный (masadan)", "level": 2, "topic": "дом"}, {"ru": "Мы едем в город на машине", "tr": "Şehre arabayla gidiyoruz", "hint": "дательный (şehre) + творительный инструм. (arabayla)", "level": 2, "topic": "город"}, {"ru": "Врач выходит из больницы", "tr": "Doktor hastaneden çıkıyor", "hint": "исходный (hastaneden)", "level": 2, "topic": "город"}, {"ru": "Я вижу парк из окна", "tr": "Pencereden parkı görüyorum", "hint": "исходный (pencereden) + винительный (parkı)", "level": 2, "topic": "город"}, {"ru": "Кошка прыгает на стол", "tr": "Kedi masaya atlıyor", "hint": "дательный (masaya)", "level": 2, "topic": "животные"}, {"ru": "Я читаю книгу друга", "tr": "Arkadaşın kitabını okuyorum", "hint": "родительный (arkadaşın) + винительный (kitabını)", "level": 2, "topic": "база"}, {"ru": "Мама идёт к врачу с другом", "tr": "Anne arkadaşıyla doktora gidiyor", "hint": "дательный (doktora) + инструм. (arkadaşıyla)", "level": 2, "topic": "город"}, {"ru": "Я беру воду из холодильника", "tr": "Buzdolabından suyu alıyorum", "hint": "исходный (buzdolabından) + винительный (suyu)", "level": 2, "topic": "база"}, {"ru": "Книга лежит на стуле", "tr": "Kitap sandalyede duruyor", "hint": "местный (sandalyede)", "level": 2, "topic": "дом"}, {"ru": "Дети бегут из парка домой", "tr": "Çocuklar parktan eve koşuyor", "hint": "исходный (parktan) + дательный (eve)", "level": 2, "topic": "город"}, {"ru": "Я даю маме чай", "tr": "Anneye çay veriyorum", "hint": "дательный (anneye)", "level": 2, "topic": "кафе"}, {"ru": "Машина стоит у дома", "tr": "Araba evin önünde duruyor", "hint": "родительный (evin) + притяжательный", "level": 2, "topic": "дом"}, {"ru": "Я покупаю книгу для друга", "tr": "Arkadaşım için kitap alıyorum", "hint": "послелог için + родительный (arkadaşım)", "level": 2, "topic": "база"}, {"ru": "Мы едем из школы в парк", "tr": "Okuldan parka gidiyoruz", "hint": "исходный (okuldan) + дательный (parka)", "level": 2, "topic": "город"}, {"ru": "Мама ставит воду на стол", "tr": "Anne suyu masaya koyuyor", "hint": "винительный (suyu) + дательный (masaya)", "level": 2, "topic": "дом"}, {"ru": "Я вижу кошку на столе", "tr": "Masadaki kediyi görüyorum", "hint": "местный (masadaki) + винительный (kediyi)", "level": 2, "topic": "дом"}, {"ru": "Врач говорит маме о болезни", "tr": "Doktor anneye hastalık hakkında söylüyor", "hint": "дательный (anneye)", "level": 2, "topic": "город"}, {"ru": "Друг едет из парка к маме", "tr": "Arkadaş parktan anneye gidiyor", "hint": "исходный (parktan) + дательный (anneye)", "level": 2, "topic": "город"}, {"ru": "Я несу чай маме", "tr": "Anneye çay götürüyorum", "hint": "дательный (anneye)", "level": 2, "topic": "кафе"}, {"ru": "Кошка выходит из комнаты", "tr": "Kedi odadan çıkıyor", "hint": "исходный (odadan)", "level": 2, "topic": "жильё"}, {"ru": "Я ставлю книгу на стул", "tr": "Kitabı sandalyeye koyuyorum", "hint": "винительный (kitabı) + дательный (sandalyeye)", "level": 2, "topic": "дом"}, {"ru": "Мама читает книгу в комнате", "tr": "Anne odada kitap okuyor", "hint": "местный (odada)", "level": 2, "topic": "жильё"}, {"ru": "Я смотрю на машину друга", "tr": "Arkadaşın arabasına bakıyorum", "hint": "родительный (arkadaşın) + дательный (arabasına)", "level": 2, "topic": "база"}, {"ru": "Врач пьёт чай в парке", "tr": "Doktor parkta çay içiyor", "hint": "местный (parkta)", "level": 2, "topic": "кафе"}, {"ru": "Я еду из города к другу", "tr": "Şehirden arkadaşa gidiyorum", "hint": "исходный (şehirden) + дательный (arkadaşa)", "level": 2, "topic": "город"}, {"ru": "Кошка лежит на книге", "tr": "Kedi kitabın üzerinde yatıyor", "hint": "родительный (kitabın) + притяжательный", "level": 2, "topic": "животные"}, {"ru": "Что это?", "tr": "Bu ne?", "hint": "bu — без падежа (именительный)", "level": 1, "topic": "база"}, {"ru": "Кто это?", "tr": "Bu kim?", "hint": "bu — без падежа (именительный)", "level": 1, "topic": "база"}, {"ru": "Это стол.", "tr": "Bu masa.", "hint": "bu — без падежа", "level": 1, "topic": "дом"}, {"ru": "Это Али.", "tr": "Bu Ali.", "hint": "bu — без падежа", "level": 1, "topic": "база"}, {"ru": "Мама — адвокат?", "tr": "Anne avukat mı?", "hint": "вопрос с mı/mi", "level": 1, "topic": "база"}, {"ru": "Да, мама — адвокат.", "tr": "Evet, anne avukat.", "hint": "утвердительный ответ", "level": 1, "topic": "база"}, {"ru": "Нет, не адвокат.", "tr": "Hayır, değil.", "hint": "отрицательный ответ (değil)", "level": 1, "topic": "база"}, {"ru": "Можно взять это?", "tr": "Bunu alabilir miyim?", "hint": "bunu — вин. от bu; al+a+bil+ir+mi+y+im", "level": 1, "topic": "база"}, {"ru": "Можно посмотреть это?", "tr": "Buna bakabilir miyim?", "hint": "buna — дат. от bu; bak+a+bil+ir+mi+y+im", "level": 1, "topic": "база"}, {"ru": "Можно взять этот товар?", "tr": "Bu ürünü alabilir miyim?", "hint": "bu ürünü — вин. к ürün (есть сущ., bu без падежа)", "level": 1, "topic": "база"}, {"ru": "Можно взять это лекарство?", "tr": "Bu ilacı alabilir miyim?", "hint": "bu ilacı — вин. к ilaç (ilaç→ilac+ı)", "level": 1, "topic": "магазин"}, {"ru": "Можно посмотреть этот товар?", "tr": "Bu ürüne bakabilir miyim?", "hint": "bu ürüne — дат. к ürün", "level": 1, "topic": "база"}, {"ru": "Вчера я видел Ахмета.", "tr": "Dün Ahmet'i gördüm.", "hint": "винительный конкретного имени (Ahmet+i)", "level": 1, "topic": "база"}, {"ru": "Я очень люблю Стамбул.", "tr": "İstanbul'u çok seviyorum.", "hint": "винительный города (İstanbul+u)", "level": 1, "topic": "база"}, {"ru": "Я хочу эту книгу.", "tr": "Bu kitabı istiyorum.", "hint": "bu kitabı — вин. к kitap; bu без суф. (есть сущ.)", "level": 1, "topic": "база"}, {"ru": "Я знаю этого человека.", "tr": "Bu adamı tanıyorum.", "hint": "bu adamı — вин. к adam", "level": 1, "topic": "база"}, {"ru": "Он читает книгу (какую-то).", "tr": "O bir kitap okuyor.", "hint": "bir = неопределённый артикль; без вин. суффикса", "level": 1, "topic": "база"}, {"ru": "Я вижу тебя.", "tr": "Seni görüyorum.", "hint": "вин. от sen (ты)", "level": 1, "topic": "база"}, {"ru": "Я жду папу.", "tr": "Babanı bekliyorum.", "hint": "вин. с притяж. суффиксом -nı (твой папа)", "level": 2, "topic": "база"}, {"ru": "Я видел своих друзей.", "tr": "Arkadaşlarını gördüm.", "hint": "вин. мн.ч. с притяж. суффиксом -nı", "level": 2, "topic": "база"}, {"ru": "Мне дай воды.", "tr": "Bana su ver.", "hint": "bana — дат. от ben (я)", "level": 1, "topic": "база"}, {"ru": "Дай ему.", "tr": "Ona ver.", "hint": "ona — дат. от o (он/она/оно)", "level": 1, "topic": "база"}, {"ru": "Мы идём к ним.", "tr": "Onlara gidiyoruz.", "hint": "onlara — дат. от onlar (они)", "level": 1, "topic": "база"}];

let sentState = {
  current: null,
  phase: 'q',
  levelFilter: 0, // 0=all, 1=simple, 2=medium
  session: { total: 0, right: 0 }
};

function getSentTopics() {
  const ts = new Set();
  SENTENCES.forEach(s => ts.add(s.topic || 'база'));
  return Array.from(ts);
}

function renderSentTopicFilter() {
  const wrap = $('sent-topic-filter');
  if (!wrap) return;
  const topics = ['все', ...getSentTopics()];
  wrap.innerHTML = topics.map(t => {
    const active = (t === 'все' && !sentState.topicFilter) || sentState.topicFilter === t;
    return `<button class="cat-btn ${active ? 'active' : ''}" data-topic="${t}">${t}</button>`;
  }).join('');
  wrap.querySelectorAll('.cat-btn').forEach(b => {
    b.addEventListener('click', () => {
      const t = b.dataset.topic;
      sentState.topicFilter = t === 'все' ? null : t;
      sentState.current = pickSentence();
      sentState.phase = 'q';
      renderSentences();
    });
  });
}

function pickSentence() {
  let pool = SENTENCES;
  if (sentState.levelFilter) pool = pool.filter(s => s.level === sentState.levelFilter);
  if (sentState.topicFilter) pool = pool.filter(s => (s.topic || 'база') === sentState.topicFilter);
  if (!pool.length) return null;
  let s, tries = 0;
  do { s = pool[Math.floor(Math.random() * pool.length)]; tries++; }
  while (tries < 15 && sentState.current && s.ru === sentState.current.ru);
  return s;
}

function normalizeTr(s) {
  return s.trim().toLowerCase()
    .replace(/[.,!?;:]+/g, '')
    .replace(/\s+/g, ' ');
}


// ─── PRONOUN DETECTION ────────────────────────────────────────────────────────
function detectPronoun(tr) {
  const t = tr.toLowerCase();
  // Explicit pronoun in text
  if (/\bben\b/.test(t))   return 'ben (я)';
  if (/\bsen\b/.test(t))   return 'sen (ты)';
  if (/\bbiz\b/.test(t))   return 'biz (мы)';
  if (/\bsiz\b/.test(t))   return 'siz (вы)';
  if (/\bonlar\b/.test(t)) return 'onlar (они)';
  // Personal verb endings (present continuous -yor, aorist, future etc.)
  if (/(?:yor|[aeıiuü]r|[aeıiuü]c[aeıiuü][kğ])um\b/.test(t)) return 'ben (я)';
  if (/(?:yor|[aeıiuü]r|[aeıiuü]c[aeıiuü][kğ])sun\b/.test(t)) return 'sen (ты)';
  if (/(?:yor|[aeıiuü]r|[aeıiuü]c[aeıiuü][kğ])uz\b/.test(t)) return 'biz (мы)';
  if (/(?:yor|[aeıiuü]r|[aeıiuü]c[aeıiuü][kğ])sunuz\b/.test(t)) return 'siz (вы)';
  if (/(?:yor|[aeıiuü]r|[aeıiuü]c[aeıiuü][kğ])lar\b/.test(t)) return 'onlar (они)';
  // -iyorum, -ıyorsun etc.
  if (/[iıuü]yorum\b/.test(t)) return 'ben (я)';
  if (/[iıuü]yorsun\b/.test(t)) return 'sen (ты)';
  if (/[iıuü]yoruz\b/.test(t)) return 'biz (мы)';
  if (/[iıuü]yorsunuz\b/.test(t)) return 'siz (вы)';
  if (/[iıuü]yorlar\b/.test(t)) return 'onlar (они)';
  // -dim/-din (past)
  if (/d[iıuü]m\b/.test(t)) return 'ben (я)';
  if (/d[iıuü]n\b/.test(t)) return 'sen (ты)';
  if (/d[iıuü]k\b/.test(t)) return 'biz (мы)';
  if (/d[iıuü]n[iıuü]z\b/.test(t)) return 'siz (вы)';
  // miyim / misin / miyiz / misiniz
  if (/m[iıuü]y[iıuü]m\b/.test(t)) return 'ben (я)';
  if (/m[iıuü]s[iıuü]n\b/.test(t) && !/m[iıuü]s[iıuü]n[iıuü]z\b/.test(t)) return 'sen (ты)';
  if (/m[iıuü]y[iıuü]z\b/.test(t)) return 'biz (мы)';
  if (/m[iıuü]s[iıuü]n[iıuü]z\b/.test(t)) return 'siz (вы)';
  // istiyorum etc.
  if (/[iı]stiyorum\b/.test(t)) return 'ben (я)';
  if (/[iı]stiyorsun\b/.test(t)) return 'sen (ты)';
  if (/[iı]stiyoruz\b/.test(t)) return 'biz (мы)';
  // -bilir miyim
  if (/bil[iı]r m[iıuü]y[iıuü]m\b/.test(t)) return 'ben (я)';
  if (/bil[iı]r m[iıuü]s[iıuü]n[iıuü]z\b/.test(t)) return 'siz (вы)';
  // 3rd person (no ending) after -yor / -ıyor
  if (/[iıuü]yor\b/.test(t)) return 'o (он/она)';
  // Explicit o (he/she) — only if standalone word
  if (/\bo\b/.test(t) && t.split(' ').length <= 5) return 'o (он/она)';
  return null;
}


function toggleRevealBlock(blockId, btnId, showText, hideText) {
  const block = $(blockId);
  const btn = $(btnId);
  if (!block || !btn) return;
  const hidden = block.style.display === 'none' || block.style.display === '';
  block.style.display = hidden ? '' : 'none';
  btn.textContent = hidden ? hideText : showText;
}

function renderSentences() {
  if (!sentState.current) sentState.current = pickSentence();
  const s = sentState.current;
  renderSentTopicFilter();
  if (!s) return;

  $('sent-ru').textContent = s.ru;
  if ($('sent-ru-answer')) $('sent-ru-answer').textContent = s.ru;
  if ($('sent-tr-text')) $('sent-tr-text').innerHTML = '<span class="sent-affix">' + highlightSentenceAffixes(s.tr) + '</span>'; 
  if ($('sent-tr-wrap')) $('sent-tr-wrap').style.display = 'none';
  if ($('btn-sent-show-tr-q')) $('btn-sent-show-tr-q').textContent = '🇹🇷 Показать по-турецки';

  $('sent-hint').innerHTML = '<b class="sent-affix" style="font-size:15px">' + highlightSentenceAffixes(s.tr) + '</b><span style="display:block;margin-top:4px;font-size:12px;opacity:.75">' + s.hint + '</span>'; 
  $('sent-hint').style.display = 'none';
  $('btn-sent-hint').style.display = '';

  const sentPron = detectPronoun(s.tr);
  const sentPronEl = $('sent-pronoun');
  const sentPronBtn = $('btn-sent-pronoun');
  if (sentPronEl && sentPronBtn) {
    if (sentPron) {
      sentPronBtn.style.display = '';
      sentPronEl.textContent = sentPron;
      sentPronEl.style.display = 'none';
    } else {
      sentPronBtn.style.display = 'none';
      sentPronEl.style.display = 'none';
    }
  }

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

  $('sent-res-correct').innerHTML = '<b class="sent-affix">' + highlightSentenceAffixes(s.tr) + '</b>';
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
  if ($('btn-sent-pronoun')) {
    $('btn-sent-pronoun').addEventListener('click', () => {
      $('sent-pronoun').style.display = '';
      $('btn-sent-pronoun').style.display = 'none';
    });
  }
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
  {topic:'отель', q_ru:'Есть свободный номер?', q_tr:'Bo\u015f odan\u0131z var m\u0131?', a_ru:'Да, у нас есть свободный номер', a_tr:'Evet, bo\u015f odam\u0131z var', hint:'боş = свободный, oda = номер'},
  {topic:'отель', q_ru:'На сколько человек?', q_tr:'Ka\u00e7 ki\u015fi i\u00e7in?', a_ru:'Для двоих', a_tr:'\u0130ki ki\u015fi i\u00e7in', hint:'ka\u00e7 = сколько, ki\u015fi = человек'},
  {topic:'отель', q_ru:'Паспорт можно?', q_tr:'Pasaportunuzu alabilir miyim?', a_ru:'Конечно, пожалуйста', a_tr:'Tabii, buyurun', hint:'pasaport = паспорт, alabilir miyim = могу взять?'},
  {topic:'отель', q_ru:'Бронирование есть?', q_tr:'Rezervasyonunuz var m\u0131?', a_ru:'Да, у меня есть бронь', a_tr:'Evet, rezervasyonum var', hint:'rezervasyon = бронирование'},
  {topic:'отель', q_ru:'Кахвалты включен?', q_tr:'Kahvalt\u0131 dahil mi?', a_ru:'Да, завтрак включён', a_tr:'Evet, kahvalt\u0131 dahil', hint:'kahvalt\u0131 = завтрак, dahil = включено'},
  {topic:'отель', q_ru:'Сколько стоит номер?', q_tr:'Oda fiyat\u0131 ne kadar?', a_ru:'Три тысячи лир за ночь', a_tr:'Bir gecelik \u00fc\u00e7 bin lira', hint:'fiyat = цена, ne kadar = сколько'},
  {topic:'отель', q_ru:'Всё оплачено?', q_tr:'Her \u015feyi \u00f6dediniz mi?', a_ru:'Да, я всё оплатил', a_tr:'Evet, her \u015feyi \u00f6dedim', hint:'\u00f6demek = оплатить, her \u015fey = всё'},

  // Кафе / Ресторан
  {topic:'кафе', q_ru:'Могу я заказать?', q_tr:'Sipari\u015f edebilir miyim?', a_ru:'Конечно, пожалуйста', a_tr:'Tabii, buyurun', hint:'sipari\u015f = заказ'},
  {topic:'кафе', q_ru:'Могу попробовать?', q_tr:'Tadabilir miyim?', a_ru:'Конечно, пожалуйста', a_tr:'Tabii, buyurun', hint:'tatmak = пробовать'},
  {topic:'кафе', q_ru:'Можете принести?', q_tr:'Getirebilir misiniz?', a_ru:'Конечно, сейчас принесу', a_tr:'Tabii, hemen getiriyorum', hint:'getirmek = принести'},
  {topic:'кафе', q_ru:'Можете дать?', q_tr:'Verebilir misiniz?', a_ru:'Конечно, пожалуйста', a_tr:'Tabii, buyurun', hint:'vermek = дать'},
  {topic:'кафе', q_ru:'Могу сесть за этот стол?', q_tr:'Bu masaya oturabilir miyim?', a_ru:'Конечно, можете сесть', a_tr:'Tabii, oturabilirsiniz', hint:'masa = стол, oturmak = сидеть, -ya дательный'},
  {topic:'кафе', q_ru:'Что будете пить?', q_tr:'Ne i\u00e7eceksiniz?', a_ru:'Один чай, пожалуйста', a_tr:'Bir \u00e7ay l\u00fctfen', hint:'и\u00e7mek = пить, ne = что'},
  {topic:'кафе', q_ru:'Что порекомендуете?', q_tr:'Ne tavsiye edersiniz?', a_ru:'Сегодняшнее фирменное блюдо очень хорошее', a_tr:'Bug\u00fcn\u00fcn \u00f6zel yeme\u011fi \u00e7ok g\u00fczel', hint:'tavsiye = рекомендация'},
  {topic:'кафе', q_ru:'Счёт, пожалуйста', q_tr:'Hesap l\u00fctfen', a_ru:'Конечно, сейчас принесу', a_tr:'Tabii, hemen getiriyorum', hint:'hesap = счёт'},
  {topic:'кафе', q_ru:'Сколько это стоит?', q_tr:'Bunun fiyat\u0131 ne kadar?', a_ru:'Сто пятьдесят лир', a_tr:'Y\u00fcz elli lira', hint:'bunun = этого (род.), fiyat = цена'},
  {topic:'кафе', q_ru:'Хочу зелёный чай', q_tr:'Ye\u015fil \u00e7ay istiyorum', a_ru:'Конечно, сейчас принесу', a_tr:'Tabii, hemen getiriyorum', hint:'ye\u015fil = зелёный, \u00e7ay = чай'},

  // Аптека / Магазин
  {topic:'магазин', q_ru:'У вас есть такая вещь?', q_tr:'Sizde b\u00f6yle \u015fey var m\u0131?', a_ru:'Да, есть', a_tr:'Evet, var', hint:'sizde = у вас (местный), b\u00f6yle = такой'},
  {topic:'магазин', q_ru:'Сколько стоит лекарство?', q_tr:'Bu ila\u00e7\u0131n fiyat\u0131 ne kadar?', a_ru:'Сто лир', a_tr:'Y\u00fcz lira', hint:'ila\u00e7 = лекарство, fiyat = цена (родительный)'},
  {topic:'магазин', q_ru:'Могу купить это?', q_tr:'Bunu alabilir miyim?', a_ru:'Конечно, можете купить', a_tr:'Tabii, alabilirsiniz', hint:'bunu = это (вин.), almak = купить'},
  {topic:'магазин', q_ru:'Могу оплатить?', q_tr:'\u00d6deyebilir miyim?', a_ru:'Конечно', a_tr:'Tabii', hint:'\u00f6demek = оплатить'},
  {topic:'магазин', q_ru:'Картой можно?', q_tr:'Kartla \u00f6deyebilir miyim?', a_ru:'Да, можно оплатить картой', a_tr:'Evet, kartla \u00f6deyebilirsiniz', hint:'kartla = картой'},
  {topic:'магазин', q_ru:'Наличными можно?', q_tr:'Nakit \u00f6deyebilir miyim?', a_ru:'Да, наличными тоже можно', a_tr:'Evet, nakit de olur', hint:'nakit = наличными'},
  {topic:'магазин', q_ru:'Скидка есть?', q_tr:'\u0130ndirim var m\u0131?', a_ru:'Да, есть скидка двадцать процентов', a_tr:'Evet, y\u00fczde yirmi indirim var', hint:'indirim = скидка'},
  {topic:'магазин', q_ru:'Я хочу купить такую вещь', q_tr:'Ben b\u00f6yle \u015feyi almak istiyorum', a_ru:'Пожалуйста, какой цвет хотите?', a_tr:'Buyurun, hangi renk istersiniz?', hint:'\u015feyi = вещь (вин.), almak = купить'},
  {topic:'магазин', q_ru:'Пакет нужен?', q_tr:'Po\u015fet ister misiniz?', a_ru:'Да, один пакет, пожалуйста', a_tr:'Evet, bir po\u015fet l\u00fctfen', hint:'po\u015fet = пакет'},
  {topic:'магазин', q_ru:'Чек нужен?', q_tr:'Fi\u015f ister misiniz?', a_ru:'Да, чек, пожалуйста', a_tr:'Evet, fi\u015f l\u00fctfen', hint:'fi\u015f = чек'},

  // Аренда
  {topic:'аренда', q_ru:'Хотите арендовать квартиру?', q_tr:'Daire kiralamak istiyor musunuz?', a_ru:'Да, я хочу арендовать квартиру', a_tr:'Evet, daire kiralamak istiyorum', hint:'daire = квартира, kiralamak = арендовать'},
  {topic:'аренда', q_ru:'Эту квартиру могу арендовать?', q_tr:'Bu daireyi kiralayabilir miyim?', a_ru:'Да, можете арендовать', a_tr:'Evet, kiralayabilirsiniz', hint:'daireyi = квартиру (вин.)'},
  {topic:'аренда', q_ru:'За 15 тыс. лир могу арендовать?', q_tr:'On be\u015f bin liraya kiralayabilir miyim?', a_ru:'Да, можете арендовать', a_tr:'Evet, kiralayabilirsiniz', hint:'liraya = дат. (за ... лир)'},
  {topic:'аренда', q_ru:'Договор составим?', q_tr:'Kira s\u00f6zle\u015fmesi yapabilir miyiz?', a_ru:'Да, можем составить', a_tr:'Tabii, yapabiliriz', hint:'s\u00f6zle\u015fme = договор, yapmak = делать'},
  {topic:'аренда', q_ru:'Квартира в центре?', q_tr:'Daire merkezde mi?', a_ru:'Да, в центре', a_tr:'Evet, merkezde', hint:'merkez = центр, -de = местный'},
  {topic:'аренда', q_ru:'Квартира с мебелью?', q_tr:'Daire e\u015fyal\u0131 m\u0131?', a_ru:'Да, с мебелью', a_tr:'Evet, e\u015fyal\u0131', hint:'e\u015fyal\u0131 = с мебелью'},
  {topic:'аренда', q_ru:'Сколько комнат?', q_tr:'Ka\u00e7 oda?', a_ru:'Три комнаты и салон', a_tr:'\u00dc\u00e7 oda bir salon', hint:'oda = комната, salon = гостиная'},

  // Приветствие / Общее
  {topic:'общее', q_ru:'Как дела?', q_tr:'Nas\u0131ls\u0131n\u0131z?', a_ru:'У меня всё хорошо, спасибо', a_tr:'\u0130yiyim, te\u015fekk\u00fcr ederim', hint:'nas\u0131l = как'},
  {topic:'общее', q_ru:'Откуда вы?', q_tr:'Nerelisiniz?', a_ru:'Я из России', a_tr:'Rusyal\u0131y\u0131m', hint:'nereli = откуда'},
  {topic:'общее', q_ru:'Говорите по-русски?', q_tr:'Rus\u00e7a biliyor musunuz?', a_ru:'Нет, я учу турецкий', a_tr:'Hay\u0131r, T\u00fcrk\u00e7e \u00f6\u011freniyorum', hint:'Rus\u00e7a = по-русски, bilmek = знать'},
  {topic:'общее', q_ru:'Помогите, пожалуйста', q_tr:'Yard\u0131m edebilir misiniz?', a_ru:'Конечно, чем я могу помочь?', a_tr:'Tabii, nas\u0131l yard\u0131m edebilirim?', hint:'yard\u0131m = помощь'},
  {topic:'общее', q_ru:'Где туалет?', q_tr:'Tuvalet nerede?', a_ru:'Если идти прямо, он слева', a_tr:'D\u00fczg\u00fcn gidince solda', hint:'nerede = где'},
  {topic:'общее', q_ru:'Это сколько стоит?', q_tr:'Bu ne kadar?', a_ru:'Пятьдесят лир', a_tr:'Elli lira', hint:'ne kadar = сколько'},
// ═══ ИЗ ФАЙЛА 7: Это дорого (базовые вопросы) ═══
  {topic:'покупки', q_ru:'Это дорого?', q_tr:'Bu pahalı mı?', a_ru:'Нет, это не дорого', a_tr:'Hayır, bu pahalı değil.', hint:'pahalı = дорогой, değil = не'},
  {topic:'покупки', q_ru:'Это дёшево?', q_tr:'Bu ucuz mu?', a_ru:'Нет, это не дёшево', a_tr:'Hayır, bu ucuz değil.', hint:'ucuz = дешёвый'},
  {topic:'покупки', q_ru:'Что это?', q_tr:'Bu ne?', a_ru:'Это фрукты', a_tr:'Bu meyveler.', hint:'meyveler = фрукты'},
  {topic:'покупки', q_ru:'Они дорогие?', q_tr:'Onlar pahalı mı?', a_ru:'Нет, они не дорогие', a_tr:'Hayır, onlar pahalı değil.', hint:'onlar = они'},
  {topic:'покупки', q_ru:'Это твой товар?', q_tr:'Bu senin malın mı?', a_ru:'Нет, это не мой товар', a_tr:'Hayır, bu benim malım değil.', hint:'mal = товар, senin = твой'},
  {topic:'покупки', q_ru:'Это его товар?', q_tr:'Bu onun malı mı?', a_ru:'Нет, это не его товар', a_tr:'Hayır, bu onun malı değil.', hint:'onun = его/её'},
  {topic:'покупки', q_ru:'Это ваша машина?', q_tr:'Bu sizin arabanız mı?', a_ru:'Нет, это не наша машина', a_tr:'Hayır, bu bizim arabamız değil.', hint:'sizin = ваш, bizim = наш'},
  {topic:'покупки', q_ru:'У вас есть машина?', q_tr:'Sizin arabanız var mı?', a_ru:'Нет, у нас нет машины', a_tr:'Hayır, bizim arabamız yok.', hint:'var = есть, yok = нет'},
  {topic:'покупки', q_ru:'У него есть машина?', q_tr:'Onun arabası var mı?', a_ru:'Да, это его машина', a_tr:'Evet, bu onun arabası.', hint:'onun arabası = его машина'},
  {topic:'покупки', q_ru:'Его машина дорогая?', q_tr:'Onun arabası pahalı mı?', a_ru:'Нет, его машина дешёвая', a_tr:'Hayır, onun arabası ucuz.', hint:'pahalı = дорогая'},
  {topic:'покупки', q_ru:'У тебя есть квартира?', q_tr:'Senin dairen var mı?', a_ru:'Нет, у меня съёмная квартира', a_tr:'Hayır, benim kiralık dairem var.', hint:'kiralık = съёмная'},
  {topic:'покупки', q_ru:'У тебя есть работа?', q_tr:'Senin işin var mı?', a_ru:'Нет, у меня нет работы, но есть образование', a_tr:'Benim işim yok.', hint:'iş = работа, yok = нет'},
  {topic:'покупки', q_ru:'Это ваши документы?', q_tr:'Bu sizin evraklarınız mı?', a_ru:'У нас нет документов', a_tr:'Bizim evraklarımız yok.', hint:'evraklar = документы'},
  {topic:'покупки', q_ru:'Кто ваш муж?', q_tr:'Sizin kocanız kim?', a_ru:'Мой муж Антон', a_tr:'Benim kocam Anton.', hint:'koca = муж, kim = кто'},
  {topic:'покупки', q_ru:'Лена ваша жена?', q_tr:'Lena sizin karınız mı?', a_ru:'Нет, это моя сестра', a_tr:'O benim kız kardeşim.', hint:'kız kardeş = сестра'},

  // ═══ ИЗ ФАЙЛА 9: Добро пожаловать (кафе) ═══
  {topic:'кафе', q_ru:'Добро пожаловать', q_tr:'Hoş geldiniz', a_ru:'Спасибо, очень приятно', a_tr:'Hoş bulduk', hint:'стандартное приветствие в Турции'},
  {topic:'кафе', q_ru:'Вам нужен свободный столик?', q_tr:'Sizde boş masa lazım mı?', a_ru:'Да, нам нужен свободный столик', a_tr:'Evet, bize boş masa lazım.', hint:'boş = свободный, masa = стол'},
  {topic:'кафе', q_ru:'Насколько человек нужен столик?', q_tr:'Kaç kişilik boş masa lazım?', a_ru:'Нам нужен столик на троих', a_tr:'Bize üç kişilik boş masa lazım.', hint:'kaç kişilik = на сколько человек'},
  {topic:'кафе', q_ru:'Этот столик свободный?', q_tr:'Bu masa boş mu?', a_ru:'Нет, этот столик не свободен', a_tr:'Hayır, bu masa boş değil.', hint:'boş = свободный'},
  {topic:'кафе', q_ru:'У вас есть меню?', q_tr:'Sizde menü var mı?', a_ru:'Да, одну минуту', a_tr:'Evet, bir dakika.', hint:'bir dakika = одну минуту'},
  {topic:'кафе', q_ru:'Можете дать нам меню?', q_tr:'Bize menü verebilir misiniz?', a_ru:'Конечно, пожалуйста', a_tr:'Tabii, buyurun.', hint:'verebilir misiniz = можете дать'},
  {topic:'кафе', q_ru:'Можете дать меню моей супруге?', q_tr:'Eşime menü verebilir misiniz?', a_ru:'Конечно', a_tr:'Tabii efendim.', hint:'eşim = моя супруга/супруг'},
  {topic:'кафе', q_ru:'У вас есть завтрак?', q_tr:'Sizde kahvaltı var mı?', a_ru:'Да, завтрак есть', a_tr:'Evet, kahvaltı var.', hint:'kahvaltı = завтрак'},
  {topic:'кафе', q_ru:'Сколько у вас стоит завтрак?', q_tr:'Sizde kahvaltı ne kadar?', a_ru:'Сто пятьдесят лир', a_tr:'Yüz elli lira.', hint:'ne kadar = сколько стоит'},
  {topic:'кафе', q_ru:'Вам нужен завтрак?', q_tr:'Size kahvaltı lazım mı?', a_ru:'Да, я хочу завтрак', a_tr:'Evet, kahvaltı istiyorum.', hint:'lazım = нужен'},
  {topic:'кафе', q_ru:'Могу ли я сесть за этот столик?', q_tr:'Bu masaya oturabilir miyim?', a_ru:'Да, пожалуйста', a_tr:'Evet, buyurun.', hint:'oturabilir miyim = могу я сесть'},
  {topic:'кафе', q_ru:'Я хочу заказать это блюдо.', q_tr:'Bu yemeği sipariş etmek istiyorum.', a_ru:'Конечно', a_tr:'Tabii efendim.', hint:'sipariş etmek = заказать, yemek = блюдо'},
  {topic:'кафе', q_ru:'Я хочу попробовать этот салат.', q_tr:'Bu salatayı tatmak istiyorum.', a_ru:'Пожалуйста', a_tr:'Buyurun.', hint:'tatmak = попробовать, salata = салат'},
  {topic:'кафе', q_ru:'Мне нравится это блюдо.', q_tr:'Bu yemeği beğeniyorum.', a_ru:'Я очень доволен', a_tr:'Çok memnun oldum.', hint:'beğenmek = нравиться, оценивать'},
  {topic:'кафе', q_ru:'Мне нужно попробовать это.', q_tr:'Bunu tatmam lazım.', a_ru:'Конечно', a_tr:'Tabii.', hint:'tatmam lazım = мне нужно попробовать'},

  // ═══ ИЗ ФАЙЛА 10: Добро пожаловать (магазин) ═══
  {topic:'магазин', q_ru:'У вас есть такая вещь?', q_tr:'Sizde böyle bir şey var mı?', a_ru:'Да, есть', a_tr:'Evet, var.', hint:'böyle bir şey = такая вещь'},
  {topic:'магазин', q_ru:'Сколько стоит такая вещь?', q_tr:'Böyle bir şey sizde ne kadar?', a_ru:'Сто лир', a_tr:'Yüz lira.', hint:'ne kadar = сколько стоит'},
  {topic:'магазин', q_ru:'Как называется такая вещь?', q_tr:'Sizde böyle bir şeyin adı ne?', a_ru:'Я не знаю', a_tr:'Bilmiyorum.', hint:'adı ne = как называется'},
  {topic:'магазин', q_ru:'Вам нужна такая вещь?', q_tr:'Size böyle bir şey lazım mı?', a_ru:'Да, нужна', a_tr:'Evet, lazım.', hint:'lazım = нужен/нужна'},
  {topic:'магазин', q_ru:'Нам такая вещь не нужна.', q_tr:'Bize böyle bir şey lazım değil.', a_ru:'Понял', a_tr:'Anladım.', hint:'lazım değil = не нужна'},
  {topic:'магазин', q_ru:'Я хочу такую вещь.', q_tr:'Ben böyle bir şey istiyorum.', a_ru:'Пожалуйста', a_tr:'Buyurun.', hint:'istiyorum = хочу'},
  {topic:'магазин', q_ru:'У вас есть такое лекарство?', q_tr:'Sizde böyle bir ilaç var mı?', a_ru:'Да, есть', a_tr:'Evet, var.', hint:'ilaç = лекарство'},
  {topic:'магазин', q_ru:'Сколько стоит такое лекарство?', q_tr:'Böyle bir ilaç sizde ne kadar?', a_ru:'Двести лир', a_tr:'İki yüz lira.', hint:'ne kadar = сколько'},
  {topic:'магазин', q_ru:'Вам нужно такое лекарство?', q_tr:'Size böyle bir ilaç lazım mı?', a_ru:'Да, нужно', a_tr:'Evet, lazım.', hint:'lazım = нужно'},

  // ═══ ИЗ ФАЙЛА 14: türkçe böyle bir şey (тур. → рус.) ═══
  {topic:'магазин', q_ru:'Hoş geldiniz.', q_tr:'Добро пожаловать.', a_ru:'Добро пожаловать', a_tr:'Hoş bulduk.', hint:'ответ на приветствие'},
  {topic:'магазин', q_ru:'Türkçeyi kötü biliyorum, ama biraz konuşabilirim.', q_tr:'Я плохо знаю турецкий, но могу немного говорить.', a_ru:'Я понимаю', a_tr:'Anlıyorum.', hint:'kötü biliyorum = плохо знаю'},
  {topic:'магазин', q_ru:'Yavaş konuşabilir misiniz?', q_tr:'Вы можете говорить медленно?', a_ru:'Конечно', a_tr:'Tabii efendim.', hint:'yavaş = медленно'},
  {topic:'магазин', q_ru:'Soru sorabilir miyim?', q_tr:'Могу я задать вопрос?', a_ru:'Конечно', a_tr:'Tabii.', hint:'soru sormak = задавать вопрос'},
  {topic:'магазин', q_ru:'Ben sizi anlamıyorum.', q_tr:'Я вас не понимаю.', a_ru:'Извините', a_tr:'Özür dilerim.', hint:'anlamıyorum = не понимаю'},
  {topic:'магазин', q_ru:'Sizde böyle bir şey var mı?', q_tr:'У вас есть такая вещь?', a_ru:'Да, есть', a_tr:'Evet, var.', hint:'böyle bir şey = такая вещь'},
  {topic:'магазин', q_ru:'Sizde böyle bir şeyin fiyatı ne kadar?', q_tr:'Сколько у вас стоит такая вещь?', a_ru:'Сто лир', a_tr:'Yüz lira.', hint:'fiyat = цена'},
  {topic:'магазин', q_ru:'Ben böyle bir şey istiyorum.', q_tr:'Я хочу такую вещь.', a_ru:'Пожалуйста', a_tr:'Buyurun.', hint:'istiyorum = хочу'},
  {topic:'магазин', q_ru:'Sizde böyle bir ilaç var mı?', q_tr:'У вас есть такое лекарство?', a_ru:'Да, есть', a_tr:'Evet, var.', hint:'ilaç = лекарство'},
  {topic:'магазин', q_ru:'Ben böyle bir ilaç istiyorum.', q_tr:'Я хочу такое лекарство.', a_ru:'Пожалуйста', a_tr:'Buyurun.', hint:'ilaç = лекарство'},

  // ═══ ИЗ ФАЙЛА 15: купить/оплатить ═══
  {topic:'покупки', q_ru:'Я хочу купить эту.', q_tr:'Bunu satın almak istiyorum.', a_ru:'Пожалуйста', a_tr:'Buyurun efendim.', hint:'satın almak = купить, bunu = это (вин.)'},
  {topic:'покупки', q_ru:'Мне нужно купить эту.', q_tr:'Bunu almam lazım.', a_ru:'Конечно', a_tr:'Tabii.', hint:'almam lazım = мне нужно купить'},
  {topic:'покупки', q_ru:'Я хочу купить эту вещь тебе.', q_tr:'Bu şeyi sana satın almak istiyorum.', a_ru:'Спасибо', a_tr:'Teşekkür ederim.', hint:'sana = тебе (дат.)'},
  {topic:'покупки', q_ru:'Я хочу купить одежду.', q_tr:'Kıyafet satın almak istiyorum.', a_ru:'Пожалуйста', a_tr:'Buyurun.', hint:'kıyafet = одежда'},
  {topic:'покупки', q_ru:'Мне нужно купить эту одежду ей.', q_tr:'Bu kıyafeti ona almam lazım.', a_ru:'Понял', a_tr:'Anladım.', hint:'ona = ей (дат.), bu kıyafeti = эту одежду (вин.)'},
  {topic:'покупки', q_ru:'Я хочу оплатить это.', q_tr:'Bunu ödemek istiyorum.', a_ru:'Наличными или картой?', a_tr:'Nakit mi kart mı?', hint:'ödemek = платить'},
  {topic:'покупки', q_ru:'Мне нужно это оплатить.', q_tr:'Bunu ödemem gerekiyor.', a_ru:'Пожалуйста', a_tr:'Buyurun.', hint:'ödemem gerekiyor = мне нужно оплатить'},

  // ═══ ИЗ ФАЙЛА 16: alabilir miyim / bakabilir miyim ═══
  {topic:'покупки', q_ru:'Могу я это купить?', q_tr:'Bunu alabilir miyim?', a_ru:'Да, пожалуйста', a_tr:'Evet, buyurun.', hint:'alabilir miyim = могу ли я взять/купить'},
  {topic:'покупки', q_ru:'Могу купить эту вещь?', q_tr:'Bu şeyi alabilir miyim?', a_ru:'Конечно', a_tr:'Tabii.', hint:'bu şeyi = эту вещь (вин.)'},
  {topic:'покупки', q_ru:'Могу взять чек?', q_tr:'Fişi alabilir miyim?', a_ru:'Да, пожалуйста', a_tr:'Evet, buyurun.', hint:'fiş = чек'},
  {topic:'покупки', q_ru:'Могу взять сдачу?', q_tr:'Üstünü alabilir miyim?', a_ru:'Конечно', a_tr:'Tabii.', hint:'üstü = сдача'},
  {topic:'покупки', q_ru:'За сколько я могу это купить?', q_tr:'Bunu kaça alabilirim?', a_ru:'За сто пятьдесят лир', a_tr:'Yüz elli liraya.', hint:'kaça = за сколько'},
  {topic:'покупки', q_ru:'Могу я купить это со скидкой?', q_tr:'Bunu indirimli alabilir miyim?', a_ru:'Нет, скидки нет', a_tr:'Hayır, indirim yok.', hint:'indirim = скидка'},
  {topic:'покупки', q_ru:'Могу я это оплатить?', q_tr:'Bunu ödeyebilir miyim?', a_ru:'Да, пожалуйста', a_tr:'Evet, buyurun.', hint:'ödeyebilir miyim = могу ли я оплатить'},
  {topic:'покупки', q_ru:'Могу я оплатить наличными?', q_tr:'Bunu nakit ödeyebilir miyim?', a_ru:'Да, наличными можно', a_tr:'Evet, nakit olur.', hint:'nakit = наличные'},
  {topic:'покупки', q_ru:'Могу я оплатить картой?', q_tr:'Bunu kartla ödeyebilir miyim?', a_ru:'Да, карта проходит', a_tr:'Evet, kart geçiyor.', hint:'kart = карта'},
  {topic:'покупки', q_ru:'Могу я посмотреть на это?', q_tr:'Buna bakabilir miyim?', a_ru:'Конечно, пожалуйста', a_tr:'Tabii, buyurun.', hint:'buna = на это (дат.), bakabilir miyim = могу посмотреть'},
  {topic:'покупки', q_ru:'Могу я посмотреть на эту вещь?', q_tr:'Bu şeye bakabilir miyim?', a_ru:'Да, пожалуйста', a_tr:'Evet, buyurun.', hint:'bu şeye = на эту вещь (дат.)'},
  {topic:'покупки', q_ru:'Могу я посмотреть чек?', q_tr:'Fişe bakabilir miyim?', a_ru:'Пожалуйста', a_tr:'Buyurun.', hint:'fişe = на чек (дат.)'},
  {topic:'покупки', q_ru:'Могу я посмотреть лекарство?', q_tr:'İlaca bakabilir miyim?', a_ru:'Пожалуйста', a_tr:'Buyurun.', hint:'ilaca = на лекарство (дат.)'},

  // ═══ ИЗ ФАЙЛА 1: Это дом (притяжательные) ═══
  {topic:'дом и семья', q_ru:'Это дом?', q_tr:'Bu ev mi?', a_ru:'Нет, это не дом', a_tr:'Hayır, burası ev değil.', hint:'ev = дом, değil = не'},
  {topic:'дом и семья', q_ru:'Это квартира?', q_tr:'Bu daire mi?', a_ru:'Нет, это офис', a_tr:'Hayır, burası ofis.', hint:'daire = квартира, ofis = офис'},
  {topic:'дом и семья', q_ru:'Это твоя машина?', q_tr:'Bu senin araban mı?', a_ru:'Нет, это его машина', a_tr:'Hayır, bu onun arabası.', hint:'senin araban = твоя машина'},
  {topic:'дом и семья', q_ru:'Эта книга интересная?', q_tr:'Bu kitap enteresan mı?', a_ru:'Нет, она скучная', a_tr:'Hayır, o sıkıcı.', hint:'enteresan = интересный, sıkıcı = скучный'},
  {topic:'дом и семья', q_ru:'Это твои документы?', q_tr:'Bu senin evrakların mı?', a_ru:'Нет, это его документы', a_tr:'Hayır, bu onun evrakları.', hint:'evraklar = документы'},
  {topic:'дом и семья', q_ru:'У тебя есть гражданство?', q_tr:'Senin vatandaşlığın var mı?', a_ru:'Да, у меня есть гражданство', a_tr:'Evet, benim vatandaşlığım var.', hint:'vatandaşlık = гражданство'},
  {topic:'дом и семья', q_ru:'Это ваша семья?', q_tr:'Bu sizin aileniz mi?', a_ru:'Да, это наша семья', a_tr:'Evet, bu bizim ailemiz.', hint:'aile = семья'},
  {topic:'дом и семья', q_ru:'Это его дети?', q_tr:'Bu onun çocukları mı?', a_ru:'Нет, это наши дети', a_tr:'Hayır, bu bizim çocuklarımız.', hint:'çocuklar = дети'},
  {topic:'дом и семья', q_ru:'Это новая одежда?', q_tr:'Bu yeni kıyafet mi?', a_ru:'Нет, она старая', a_tr:'Hayır, o eski.', hint:'yeni = новый, eski = старый'},
  {topic:'дом и семья', q_ru:'Эти фрукты дорогие?', q_tr:'Bu meyveler pahalı mı?', a_ru:'Нет, они дешёвые', a_tr:'Hayır, onlar ucuz.', hint:'meyveler = фрукты, ucuz = дешёвые'},
  {topic:'дом и семья', q_ru:'У неё есть муж?', q_tr:'Onun kocası var mı?', a_ru:'Да, её муж Иван', a_tr:'Evet, onun kocası Ivan.', hint:'koca = муж'},
  {topic:'дом и семья', q_ru:'Это ваша сумка?', q_tr:'Bu sizin çantanız mı?', a_ru:'Нет, это её сумка', a_tr:'Hayır, bu onun çantası.', hint:'çanta = сумка'},
  {topic:'дом и семья', q_ru:'У тебя есть работа?', q_tr:'Senin işin var mı?', a_ru:'Нет, у меня нет работы, но есть образование', a_tr:'Hayır, benim işim yok ama eğitimim var.', hint:'ama = но, eğitim = образование'},
  {topic:'дом и семья', q_ru:'Это твоя квартира?', q_tr:'Bu senin dairen mi?', a_ru:'Нет, это съёмная квартира', a_tr:'Hayır, bu kiralık daire.', hint:'kiralık = съёмная'},

  // ═══ ИЗ ФАЙЛА 11: образование и работа ═══
  {topic:'работа', q_ru:'У вас есть образование?', q_tr:'Sizin eğitiminiz var mı?', a_ru:'Да, у меня есть образование', a_tr:'Evet, benim eğitimim var.', hint:'eğitim = образование'},
  {topic:'работа', q_ru:'Какое у вас образование?', q_tr:'Sizin eğitiminiz ne?', a_ru:'У меня юридическое образование', a_tr:'Benim eğitimim hukukçu.', hint:'hukukçu = юрист'},
  {topic:'работа', q_ru:'Какая у вас работа?', q_tr:'Sizin işiniz ne?', a_ru:'Я водитель', a_tr:'Benim işim sürücü.', hint:'iş ne = какая работа, sürücü = водитель'},
  {topic:'работа', q_ru:'У вас официальная работа?', q_tr:'Sizin işiniz resmi mi?', a_ru:'Моя работа неофициальная', a_tr:'Benim işim resmi değil.', hint:'resmi = официальный'},
  {topic:'работа', q_ru:'Какая у вас профессия?', q_tr:'Sizin mesleğiniz ne?', a_ru:'Я инженер', a_tr:'Benim mesleğim mühendis.', hint:'meslek = профессия, mühendis = инженер'},
  {topic:'работа', q_ru:'Какая у вас зарплата?', q_tr:'Sizin maaşınız ne kadar?', a_ru:'Моя зарплата сто пятьдесят тысяч рублей', a_tr:'Benim maaşım yüz elli bin ruble.', hint:'maaş = зарплата, ne kadar = сколько'},
  {topic:'работа', q_ru:'У вас высокая зарплата?', q_tr:'Sizin maaşınız yüksek mi?', a_ru:'Моя зарплата низкая', a_tr:'Benim maaşım düşük.', hint:'yüksek = высокий, düşük = низкий'},
  {topic:'работа', q_ru:'Кто ваш начальник?', q_tr:'Sizin müdürünüz kim?', a_ru:'У меня нет начальника', a_tr:'Benim müdürüm yok.', hint:'müdür = начальник/директор'},
  {topic:'работа', q_ru:'Ваш начальник мужчина или женщина?', q_tr:'Sizin müdürünüz erkek mi yoksa kadın mı?', a_ru:'Мой начальник женщина', a_tr:'Benim müdürüm kadın.', hint:'erkek = мужчина, kadın = женщина, yoksa = или'},
  {topic:'работа', q_ru:'У неё высокая зарплата?', q_tr:'Onun maaşı yüksek mi?', a_ru:'Нет, у неё средняя зарплата', a_tr:'Hayır, onun maaşı orta.', hint:'orta = средний'},
  {topic:'работа', q_ru:'У вас много коллег?', q_tr:'Sizin çok meslektaşınız var mı?', a_ru:'Нет, у меня мало коллег', a_tr:'Hayır, benim az meslektaşım var.', hint:'meslektaş = коллега, az = мало'},
  {topic:'работа', q_ru:'У вас много клиентов?', q_tr:'Sizin çok müşteriniz var mı?', a_ru:'Hayır, benim az müşterim var.', a_tr:'Hayır, benim az müşterim var.', hint:'müşteri = клиент'},

  // ═══ ИЗ ФАЙЛА 2: опыт, должность ═══
  {topic:'работа', q_ru:'У вас есть опыт?', q_tr:'Sizin tecrübeniz var mı?', a_ru:'Evet, benim tecrübem var.', a_tr:'Evet, benim tecrübem var.', hint:'tecrübe = опыт'},
  {topic:'работа', q_ru:'Какой у вас опыт?', q_tr:'Sizin tecrübeniz ne?', a_ru:'Benim tecrübem büyük.', a_tr:'Benim tecrübem büyük.', hint:'büyük = большой'},
  {topic:'работа', q_ru:'Какая у вас должность?', q_tr:'Sizin pozisyonunuz ne?', a_ru:'Benim pozisyonum muhasebeci.', a_tr:'Benim pozisyonum muhasebeci.', hint:'pozisyon = должность, muhasebeci = бухгалтер'},
  {topic:'работа', q_ru:'У вас постоянная должность?', q_tr:'Sizin pozisyonunuz daimi mi?', a_ru:'Hayır, benim pozisyonum geçici.', a_tr:'Hayır, benim pozisyonum geçici.', hint:'daimi = постоянный, geçici = временный'},
  {topic:'работа', q_ru:'Какой у вас доход?', q_tr:'Sizin geliriniz ne kadar?', a_ru:'Benim gelirim seksen bin ruble.', a_tr:'Benim gelirim seksen bin ruble.', hint:'gelir = доход'},
  {topic:'работа', q_ru:'У вас высокий доход?', q_tr:'Sizin geliriniz yüksek mi?', a_ru:'Hayır, benim gelirim orta.', a_tr:'Hayır, benim gelirim orta.', hint:'yüksek = высокий, orta = средний'},
  {topic:'работа', q_ru:'Кто ваш руководитель?', q_tr:'Sizin yöneticiniz kim?', a_ru:'Benim yöneticim müdür.', a_tr:'Benim yöneticim müdür.', hint:'yönetici = руководитель'},
  {topic:'работа', q_ru:'Ваш руководитель молодой или пожилой?', q_tr:'Sizin yöneticiniz genç mi yoksa yaşlı mı?', a_ru:'Benim yöneticim genç.', a_tr:'Benim yöneticim genç.', hint:'genç = молодой, yaşlı = пожилой'},
  {topic:'работа', q_ru:'У него большая ответственность?', q_tr:'Onun sorumluluğu büyük mü?', a_ru:'Evet, onun sorumluluğu yüksek.', a_tr:'Evet, onun sorumluluğu yüksek.', hint:'sorumluluk = ответственность'},
  {topic:'работа', q_ru:'У вас много проектов?', q_tr:'Sizin çok projeniz var mı?', a_ru:'Hayır, benim az projem var.', a_tr:'Hayır, benim az projem var.', hint:'proje = проект, az = мало'},
  {topic:'работа', q_ru:'У вас есть клиенты?', q_tr:'Sizin müşterileriniz var mı?', a_ru:'Evet, benim müşterilerim var.', a_tr:'Evet, benim müşterilerim var.', hint:'müşteri = клиент'},

  // ═══ ИЗ ФАЙЛА 3: деньги, зарплата, команда ═══
  {topic:'работа', q_ru:'У вас есть деньги?', q_tr:'Sizin paranız var mı?', a_ru:'Evet, benim param var.', a_tr:'Evet, benim param var.', hint:'para = деньги'},
  {topic:'работа', q_ru:'Сколько у вас денег?', q_tr:'Sizin ne kadar paranız var?', a_ru:'Benim çok param var.', a_tr:'Benim çok param var.', hint:'ne kadar = сколько, çok = много'},
  {topic:'работа', q_ru:'Как вас зовут?', q_tr:'Sizin adınız ne?', a_ru:'Benim adım Yuri.', a_tr:'Benim adım Yuri.', hint:'ad = имя'},
  {topic:'работа', q_ru:'У вас есть команда?', q_tr:'Sizin ekibiniz var mı?', a_ru:'Evet, benim ekibim var.', a_tr:'Evet, benim ekibim var.', hint:'ekip = команда'},
  {topic:'работа', q_ru:'У вас большая команда?', q_tr:'Sizin ekibiniz büyük mü?', a_ru:'Hayır, benim ekibim küçük.', a_tr:'Hayır, benim ekibim küçük.', hint:'büyük = большой, küçük = маленький'},
  {topic:'работа', q_ru:'Ваш начальник строгий или спокойный?', q_tr:'Sizin müdürünüz sert mi yoksa sakin mi?', a_ru:'Benim müdürüm sakin.', a_tr:'Benim müdürüm sakin.', hint:'sert = строгий, sakin = спокойный'},
  {topic:'работа', q_ru:'Кто ваш друг?', q_tr:'Sizin arkadaşınız kim?', a_ru:'Benim arkadaşım Ali.', a_tr:'Benim arkadaşım Ali.', hint:'arkadaş = друг'},

  // ═══ ИЗ ФАЙЛА 4: семья, дом, вещи ═══
  {topic:'дом и семья', q_ru:'Как зовут вашего брата?', q_tr:'Erkek kardeşinizin adı ne?', a_ru:'Erkek kardeşimin adı Aleksey.', a_tr:'Erkek kardeşimin adı Aleksey.', hint:'erkek kardeş = брат'},
  {topic:'дом и семья', q_ru:'У вас есть сестра?', q_tr:'Sizin kız kardeşiniz var mı?', a_ru:'Evet, kız kardeşimin adı Maria.', a_tr:'Evet, kız kardeşimin adı Maria.', hint:'kız kardeş = сестра'},
  {topic:'дом и семья', q_ru:'Мария замужем?', q_tr:'Maria evli mi?', a_ru:'Hayır, kız kardeşim bekar.', a_tr:'Hayır, kız kardeşim bekar.', hint:'evli = замужем, bekar = не замужем'},
  {topic:'дом и семья', q_ru:'Какая работа у вашего брата?', q_tr:'Erkek kardeşinizin işi ne?', a_ru:'Erkek kardeşim sürücü.', a_tr:'Erkek kardeşim sürücü.', hint:'iş = работа, sürücü = водитель'},
  {topic:'дом и семья', q_ru:'Это ваш дом?', q_tr:'Bu sizin eviniz mi?', a_ru:'Hayır, bu bizim evimiz değil.', a_tr:'Hayır, bu bizim evimiz değil.', hint:'eviniz = ваш дом'},
  {topic:'дом и семья', q_ru:'Чей этот дом?', q_tr:'Bu kimin evi?', a_ru:'Bu bizim arkadaşlarımızın evi.', a_tr:'Bu bizim arkadaşlarımızın evi.', hint:'kimin = чей, ev = дом'},
  {topic:'дом и семья', q_ru:'У вас есть квартира?', q_tr:'Sizin daireniz var mı?', a_ru:'Evet, bizim Moskova\u2019da dairemiz var.', a_tr:'Evet, bizim Moskova\u2019da dairemiz var.', hint:'daire = квартира'},
  {topic:'дом и семья', q_ru:'У ваших друзей есть дети?', q_tr:'Sizin arkadaşlarınızın çocukları var mı?', a_ru:'Evet, onların üç çocuğu var.', a_tr:'Evet, onların üç çocuğu var.', hint:'üç = три, çocuk = ребёнок'},
  {topic:'дом и семья', q_ru:'Это ваш телефон?', q_tr:'Bu sizin telefonunuz mu?', a_ru:'Hayır, benim telefonum siyah, bu ise beyaz.', a_tr:'Hayır, benim telefonum siyah, bu ise beyaz.', hint:'siyah = чёрный, beyaz = белый'},
  {topic:'дом и семья', q_ru:'У вас есть родители?', q_tr:'Sizin anne babanız var mı?', a_ru:'Evet, bunlar benim anne babam.', a_tr:'Evet, bunlar benim anne babam.', hint:'anne baba = родители'},
  {topic:'дом и семья', q_ru:'У вашего брата есть машина?', q_tr:'Erkek kardeşinizin arabası var mı?', a_ru:'Evet, onun kırmızı bir arabası var.', a_tr:'Evet, onun kırmızı bir arabası var.', hint:'kırmızı = красная'},

  // ═══ ИЗ ФАЙЛА 5: сын, жена, образование ═══
  {topic:'дом и семья', q_ru:'Это жена вашего сына?', q_tr:'Bu sizin oğlunuzun karısı mı?', a_ru:'Oğlum evli değil, onun karısı yok.', a_tr:'Oğlum evli değil, onun karısı yok.', hint:'oğul = сын, karı = жена'},
  {topic:'дом и семья', q_ru:'У вашего сына есть дети?', q_tr:'Sizin oğlunuzun çocukları var mı?', a_ru:'Evet, bizim oğlumuzun iki çocuğu var.', a_tr:'Evet, bizim oğlumuzun iki çocuğu var.', hint:'iki = два'},
  {topic:'дом и семья', q_ru:'У вас есть образование?', q_tr:'Sizin eğitiminiz var mı?', a_ru:'Да, у меня есть образование', a_tr:'Benim eğitimim yok, eşimin iki eğitimi var.', hint:'eğitim = образование, eş = супруг'},
  {topic:'дом и семья', q_ru:'Она по образованию медсестра?', q_tr:'Onun eğitimi hemşire mi?', a_ru:'Hayır, onun eğitimi hukukçu, işi hemşire.', a_tr:'Hayır, onun eğitimi hukukçu, işi hemşire.', hint:'hemşire = медсестра, hukukçu = юрист'},
  {topic:'дом и семья', q_ru:'У вашей жены высокая зарплата?', q_tr:'Eşinizin maaşı yüksek mi?', a_ru:'Benim eşimin maaşı yüksek değil.', a_tr:'Benim eşimin maaşı yüksek değil.', hint:'eş = супруг/супруга'},
  {topic:'дом и семья', q_ru:'У вашего сына есть работа?', q_tr:'Sizin oğlunuzun işi var mı?', a_ru:'Evet, o sürücü olarak çalışıyor.', a_tr:'Evet, o sürücü olarak çalışıyor.', hint:'çalışmak = работать, olarak = как/в качестве'},
  {topic:'дом и семья', q_ru:'Он водитель?', q_tr:'O sürücü mü?', a_ru:'Evet, ve onun maaşı yüksek.', a_tr:'Evet, ve onun maaşı yüksek.', hint:'sürücü = водитель'},
  {topic:'дом и семья', q_ru:'Какого цвета машина вашего сына?', q_tr:'Oğlunuzun arabasının rengi ne?', a_ru:'Oğlumuzun arabasının rengi siyah.', a_tr:'Oğlumuzun arabasının rengi siyah.', hint:'renk = цвет, siyah = чёрный'},

  // ═══ ИЗ ФАЙЛА 6: родственники ═══
  {topic:'дом и семья', q_ru:'У вас есть старший брат?', q_tr:'Sizin ağabeyiniz var mı?', a_ru:'Hayır, benim sadece küçük erkek kardeşim var.', a_tr:'Hayır, benim sadece küçük erkek kardeşim var.', hint:'ağabey = старший брат, sadece = только'},
  {topic:'дом и семья', q_ru:'Как зовут вашего старшего брата?', q_tr:'Ağabeyinizin adı ne?', a_ru:'Ağabeyimin adı Emre.', a_tr:'Ağabeyimin adı Emre.', hint:'ağabey = старший брат'},
  {topic:'дом и семья', q_ru:'У вашей сестры есть подруга?', q_tr:'Kız kardeşinizin bir arkadaşı var mı?', a_ru:'Evet, en iyi arkadaşının adı Aslı.', a_tr:'Evet, en iyi arkadaşının adı Aslı.', hint:'en iyi arkadaş = лучшая подруга'},
  {topic:'дом и семья', q_ru:'Это дом ваших родителей?', q_tr:'Bu sizin anne babanızın evi mi?', a_ru:'Hayır, bu onların arkadaşlarının evi.', a_tr:'Hayır, bu onların arkadaşlarının evi.', hint:'anne baba = родители'},
  {topic:'дом и семья', q_ru:'У ваших родителей есть машина?', q_tr:'Anne babanızın arabası var mı?', a_ru:'Evet, onların kırmızı bir arabası var.', a_tr:'Evet, onların kırmızı bir arabası var.', hint:'kırmızı = красная'},
  {topic:'дом и семья', q_ru:'У вашей бабушки есть внуки?', q_tr:'Ninenizin torunları var mı?', a_ru:'Evet, onun beş torunu var.', a_tr:'Evet, onun beş torunu var.', hint:'nine = бабушка, torun = внук'},
  {topic:'дом и семья', q_ru:'У вашей тёти есть квартира?', q_tr:'Teyzenizin dairesi var mı?', a_ru:'Evet, teyzemin İzmir\u2019de bir dairesi var.', a_tr:'Evet, teyzemin İzmir\u2019de bir dairesi var.', hint:'teyze = тётя'},
  {topic:'дом и семья', q_ru:'У вашей тёти есть работа?', q_tr:'Teyzenizin işi var mı?', a_ru:'Hayır, o emekli.', a_tr:'Hayır, o emekli.', hint:'emekli = пенсионер'},
  {topic:'дом и семья', q_ru:'Это ребёнок вашей дочери?', q_tr:'Bu sizin kızınızın çocuğu mu?', a_ru:'Hayır, bu onun arkadaşının çocuğu.', a_tr:'Hayır, bu onun arkadaşının çocuğu.', hint:'kız = дочь'},
  {topic:'дом и семья', q_ru:'У вашей жены есть брат?', q_tr:'Eşinizin erkek kardeşi var mı?', a_ru:'Evet, onun adı Mustafa.', a_tr:'Evet, onun adı Mustafa.', hint:'erkek kardeş = брат'},

  // ═══ ИЗ ФАЙЛА 12: друзья, машины, гражданство ═══
  {topic:'дом и семья', q_ru:'У тебя есть друзья?', q_tr:'Senin arkadaşların var mı?', a_ru:'Benim arkadaşlarım yok.', a_tr:'Benim arkadaşlarım yok.', hint:'arkadaşlar = друзья'},
  {topic:'дом и семья', q_ru:'Антон не твой друг?', q_tr:'Anton senin arkadaşın değil mi?', a_ru:'Hayır, o benim meslektaşım.', a_tr:'Hayır, o benim meslektaşım.', hint:'meslektaş = коллега'},
  {topic:'дом и семья', q_ru:'У него есть жена?', q_tr:'Onun karısı var mı?', a_ru:'Ira onun karısı.', a_tr:'Ira onun karısı.', hint:'karı = жена'},
  {topic:'дом и семья', q_ru:'У Иры есть работа?', q_tr:'Ira\u2019nın işi var mı?', a_ru:'Evet, o hukukçu.', a_tr:'Evet, o hukukçu.', hint:'hukukçu = юрист'},
  {topic:'дом и семья', q_ru:'У Антона есть машина?', q_tr:'Anton\u2019un arabası var mı?', a_ru:'Evet, bu onun arabası.', a_tr:'Evet, bu onun arabası.', hint:'arabası = его машина'},
  {topic:'дом и семья', q_ru:'Какого цвета машина Антона?', q_tr:'Anton\u2019un arabasının rengi ne?', a_ru:'Onun arabasının rengi gri.', a_tr:'Onun arabasının rengi gri.', hint:'renk = цвет, gri = серый'},
  {topic:'дом и семья', q_ru:'Какого цвета твоя машина?', q_tr:'Senin arabının rengi ne?', a_ru:'Benim arabam yok.', a_tr:'Benim arabam yok.', hint:'arabam yok = у меня нет машины'},
  {topic:'дом и семья', q_ru:'У твоей жены есть машина?', q_tr:'Senin karının arabası var mı?', a_ru:'Benim karımın ehliyeti yok.', a_tr:'Benim karımın ehliyeti yok.', hint:'ehliyet = водительские права'},
  {topic:'дом и семья', q_ru:'Это чья машина?', q_tr:'Bu kimin arabası?', a_ru:'Bu benim babamın arabası.', a_tr:'Bu benim babamın arabası.', hint:'kimin = чья, babam = мой отец'},
  {topic:'дом и семья', q_ru:'Сколько стоит машина твоего отца?', q_tr:'Babanın arabasının fiyatı ne kadar?', a_ru:'Babamın arabasının fiyatı bir milyon iki yüz bin ruble.', a_tr:'Babamın arabasının fiyatı bir milyon iki yüz bin ruble.', hint:'fiyat = цена'},
  {topic:'дом и семья', q_ru:'Твой отец бизнесмен?', q_tr:'Baban iş adamı mı?', a_ru:'Hayır, o askeri.', a_tr:'Hayır, o askeri.', hint:'iş adamı = бизнесмен, askeri = военный'},
  {topic:'дом и семья', q_ru:'У твоего брата есть гражданство?', q_tr:'Senin erkek kardeşinin vatandaşlığı var mı?', a_ru:'Benim erkek kardeşimin vatandaşlığı yok.', a_tr:'Benim erkek kardeşimin vatandaşlığı yok.', hint:'vatandaşlık = гражданство'},

  // ═══ ИЗ ФАЙЛА 13: разные вещи ═══
  {topic:'дом и семья', q_ru:'Это валюта?', q_tr:'Bu döviz mi?', a_ru:'Hayır, bu döviz değil.', a_tr:'Hayır, bu döviz değil.', hint:'döviz = валюта'},
  {topic:'дом и семья', q_ru:'Это фрукты?', q_tr:'Bunlar meyveler mi?', a_ru:'Hayır, bunlar sebzeler.', a_tr:'Hayır, bunlar sebzeler.', hint:'sebzeler = овощи'},
  {topic:'дом и семья', q_ru:'Это твой телефон?', q_tr:'Bu senin telefonun mu?', a_ru:'Hayır, bu onun telefonu.', a_tr:'Hayır, bu onun telefonu.', hint:'telefon = телефон'},
  {topic:'дом и семья', q_ru:'Эта комната светлая?', q_tr:'Bu oda ışıklı mı?', a_ru:'Hayır, o karanlık.', a_tr:'Hayır, o karanlık.', hint:'ışıklı = светлый, karanlık = тёмный'},
  {topic:'дом и семья', q_ru:'Это твои тетради?', q_tr:'Bunlar senin defterlerin mi?', a_ru:'Hayır, bunlar onun defterleri.', a_tr:'Hayır, bunlar onun defterleri.', hint:'defterler = тетради'},
  {topic:'дом и семья', q_ru:'У тебя есть телевизор?', q_tr:'Senin televizyonun var mı?', a_ru:'Evet, benim televizyonum var.', a_tr:'Evet, benim televizyonum var.', hint:'televizyon = телевизор'},
  {topic:'дом и семья', q_ru:'Это ваши ключи?', q_tr:'Bunlar sizin anahtarlarınız mı?', a_ru:'Evet, bunlar bizim anahtarlarımız.', a_tr:'Evet, bunlar bizim anahtarlarımız.', hint:'anahtarlar = ключи'},
  {topic:'дом и семья', q_ru:'Это его родители?', q_tr:'Bunlar onun anne babası mı?', a_ru:'Hayır, bunlar benim anne babam.', a_tr:'Hayır, bunlar benim anne babam.', hint:'anne baba = родители'},
  {topic:'дом и семья', q_ru:'Это новый стул?', q_tr:'Bu yeni sandalye mi?', a_ru:'Hayır, o eski.', a_tr:'Hayır, o eski.', hint:'yeni = новый, eski = старый'},
  {topic:'дом и семья', q_ru:'Эти сумки тяжёлые?', q_tr:'Bu çantalar ağır mı?', a_ru:'Hayır, onlar hafif.', a_tr:'Hayır, onlar hafif.', hint:'ağır = тяжёлый, hafif = лёгкий'},
  {topic:'дом и семья', q_ru:'Это твой паспорт?', q_tr:'Bu senin pasaportun mu?', a_ru:'Hayır, bu benim pasaportum.', a_tr:'Hayır, bu benim pasaportum.', hint:'pasaport = паспорт'},
  {topic:'дом и семья', q_ru:'У вас есть книга?', q_tr:'Sizin kitabınız var mı?', a_ru:'Evet, bizim kitabımız var.', a_tr:'Evet, bizim kitabımız var.', hint:'kitap = книга'},
  {topic:'дом и семья', q_ru:'У вас есть турецкая SIM-карта?', q_tr:'Sizin Türk SIM kartınız var mı?', a_ru:'Evet, benim Türk SIM kartım var.', a_tr:'Evet, benim Türk SIM kartım var.', hint:'Türk SIM kart = турецкая SIM-карта'},
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
  $('dlg-topic-badge').textContent = d.topic;
  $('dlg-question').textContent = d.q_ru;
  if ($('dlg-answer-ru')) $('dlg-answer-ru').textContent = d.a_ru || '—';
  $('dlg-question-tr').textContent = d.q_tr;
  if ($('dlg-answer-tr')) $('dlg-answer-tr').textContent = d.a_tr;
  if ($('dlg-question-tr-wrap')) $('dlg-question-tr-wrap').style.display = 'none';
  if ($('dlg-answer-tr-wrap')) $('dlg-answer-tr-wrap').style.display = 'none';
  if ($('btn-dlg-show-qtr')) $('btn-dlg-show-qtr').textContent = '🇹🇷 Показать вопрос по-турецки';
  if ($('btn-dlg-show-atr')) $('btn-dlg-show-atr').textContent = '🇹🇷 Показать ответ по-турецки';

  $('dlg-hint').innerHTML = '<span style="font-size:11px;opacity:.6">Вопрос:</span> <b>' + d.q_tr + '</b><br><span style="font-size:11px;opacity:.6">Ответ:</span> <b>' + d.a_tr + '</b><span style="display:block;margin-top:4px;font-size:12px;opacity:.75">' + d.hint + '</span>';
  $('dlg-hint').style.display = 'none';
  $('btn-dlg-hint').style.display = '';

  const dlgPronQ = detectPronoun(d.q_tr);
  const dlgPronA = detectPronoun(d.a_tr);
  const dlgPronBtnQ = $('btn-dlg-pronoun-q');
  const dlgPronElQ = $('dlg-pronoun-q');
  const dlgPronBtnA = $('btn-dlg-pronoun-a');
  const dlgPronElA = $('dlg-pronoun-a');
  if (dlgPronBtnQ && dlgPronElQ) {
    if (dlgPronQ) {
      dlgPronBtnQ.style.display = '';
      dlgPronElQ.textContent = dlgPronQ;
      dlgPronElQ.style.display = 'none';
    } else {
      dlgPronBtnQ.style.display = 'none';
      dlgPronElQ.style.display = 'none';
    }
  }
  if (dlgPronBtnA && dlgPronElA) {
    if (dlgPronA) {
      dlgPronBtnA.style.display = '';
      dlgPronElA.textContent = dlgPronA;
      dlgPronElA.style.display = 'none';
    } else {
      dlgPronBtnA.style.display = 'none';
      dlgPronElA.style.display = 'none';
    }
  }

  const acc = dlgState.session.total > 0
    ? Math.round(dlgState.session.right / dlgState.session.total * 100) : null;
  $('ds-total').textContent = dlgState.session.total;
  $('ds-right').textContent = dlgState.session.right;
  $('ds-acc').textContent = acc !== null ? acc + '%' : '—';

  if (dlgState.phase === 'q') {
    $('dlg-input-area').style.display = '';
    $('dlg-result-area').style.display = 'none';
    if ($('dlg-question-answer')) $('dlg-question-answer').value = '';
    $('dlg-answer').value = '';
    setTimeout(() => ($('dlg-question-answer') || $('dlg-answer')).focus(), 50);
  } else {
    $('dlg-input-area').style.display = 'none';
    $('dlg-result-area').style.display = '';
  }
}

function checkDlgAnswer() {
  const d = dlgState.current;
  const userQ = (($('dlg-question-answer') && $('dlg-question-answer').value) || '').trim();
  const userA = $('dlg-answer').value.trim();
  const okQ = normalizeTR(userQ) === normalizeTR(d.q_tr);
  const okA = normalizeTR(userA) === normalizeTR(d.a_tr);
  const ok = okQ && okA;

  dlgState.session.total++;
  if (ok) dlgState.session.right++;
  dlgState.phase = 'result';

  $('dlg-res-icon').textContent = ok ? '✅' : '❌';
  $('dlg-res-verdict').textContent = ok ? 'Верно' : 'Неверно';
  $('dlg-res-verdict').className = 'res-verdict ' + (ok ? 'c-ok' : 'c-bad');

  $('dlg-res-your').style.display = '';
  $('dlg-res-your').innerHTML = '<b>Ваш вопрос:</b> ' + (userQ || '—') + '<br><b>Ваш ответ:</b> ' + (userA || '—');
  $('dlg-res-correct').innerHTML = '<b>Правильно:</b><br>Вопрос: <b>' + d.q_tr + '</b><br>Ответ: <b>' + d.a_tr + '</b>';
  $('dlg-res-hint').innerHTML = '<span style="font-size:12px;opacity:.75">' + d.hint + '</span>';
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
    $('dlg-res-hint').innerHTML = '<span style="font-size:12px;opacity:.75">' + d.hint + '</span>';
    renderDialogs();
  });
  $('btn-dlg-next').addEventListener('click', nextDialog);
  $('btn-dlg-hint').addEventListener('click', () => {
    $('dlg-hint').style.display = '';
    $('btn-dlg-hint').style.display = 'none';
  });
  if ($('btn-sent-show-tr-q')) {
    $('btn-sent-show-tr-q').addEventListener('click', () => {
      toggleRevealBlock('sent-tr-wrap', 'btn-sent-show-tr-q', '🇹🇷 Показать по-турецки', '🙈 Скрыть турецкий');
    });
  }
  if ($('btn-dlg-show-qtr')) {
    $('btn-dlg-show-qtr').addEventListener('click', () => {
      toggleRevealBlock('dlg-question-tr-wrap', 'btn-dlg-show-qtr', '🇹🇷 Показать вопрос по-турецки', '🙈 Скрыть вопрос по-турецки');
    });
  }
  if ($('btn-dlg-show-atr')) {
    $('btn-dlg-show-atr').addEventListener('click', () => {
      toggleRevealBlock('dlg-answer-tr-wrap', 'btn-dlg-show-atr', '🇹🇷 Показать ответ по-турецки', '🙈 Скрыть ответ по-турецки');
    });
  }
  if ($('btn-dlg-pronoun-q')) {
    $('btn-dlg-pronoun-q').addEventListener('click', () => {
      $('dlg-pronoun-q').style.display = '';
      $('btn-dlg-pronoun-q').style.display = 'none';
    });
  }
  if ($('btn-dlg-pronoun-a')) {
    $('btn-dlg-pronoun-a').addEventListener('click', () => {
      $('dlg-pronoun-a').style.display = '';
      $('btn-dlg-pronoun-a').style.display = 'none';
    });
  }
  const dlgInputs = ['dlg-question-answer','dlg-answer'].map(id => $(id)).filter(Boolean);
  dlgInputs.forEach(inp => inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (dlgState.phase === 'q') checkDlgAnswer();
      else nextDialog();
    }
  }));
}

// ─── HOW-TO TABS ──────────────────────────────────────────────────────────────
function showHowto(id, btn) {
  document.querySelectorAll('.ref-howto-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.ref-howto-tab').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('howto-' + id);
  if (panel) panel.style.display = '';
  if (btn) btn.classList.add('active');
}

// ─── CHEAT TOGGLE ─────────────────────────────────────────────────────────────
function toggleCheat() {
  const body = document.getElementById('cheat-body');
  const btn  = document.getElementById('btn-cheat');
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  btn.textContent = open ? '💡 Показать все формы' : '🙈 Скрыть формы';
}
