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
    this.deletedGuests = []; // Für Undo-Funktion
    this.loadFeatureSettings();
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

  loadFeatureSettings() {
    const savedSettings = localStorage.getItem('wedding_feature_settings');
    if (savedSettings) {
      this.config.features = { ...this.config.features, ...JSON.parse(savedSettings) };
    }
    this.applyFeatureSettings();
  }

  saveFeatureSettings() {
    localStorage.setItem('wedding_feature_settings', JSON.stringify(this.config.features));
    this.applyFeatureSettings();
  }

  applyFeatureSettings() {
    // Dark Mode
    if (this.config.features.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Feature-Buttons ein/ausblenden
    const toiletBtn = document.getElementById('toilet-btn');
    const speechBtn = document.getElementById('speech-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');

    if (toiletBtn) {
      toiletBtn.style.display = this.config.features.toiletToggle ? 'inline-flex' : 'none';
    }
    if (speechBtn) {
      speechBtn.style.display = this.config.features.speechGreeting ? 'inline-flex' : 'none';
    }
    if (darkModeBtn) {
      darkModeBtn.style.display = 'inline-flex';
      darkModeBtn.textContent = this.config.features.darkMode ? '☀️' : '🌙';
      darkModeBtn.title = this.config.features.darkMode ? 'Hellmodus' : 'Dark Mode';
    }
  }

  showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
  }

  hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
  }

  async init() {
    this.applyConfig();
    await this.loadData();

    this.searchModule = new SearchModule(this.data.guests, this.data.tables, (guest) => this.onGuestSelected(guest));
    this.adminModule = new AdminModule(this.data, () => this.onDataUpdated(), this.config, this.deletedGuests);

    this.initPanzoom();
    this.setupEventListeners();
  }

  initPanzoom() {
    const mapContainer = document.getElementById('map-container');
    const viewport = document.getElementById('map-viewport');
    
    this.panzoom = Panzoom(mapContainer, {
      maxScale: 4,
      minScale: 1,
      step: 0.3,
      contain: 'outside'
    });

    viewport.addEventListener('wheel', this.panzoom.zoomWithWheel);
  }

  applyConfig() {
    document.getElementById('app-title').innerText = `${this.config.names.bride} & ${this.config.names.groom}`;
    document.getElementById('photo-link').href = this.config.photoAlbumUrl;
    this.applyFeatureSettings();
  }

  async loadData() {
    this.showLoading();
    try {
      const res = await fetch('data.json');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const jsonData = await res.json();
      this.data.tables = jsonData.tables;

      const savedGuestsRaw = localStorage.getItem('wedding_guests_custom');
      let savedGuests = savedGuestsRaw ? JSON.parse(savedGuestsRaw) : null;

      if (savedGuests && savedGuests.some(g => g.firstName === "Gast 1" || g.firstName === "Gast")) {
        localStorage.removeItem('wedding_guests_custom');
        savedGuests = null;
      }

      this.data.guests = savedGuests ? savedGuests : jsonData.guests;

      // Sicherstellen, dass alle Gäste die neuen Felder haben
      this.data.guests = this.data.guests.map(guest => ({
        ...guest,
        notes: guest.notes || '',
        dietary: guest.dietary || '',
        allergies: guest.allergies || ''
      }));

      console.log(`Erfolgreich ${this.data.guests.length} Gäste geladen`);
    } catch (e) {
      console.error("Fehler beim Laden von data.json", e);
      alert("Fehler beim Laden der Daten. Bitte überprüfe deine Internetverbindung.");
      this.data.guests = []; // Fallback
    } finally {
      this.hideLoading();
    }
  }

  onDataUpdated() {
    this.searchModule.updateGuests(this.data.guests);
  }

  setupEventListeners() {
    document.getElementById('speech-btn')?.addEventListener('click', () => {
      if (this.config.features.speechGreeting) {
        alert(`💬 Brautpaar Spruch:\n\n"${getRandomSpeech()}"`);
      }
    });

    document.getElementById('reset-zoom-btn')?.addEventListener('click', (e) => {
      this.panzoom.reset({ animate: true });
      e.target.classList.add('hidden');
    });

    let showToilets = false;
    const mapImage = document.getElementById('map-image');
    document.getElementById('toilet-btn')?.addEventListener('click', (e) => {
      if (!this.config.features.toiletToggle) return;

      showToilets = !showToilets;
      if (showToilets) {
        mapImage.src = 'assets/saalplan_toiletten.png';
        e.target.innerText = '🗺️ Plan';
        e.target.classList.replace('btn-creme', 'btn-gold');
      } else {
        mapImage.src = 'assets/saalplan.png';
        e.target.innerText = '🚻 WC';
        e.target.classList.replace('btn-gold', 'btn-creme');
      }
    });

    // Dark Mode Toggle
    document.getElementById('dark-mode-btn')?.addEventListener('click', () => {
      this.config.features.darkMode = !this.config.features.darkMode;
      this.saveFeatureSettings();
    });

    // Music Button
    document.getElementById('music-btn')?.addEventListener('click', () => {
      const musicDialog = document.getElementById('music-dialog');
      if (musicDialog) {
        musicDialog.showModal();
        // Load saved Spotify URL
        const savedUrl = localStorage.getItem('wedding_spotify_url');
        if (savedUrl) {
          document.getElementById('spotify-url-input').value = savedUrl;
          document.getElementById('spotify-link').href = savedUrl;
          document.getElementById('spotify-link-section').classList.remove('hidden');
        }
      }
    });

    // Save Spotify URL
    document.getElementById('save-spotify-btn')?.addEventListener('click', () => {
      const url = document.getElementById('spotify-url-input').value;
      localStorage.setItem('wedding_spotify_url', url);
      document.getElementById('spotify-link').href = url;
      document.getElementById('spotify-link-section').classList.remove('hidden');
      this.config.photoAlbumUrl = url; // Update config if needed
    });

    // Close Music Dialog
    document.getElementById('music-close-btn')?.addEventListener('click', () => {
      document.getElementById('music-dialog').close();
    });

    // Taxi Button
    document.getElementById('taxi-btn')?.addEventListener('click', () => {
      const taxiDialog = document.getElementById('taxi-dialog');
      if (taxiDialog) {
        taxiDialog.showModal();
        this.loadTaxiCompanies();
      }
    });

    // Close Taxi Dialog
    document.getElementById('taxi-close-btn')?.addEventListener('click', () => {
      document.getElementById('taxi-dialog').close();
    });
  }

  loadTaxiCompanies() {
    const taxiList = document.getElementById('taxi-list');
    if (!taxiList) return;

    // Taxi companies from original implementation
    const taxiCompanies = [
      { name: 'Taxi Tibljas', phone: '+499281794111' },
      { name: 'Taxi 8088', phone: '+4992818088' },
      { name: 'Taxi Frisch', phone: '+4992814866 oder +499281833010' },
      { name: 'Taxi 3033 Hof', phone: '+4992813033' }
    ];

    taxiList.innerHTML = '';
    taxiCompanies.forEach(company => {
      const item = document.createElement('div');
      item.className = 'disambiguation-btn';
      item.innerHTML = `
        <div>
          <strong>${company.name}</strong><br>
          <small>${company.phone}</small>
        </div>
        <a href="tel:${company.phone.split(' oder ')[0].replace(/\s/g, '')}" class="btn-gold" style="text-decoration:none; padding:0.3rem 0.6rem; font-size:0.8rem;">Anrufen</a>
      `;
      taxiList.appendChild(item);
    });
  }

  onGuestSelected(guest) {
    const table = this.data.tables.find(t => t.id === guest.tableId);
    if (!table) return;

    const guestName = `${guest.firstName} ${guest.lastNameInitial || ''}`.trim();
    const tableName = table.name.replace('Tisch ', 'Tisch ');

    document.getElementById('target-guest-info').innerText = `${guestName} ➔ ${tableName}`;
    document.getElementById('target-seat-info').innerText = `Dein Sitzplatz ist Nummer ${guest.seat}`;

    // Gästehinweise anzeigen wenn aktiviert und vorhanden
    this.showGuestNotes(guest);

    // NEU: Scrollt automatisch sanft zur Karte hinunter
    document.getElementById('map-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

    this.focusTable(table);

    if (this.config.features.confettiAnimation) {
      this.animationEngine.triggerConfetti();
    }

    if (this.config.features.speechGreeting) {
      speakGreeting(guest.firstName, table.name, guest.seat);
    }
  }

  showGuestNotes(guest) {
    const notesSection = document.getElementById('guest-notes-section');
    const notesContent = document.getElementById('guest-notes-content');

    if (!this.config.features.guestNotes) {
      notesSection.classList.remove('active');
