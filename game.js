// -------------------------------------------------------
// Field projection constants  (canvas: 480 x 400)
// -------------------------------------------------------
// The field occupies the lower half of the canvas and is
// drawn as a trapezoid for a pseudo-3D top-down look.
// Coordinate system:
//   x : -0.5 (left) … 0.5 (right)  — normalised field width
//   z :  0   (far)  … 1   (near)   — normalised field depth
// -------------------------------------------------------
var FIELD = {
  yFar  : 200,   // canvas-y of the far  (back)  edge
  yNear : 400,   // canvas-y of the near (front) edge
  hwFar : 150,   // half-pixel-width at the far  edge
  hwNear: 240,   // half-pixel-width at the near edge
  cx    : 240    // canvas centre-x
};

// Convert field coords → canvas pixels.
function project(x, z) {
  var sy = FIELD.yFar + (FIELD.yNear - FIELD.yFar) * z;
  var hw = FIELD.hwFar + (FIELD.hwNear - FIELD.hwFar) * z;
  return { x: FIELD.cx + x * hw * 2, y: sy };
}

// Visual radius of a medal at depth z.
function medalRadius(z) {
  return 5 + 8 * z;   // 5px at the far edge, 13px at the near edge
}

// -------------------------------------------------------
// Game state
// -------------------------------------------------------
var medals     = [];
var score      = 0;
var medalCount = 50;

// -------------------------------------------------------
// Pusher (上の板)
// -------------------------------------------------------
// The pusher spans PUSHER_DEPTH (= 0.25 = 1/4 of field) in
// z-space and oscillates so that its front edge moves
// between PUSHER_ZMIN and PUSHER_ZMAX.
var PUSHER_DEPTH = 0.25;
var PUSHER_SPEED = 0.004;
var PUSHER_ZMIN  = 0.25;
var PUSHER_ZMAX  = 0.58;   // ≈ front-edge at 1/3 of visible field

var pusherFront = 0.35;    // current front-edge depth
var pusherDir   = 1;       //  1 = moving toward viewer, -1 = away
var pusherDelta = 0;       // how much the pusher moved this frame

function getPusherBack() {
  return pusherFront - PUSHER_DEPTH;
}

function updatePusher() {
  var next = pusherFront + PUSHER_SPEED * pusherDir;
  if (next >= PUSHER_ZMAX) {
    next = PUSHER_ZMAX;
    pusherDir = -1;
  } else if (next <= PUSHER_ZMIN) {
    next = PUSHER_ZMIN;
    pusherDir = 1;
  }
  pusherDelta = next - pusherFront;
  pusherFront = next;
}

// -------------------------------------------------------
// Medal physics
// -------------------------------------------------------
function updateMedals() {
  var pb = getPusherBack();
  for (var i = medals.length - 1; i >= 0; i--) {
    var m = medals[i];

    if (m.z >= pb - 0.02 && m.z <= pusherFront + 0.01) {
      // Medal is on the pusher — loose forward follow,
      // barely moves when pusher retreats (ratchet effect).
      m.z += pusherDelta * (pusherDelta > 0 ? 0.6 : 0.05);
    } else if (m.z > pusherFront) {
      // Medal is on the field past the pusher.
      // Receives an indirect push and a slow natural drift.
      if (pusherDelta > 0) { m.z += pusherDelta * 0.25; }
      m.z += 0.0004;
    }

    // Tiny lateral drift for variety.
    m.x += (Math.random() - 0.5) * 0.0005;
    m.x = Math.max(-0.48, Math.min(0.48, m.x));

    // Medal reached the front edge.
    if (m.z >= 1.0) {
      // Only score if within the front opening (not the side edges).
      if (m.x > -0.45 && m.x < 0.45) { score++; }
      medals.splice(i, 1);
      continue;
    }

    // Safety: remove medals that drifted behind the field.
    if (m.z < -0.05) {
      medals.splice(i, 1);
    }
  }
}

// -------------------------------------------------------
// Shoot a medal from the back-centre of the pusher.
// -------------------------------------------------------
function shootMedal() {
  if (medalCount <= 0) { return; }
  medals.push({
    x: (Math.random() * 0.1 - 0.05),   // slight random offset from center
    z: getPusherBack() + 0.01
  });
  medalCount--;
}

// -------------------------------------------------------
// Main game-logic update (called once per frame).
// -------------------------------------------------------
function updateGame() {
  updatePusher();
  updateMedals();
}
