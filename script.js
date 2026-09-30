/**
 * VOLCANEX - Interactive Earth & Life Science Exhibit
 * script.js (Refactored & Fixed)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initParticleCanvas();
  initInteractiveMap();
  initMapZoom();
  initVolcanoGallery();
  initStepper();
  initSimulation();
  initModal();
});

/* ==========================================================================
   1. NAVIGATION & SMOOTH SCROLL
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header background transition
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    highlightActiveNavLink();
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');
    });
  }

  // Close mobile nav on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (mobileToggle) {
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
}

function highlightActiveNavLink() {
  const sections = document.querySelectorAll('main section[id]');
  const scrollPos = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);

    if (link) {
      if (scrollPos >= top && scrollPos < top + height) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });
}

/* ==========================================================================
   2. HERO VOLCANIC ASH CANVAS PARTICLES
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('ash-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationFrameId;

  function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class AshParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 20;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = -(Math.random() * 1.2 + 0.3);
      this.speedX = Math.random() * 0.8 - 0.4;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.color = Math.random() > 0.4 ? '224, 122, 95' : '244, 241, 222';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const particleCount = Math.min(Math.floor(window.innerWidth / 15), 60);
  for (let i = 0; i < particleCount; i++) {
    const p = new AshParticle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   3. VOLCANO DATA & INTERACTIVE MAP
   ========================================================================== */
const VOLCANO_DATA = [
  {
    id: 'pinatubo',
    name: 'Mount Pinatubo',
    location: 'Zambales / Tarlac / Pampanga',
    arc: 'Luzon Volcanic Arc',
    arcBelonging: true,
    trench: 'Manila Trench',
    type: 'Stratovolcano / Caldera',
    lastEruption: '1991 (Ultra-Plinian) / 2021 (Phreatic)',
    elevation: '1,486 m',
    image: 'img/pinatubo.jpg',
    description: 'Pinatubo formed as a direct result of eastward subduction along the Manila Trench. Its 1991 eruption produced the 2nd largest terrestrial eruption of the 20th century, injecting millions of tons of SO2 into the stratosphere and lowering global temperatures.',
    hazards: ['Pyroclastic Flows', 'Extensive Lahars', 'Ashfall', 'Caldera Formation']
  },
  {
    id: 'taal',
    name: 'Taal Volcano',
    location: 'Batangas, Luzon',
    arc: 'Luzon Volcanic Arc',
    arcBelonging: true,
    trench: 'Manila Trench',
    type: 'Complex Volcano / Caldera',
    lastEruption: '2020 - 2022',
    elevation: '311 m',
    image: 'img/taal.jpg',
    description: 'Situated within a large prehistoric caldera lake, Taal is a highly active complex volcano associated with the southern section of the Luzon Volcanic Arc system driven by Manila Trench subduction.',
    hazards: ['Base Surges', 'Volcanic Tsunami', 'Ashfall', 'Phreatomagmatic Eruptions']
  },
  {
    id: 'babuyan',
    name: 'Babuyan Claro',
    location: 'Babuyan Islands, Cagayan',
    arc: 'Luzon Volcanic Arc',
    arcBelonging: true,
    trench: 'Manila Trench',
    type: 'Stratovolcano',
    lastEruption: '1913',
    elevation: '843 m',
    image: 'img/babuyan.jpg',
    description: 'Located on Babuyan Island north of mainland Luzon, this volcano marks the northern extension of the Luzon Arc offshore segment created by Manila Trench subduction.',
    hazards: ['Ashfall', 'Lava Flows', 'Pyroclastic Surges']
  },
  {
    id: 'mayon',
    name: 'Mayon Volcano',
    location: 'Albay, Bicol Region',
    arc: 'Bicol Volcanic Arc',
    arcBelonging: false,
    trench: 'Philippine Trench',
    type: 'Stratovolcano (Symmetrical Cone)',
    lastEruption: '2023 - 2024 (Strombolian)',
    elevation: '2,463 m',
    image: 'img/mayon.jpg',
    description: 'Renowned globally for its near-perfect symmetrical cone. Mayon is formed by west-dipping subduction of the Philippine Sea Plate along the Philippine Trench—distinct from the Luzon Volcanic Arc.',
    hazards: ['Pyroclastic Density Currents', 'Lava Flows', 'Lahars', 'Ashfall']
  },
  {
    id: 'bulusan',
    name: 'Bulusan Volcano',
    location: 'Sorsogon, Bicol Region',
    arc: 'Bicol Volcanic Arc',
    arcBelonging: false,
    trench: 'Philippine Trench',
    type: 'Stratovolcano / Caldera Complex',
    lastEruption: '2022 (Phreatic)',
    elevation: '1,565 m',
    image: 'img/bulusan.jpg',
    description: 'The southernmost volcano on Luzon Island, Bulusan is part of the Bicol Volcanic Chain powered by Philippine Trench dynamics.',
    hazards: ['Phreatic Ash Explosions', 'Lahars', 'Mudflows']
  },
  {
    id: 'kanlaon',
    name: 'Kanlaon Volcano',
    location: 'Negros Occidental / Oriental',
    arc: 'Negros Volcanic Arc',
    arcBelonging: false,
    trench: 'Sulu Trench / Negros Trench',
    type: 'Stratovolcano',
    lastEruption: '2024',
    elevation: '2,435 m',
    image: 'img/kanlaon.jpg',
    description: 'The highest peak in the Visayas, Kanlaon is an active stratovolcano formed by subduction along the western offshore Negros Trench system.',
    hazards: ['Phreatic Eruptions', 'Ashfall', 'Pyroclastic Flows']
  },
  {
    id: 'matutum',
    name: 'Mount Matutum',
    location: 'South Cotabato, Mindanao',
    arc: 'Cotabato Volcanic Arc',
    arcBelonging: false,
    trench: 'Cotabato Trench',
    type: 'Stratovolcano',
    lastEruption: '1911 (Unconfirmed)',
    elevation: '2,286 m',
    image: 'img/matutum.jpg',
    description: 'A symmetrical stratovolcano in southern Mindanao driven by complex collision and subduction along the Cotabato Trench.',
    hazards: ['Pyroclastic Flows', 'Ashfall', 'Landslides']
  }
];

