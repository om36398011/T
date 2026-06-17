// main.js – SPA Router, Side Panels, Modals, Particles & Global Interactivity (standard global script version)

// Page Title Mapping
const PAGE_TITLES = {
  dashboard: 'Hidden Trade-Offs | Sustainability Dashboard',
  tradeoff: 'Hidden Trade-Offs | Trade-Off Analysis',
  sector: 'Hidden Trade-Offs | Sector Analysis',
  trend: 'Hidden Trade-Offs | Trend Analysis',
  scenario: 'Hidden Trade-Offs | Scenario Simulator'
};

let activePage = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: true });
  }

  generateParticles();
  setupSidebar();
  setupRipples();
  setupOverlays();
  setupRouteHandler();
});

// SPA Router using local <template> tags (completely CORS-free!)
window.navigateToPage = function(pageName) {
  const contentContainer = document.getElementById('page-content');
  if (!contentContainer) return;

  // Exit Animation
  contentContainer.classList.add('page-exit');
  contentContainer.classList.add('page-exit-active');

  setTimeout(() => {
    try {
      const template = document.getElementById(`tpl-${pageName}`);
      if (!template) throw new Error(`Template tpl-${pageName} not found`);
      
      // Clear and clone content
      contentContainer.innerHTML = '';
      contentContainer.appendChild(template.content.cloneNode(true));
      
      // Update page title
      document.title = PAGE_TITLES[pageName] || 'Hidden Trade-Offs';

      // Update Sidebar highlights
      document.querySelectorAll('.menu-link').forEach(link => {
        if (link.dataset.page === pageName) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });

      // Clear Chart references
      if (window.destroySimulatedChart) window.destroySimulatedChart();
      activePage = pageName;

      // Page-specific initializers
      if (pageName === 'dashboard' && window.loadDashboard) {
        window.loadDashboard();
      } else if (pageName === 'tradeoff') {
        if (window.initTradeoffBubbleChart) window.initTradeoffBubbleChart();
        setupTradeoffControls();
      } else if (pageName === 'sector') {
        if (window.initSectorDoughnutCharts) window.initSectorDoughnutCharts();
        setupSectorProfiles();
      } else if (pageName === 'trend') {
        if (window.initTimelineExplorationChart) window.initTimelineExplorationChart();
        setupTimelineExplorationControls();
      } else if (pageName === 'scenario') {
        setupFutureSimulatorControls();
      }

      // Re-trigger AOS animations
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }

      // Enter Transition Animation
      contentContainer.classList.remove('page-exit', 'page-exit-active');
      contentContainer.classList.add('page-enter');
      requestAnimationFrame(() => {
        contentContainer.classList.add('page-enter-active');
        setTimeout(() => {
          contentContainer.classList.remove('page-enter', 'page-enter-active');
        }, 400);
      });

    } catch (error) {
      console.error(error);
      contentContainer.innerHTML = `
        <div class="p-5 text-center">
          <i class="fas fa-triangle-exclamation text-danger fs-1 mb-3"></i>
          <h4>Error Loading Panel Fragment</h4>
          <p class="text-secondary">${error.message}</p>
        </div>
      `;
    }
  }, 250);
};

function setupRouteHandler() {
  const hash = window.location.hash.substring(1);
  const defaultPage = hash && PAGE_TITLES[hash] ? hash : 'dashboard';
  window.navigateToPage(defaultPage);

  window.addEventListener('hashchange', () => {
    const targetHash = window.location.hash.substring(1);
    if (PAGE_TITLES[targetHash]) {
      window.navigateToPage(targetHash);
    }
  });
}

function setupSidebar() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth < 992 && sidebar && sidebar.classList.contains('active')) {
      if (!sidebar.contains(e.target) && e.target !== toggleBtn) {
        sidebar.classList.remove('active');
      }
    }
  });

  document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      window.location.hash = page;
      if (window.innerWidth < 992) {
        sidebar.classList.remove('active');
      }
    });
  });
}

function setupRipples() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.btn-ripple');
    if (target) {
      const circle = document.createElement('span');
      circle.classList.add('ripple-circle');
      
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;
      
      target.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    }
  });
}

