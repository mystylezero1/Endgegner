export function speakGreeting(name, table, seat) {
  if (!('speechSynthesis' in window)) return;
  
  // Laufende Sprachausgabe abbrechen, um Überlappungen zu verhindern
  window.speechSynthesis.cancel();
  
  const displayTable = table === 'Braut-Tisch' ? 'dem Braut-Tisch' : `Tisch ${table.replace('Tisch ', '')}`;
  const text = `Hallo ${name}! Dein Platz ist an ${displayTable}. Wir freuen uns sehr, dass du da bist!`;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.90; // Etwas langsamer für natürlicheren Klang
  utterance.pitch = 1.0; // Exakt 1.0 verhindert Frequenz-Verzerrungen (Blech-Klang)

  const playSpeech = () => {
    const voices = window.speechSynthesis.getVoices();
    
    // 1. Priorität: Gezielte Online-/Natural-Stimmen (z.B. Edge, Google Cloud, Apple Siri)
    // 2. Priorität: Stimmen, die nicht als blechiger Offline-Dienst (localService) markiert sind
    const premiumVoice = voices.find(v => v.lang.startsWith('de') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                         voices.find(v => v.lang.startsWith('de') && (v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Katja'))) ||
                         voices.find(v => v.lang.startsWith('de') && v.localService === false) ||
                         voices.find(v => v.lang.startsWith('de'));

    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  let voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      playSpeech();
    };
  } else {
    playSpeech();
  }
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
