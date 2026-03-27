var medals = [];
var score = 0;
var medalCount = 50;

var pusher = {
  x: 140,
  y: 300,
  width: 200,
  height: 20,
  speed: 2,
  direction: 1
};

function updatePusher() {
  pusher.y += pusher.speed * pusher.direction;
  if (pusher.y >= 320 || pusher.y <= 200) {
    pusher.direction *= -1;
  }
}

function updateMedals() {
  for (var i = medals.length - 1; i >= 0; i--) {
    var m = medals[i];
    m.y += m.vy;

    if (
      m.y + m.radius >= pusher.y &&
      m.y - m.radius <= pusher.y + pusher.height &&
      m.x + m.radius >= pusher.x &&
      m.x - m.radius <= pusher.x + pusher.width
    ) {
      m.vy *= -1;
    }

    if (m.y > 400) {
      score++;
      medals.splice(i, 1);
    }
  }
}

function shootMedal(x) {
  medals.push({ x: x, y: 0, vx: 0, vy: 3, radius: 15 });
}