function setupOverlays() {
  const backdrop = document.getElementById('overlay-backdrop');
  
  backdrop?.addEventListener('click', closeAllOverlays);

  document.getElementById('panelCloseBtn')?.addEventListener('click', closeSidePanel);
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);

  document.getElementById('notificationBtn')?.addEventListener('click', () => {
    window.openSidePanel('Notifications', renderNotifications());
  });

  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    window.openSidePanel('Preferences', renderPreferences());
  });

  document.getElementById('profileBtn')?.addEventListener('click', () => {
    window.openSidePanel('My Profile', renderProfile());
  });

  document.getElementById('filterBtn')?.addEventListener('click', () => {
    window.openModal('Filter Analysis Parameters', renderFilterPanel());
  });
}

window.openSidePanel = function(title, bodyHtml) {
  const panel = document.getElementById('side-panel');
  const backdrop = document.getElementById('overlay-backdrop');
  
  document.getElementById('panel-title').innerText = title;
  document.getElementById('panel-body').innerHTML = bodyHtml;
  
  backdrop.classList.add('active');
  panel.classList.add('active');
  
  panel.setAttribute('tabindex', '-1');
  panel.focus();

  bindPanelInteractivity(title);
};

function closeSidePanel() {
  const panel = document.getElementById('side-panel');
  if (panel) panel.classList.remove('active');
  checkBackdropState();
}

window.openModal = function(title, bodyHtml) {
  const modal = document.getElementById('modal-overlay');
  const backdrop = document.getElementById('overlay-backdrop');
  
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  
  backdrop.classList.add('active');
  modal.classList.add('active');

  modal.setAttribute('tabindex', '-1');
  modal.focus();

  document.getElementById('applyFilterBtn')?.addEventListener('click', () => {
    closeModal();
    window.openSidePanel('Notification Status', '<div class="alert alert-success">Filters applied successfully. Refreshed charts data.</div>');
  });
};

window.closeModal = function() {
  const modal = document.getElementById('modal-overlay');
  if (modal) modal.classList.remove('active');
  checkBackdropState();
};

function closeAllOverlays() {
  closeSidePanel();
  window.closeModal();
}

function checkBackdropState() {
  const panel = document.getElementById('side-panel');
  const modal = document.getElementById('modal-overlay');
  if (panel && modal && !panel.classList.contains('active') && !modal.classList.contains('active')) {
    document.getElementById('overlay-backdrop').classList.remove('active');
  }
}

function generateParticles() {
  const container = document.getElementById('particle-container');
  if (!container) return;

  const count = 12;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    const size = Math.random() * 200 + 80;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particle.style.animationDuration = `${Math.random() * 20 + 15}s`;
    
    container.appendChild(particle);
  }
}

function renderNotifications() {
  return `
    <div class="d-flex flex-column gap-3" id="notification-list">
      <div class="p-3 border rounded notification-item unread position-relative" style="cursor:pointer; border-left: 4px solid var(--danger) !important;">
        <span class="badge-dot" style="top: 8px; right: 8px;"></span>
        <h6 class="fw-bold mb-1 small text-dark">High Emissions Alert</h6>
        <p class="text-secondary mb-0" style="font-size:0.75rem;">Methane emissions exceeded limits in APAC by 5%.</p>
        <small class="text-muted mt-2 d-block">10 mins ago</small>
      </div>
      <div class="p-3 border rounded notification-item position-relative" style="cursor:pointer; border-left: 4px solid var(--success) !important;">
        <h6 class="fw-bold mb-1 small text-dark">Recent Report Upload</h6>
        <p class="text-secondary mb-0" style="font-size:0.75rem;">Global Sustainability summary upload ready.</p>
        <small class="text-muted mt-2 d-block">2 hours ago</small>
      </div>
      <div class="p-3 border rounded notification-item position-relative" style="cursor:pointer; border-left: 4px solid var(--success) !important;">
        <h6 class="fw-bold mb-1 small text-dark">Data Update</h6>
        <p class="text-secondary mb-0" style="font-size:0.75rem;">New Agricultural Land statistics successfully integrated.</p>
        <small class="text-muted mt-2 d-block">1 day ago</small>
      </div>
      <div class="p-3 border rounded notification-item position-relative" style="cursor:pointer; border-left: 4px solid var(--success) !important;">
        <h6 class="fw-bold mb-1 small text-dark">Regional Analysis</h6>
        <p class="text-secondary mb-0" style="font-size:0.75rem;">Europe crop efficiency improved to 9.2%.</p>
        <small class="text-muted mt-2 d-block">3 days ago</small>
      </div>
      <a href="#" class="text-success text-center small fw-semibold mt-2 text-decoration-none">View all notifications</a>
    </div>
  `;
}

