export function speakGreeting(name, table, seat) {
  const displayTable = table === 'Braut-Tisch' ? 'dem Brauttisch' : `Tisch Nummer ${table.replace('Tisch ', '')}`;
  const text = `Hallo ${name}! Du sitzt an ${displayTable}. Wir freuen uns sehr, dass du da bist!`;
  
  // ResponsiveVoice Text-to-Speech
  if (typeof responsiveVoice !== 'undefined') {
    responsiveVoice.cancel();
    responsiveVoice.speak(text, 'German Female', {
      rate: 0.9,
    });
  } else {
    console.error('ResponsiveVoice ist nicht geladen');
  }
}

export function getRandomSpeech() {
  const speeches = [
    "Schön, dass du unseren besonderen Tag mit uns feierst!",
    "Lasst uns zusammen lachen, tanzen und feiern!",
    "Ein Hoch auf die Liebe und auf euch alle!",
    "Auf eine unvergessliche Hochzeitsfeier!"
  ];
  
  const text = speeches[Math.floor(Math.random() * speeches.length)];
  
  // ResponsiveVoice Text-to-Speech
  if (typeof responsiveVoice !== 'undefined') {
    responsiveVoice.cancel();
    responsiveVoice.speak(text, 'German Female', {
      rate: 0.9,
    });
  } else {
    console.error('ResponsiveVoice ist nicht geladen');
  }
  
  return text;
}