function initInteractiveMap() {
  const markers = document.querySelectorAll('#ph-svg-map .marker');
  const filterBtns = document.querySelectorAll('[data-map-filter]');
  const infoPanel = document.getElementById('map-info-panel');
  const panelContent = document.getElementById('panel-content');
  const placeholder = infoPanel ? infoPanel.querySelector('.panel-placeholder') : null;

  if (!markers.length) return;

  markers.forEach(marker => {
    const handleSelect = (e) => {
      e.preventDefault();
      
      markers.forEach(m => m.classList.remove('selected'));
      marker.classList.add('selected');

      const volcanoId = marker.getAttribute('data-id');
      const data = VOLCANO_DATA.find(v => v.id === volcanoId);

      if (data && panelContent) {
        panelContent.classList.remove('visible');

        setTimeout(() => {
          if (placeholder) {
            placeholder.classList.add('hidden');
          }

          panelContent.innerHTML = `
            <img src="${data.image}" alt="${data.name}" class="volcano-info-image">
            <div class="panel-header">
              <span class="badge ${data.arcBelonging ? 'badge-arc' : 'badge-other'}">
                ${data.arcBelonging ? 'Luzon Volcanic Arc' : 'Other Regional Arc'}
              </span>
              <h3>${data.name}</h3>
              <p class="loc">📍 ${data.location}</p>
            </div>
            <div class="panel-details">
              <div class="detail-row">
                <span>Associated Trench:</span>
                <strong>${data.trench}</strong>
              </div>
              <div class="detail-row">
                <span>Volcano Type:</span>
                <strong>${data.type}</strong>
              </div>
              <div class="detail-row">
                <span>Recent Activity:</span>
                <strong>${data.lastEruption}</strong>
              </div>
              <div class="detail-row">
                <span>Elevation:</span>
                <strong>${data.elevation}</strong>
              </div>
            </div>
            <p class="panel-desc">${data.description}</p>
            <div class="panel-hazards">
              <strong>Key Hazards:</strong>
              <div class="hazard-tags">
                ${data.hazards.map(h => `<span class="tag">${h}</span>`).join('')}
              </div>
            </div>
          `;

          panelContent.classList.add('visible');
        }, 150);
      }
    };

    marker.addEventListener('click', handleSelect);
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-map-filter');

      markers.forEach(marker => {
        if (filter === 'all') {
          marker.style.display = 'block';
          marker.style.opacity = '1';
        } else if (filter === 'luzon-arc') {
          if (marker.classList.contains('luzon-arc')) {
            marker.style.display = 'block';
            marker.style.opacity = '1';
          } else {
            marker.style.opacity = '0.15';
          }
        } else if (filter === 'other-arc') {
          if (marker.classList.contains('other-arc')) {
            marker.style.display = 'block';
            marker.style.opacity = '1';
          } else {
            marker.style.opacity = '0.15';
          }
        }
      });
    });
  });
}

