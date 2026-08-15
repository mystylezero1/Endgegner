export function speakGreeting(name, table, seat) {
  if (!('speechSynthesis' in window)) return;
  
  // Laufende Sprachausgabe abbrechen
  window.speechSynthesis.cancel();
  
  const displayTable = table === 'Braut-Tisch' ? 'dem Braut-Tisch' : `Tisch ${table.replace('Tisch ', '')}`;
  
  // NEU: Ein unsichtbares Komma zwingt die Stimme zum "Luftholen" und macht es natürlicher
  const text = `Hallo ${name}! Dein Platz, ist an ${displayTable}. Wir freuen uns sehr, dass du da bist!`;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.95; // Minimal schneller als vorher, damit es nicht "betrunken" klingt
  utterance.pitch = 1.05; // Minimal höher für eine freundlichere Klangfarbe

  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length > 0) {
    // NEU: Wir suchen gezielt nach den natürlichsten Systemstimmen
    const bestVoice = voices.find(v => v.lang.startsWith('de') && (v.name.includes('Siri') || v.name.includes('Helena') || v.name.includes('Marlene') || v.name.includes('Anna'))) || // iOS Favoriten
                      voices.find(v => v.lang.startsWith('de') && v.name.includes('Google') && v.name.includes('Online')) || // Android Online-Stimmen (viel natürlicher)
                      voices.find(v => v.lang.startsWith('de') && v.name.includes('Google')) || // Android Standard
                      voices.find(v => v.lang.startsWith('de') && v.name.includes('Katja')) || // Windows
                      voices.find(v => v.lang.startsWith('de') && v.localService === false) ||
                      voices.find(v => v.lang.startsWith('de'));

    if (bestVoice) {
      utterance.voice = bestVoice;
    }
  }

  // WICHTIG FÜR APPLE: Sofort ausführen!
  window.speechSynthesis.speak(utterance);
}

export function getRandomSpeech() {
  const speeches = [
    "Schön, dass du unseren besonderen Tag mit uns feierst!",
    "Lasst uns zusammen lachen, tanzen und feiern!",
    // NEU: Kommas für natürlichere Betonung beim Vorlesen
    "Ein Hoch auf die Liebe, und auf euch alle!",
    "Auf eine unvergessliche Hochzeitsfeier!"
  ];
  return speeches[Math.floor(Math.random() * speeches.length)];
}
