// render.js – Custom Canvas pseudo-3D rendering + main game loop.
// Loaded last (after game.js and ui.js).

var canvas = document.getElementById('game-canvas');
var ctx    = canvas.getContext('2d');

// ── Projection constants ──────────────────────────────────────────────────────
// The field occupies the lower portion of the 600×500 canvas and is drawn as
// a trapezoid to give a pseudo-3D top-down oblique look.
//
// Physics coords  →  canvas coords
//   physX : 0 … WORLD_W   (left → right)
//   physZ : 0 … WORLD_H   (far/back → near/front)
//   h     : 0 … PUSHER_H_VIS  (field surface → top of pusher)
var FIELD_Y_FAR  = 195;  // canvas-y for the far/back edge of the field
var FIELD_Y_NEAR = 488;  // canvas-y for the near/front edge
var HW_FAR       = 108;  // half-pixel-width at the far  edge
var HW_NEAR      = 300;  // half-pixel-width at the near edge (= full canvas)
var CX           = 300;  // canvas centre-x

// ── project() ────────────────────────────────────────────────────────────────
// Convert physics (physX, physZ) at visual height h to canvas (x, y).
// A larger h means the point is drawn higher (farther up) in the canvas.
function project(physX, physZ, h) {
  h = h || 0;
  var t    = physZ / WORLD_H;                                    // 0=far, 1=near
  var canY = FIELD_Y_FAR  + (FIELD_Y_NEAR - FIELD_Y_FAR)  * t;
  var hw   = HW_FAR       + (HW_NEAR      - HW_FAR)       * t;
  var canX = CX + (physX - WORLD_W / 2) / (WORLD_W / 2) * hw;
  // Height foreshortening: objects at the far edge appear less tall.
  var hOff = h * (1.0 - t * 0.38);
  return { x: canX, y: canY - hOff };
}

// Visual radius of a medal at physics depth physZ.
function medalVisRadius(physZ) {
  var t = physZ / WORLD_H;
  return 7 + 13 * t;   // 7 px at far edge → 20 px at near edge
}

// ── drawField() ───────────────────────────────────────────────────────────────
function drawField() {
  var tl = project(0,       0,       0);
  var tr = project(WORLD_W, 0,       0);
  var br = project(WORLD_W, WORLD_H, 0);
  var bl = project(0,       WORLD_H, 0);

  // Surface fill
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y); ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y); ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  var surfGrad = ctx.createLinearGradient(CX, FIELD_Y_FAR, CX, FIELD_Y_NEAR);
  surfGrad.addColorStop(0, '#1e3a1e');
  surfGrad.addColorStop(1, '#2e5430');
  ctx.fillStyle = surfGrad;
  ctx.fill();

  // Depth grid lines (visual depth cue)
  ctx.lineWidth = 1;
  for (var z = 30; z < WORLD_H; z += 30) {
    var l = project(0,       z, 0);
    var r = project(WORLD_W, z, 0);
    ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(r.x, r.y);
    ctx.strokeStyle = 'rgba(80,150,80,0.22)';
    ctx.stroke();
  }

  // Side rails
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(160,210,160,0.35)';
  ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.lineTo(bl.x, bl.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tr.x, tr.y); ctx.lineTo(br.x, br.y); ctx.stroke();

  // Front edge highlight (scoring zone)
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#f39c12';
  ctx.beginPath(); ctx.moveTo(bl.x, bl.y); ctx.lineTo(br.x, br.y); ctx.stroke();
}

