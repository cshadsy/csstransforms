const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const center = { x: canvas.width/2, y: canvas.height/2 };
const radius = 90;
const numPoints = 60;
const points = [];

for(let i=0;i<numPoints;i++){
  const angle = (i/numPoints)*Math.PI*2;
  points.push({angle,radiusCurrent:radius,radiusTarget:radius,vr:0});
}

let mouse = null;
let isPressed = false;

// modify these to edit the effect
const hoverBulge = 15;
const pressForce = 25;
const pressRadius = 60;
const spring = 0.15;
const damping = 0.88;

canvas.addEventListener('mousemove', e=>{
  const rect = canvas.getBoundingClientRect();
  mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});
canvas.addEventListener('mouseleave', ()=> mouse=null);
canvas.addEventListener('mousedown', ()=> isPressed=true);
canvas.addEventListener('mouseup', ()=> isPressed=false);

function animate(){
  for(let i=0;i<numPoints;i++){
    const p = points[i];
    let targetR = radius;
    if(mouse){
      const px = center.x + Math.cos(p.angle)*radius;
      const py = center.y + Math.sin(p.angle)*radius;
      const dx = px - mouse.x;
      const dy = py - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(!isPressed && dist<radius+hoverBulge) targetR += hoverBulge*(1 - dist/(radius+hoverBulge));
      if(isPressed && dist<pressRadius) targetR += pressForce*(1 - dist/pressRadius);
    }
    p.radiusTarget = targetR;
    p.vr += (p.radiusTarget - p.radiusCurrent)*spring;
    p.vr *= damping;
    p.radiusCurrent += p.vr;
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const grad = ctx.createRadialGradient(center.x-20,center.y-20,10,center.x,center.y,radius);
  grad.addColorStop(0.6,'rgba(196, 4, 4, 0.66)');
  grad.addColorStop(1,'rgba(200, 0, 0, 0.52)');
  ctx.fillStyle = grad;
  ctx.strokeStyle = 'rgba(200, 0, 0, 0.59)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  for(let i=0;i<numPoints;i++){
    const p0 = points[i];
    const p1 = points[(i+1)%numPoints];
    const x0 = center.x + Math.cos(p0.angle)*p0.radiusCurrent;
    const y0 = center.y + Math.sin(p0.angle)*p0.radiusCurrent;
    const x1 = center.x + Math.cos(p1.angle)*p1.radiusCurrent;
    const y1 = center.y + Math.sin(p1.angle)*p1.radiusCurrent;
    const mx = (x0+x1)/2;
    const my = (y0+y1)/2;
    if(i===0) ctx.moveTo(mx,my);
    ctx.quadraticCurveTo(x0,y0,mx,my);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  requestAnimationFrame(animate);
}

animate();
