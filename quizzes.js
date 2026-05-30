/**
 * Allmennkunnskap – sentral metadata for alle quizer.
 *
 * Når du legger til en ny quiz: legg den til i QUIZZES nedenfor.
 * Forsiden (index.html) og anbefalings-widgeten i hver quiz leser
 * fra denne lista, så du slipper å oppdatere noe annet sted.
 */
window.QUIZZES = [
  {
    id: 'allmenn-01',
    file: 'quiz.html',
    number: '01',
    title: 'Almenndannelse',
    subtitle: 'En quiz i ti bolker',
    eyebrow: 'Allmenn',
    category: 'allmenn',
    tags: ['allmenn', 'norsk', 'blandet']
  },
  {
    id: 'allmenn-02',
    file: 'quiz-2.html',
    number: '02',
    title: 'Almenndannelse № 02',
    subtitle: 'Andre runde, ti nye bolker',
    eyebrow: 'Allmenn',
    category: 'allmenn',
    tags: ['allmenn', 'norsk', 'blandet']
  },
  {
    id: 'oslo-01',
    file: 'oslo-quiz.html',
    number: '03',
    title: 'Oslo',
    subtitle: 'Byvandring i kunnskap',
    eyebrow: 'Sted',
    category: 'sted',
    tags: ['sted', 'oslo', 'norsk', 'kultur', 'historie']
  },
  {
    id: 'oslo-02',
    file: 'oslo-quiz-puber.html',
    number: '04',
    title: 'Oslo nº 2',
    subtitle: 'Puber, gater og litt rart',
    eyebrow: 'Sted',
    category: 'sted',
    tags: ['sted', 'oslo', 'norsk', 'kultur']
  },
  {
    id: 'klinikk',
    file: 'klinikk-quiz.html',
    number: '05',
    title: 'Hud, hender, helbredelse',
    subtitle: 'Hudpleie, fysio, fotpleie og litt healing',
    eyebrow: 'Fag',
    category: 'fag',
    tags: ['fag', 'klinikk', 'helse', 'kropp']
  },
  {
    id: 'yungblud',
    file: 'yungblud-quiz.html',
    number: '06',
    title: 'YUNGBLUD',
    subtitle: 'Black Hearts Club',
    eyebrow: 'Musikk',
    category: 'musikk',
    tags: ['musikk', 'rock', 'pop', 'britisk', 'samtidsmusikk']
  },
  {
    id: 'the-weeknd',
    file: 'the-weeknd-quiz.html',
    number: '07',
    title: 'The Weeknd',
    subtitle: 'Fra Scarborough til Super Bowl',
    eyebrow: 'Musikk',
    category: 'musikk',
    tags: ['musikk', 'pop', 'rnb', 'kanadisk', 'samtidsmusikk']
  },
  {
    id: 'moby',
    file: 'moby-quiz.html',
    number: '08',
    title: 'Moby',
    subtitle: 'Techno, vegansk og litt Melville',
    eyebrow: 'Musikk',
    category: 'musikk',
    tags: ['musikk', 'elektronisk', 'techno', 'amerikansk', '90-tall']
  }
];

/**
 * Rangerer quizer etter overlapp av tags. Brukes til
 * «Du vil kanskje også like»-seksjonen på resultatskjermen.
 *
 * @param {string} currentId  - id-en til den nåværende quizen
 * @param {number} [limit=3]  - hvor mange anbefalinger som skal returneres
 * @returns {Array} liste med relaterte quiz-objekter, sortert etter relevans
 */
window.getRelatedQuizzes = function(currentId, limit) {
  limit = limit || 3;
  var current = window.QUIZZES.find(function(q) { return q.id === currentId; });
  if (!current) return [];
  var currentTags = current.tags;

  return window.QUIZZES
    .filter(function(q) { return q.id !== currentId; })
    .map(function(q) {
      var score = q.tags.filter(function(t) { return currentTags.indexOf(t) !== -1; }).length;
      return { quiz: q, score: score };
    })
    .filter(function(item) { return item.score > 0; })
    .sort(function(a, b) {
      // Primært: flere matchende tags først
      if (b.score !== a.score) return b.score - a.score;
      // Sekundært: nyere quizer (høyere nummer) først
      return parseInt(b.quiz.number, 10) - parseInt(a.quiz.number, 10);
    })
    .slice(0, limit)
    .map(function(item) { return item.quiz; });
};

/**
 * Grupperer quizene etter kategori for forsiden.
 */
window.getQuizzesByCategory = function() {
  var groups = {};
  window.QUIZZES.forEach(function(q) {
    if (!groups[q.category]) groups[q.category] = [];
    groups[q.category].push(q);
  });
  return groups;
};