// ── drawPusher() ──────────────────────────────────────────────────────────────
// Renders the pusher as a 3-D box:
//   • two side faces
//   • a front slope (ramp)
//   • the top surface
function drawPusher() {
  var pf = pusherDepth;       // front-edge depth (physics units)
  var pH = PUSHER_H_VIS;      // visual height above field
  var sW = SLOPE_W_VIS;       // slope width (physics units)

  // ── Left side face ────────────────────────────────────
  var lBT = project(0, 0,        pH);  // back  top
  var lBB = project(0, 0,        0);   // back  bottom
  var lFB = project(0, pf + sW,  0);   // front bottom (slope end)
  var lFT = project(0, pf,       pH);  // front top
  ctx.beginPath();
  ctx.moveTo(lBT.x, lBT.y);
  ctx.lineTo(lFT.x, lFT.y);
  ctx.lineTo(lFB.x, lFB.y);
  ctx.lineTo(lBB.x, lBB.y);
  ctx.closePath();
  ctx.fillStyle = '#3d2008';
  ctx.fill();

  // ── Right side face ───────────────────────────────────
  var rBT = project(WORLD_W, 0,       pH);
  var rBB = project(WORLD_W, 0,       0);
  var rFB = project(WORLD_W, pf + sW, 0);
  var rFT = project(WORLD_W, pf,      pH);
  ctx.beginPath();
  ctx.moveTo(rBT.x, rBT.y);
  ctx.lineTo(rFT.x, rFT.y);
  ctx.lineTo(rFB.x, rFB.y);
  ctx.lineTo(rBB.x, rBB.y);
  ctx.closePath();
  ctx.fillStyle = '#3d2008';
  ctx.fill();

  // ── Front slope ───────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(lFT.x, lFT.y);
  ctx.lineTo(rFT.x, rFT.y);
  ctx.lineTo(rFB.x, rFB.y);
  ctx.lineTo(lFB.x, lFB.y);
  ctx.closePath();
  var slopeGrad = ctx.createLinearGradient(CX, lFT.y, CX, lFB.y);
  slopeGrad.addColorStop(0, '#7a3810');
  slopeGrad.addColorStop(1, '#4a2008');
  ctx.fillStyle = slopeGrad;
  ctx.fill();
  ctx.strokeStyle = '#5a2c0e';
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Top surface ───────────────────────────────────────
  var tBL = project(0,       0,  pH);
  var tBR = project(WORLD_W, 0,  pH);
  var tFL = project(0,       pf, pH);
  var tFR = project(WORLD_W, pf, pH);
  ctx.beginPath();
  ctx.moveTo(tBL.x, tBL.y); ctx.lineTo(tBR.x, tBR.y);
  ctx.lineTo(tFR.x, tFR.y); ctx.lineTo(tFL.x, tFL.y);
  ctx.closePath();
  var topGrad = ctx.createLinearGradient(CX, tBL.y, CX, tFL.y);
  topGrad.addColorStop(0, '#9b5523');
  topGrad.addColorStop(1, '#7a3f18');
  ctx.fillStyle = topGrad;
  ctx.fill();
  ctx.strokeStyle = '#b06030';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Front-edge highlight on top surface
  ctx.beginPath(); ctx.moveTo(tFL.x, tFL.y); ctx.lineTo(tFR.x, tFR.y);
  ctx.strokeStyle = '#cd7040';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ── drawMedals() ──────────────────────────────────────────────────────────────
// Sort far-to-near so closer medals appear on top.
function drawMedals() {
  var sorted = medals.slice().sort(function (a, b) {
    return a.position.y - b.position.y;
  });

  sorted.forEach(function (m) {
    var px = m.position.x;
    var pz = m.position.y;   // physics y = depth

    // Visual height: on-pusher → PUSHER_H_VIS, slope → interpolated, field → 0.
    var medalH;
    if (pz < pusherDepth) {
      medalH = PUSHER_H_VIS;
    } else if (pz < pusherDepth + SLOPE_W_VIS) {
      medalH = PUSHER_H_VIS * (1 - (pz - pusherDepth) / SLOPE_W_VIS);
    } else {
      medalH = 0;
    }

    var pt = project(px, pz, medalH);
    var r  = medalVisRadius(pz);
    var ry = r * 0.48;   // flatten vertically for perspective

    // Drop shadow
    ctx.beginPath();
    ctx.ellipse(pt.x + 3, pt.y + 5, r * 0.88, ry * 0.65, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.fill();

    // Medal body (radial gradient for coin sheen)
    var gr = ctx.createRadialGradient(
      pt.x - r * 0.28, pt.y - ry * 0.28, r * 0.04,
      pt.x,            pt.y,              r
    );
    gr.addColorStop(0,    '#fffde7');
    gr.addColorStop(0.22, '#ffd700');
    gr.addColorStop(0.62, '#d4a017');
    gr.addColorStop(1,    '#8b6914');

    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, r, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = gr;
    ctx.fill();
    ctx.strokeStyle = '#7a5c10';
    ctx.lineWidth   = 1;
    ctx.stroke();
  });
}

// ── Main game loop ─────────────────────────────────────────────────────────────
function gameLoop() {
  updateGame();

  // Background
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawField();
  drawPusher();
  drawMedals();
  updateUI();

  requestAnimationFrame(gameLoop);
}

gameLoop();
