// game.js – Matter.js physics engine + game logic.
// Matter.js 0.19.0 is loaded via CDN before this file.

// ── Convenience alias ────────────────────────────────────────────────────────
var M = Matter;

// ── World / field dimensions (physics units) ─────────────────────────────────
// x : 0 (left)  →  WORLD_W (right)
// y : 0 (far/back)  →  WORLD_H (near/front)
var WORLD_W = 600;
var WORLD_H = 300;

// ── Pusher constants ──────────────────────────────────────────────────────────
// The pusher is a slab whose back edge is always fixed at y = 0 (far wall).
// Its front edge oscillates between PUSHER_DEPTH_MIN and PUSHER_DEPTH_MAX.
var PUSHER_DEPTH_MIN = WORLD_H / 4;   // 75  – 1/4 of field
var PUSHER_DEPTH_MAX = WORLD_H / 3;   // 100 – 1/3 of field
var PUSHER_SPEED     = 0.35;          // physics units per frame

// Visual-only constants referenced by render.js
var PUSHER_H_VIS  = 28;   // apparent height of pusher above field surface (px)
var SLOPE_W_VIS   = 22;   // apparent width of the front slope (physics units)

// ── Medal constants ───────────────────────────────────────────────────────────
var MEDAL_RADIUS   = 35;  // physics radius (px)
var SCORE_X_MARGIN = MEDAL_RADIUS * 2.5; // medals must be this far from side walls to score

// ── Matter.js setup ───────────────────────────────────────────────────────────
// y-axis represents field depth (0 = far/back, WORLD_H = near/front).
// A tiny positive gravity along y produces a gentle forward drift so that
// medals naturally creep toward the scoring edge without player input.
var engine = M.Engine.create({ gravity: { x: 0, y: 0.001 } });
var world  = engine.world;

// Static boundary walls
var _wallOpts = { isStatic: true, restitution: 0.25, friction: 0.05,
                  frictionAir: 0, label: 'wall' };
var wallLeft  = M.Bodies.rectangle(-15, WORLD_H / 2, 30, WORLD_H * 3, _wallOpts);
var wallRight = M.Bodies.rectangle(WORLD_W + 15, WORLD_H / 2, 30, WORLD_H * 3, _wallOpts);
var wallBack  = M.Bodies.rectangle(WORLD_W / 2, -15, WORLD_W + 60, 30, _wallOpts);
M.World.add(world, [wallLeft, wallRight, wallBack]);

// ── Pusher state ──────────────────────────────────────────────────────────────
// The pusher is NOT a physics body; its interaction with medals is applied
// programmatically each frame so that the back edge stays fixed at y = 0
// while the front edge extends / retracts.
var pusherDepth = PUSHER_DEPTH_MIN;  // current front-edge depth (y value)
var pusherDir   = 1;                 //  1 = extending toward viewer, -1 = retracting

// ── Game state ────────────────────────────────────────────────────────────────
var score      = 0;
var medalCount = 50;
var medals     = [];   // array of active Matter.js Bodies

// ── Pusher update ─────────────────────────────────────────────────────────────
function updatePusher() {
  var prev = pusherDepth;
  var next = pusherDepth + PUSHER_SPEED * pusherDir;

  if (next >= PUSHER_DEPTH_MAX) { next = PUSHER_DEPTH_MAX; pusherDir = -1; }
  if (next <= PUSHER_DEPTH_MIN) { next = PUSHER_DEPTH_MIN; pusherDir =  1; }

  var delta = next - prev;
  pusherDepth = next;

  // When extending (delta > 0) push every medal that sits on the pusher.
  // We only push forward; retracting leaves medals behind (ratchet effect).
  if (delta > 0) {
    for (var i = 0; i < medals.length; i++) {
      var m   = medals[i];
      var pos = m.position;
      // Medal is within the pusher zone (allow one radius of overlap at front).
      if (pos.y < pusherDepth + MEDAL_RADIUS) {
        // Ensure the medal moves at least as fast as the pusher front edge.
        if (m.velocity.y < delta) {
          M.Body.setVelocity(m, { x: m.velocity.x, y: delta });
        }
      }
    }
  }
}

// ── Medal update ──────────────────────────────────────────────────────────────
function updateMedals() {
  for (var i = medals.length - 1; i >= 0; i--) {
    var m   = medals[i];
    var pos = m.position;

    // Medal crossed the front edge → scoring check.
    if (pos.y > WORLD_H + MEDAL_RADIUS) {
      if (pos.x >= SCORE_X_MARGIN && pos.x <= WORLD_W - SCORE_X_MARGIN) {
        score++;
      }
      M.World.remove(world, m);
      medals.splice(i, 1);
      continue;
    }

    // Remove medals that somehow escaped behind the back wall.
    if (pos.y < -(MEDAL_RADIUS * 3)) {
      M.World.remove(world, m);
      medals.splice(i, 1);
    }
  }
}

// ── Shoot a medal ─────────────────────────────────────────────────────────────
// Launch position: back-centre of the pusher (fixed, near y = 0).
function shootMedal() {
  if (medalCount <= 0) { return; }

  var spawnX = WORLD_W / 2 + (Math.random() - 0.5) * 20;
  var spawnY = MEDAL_RADIUS + 4;

  var medal = M.Bodies.circle(spawnX, spawnY, MEDAL_RADIUS, {
    restitution : 0.25,
    friction    : 0.05,
    frictionAir : 0.045,
    density     : 0.002,
    label       : 'medal'
  });
  // Give the medal an initial nudge toward the viewer.
  M.Body.setVelocity(medal, { x: (Math.random() - 0.5) * 0.4, y: 0.5 });
  M.World.add(world, medal);
  medals.push(medal);
  medalCount--;
}

// ── Main update (called once per frame from render.js) ────────────────────────
function updateGame() {
  updatePusher();
  updateMedals();
  M.Engine.update(engine, 1000 / 60);
}
