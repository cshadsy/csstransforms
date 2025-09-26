const svg = document.querySelector('.glass-button');
const path = svg.querySelector('path');
const center = { x: 100, y: 100 };
const radius = 90;

const points = [];
const numPoints = 60;
for (let i = 0; i < numPoints; i++) {
  const angle = (i / numPoints) * Math.PI * 2;
  points.push({
    x0: center.x + radius * Math.cos(angle),
    y0: center.y + radius * Math.sin(angle),
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
    vx: 0,
    vy: 0
  });
}

// if you want to modify the effect, these are the main effect variables
const spring = 0.15;
const damping = 0.8;
const hoverBulge = 15; 
const pressForce = 25; 
const pressRadius = 60;

let mouse = null;
let isPressed = false;

function drawPath() {
  let d = "";
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p0 = points[i];
    const p1 = points[(i + 1) % n];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    if (i === 0) d += `M ${midX} ${midY} `;
    const next = points[(i + 2) % n];
    const cx = p1.x;
    const cy = p1.y;
    const nx = (p1.x + next.x) / 2;
    const ny = (p1.y + next.y) / 2;
    d += `Q ${cx} ${cy} ${nx} ${ny} `;
  }
  d += "Z";
  path.setAttribute('d', d);
}

function animate() {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    let targetX = p.x0;
    let targetY = p.y0;

    if (mouse) {
      const dx = mouse.x - p.x0;
      const dy = mouse.y - p.y0;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (!isPressed && dist < radius + hoverBulge) {
        const force = hoverBulge * (1 - dist/(radius + hoverBulge));
        const angle = Math.atan2(dy, dx);
        targetX = p.x0 + Math.cos(angle) * force;
        targetY = p.y0 + Math.sin(angle) * force;
      }

      if (isPressed && dist < pressRadius) {
        const force = pressForce * (1 - dist/pressRadius);
        const angle = Math.atan2(dy, dx);
        targetX = p.x0 + Math.cos(angle) * force;
        targetY = p.y0 + Math.sin(angle) * force;
      }
    }

    p.vx += (targetX - p.x) * spring;
    p.vy += (targetY - p.y) * spring;
    p.vx *= damping;
    p.vy *= damping;
    p.x += p.vx;
    p.y += p.vy;
  }

  drawPath();
  requestAnimationFrame(animate);
}

svg.addEventListener('mousemove', e => {
  const rect = svg.getBoundingClientRect();
  mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});
svg.addEventListener('mouseleave', () => mouse = null);
svg.addEventListener('mousedown', () => isPressed = true);
svg.addEventListener('mouseup', () => isPressed = false);

drawPath();
animate();