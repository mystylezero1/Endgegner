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
    this.panzoom = null;
    this.injectHighlightStyles();
  }

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

    this.initPanzoom();
    this.setupEventListeners();
  }

  initPanzoom() {
    const mapContainer = document.getElementById('map-container');
    const viewport = document.getElementById('map-viewport');
    
    this.panzoom = Panzoom(mapContainer, {
      maxScale: 4,
      minScale: 1,
      // 'contain' wurde entfernt, damit das Skript nicht beim Zoomen an Rändern blockiert
      step: 0.3
    });

    viewport.addEventListener('wheel', this.panzoom.zoomWithWheel);
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

    document.getElementById('reset-zoom-btn')?.addEventListener('click', (e) => {
      this.panzoom.reset({ animate: true });
      e.target.classList.add('hidden');
    });

    let showToilets = false;
    const mapImage = document.getElementById('map-image');
    document.getElementById('toilet-btn')?.addEventListener('click', (e) => {
      showToilets = !showToilets;
      if (showToilets) {
        mapImage.src = 'assets/saalplan_toiletten.png'; 
        e.target.innerText = '🗺️ Saalplan';
        e.target.classList.replace('btn-creme', 'btn-gold');
      } else {
        mapImage.src = 'assets/saalplan.png';
        e.target.innerText = '🚻 Toiletten';
        e.target.classList.replace('btn-gold', 'btn-creme');
      }
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
    const container = document.getElementById('map-container');
    const scale = 1.7;

    const cw = container.clientWidth || container.offsetWidth;
    const ch = container.clientHeight || container.offsetHeight;
    
    const panX = (cw * ((50 - table.x) / 100));
    const panY = (ch * ((50 - table.y) / 100));

    // Beide Befehle nacheinander triggern flüssige Simultan-Animation
    this.panzoom.zoom(scale, { animate: true });
    this.panzoom.pan(panX, panY, { animate: true });

    document.getElementById('reset-zoom-btn').classList.remove('hidden');

    const tablesLayer = document.getElementById('tables-layer');
    tablesLayer.innerHTML = '';

    const highlight = document.createElement('div');
    highlight.className = 'table-highlight';

    const isBrautTisch = table.id === 'brauttisch' || table.name.toLowerCase().includes('braut');
    
    const width = table.width || (isBrautTisch ? 62 : 13.2);
    const height = table.height || (isBrautTisch ? 16 : 15.3);

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
