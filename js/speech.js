export function speakGreeting(name, table, seat) {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  
  const displayTable = table === 'Braut-Tisch' ? 'dem Brauttisch' : `Tisch Nummer ${table.replace('Tisch ', '')}`;
  const text = `Hallo ${name}! Du sitzt an ${displayTable}. Wir freuen uns sehr, dass du da bist!`;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  
  // WICHTIG: Exakt 1.0! Jede Abweichung verzerrt die iOS-Stimme massiv.
  utterance.rate = 1.0; 
  utterance.pitch = 1.0; 

  // Wir verzichten komplett auf die manuelle Zuweisung einer Stimme (utterance.voice).
  // Dadurch überlassen wir dem iPhone/Android die Wahl, und es nutzt 
  // automatisch seine beste eingestellte Standard-Stimme für Deutsch.
  
  window.speechSynthesis.speak(utterance);
}

export function getRandomSpeech() {
  const speeches = [
    "Schön, dass du unseren besonderen Tag mit uns feierst!",
    "Lasst uns zusammen lachen, tanzen und feiern!",
    "Ein Hoch auf die Liebe und auf euch alle!",
    "Auf eine unvergessliche Hochzeitsfeier!"
  ];
  return speeches[Math.floor(Math.random() * speeches.length)];
}
