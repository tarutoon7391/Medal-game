var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext('2d');

function drawMedals() {
  medals.forEach(function(m) {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.closePath();
  });
}

function drawPusher() {
  ctx.fillStyle = '#e94560';
  ctx.fillRect(pusher.x, pusher.y, pusher.width, pusher.height);
}

function gameLoop() {
  updatePusher();
  updateMedals();
  updateUI();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMedals();
  drawPusher();
  requestAnimationFrame(gameLoop);
}

gameLoop();
