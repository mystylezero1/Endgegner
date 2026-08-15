export function speakGreeting(name, table, seat) {
  if (!('speechSynthesis' in window)) return;
  
  // Laufende Sprachausgabe abbrechen
  window.speechSynthesis.cancel();
  
  const displayTable = table === 'Braut-Tisch' ? 'dem Braut-Tisch' : `Tisch ${table.replace('Tisch ', '')}`;
  const text = `Hallo ${name}! Dein Platz ist an ${displayTable}. Wir freuen uns sehr, dass du da bist!`;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.90; 
  utterance.pitch = 1.0; 

  // Wir versuchen sofort eine deutsche Stimme zu greifen
  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length > 0) {
    const premiumVoice = voices.find(v => v.lang.startsWith('de') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                         voices.find(v => v.lang.startsWith('de') && (v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Katja'))) ||
                         voices.find(v => v.lang.startsWith('de') && v.localService === false) ||
                         voices.find(v => v.lang.startsWith('de'));

    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }
  }

  // WICHTIG FÜR APPLE: Der speak()-Befehl MUSS sofort ausgeführt werden.
  // Jegliches Warten (z.B. auf onvoiceschanged) führt unter iOS dazu,
  // dass Safari die Ausgabe blockiert, da die direkte Klick-Interaktion abläuft!
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
