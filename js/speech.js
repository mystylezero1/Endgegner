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
    
    // Für iOS: Trigger mit user interaction
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      utterance.onend = () => {
        console.log('Begrüßung abgespielt');
      };
    }
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Web Speech API wird nicht unterstützt');
  }
}

export function getRandomSpeech() {
  const speeches = [
    "Auf eine unvergessliche Hochzeitsfeier!.mp3",
    "Ein Hoch auf die Liebe und auf euch alle!.mp3",
    "Lasst uns zusammen lachen, tanzen und feiern!.mp3",
    "Schön, dass du unseren besonderen Tag mit uns feierst!.mp3"
  ];
  
  const randomFile = speeches[Math.floor(Math.random() * speeches.length)];
  const audioPath = `assets/${randomFile}`;
  
  // Spiele die MP3-Datei ab
  const audio = new Audio(audioPath);
  audio.volume = 1.0;
  audio.play().catch(err => {
    console.error('Audio konnte nicht abgespielt werden:', err);
  });
  
  // Gib den Text zurück für die Alert-Box
  return randomFile.replace('.mp3', '');
}