function renderPreferences() {
  return `
    <form class="d-flex flex-column gap-3">
      <div>
        <label class="form-label fw-bold mb-1">UI Appearance Mode</label>
        <select class="form-select form-select-sm">
          <option selected>Light Theme (SaaS Green)</option>
          <option>Dark Eco Mode</option>
          <option>High Contrast</option>
        </select>
      </div>
      <div>
        <label class="form-label fw-bold mb-1">Alert Notifications</label>
        <div class="form-check form-switch mb-1">
          <input class="form-check-input" type="checkbox" role="switch" id="notifCritical" checked>
          <label class="form-check-label small" for="notifCritical">Critical Resource Limits</label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="notifWeekly" checked>
          <label class="form-check-label small" for="notifWeekly">Weekly Summary Reports</label>
        </div>
      </div>
      <hr>
      <button type="button" class="btn btn-success btn-sm btn-ripple" id="savePrefsBtn">Save Preferences</button>
    </form>
  `;
}

function renderProfile() {
  return `
    <div class="text-center py-4 border-bottom mb-4">
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Avatar" class="rounded-circle mb-3 border" style="width: 80px; height:80px; object-fit:cover;" />
      <h6 class="fw-bold mb-1">Tulsi Mistry</h6>
      <p class="text-secondary small mb-0">Founder</p>
      <span class="badge bg-success mt-2">Admin</span>
    </div>
    <div class="d-flex flex-column gap-3">
      <div class="d-flex justify-content-between align-items-center p-2 border rounded">
        <div>
          <div class="small fw-bold">Profile</div>
          <div class="text-secondary" style="font-size: 0.7rem;">Manage your account settings</div>
        </div>
        <button class="btn btn-outline-success btn-xs btn-ripple">Edit</button>
      </div>
      <div class="d-flex justify-content-between align-items-center p-2 border rounded">
        <div>
          <div class="small fw-bold">Notifications</div>
          <div class="text-secondary" style="font-size: 0.7rem;">Configure alert preferences</div>
        </div>
        <div class="form-check form-switch mb-0">
          <input class="form-check-input" type="checkbox" role="switch" checked>
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center p-2 border rounded">
        <div>
          <div class="small fw-bold">Region & Language</div>
          <div class="text-secondary" style="font-size: 0.7rem;">English (US)</div>
        </div>
        <button class="btn btn-outline-success btn-xs btn-ripple">Change</button>
      </div>
      <div class="d-flex justify-content-between align-items-center p-2 border rounded">
        <div>
          <div class="small fw-bold">Privacy & Security</div>
          <div class="text-secondary" style="font-size: 0.7rem;">Manage data and connections</div>
        </div>
        <button class="btn btn-outline-success btn-xs btn-ripple">View</button>
      </div>
      <button class="btn btn-outline-danger btn-sm w-100 mt-2 btn-ripple" onclick="alert('Session logged out.')"><i class="fas fa-sign-out-alt me-2"></i>Logout</button>
    </div>
  `;
}

