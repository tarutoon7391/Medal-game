// render.js — Canvas rendering and main game loop.
// Loaded last (after game.js and ui.js).

var canvas = document.getElementById('game-canvas');
var ctx    = canvas.getContext('2d');

// -------------------------------------------------------
// Draw the field (bottom board) as a perspective trapezoid.
// -------------------------------------------------------
function drawField() {
  var tl = project(-0.5, 0);
  var tr = project( 0.5, 0);
  var br = project( 0.5, 1);
  var bl = project(-0.5, 1);

  // Fill
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.fillStyle = '#3a3a3a';
  ctx.fill();

  // Depth grid lines for 3-D depth cue
  ctx.lineWidth = 1;
  for (var z = 0.1; z < 1.0; z += 0.1) {
    var l = project(-0.5, z);
    var r = project( 0.5, z);
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(r.x, r.y);
    ctx.strokeStyle = 'rgba(110,110,110,0.4)';
    ctx.stroke();
  }

  // Side edges
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(160,160,160,0.5)';
  ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.lineTo(bl.x, bl.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tr.x, tr.y); ctx.lineTo(br.x, br.y); ctx.stroke();
}

// -------------------------------------------------------
// Draw the pusher (top board) as a perspective trapezoid.
// -------------------------------------------------------
function drawPusher() {
  var pb = getPusherBack();
  var tl = project(-0.5, pb);
  var tr = project( 0.5, pb);
  var br = project( 0.5, pusherFront);
  var bl = project(-0.5, pusherFront);

  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.fillStyle = '#c0392b';
  ctx.fill();

  // Highlight the front edge
  ctx.beginPath();
  ctx.moveTo(bl.x, bl.y);
  ctx.lineTo(br.x, br.y);
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Shade the back edge
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.strokeStyle = '#922b21';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// -------------------------------------------------------
// Draw all medals, sorted far-to-near so closer ones
// appear on top of farther ones.
// -------------------------------------------------------
function drawMedals() {
  var sorted = medals.slice().sort(function (a, b) { return a.z - b.z; });

  sorted.forEach(function (m) {
    var p  = project(m.x, m.z);
    var r  = medalRadius(m.z);
    var ry = r * 0.55;   // flatten vertically for perspective

    var grad = ctx.createRadialGradient(
      p.x - r * 0.25, p.y - ry * 0.3, r * 0.05,
      p.x,            p.y,             r
    );
    grad.addColorStop(0,   '#fff3a0');
    grad.addColorStop(0.4, '#ffd700');
    grad.addColorStop(0.8, '#daa520');
    grad.addColorStop(1,   '#8b6914');

    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth   = 1;
    ctx.stroke();
  });
}

// -------------------------------------------------------
// Main game loop
// -------------------------------------------------------
function gameLoop() {
  updateGame();

  // Clear entire canvas with dark background
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawField();
  drawPusher();
  drawMedals();
  updateUI();

  requestAnimationFrame(gameLoop);
}

gameLoop();
