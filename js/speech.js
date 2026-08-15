export function speakGreeting(name, table, seat) {
  const displayTable = table === 'Braut-Tisch' ? 'dem Brauttisch' : `Tisch Nummer ${table.replace('Tisch ', '')}`;
  const text = `Hallo ${name}! Du sitzt an ${displayTable}. Wir freuen uns sehr, dass du da bist!`;
  
  // Web Speech API für dynamische Begrüßung
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Web Speech API wird nicht unterstützt');
  }
}

export function getRandomSpeech() {
  const speeches = [
    {
      text: "Auf eine unvergessliche Hochzeitsfeier!",
      file: "Auf eine unvergessliche Hochzeitsfeier!.mp3"
    },
    {
      text: "Ein Hoch auf die Liebe und auf euch alle!",
      file: "Ein Hoch auf die Liebe und auf euch alle!.mp3"
    },
    {
      text: "Lasst uns zusammen lachen, tanzen und feiern!",
      file: "Lasst uns zusammen lachen, tanzen und feiern!.mp3"
    },
    {
      text: "Schön, dass du unseren besonderen Tag mit uns feierst!",
      file: "Schön, dass du unseren besonderen Tag mit uns feierst!.mp3"
    }
  ];
  
  const randomSpeech = speeches[Math.floor(Math.random() * speeches.length)];
  
  // Spiele die MP3-Datei ab
  const audio = new Audio(`assets/${randomSpeech.file}`);
  audio.play().catch(err => {
    console.error('Audio konnte nicht abgespielt werden:', err);
  });
  
  return randomSpeech.text;
}
