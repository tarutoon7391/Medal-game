// ui.js — DOM updates and user-input handling.
// Loaded after game.js, before render.js.

function updateUI() {
  document.getElementById('score').textContent      = score;
  document.getElementById('medal-count').textContent = medalCount;
}

document.getElementById('shoot-btn').addEventListener('click', function () {
  shootMedal();
  updateUI();
});

updateUI();