function renderFilterPanel() {
  return `
    <div class="d-flex flex-column gap-3">
      <div>
        <label class="form-label fw-bold mb-1" style="font-size: 0.85rem;">Regions</label>
        <div class="d-flex flex-wrap gap-2">
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="regAmericas" checked>
            <label class="form-check-label small" for="regAmericas">Americas</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="regAsia" checked>
            <label class="form-check-label small" for="regAsia">Asia</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="regEurope">
            <label class="form-check-label small" for="regEurope">Europe</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="regAfrica">
            <label class="form-check-label small" for="regAfrica">Africa</label>
          </div>
        </div>
      </div>
      
      <div>
        <label class="form-label fw-bold mb-1" style="font-size: 0.85rem;">Metrics</label>
        <div class="d-flex flex-column gap-1">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="metProd" checked>
            <label class="form-check-label small" for="metProd">Production</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="metEmis" checked>
            <label class="form-check-label small" for="metEmis">Emissions</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="metLand">
            <label class="form-check-label small" for="metLand">Land Use</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="metEff">
            <label class="form-check-label small" for="metEff">Efficiency</label>
          </div>
        </div>
      </div>

      <div>
        <div class="d-flex justify-content-between mb-1">
          <label class="form-label fw-bold mb-0" style="font-size: 0.85rem;">Emission Range (Mt CO2e)</label>
          <span class="small fw-semibold text-success">2000 - 7000</span>
        </div>
        <input type="range" class="form-range" min="1000" max="10000" step="500" value="4500">
        <div class="d-flex justify-content-between text-secondary" style="font-size: 0.7rem;">
          <span>1000</span>
          <span>10000</span>
        </div>
      </div>

      <div>
        <label class="form-label fw-bold mb-1" style="font-size: 0.85rem;">Time Period</label>
        <select class="form-select form-select-sm">
          <option selected>2022</option>
          <option>2023</option>
          <option>2024</option>
        </select>
      </div>

      <div class="d-flex gap-2 mt-2 pt-2 border-top">
        <button class="btn btn-outline-secondary btn-sm flex-grow-1" onclick="alert('Filters reset')">Reset All</button>
        <button class="btn btn-outline-secondary btn-sm flex-grow-1" id="filterCancelBtn">Cancel</button>
        <button class="btn btn-success btn-sm flex-grow-1 btn-ripple" id="applyFilterBtn">Apply Filters</button>
      </div>
    </div>
  `;
}

function bindPanelInteractivity(title) {
  if (title === 'Notifications') {
    const markReadBtn = document.getElementById('markAllReadBtn');
    markReadBtn?.addEventListener('click', () => {
      document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
        item.style.backgroundColor = '#FFFFFF';
      });
      document.querySelector('.badge-dot')?.remove();
      markReadBtn.innerText = 'All Read';
      markReadBtn.classList.add('text-muted');
      markReadBtn.disabled = true;
    });
  }
}

function setupTradeoffControls() {
  const metricSelector = document.getElementById('bubbleSizeMetric');
  metricSelector?.addEventListener('change', () => {
    if (window.initTradeoffBubbleChart) window.initTradeoffBubbleChart(metricSelector.value);
  });
}

function setupTimelineExplorationControls() {
  const yearSlider = document.getElementById('timelineYearSlider');
  if (yearSlider) {
    yearSlider.addEventListener('input', () => {
      if (window.updateTimelineExplorationRange) {
        window.updateTimelineExplorationRange(yearSlider.value);
      }
    });
    // Trigger initial render
    if (window.updateTimelineExplorationRange) {
      window.updateTimelineExplorationRange(yearSlider.value);
    }
  }
}