function initMapZoom() {
  const map = document.getElementById('ph-svg-map');
  const zoomIn = document.getElementById('zoom-in');
  const zoomOut = document.getElementById('zoom-out');
  const zoomReset = document.getElementById('zoom-reset');

  if (!map || !zoomIn || !zoomOut || !zoomReset) return;

  const defaultView = { x: 0, y: 0, width: 600, height: 800 };
  let view = { ...defaultView };

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startViewX = 0;
  let startViewY = 0;

  function updateMap() {
    map.setAttribute('viewBox', `${view.x} ${view.y} ${view.width} ${view.height}`);
  }

  function zoom(factor) {
    const newWidth = view.width * factor;
    const newHeight = view.height * factor;

    if (newWidth < 250 || newWidth > 600) return;

    const centerX = view.x + view.width / 2;
    const centerY = view.y + view.height / 2;

    view.width = newWidth;
    view.height = newHeight;
    view.x = centerX - newWidth / 2;
    view.y = centerY - newHeight / 2;

    updateMap();
  }

  zoomIn.addEventListener('click', () => zoom(0.8));
  zoomOut.addEventListener('click', () => zoom(1.25));
  zoomReset.addEventListener('click', () => {
    view = { ...defaultView };
    updateMap();
  });

  map.addEventListener('wheel', (event) => {
    event.preventDefault();
    zoom(event.deltaY < 0 ? 0.9 : 1.1);
  }, { passive: false });

  map.addEventListener('mousedown', (event) => {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startViewX = view.x;
    startViewY = view.y;
    map.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    const rect = map.getBoundingClientRect();
    const scaleX = view.width / rect.width;
    const scaleY = view.height / rect.height;

    view.x = startViewX - (event.clientX - startX) * scaleX;
    view.y = startViewY - (event.clientY - startY) * scaleY;

    updateMap();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    map.style.cursor = 'grab';
  });

  map.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) return;
    isDragging = true;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    startViewX = view.x;
    startViewY = view.y;
  }, { passive: true });

  map.addEventListener('touchmove', (event) => {
    if (!isDragging || event.touches.length !== 1) return;
    const rect = map.getBoundingClientRect();
    const scaleX = view.width / rect.width;
    const scaleY = view.height / rect.height;

    view.x = startViewX - (event.touches[0].clientX - startX) * scaleX;
    view.y = startViewY - (event.touches[0].clientY - startY) * scaleY;

    updateMap();
  }, { passive: true });

  map.addEventListener('touchend', () => {
    isDragging = false;
  });

  map.style.cursor = 'grab';
}

/* ==========================================================================
   4. VOLCANO GALLERY & SEARCH/FILTER
   ========================================================================== */
