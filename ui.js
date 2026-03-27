function updateUI() {
  document.getElementById('score').textContent = score;
  document.getElementById('medal-count').textContent = medalCount;
}

document.getElementById('shoot-btn').addEventListener('click', function() {
  shootMedal(canvas.width / 2);
  updateUI();
});

updateUI();