function setupFutureSimulatorControls() {
  if (window.initFutureSimulatorTrajectoryChart) {
    window.initFutureSimulatorTrajectoryChart();
  }

  const ls = document.getElementById('sliderFutureLivestock');
  const es = document.getElementById('sliderFutureEnergy');
  const ts = document.getElementById('sliderFutureTech');

  const lVal = document.getElementById('valFutureLivestock');
  const eVal = document.getElementById('valFutureEnergy');
  const tVal = document.getElementById('valFutureTech');

  const runFutureCalculation = () => {
    if (!ls || !es || !ts) return;
    const lValue = parseInt(ls.value);
    const eValue = parseInt(es.value);
    const tValue = parseInt(ts.value);

    if (lVal) lVal.innerText = `${lValue}%`;
    if (eVal) eVal.innerText = `${eValue}%`;
    if (tVal) tVal.innerText = `${tValue}%`;

    if (window.updateFutureSimulatorSimulation) {
      window.updateFutureSimulatorSimulation(lValue, eValue, tValue);
    }
  };

  // Attach slider input listeners
  ls?.addEventListener('input', runFutureCalculation);
  es?.addEventListener('input', runFutureCalculation);
  ts?.addEventListener('input', runFutureCalculation);

  // Buttons
  document.getElementById('btnRunFutureSim')?.addEventListener('click', () => {
    // Standard beautiful micro-interaction confirmation
    const btn = document.getElementById('btnRunFutureSim');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Simulating...`;
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      window.openSidePanel('Simulation Status', `
        <div class="alert alert-success">
          <h6 class="fw-bold mb-1"><i class="fas fa-check-circle me-2"></i>Simulation Succeeded</h6>
          <p class="small text-secondary mb-0">Projected emissions parameters computed. Optimized path updated correctly.</p>
        </div>
      `);
      runFutureCalculation();
    }, 1000);
  });

  document.getElementById('btnResetFutureSim')?.addEventListener('click', () => {
    if (ls) ls.value = 21;
    if (es) es.value = 26;
    if (ts) ts.value = 10;
    runFutureCalculation();
  });

  // Trigger initial simulation calculations
  runFutureCalculation();
}

function setupSectorProfiles() {
  const sectors = {
    livestock: {
      title: 'Livestock overlay',
      icon: 'fa-circle-dot',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      name: 'Livestock',
      prod: '3.2 Bt',
      emissions: '7.1 Gt',
      emColor: 'text-danger',
      ratio: '0.45'
    },
    crops: {
      title: 'crops overlay',
      icon: 'fa-leaf',
      color: '#22C55E',
      bgColor: '#DCFCE7',
      name: 'Crops',
      prod: '3.2 Bt',
      emissions: '5.2 Gt',
      emColor: 'text-success',
      ratio: '0.45'
    },
    rice: {
      title: 'rice overlay',
      icon: 'fa-wheat-awn',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      name: 'Rice',
      prod: '3.2 Bt',
      emissions: '2.5 Gt',
      emColor: 'text-warning',
      ratio: '0.45'
    },
    aqua: {
      title: 'Aquaculture overlay',
      icon: 'fa-fish',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      name: 'Aquaculture',
      prod: '3.2 Bt',
      emissions: '0.5 Gt',
      emColor: 'text-primary',
      ratio: '0.45'
    }
  };

  const showOverlay = (key) => {
    const data = sectors[key];
    const html = `
      <div class="d-flex flex-column align-items-center py-4">
        <div class="d-flex align-items-center justify-content-center mb-3 rounded-4 shadow-sm" style="width: 70px; height: 70px; background-color: ${data.bgColor}; border: 1px solid var(--border);">
          <i class="fa-solid ${data.icon} fs-2" style="color: ${data.color};"></i>
        </div>
        <h3 class="fw-bold mb-4" style="font-size: 1.4rem;">${data.name}</h3>
        <div class="w-100 py-2 d-flex flex-column gap-3 border-top border-bottom">
          <div class="d-flex justify-content-between align-items-center py-1">
            <span class="text-secondary fw-semibold">Production</span>
            <strong class="fs-5">${data.prod}</strong>
          </div>
          <div class="d-flex justify-content-between align-items-center py-1">
            <span class="text-secondary fw-semibold">Emissions</span>
            <strong class="fs-5 ${data.emColor}">${data.emissions}</strong>
          </div>
          <div class="d-flex justify-content-between align-items-center py-1">
            <span class="text-secondary fw-semibold">Ratio</span>
            <strong class="fs-5">${data.ratio}</strong>
          </div>
        </div>
      </div>
    `;
    window.openModal(data.title, html);
  };

  document.getElementById('sec-profile-livestock')?.addEventListener('click', () => showOverlay('livestock'));
  document.getElementById('sec-profile-crops')?.addEventListener('click', () => showOverlay('crops'));
  document.getElementById('sec-profile-rice')?.addEventListener('click', () => showOverlay('rice'));
  document.getElementById('sec-profile-aqua')?.addEventListener('click', () => showOverlay('aqua'));
}