function initVolcanoGallery() {
  const grid = document.getElementById('volcano-grid');
  const searchInput = document.getElementById('volcano-search');
  const filterBtns = document.querySelectorAll('.gallery-controls .filter-btn');

  if (!grid) return;

  let activeFilter = 'all';

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const filtered = VOLCANO_DATA.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(query) ||
                            v.location.toLowerCase().includes(query) ||
                            v.trench.toLowerCase().includes(query);

      let matchesFilter = true;
      if (activeFilter === 'luzon') {
        matchesFilter = v.arcBelonging;
      } else if (activeFilter === 'stratovolcano') {
        matchesFilter = v.type.toLowerCase().includes('stratovolcano');
      } else if (activeFilter === 'complex') {
        matchesFilter = v.type.toLowerCase().includes('complex') || v.type.toLowerCase().includes('caldera');
      }

      return matchesSearch && matchesFilter;
    });

    renderVolcanoes(filtered);
  }

  function renderVolcanoes(data) {
    grid.innerHTML = '';
    if (data.length === 0) {
      grid.innerHTML = `<div class="no-results"><p>No volcanoes match your filter criteria.</p></div>`;
      return;
    }

    data.forEach(v => {
      const card = document.createElement('div');
      card.className = 'volcano-card';
      card.innerHTML = `
        <div class="card-badge ${v.arcBelonging ? 'badge-luzon' : 'badge-other'}">
          ${v.arcBelonging ? 'Luzon Arc' : 'Regional System'}
        </div>
        <h3 class="card-title">${v.name}</h3>
        <p class="card-subtitle">📍 ${v.location}</p>
        <div class="card-meta">
          <div><span>Trench:</span> <strong>${v.trench}</strong></div>
          <div><span>Type:</span> <strong>${v.type}</strong></div>
          <div><span>Eruption:</span> <strong>${v.lastEruption}</strong></div>
        </div>
        <button class="btn btn-sm btn-outline card-btn" data-modal-id="${v.id}">View Full Geological Profile</button>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll('[data-modal-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-modal-id');
        openVolcanoModal(id);
      });
    });
  }

  renderVolcanoes(VOLCANO_DATA);

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });
}

/* ==========================================================================
   5. TIMELINE STEPPER
   ========================================================================== */
function initStepper() {
  const stepBtns = document.querySelectorAll('.stepper-nav .step-btn');
  const stepPanels = document.querySelectorAll('.stepper-content .step-panel');

  if (!stepBtns.length) return;

  stepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = btn.getAttribute('data-step-target');

      stepBtns.forEach(b => b.classList.remove('active'));
      stepPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`step-panel-${targetStep}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   6. SIMULATION CANVAS ("BUILD THE ARC")
   ========================================================================== */
function initSimulation() {
  const canvas = document.getElementById('sim-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const statusText = document.getElementById('sim-status-text');

  const btn1 = document.getElementById('sim-step-1');
  const btn2 = document.getElementById('sim-step-2');
  const btn3 = document.getElementById('sim-step-3');
  const btn4 = document.getElementById('sim-step-4');
  const btn5 = document.getElementById('sim-step-5');
  const btnReset = document.getElementById('sim-reset');

  let currentStep = 0;

  function drawBase() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky / Ocean
    ctx.fillStyle = '#0B132B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ocean Water Label
    ctx.fillStyle = '#3A506B';
    ctx.fillRect(0, 100, 260, 40);
    ctx.fillStyle = '#64DFDF';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Oceanic Water (South China Sea)', 20, 125);

    // Asthenosphere / Mantle
    ctx.fillStyle = '#1C2541';
    ctx.fillRect(0, 140, canvas.width, canvas.height - 140);
    ctx.fillStyle = '#5C6B73';
    ctx.fillText('Upper Mantle (Asthenosphere)', 20, 320);

    // Overriding Plate (Philippine Mobile Belt)
    ctx.fillStyle = '#2B3A4E';
    ctx.beginPath();
    ctx.moveTo(260, 140);
    ctx.lineTo(canvas.width, 140);
    ctx.lineTo(canvas.width, 350);
    ctx.lineTo(380, 350);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#F4F1DE';
    ctx.fillText('Overriding Continental / Island Arc Crust', 420, 170);
  }

  function renderStep(step) {
    drawBase();

    if (step >= 1) {
      ctx.fillStyle = '#3A506B';
      ctx.beginPath();
      ctx.moveTo(0, 140);
      ctx.lineTo(260, 140);
      ctx.lineTo(260 + (step >= 2 ? 150 : 0), 140 + (step >= 2 ? 170 : 0));
      ctx.lineTo(200 + (step >= 2 ? 150 : 0), 140 + (step >= 2 ? 170 : 0));
      ctx.lineTo(0, 160);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#E07A5F';
      ctx.fillText('▼ Manila Trench', 230, 130);
    }

    if (step >= 3) {
      ctx.fillStyle = 'rgba(100, 223, 223, 0.4)';
      ctx.beginPath();
      ctx.arc(330, 260, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64DFDF';
      ctx.fillText('💧 Dehydration & Flux Melting', 360, 265);
    }

    if (step >= 4) {
      ctx.fillStyle = 'rgba(224, 122, 95, 0.8)';
      ctx.beginPath();
      ctx.arc(480, 200, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillRect(476, 140, 8, 60);

      ctx.fillStyle = '#E07A5F';
      ctx.fillText('🔥 Buoyant Magma Rising', 510, 205);
    }

    if (step >= 5) {
      ctx.fillStyle = '#E07A5F';
      ctx.beginPath();
      ctx.moveTo(440, 140);
      ctx.lineTo(480, 80);
      ctx.lineTo(520, 140);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(244, 241, 222, 0.7)';
      ctx.beginPath();
      ctx.arc(480, 60, 15, 0, Math.PI * 2);
      ctx.arc(470, 45, 12, 0, Math.PI * 2);
      ctx.arc(495, 45, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F4F1DE';
      ctx.font = 'bold 14px Chakra Petch, sans-serif';
      ctx.fillText('🌋 LUZON VOLCANIC ARC', 410, 30);
    }
  }

  drawBase();

  if (btn1) {
    btn1.addEventListener('click', () => {
      currentStep = 1;
      renderStep(1);
      if (statusText) statusText.textContent = "Step 1: Oceanic slab of the South China Sea moves toward the overriding Philippine Mobile Belt.";
      if (btn2) btn2.disabled = false;
    });
  }

  if (btn2) {
    btn2.addEventListener('click', () => {
      currentStep = 2;
      renderStep(2);
      if (statusText) statusText.textContent = "Step 2: Subduction occurs. The oceanic slab sinks downward into the high-temperature mantle at the Manila Trench.";
      if (btn3) btn3.disabled = false;
    });
  }

  if (btn3) {
    btn3.addEventListener('click', () => {
      currentStep = 3;
      renderStep(3);
      if (statusText) statusText.textContent = "Step 3: Flux Melting! Sinking hydrated minerals release water, lowering the melting point of mantle rocks.";
      if (btn4) btn4.disabled = false;
    });
  }

  if (btn4) {
    btn4.addEventListener('click', () => {
      currentStep = 4;
      renderStep(4);
      if (statusText) statusText.textContent = "Step 4: Magma Ascent! The hot, buoyant magma collects in chambers and begins forcing its way up through crustal fractures.";
      if (btn5) btn5.disabled = false;
    });
  }

  if (btn5) {
    btn5.addEventListener('click', () => {
      currentStep = 5;
      renderStep(5);
      if (statusText) statusText.textContent = "Step 5: Eruption & Arc Construction! Over millions of years, eruptions build a line of volcanoes parallel to the Manila Trench: The Luzon Volcanic Arc.";
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      currentStep = 0;
      drawBase();
      if (statusText) statusText.textContent = "Click Step 1 to position the subducting oceanic slab beneath the overriding crust.";
      if (btn2) btn2.disabled = true;
      if (btn3) btn3.disabled = true;
      if (btn4) btn4.disabled = true;
      if (btn5) btn5.disabled = true;
    });
  }
}

/* ==========================================================================
   7. DETAIL MODAL DIALOG
   ========================================================================== */
function initModal() {
  const modal = document.getElementById('volcano-modal');
  const closeBtn = document.getElementById('modal-close');
  const modalBody = document.getElementById('modal-body');

  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  window.openVolcanoModal = function(id) {
    const data = VOLCANO_DATA.find(v => v.id === id);
    if (!data || !modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-header">
        <span class="badge ${data.arcBelonging ? 'badge-arc' : 'badge-other'}">
          ${data.arcBelonging ? 'Luzon Volcanic Arc System' : 'Regional Volcanic Chain'}
        </span>
        <h2>${data.name}</h2>
        <p class="modal-sub">📍 ${data.location}</p>
      </div>

      <div class="modal-grid">
        <div class="modal-stat">
          <span class="stat-label">Subduction Trench</span>
          <span class="stat-val">${data.trench}</span>
        </div>
        <div class="modal-stat">
          <span class="stat-label">Volcano Type</span>
          <span class="stat-val">${data.type}</span>
        </div>
        <div class="modal-stat">
          <span class="stat-label">Recent Activity</span>
          <span class="stat-val">${data.lastEruption}</span>
        </div>
        <div class="modal-stat">
          <span class="stat-label">Elevation</span>
          <span class="stat-val">${data.elevation}</span>
        </div>
      </div>

      <div class="modal-section">
        <h3>Geological Context</h3>
        <p>${data.description}</p>
      </div>

      <div class="modal-section">
        <h3>Primary Hazards & Features</h3>
        <div class="hazard-tags">
          ${data.hazards.map(h => `<span class="tag tag-lg">${h}</span>`).join('')}
        </div>
      </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}
