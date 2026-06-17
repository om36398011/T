// dashboard.js – KPI animations, sparklines, and map interactions (standard script version with Figma data)

window.loadDashboard = function() {
  // 1. Sparkline Initializations (matching Figma dashboard stats trends)
  window.initSparkline('sparkline-production', [7.8, 8.2, 8.9, 9.21], '#2E7D32');
  window.initSparkline('sparkline-ghg', [5.8, 5.6, 5.4, 5.37], '#EF4444');
  window.initSparkline('sparkline-land', [4.95, 4.92, 4.90, 4.89], '#F59E0B');
  window.initSparkline('sparkline-efficiency', [1.45, 1.55, 1.65, 1.71], '#22C55E');

  // 2. Count-Up Animation
  animateCounters();

  // 3. World Map Interactions
  initWorldMap();

  // 4. KPI Click Handlers to trigger Metric Detail Overlays
  setupKpiModalTriggers();
};

function animateCounters() {
  const counters = document.querySelectorAll('[id^="counter-"]');
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-target'));
    const isDecimal = target % 1 !== 0;
    let current = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    function update(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const ease = 1 - Math.pow(1 - progress, 3);
      current = ease * target;
      
      counter.innerText = isDecimal ? current.toFixed(2) : Math.floor(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.innerText = isDecimal ? target.toFixed(2) : target;
      }
    }
    requestAnimationFrame(update);
  });
}

function initWorldMap() {
  const paths = document.querySelectorAll('.country-path, .map-pulsing-node');
  const tooltip = document.getElementById('map-tooltip');

  paths.forEach(path => {
    // Helper to get the correct path data element
    const getTargetEl = () => {
      if (path.classList.contains('map-pulsing-node')) {
        const name = path.getAttribute('data-name');
        return document.querySelector(`.country-path[data-name="${name}"]`) || path;
      }
      return path;
    };

    path.addEventListener('mousemove', (e) => {
      const el = getTargetEl();
      const name = el.getAttribute('data-name');
      const prod = el.getAttribute('data-prod') || 'N/A';
      const ghg = el.getAttribute('data-ghg') || 'N/A';
      
      tooltip.style.display = 'block';
      tooltip.innerHTML = `<strong>${name}</strong><br>Production: ${prod}<br>Emissions: ${ghg}`;
      
      const containerRect = e.target.ownerSVGElement.parentNode.getBoundingClientRect();
      const x = e.clientX - containerRect.left + 15;
      const y = e.clientY - containerRect.top + 15;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    });

    path.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    path.addEventListener('click', () => {
      const el = getTargetEl();
      const name = el.getAttribute('data-name');
      const prod = el.getAttribute('data-prod') || 'N/A';
      const ghg = el.getAttribute('data-ghg') || 'N/A';
      const land = el.getAttribute('data-land') || 'N/A';
      const eff = el.getAttribute('data-eff') || 'N/A';

      const flagColors = {
        'USA': '#3B82F6',
        'India': '#F59E0B',
        'China': '#EF4444',
        'Brazil': '#22C55E'
      };
      const color = flagColors[name] || '#6B7280';

      const html = `
        <div class="p-2">
          <div class="d-flex align-items-center gap-2 mb-4 border-bottom pb-2">
            <span class="d-inline-block rounded-circle" style="width: 15px; height:15px; background-color:${color};"></span>
            <h3 class="fw-bold mb-0">${name}</h3>
          </div>
          <div class="d-flex flex-column gap-3">
            <div class="d-flex justify-content-between align-items-center p-2 rounded bg-light">
              <span class="text-secondary fw-semibold">Food Production</span>
              <strong class="fs-5">${prod}</strong>
            </div>
            <div class="d-flex justify-content-between align-items-center p-2 rounded bg-light">
              <span class="text-secondary fw-semibold">GHG Emissions</span>
              <strong class="fs-5 text-danger">${ghg}</strong>
            </div>
            <div class="d-flex justify-content-between align-items-center p-2 rounded bg-light">
              <span class="text-secondary fw-semibold">Land</span>
              <strong class="fs-5 text-warning">${land}</strong>
            </div>
            <div class="d-flex justify-content-between align-items-center p-2 rounded bg-light">
              <span class="text-secondary fw-semibold">Efficiency Ratio</span>
              <strong class="fs-5 text-primary">${eff}</strong>
            </div>
          </div>
        </div>
      `;
      window.openModal(`${name} Overlay`, html);
    });
  });

  const mapSvg = document.getElementById('world-map-svg');
  let scale = 1;
  document.getElementById('zoomInBtn')?.addEventListener('click', () => {
    scale = Math.min(scale + 0.15, 2);
    mapSvg.style.transform = `scale(${scale})`;
    mapSvg.style.transition = 'transform 0.3s ease';
  });

  document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
    scale = Math.max(scale - 0.15, 0.7);
    mapSvg.style.transform = `scale(${scale})`;
    mapSvg.style.transition = 'transform 0.3s ease';
  });
}

// Render overlays exactly matching Image 2
function setupKpiModalTriggers() {
  const openKpiOverlay = (title, chartLabel, color) => {
    const html = `
      <div>
        <p class="small text-secondary mb-3">Details, analysis, and trends.</p>
        <div class="row g-2 mb-4 text-center">
          <div class="col-4">
            <div class="p-2 border rounded bg-light" style="height: 100%;">
              <small class="text-secondary d-block" style="font-size:0.6rem; line-height:1.2;">Avg. Monthly Growth</small>
              <strong class="text-success" style="font-size:0.85rem;"><i class="fas fa-arrow-up"></i> +4.2%</strong>
            </div>
          </div>
          <div class="col-4">
            <div class="p-2 border rounded bg-light" style="height: 100%;">
              <small class="text-secondary d-block" style="font-size:0.6rem; line-height:1.2;">Volatility Index</small>
              <strong class="text-dark" style="font-size:0.85rem;">12.4</strong>
            </div>
          </div>
          <div class="col-4">
            <div class="p-2 border rounded bg-primary-subtle border-primary-subtle text-primary" style="height: 100%;">
              <small class="d-block" style="font-size:0.6rem; line-height:1.2; color:inherit;">Avg. Risk Score</small>
              <strong style="font-size:0.85rem; color:inherit;">Low</strong>
            </div>
          </div>
        </div>
        <div class="mb-2">
          <h6 class="fw-bold small mb-1">12-Month Trend</h6>
        </div>
        <div style="height: 180px; position: relative;">
          <canvas id="overlay-trend-chart"></canvas>
        </div>
      </div>
    `;
    
    window.openModal(title, html);

    // Give browser time to paint the canvas, then render the overlay trend chart
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (window.initOverlayTrendChart) {
          window.initOverlayTrendChart('overlay-trend-chart', chartLabel, color);
        }
      }, 50);
    });
  };

  document.getElementById('kpi-production')?.addEventListener('click', () => {
    openKpiOverlay('Global Food Production', 'Food Production', '#2E7D32');
  });

  document.getElementById('kpi-ghg')?.addEventListener('click', () => {
    openKpiOverlay('Total GHG Emission', 'GHG Emissions', '#EF4444');
  });

  document.getElementById('kpi-land')?.addEventListener('click', () => {
    openKpiOverlay('Agriculture Land Use', 'Agri Land footprint', '#F59E0B');
  });

  document.getElementById('kpi-efficiency')?.addEventListener('click', () => {
    openKpiOverlay('Efficiency Score', 'Efficiency ratio', '#22C55E');
  });
}
