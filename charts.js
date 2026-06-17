// charts.js – Configuration for all Chart.js visualizations (standard global script version matching Figma updates)

const years = ['2020', '2021', '2022', '2023', '2024'];

// Helper to create small clean sparklines in KPI cards
window.initSparkline = function(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data: data,
        borderColor: color,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
};

// Trade-off Bubble Chart (Trade-Off analysis page)
window.initTradeoffBubbleChart = function(metric = 'land') {
  const canvas = document.getElementById('tradeoff-bubble-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const rawData = [
    { label: 'Red Meat', x: 2.1, y: 7.2, land: 8.5, eff: 42 },
    { label: 'Grains & Rice', x: 8.4, y: 3.5, land: 4.8, eff: 78 },
    { label: 'Vegetables & Fruits', x: 12.5, y: 1.2, land: 1.6, eff: 92 },
    { label: 'Aquaculture', x: 4.5, y: 2.8, land: 0.8, eff: 81 },
    { label: 'Dairy', x: 5.6, y: 4.8, land: 3.4, eff: 65 },
    { label: 'Poultry', x: 7.2, y: 3.1, land: 2.2, eff: 74 }
  ];

  const chartData = {
    datasets: rawData.map((item, idx) => {
      const colors = ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#EC4899', '#8B5CF6'];
      return {
        label: item.label,
        data: [{
          x: item.x,
          y: item.y,
          r: metric === 'land' ? item.land * 4 : item.eff / 4
        }],
        backgroundColor: colors[idx % colors.length] + '99',
        borderColor: colors[idx % colors.length],
        borderWidth: 2
      };
    })
  };

  const bubbleChart = new Chart(ctx, {
    type: 'bubble',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1500 },
      plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function(context) {
              const item = rawData[context.datasetIndex];
              return `${item.label} (Yield: ${item.x}M t, GHG: ${item.y}Mt, Land: ${item.land}M ha, Eff: ${item.eff}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Food Production Yield (M tonnes)', color: '#6B7280' },
          grid: { color: '#E5E7EB' }
        },
        y: {
          title: { display: true, text: 'GHG Emissions (Mt CO₂e)', color: '#6B7280' },
          grid: { color: '#E5E7EB' }
        }
      }
    }
  });

  canvas.onclick = (evt) => {
    const points = bubbleChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
    if (points.length) {
      const firstPoint = points[0];
      const item = rawData[firstPoint.datasetIndex];
      const detailsDiv = document.getElementById('bubble-interactive-details');
      if (detailsDiv) {
        detailsDiv.innerHTML = `
          <h6 class="fw-bold mb-2 text-primary">${item.label} Profile</h6>
          <div class="small text-secondary mb-1"><strong>Production Yield:</strong> ${item.x}M tonnes</div>
          <div class="small text-secondary mb-1"><strong>Emissions Footprint:</strong> ${item.y}Mt CO₂e</div>
          <div class="small text-secondary mb-1"><strong>Land Footprint:</strong> ${item.land}M hectares</div>
          <div class="small text-secondary"><strong>Eco-Efficiency Score:</strong> <span class="badge bg-success">${item.eff}%</span></div>
        `;
      }
    }
  };
};

// Sector Analysis Doughnut Charts (Image 3)
window.initSectorDoughnutCharts = function() {
  // 1. Production Distribution Doughnut
  const prodCanvas = document.getElementById('sector-production-doughnut');
  if (prodCanvas) {
    const ctx = prodCanvas.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Livestock', 'Crops', 'Rice', 'Aquaculture', 'Others'],
        datasets: [{
          data: [51, 31, 8, 7, 3],
          backgroundColor: ['#EF4444', '#22C55E', '#F59E0B', '#3B82F6', '#9CA3AF'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: { boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    });
  }

  // 2. Emissions Distribution Doughnut
  const emisCanvas = document.getElementById('sector-emissions-doughnut');
  if (emisCanvas) {
    const ctx = emisCanvas.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Livestock', 'Crops', 'Rice', 'Aquaculture'],
        datasets: [{
          data: [65, 20, 10, 5],
          backgroundColor: ['#EF4444', '#22C55E', '#F59E0B', '#3B82F6'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: { boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    });
  }
};

// Timeline Exploration Historical Line Chart (Image 1)
let timelineChartInstance = null;
const fullTimelineYears = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
const fullTimelineEmissions = [21000, 21500, 21200, 22400, 22800, 23100, 23400];
const fullTimelineProduction = [8200, 8500, 8400, 8800, 9100, 9210, 9300];

window.initTimelineExplorationChart = function() {
  const canvas = document.getElementById('timeline-exploration-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (timelineChartInstance) {
    timelineChartInstance.destroy();
  }

  timelineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: fullTimelineYears,
      datasets: [
        {
          label: 'Emissions',
          data: fullTimelineEmissions,
          borderColor: '#EF4444',
          backgroundColor: '#EF4444',
          borderWidth: 2,
          tension: 0.2,
          fill: false,
          yAxisID: 'y'
        },
        {
          label: 'Production',
          data: fullTimelineProduction,
          borderColor: '#22C55E',
          backgroundColor: '#22C55E',
          borderWidth: 2,
          tension: 0.2,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: {
          type: 'linear',
          position: 'left',
          grid: { color: '#F3F4F6' },
          ticks: { font: { size: 9 } }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { font: { size: 9 } }
        }
      }
    }
  });
};

window.updateTimelineExplorationRange = function(endYear) {
  if (!timelineChartInstance) return;
  
  const endIndex = fullTimelineYears.indexOf(endYear.toString());
  if (endIndex === -1) return;

  const filteredYears = fullTimelineYears.slice(0, endIndex + 1);
  const filteredEmissions = fullTimelineEmissions.slice(0, endIndex + 1);
  const filteredProduction = fullTimelineProduction.slice(0, endIndex + 1);

  timelineChartInstance.data.labels = filteredYears;
  timelineChartInstance.data.datasets[0].data = filteredEmissions;
  timelineChartInstance.data.datasets[1].data = filteredProduction;
  timelineChartInstance.update();

  // Dynamically recalculate card details to make it feel super realistic!
  const climateEventsVal = document.getElementById('timeline-events-val');
  const changeVal = document.getElementById('timeline-change-val');
  const committedVal = document.getElementById('timeline-committed-val');

  if (climateEventsVal) {
    const eventsMap = { '2018': 2, '2019': 3, '2020': 4, '2021': 4, '2022': 5, '2023': 6, '2024': 6 };
    climateEventsVal.innerText = eventsMap[endYear] || 6;
  }
  if (changeVal) {
    const changeMap = { '2018': '+1.2%', '2019': '+2.5%', '2020': '+3.4%', '2021': '+4.1%', '2022': '+5.0%', '2023': '+6.1%', '2024': '+6.8%' };
    changeVal.innerText = changeMap[endYear] || '+6.8%';
  }
  if (committedVal) {
    const committedMap = { '2018': 142, '2019': 156, '2020': 172, '2021': 189, '2022': 192, '2023': 196, '2024': 196 };
    committedVal.innerText = committedMap[endYear] || 196;
  }
};

// Future Simulator Trajectory Chart (Image 2)
let futureChartInstance = null;
const futureYears = ['2020', '2025', '2030', '2035', '2040', '2045', '2050'];
const baselineTrajectory = [15.0, 16.0, 17.2, 18.5, 19.8, 21.0, 22.5]; // standard rising emissions

window.initFutureSimulatorTrajectoryChart = function() {
  const canvas = document.getElementById('future-simulator-trajectory-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (futureChartInstance) {
    futureChartInstance.destroy();
  }

  // Base Optimized Scenario
  const optimizedData = [15.0, 14.5, 13.8, 12.5, 11.2, 9.8, 8.5];

  futureChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: futureYears,
      datasets: [
        {
          label: 'Baseline Scenario',
          data: baselineTrajectory,
          borderColor: '#EF4444',
          borderWidth: 2.5,
          borderDash: [5, 5],
          pointRadius: 3,
          tension: 0.2,
          fill: false
        },
        {
          label: 'Optimized Scenario',
          data: optimizedData,
          borderColor: '#22C55E',
          borderWidth: 2.5,
          pointRadius: 3,
          tension: 0.2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 9 } } }
      }
    }
  });
};

window.updateFutureSimulatorSimulation = function(livestockLimit, energyAdoption, techInnovation) {
  if (!futureChartInstance) return;

  // Recalculate trajectory based on levers
  // Livestock reduces emissions. Energy adoption reduces emissions. Tech innovation increases production efficiency
  const newOptimized = [15.0];
  let currentVal = 15.0;

  for (let i = 1; i <= 6; i++) {
    // Levers reduce emissions over time
    const reductionRate = (livestockLimit * 0.003) + (energyAdoption * 0.004) + (techInnovation * 0.002);
    // Baseline growth would be 1.07, reduction counteracts it
    const growth = 1.07 - reductionRate;
    currentVal = currentVal * growth;
    newOptimized.push(parseFloat(currentVal.toFixed(2)));
  }

  futureChartInstance.data.datasets[1].data = newOptimized;
  futureChartInstance.update('none'); // silent update

  // Recalculate the bottom card outputs (Image 2)
  const reductionVal = document.getElementById('future-sim-reduction');
  const avoidedVal = document.getElementById('future-sim-avoided');
  const maintainedVal = document.getElementById('future-sim-maintained');

  // Avoided carbon Gt: difference between baseline 22.5 and final optimized
  const finalBaseline = baselineTrajectory[6];
  const finalOptimized = newOptimized[6];
  const avoided = Math.max(0.1, finalBaseline - finalOptimized).toFixed(1);

  // Reduction percent vs baseline
  const reductionPercent = Math.max(1, ((finalBaseline - finalOptimized) / finalBaseline) * 100).toFixed(1);

  // Maintained food: tech increases it
  const foodMaintained = (12.0 + (techInnovation * 0.03)).toFixed(1);

  if (reductionVal) reductionVal.innerText = `${reductionPercent}%`;
  if (avoidedVal) avoidedVal.innerText = `${avoided} Gt`;
  if (maintainedVal) maintainedVal.innerText = `${foodMaintained} Bt`;
};

// Overlay Trend Area Chart (Image 2)
window.initOverlayTrendChart = function(canvasId, label, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 150);
  gradient.addColorStop(0, color + '66');
  gradient.addColorStop(1, color + '00');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: label,
        data: [200, 220, 215, 240, 255, 230, 260, 280, 275, 290, 310, 320],
        borderColor: color,
        borderWidth: 2,
        backgroundColor: gradient,
        fill: true,
        pointRadius: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
        y: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 9 } } }
      }
    }
  });
};
