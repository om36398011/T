// navigation.js – Custom navigation utilities (standard script fallback)
window.initNavigation = function() {
  // Setup standard navigation triggers for screen reader accessibility
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('page-content');
    if (container) {
      container.setAttribute('tabindex', '-1');
    }
  });
};
