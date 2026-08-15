export function speakGreeting(name, table, seat) {
  if (!('speechSynthesis' in window)) return;
  
  // Laufende Sprachausgabe abbrechen
  window.speechSynthesis.cancel();
  
  // FIX: Wir fügen "Nummer" hinzu, damit das iPhone keine Ordnungszahl (siebter) daraus macht.
  const displayTable = table === 'Braut-Tisch' ? 'dem Brauttisch' : `Tisch Nummer ${table.replace('Tisch ', '')}`;
  
  // Einfacher, flüssiger Satz ohne irritierende Satzzeichen für die KI
  const text = `Hallo ${name}! Du sitzt an ${displayTable}. Wir freuen uns sehr, dass du da bist!`;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.95; // Normale, angenehme Lesegeschwindigkeit
  utterance.pitch = 1.0; // Zurück auf Standard (1.0), das klingt am natürlichsten

  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length > 0) {
    const bestVoice = voices.find(v => v.lang.startsWith('de') && (v.name.includes('Siri') || v.name.includes('Helena') || v.name.includes('Marlene') || v.name.includes('Anna'))) || 
                      voices.find(v => v.lang.startsWith('de') && v.name.includes('Google') && v.name.includes('Online')) || 
                      voices.find(v => v.lang.startsWith('de') && v.name.includes('Google')) || 
                      voices.find(v => v.lang.startsWith('de') && v.name.includes('Katja')) || 
                      voices.find(v => v.lang.startsWith('de') && v.localService === false) ||
                      voices.find(v => v.lang.startsWith('de'));

    if (bestVoice) {
      utterance.voice = bestVoice;
    }
  }

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
