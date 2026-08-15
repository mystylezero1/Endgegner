import { CONFIG } from './config.js';
import { AnimationEngine } from './animation.js';
import { SearchModule } from './search.js';
import { speakGreeting, getRandomSpeech } from './speech.js';
import { AdminModule } from './admin.js';

class WeddingApp {
  constructor() {
    this.config = CONFIG;
    this.data = { tables: [], guests: [] };
    this.animationEngine = new AnimationEngine('animation-canvas');
    this.injectHighlightStyles();
  }

  // Erzeugt das goldene Pulsieren für den gewählten Tisch
  injectHighlightStyles() {
    if (!document.getElementById('table-highlight-style')) {
      const style = document.createElement('style');
      style.id = 'table-highlight-style';
      style.innerHTML = `
        @keyframes blink-glow {
          0% { box-shadow: 0 0 6px #d4af37, inset 0 0 6px #d4af37; border-color: rgba(212, 175, 55, 0.7); }
          50% { box-shadow: 0 0 24px #d4af37, inset 0 0 16px #d4af37; border-color: #ffffff; }
          100% { box-shadow: 0 0 6px #d4af37, inset 0 0 6px #d4af37; border-color: rgba(212, 175, 55, 0.7); }
        }
        .table-highlight {
          position: absolute;
          border: 3px solid #d4af37;
          animation: blink-glow 1.1s infinite ease-in-out;
          pointer-events: none;
          box-sizing: border-box;
          z-index: 10;
          transition: all 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }

  async init() {
    this.applyConfig();
    await this.loadData();

    this.searchModule = new SearchModule(this.data.guests, (guest) => this.onGuestSelected(guest));
    this.adminModule = new AdminModule(this.data, () => this.onDataUpdated());

    this.setupEventListeners();
  }

  applyConfig() {
    document.getElementById('app-title').innerText = `${this.config.names.bride} & ${this.config.names.groom}`;
    document.getElementById('photo-link').href = this.config.photoAlbumUrl;
  }

  async loadData() {
    try {
      const res = await fetch('data.json');
      const jsonData = await res.json();
      this.data.tables = jsonData.tables;
      
      const savedGuestsRaw = localStorage.getItem('wedding_guests_custom');
      let savedGuests = savedGuestsRaw ? JSON.parse(savedGuestsRaw) : null;

      if (savedGuests && savedGuests.some(g => g.firstName === "Gast 1" || g.firstName === "Gast")) {
        localStorage.removeItem('wedding_guests_custom');
        savedGuests = null;
      }

      this.data.guests = savedGuests ? savedGuests : jsonData.guests;
    } catch (e) {
      console.error("Fehler beim Laden von data.json", e);
    }
  }

  onDataUpdated() {
    this.searchModule.updateGuests(this.data.guests);
  }

  setupEventListeners() {
    document.getElementById('speech-btn')?.addEventListener('click', () => {
      alert(`💬 Brautpaar Spruch:\n\n"${getRandomSpeech()}"`);
    });
  }

  onGuestSelected(guest) {
    const table = this.data.tables.find(t => t.id === guest.tableId);
    if (!table) return;

    const guestName = `${guest.firstName} ${guest.lastNameInitial || ''}`.trim();
    const tableName = table.name.replace('Tisch ', 'Tisch ');
    
    document.getElementById('target-guest-info').innerText = `${guestName} ➔ ${tableName}`;
    document.getElementById('target-seat-info').innerText = `Dein Sitzplatz ist Nummer ${guest.seat}`;

    this.focusTable(table);
    this.animationEngine.triggerConfetti();
    speakGreeting(guest.firstName, table.name, guest.seat);
  }

  focusTable(table) {
    // 1. Kamera-Zoom auf das Zentrum des Tisches
    const container = document.getElementById('map-container');
    const scale = 1.7;
    const translateX = (50 - table.x) * (scale / 1.8);
    const translateY = (50 - table.y) * (scale / 1.8);

    container.style.transform = `scale(${scale}) translate(${translateX}%, ${translateY}%)`;

    // 2. Erzeuge den exakten Rahmen
    const tablesLayer = document.getElementById('tables-layer');
    tablesLayer.innerHTML = '';

    const highlight = document.createElement('div');
    highlight.className = 'table-highlight';

    // Automatischer Format-Wechsel: Brauttisch vs. Standard-Tische
    const isBrautTisch = table.id === 'brauttisch' || table.name.toLowerCase().includes('braut');
    
    // Feinjustierte Maße in % für einen exakten Sitz
    const width = table.width || (isBrautTisch ? 62 : 13.2);
    const height = table.height || (isBrautTisch ? 16 : 15.3);

    // Positionierung zentriert zum X/Y-Koordinatenpunkt des Tisches
    highlight.style.left = `${table.x - width / 2}%`;
    highlight.style.top = `${table.y - height / 2}%`;
    highlight.style.width = `${width}%`;
    highlight.style.height = `${height}%`;
    highlight.style.borderRadius = isBrautTisch ? '24px' : '8px';

    tablesLayer.appendChild(highlight);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new WeddingApp();
  app.init();
});
