export function speakGreeting(name, table, seat) {
  const displayTable = table === 'Braut-Tisch' ? 'dem Brauttisch' : `Tisch Nummer ${table.replace('Tisch ', '')}`;
  const text = `Hallo ${name}! Du sitzt an ${displayTable}. Wir freuen uns sehr, dass du da bist!`;
  
  // Google Translate Text-to-Speech API (kostenlos)
  const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=de&client=tw-ob`;
  
  const audio = new Audio(audioUrl);
  audio.play().catch(err => console.error('Audio konnte nicht abgespielt werden:', err));
}

export function getRandomSpeech() {
  const speeches = [
    "Schön, dass du unseren besonderen Tag mit uns feierst!",
    "Lasst uns zusammen lachen, tanzen und feiern!",
    "Ein Hoch auf die Liebe und auf euch alle!",
    "Auf eine unvergessliche Hochzeitsfeier!"
  ];
  
  const text = speeches[Math.floor(Math.random() * speeches.length)];
  
  // Google Translate Text-to-Speech API (kostenlos)
  const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=de&client=tw-ob`;
  
  const audio = new Audio(audioUrl);
  audio.play().catch(err => console.error('Audio konnte nicht abgespielt werden:', err));
  
  return text;
}
