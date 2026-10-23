import { useEffect, useRef } from 'react';

const WIDTH = 900, HEIGHT = 600;
const CELL = 68, OFFSET_X = 110, OFFSET_Y = 52;
const location = point => [OFFSET_X + point[0] * CELL, OFFSET_Y + point[1] * CELL];

export default function GameBoard({ level, game }) {
  const canvas = useRef(null);
  const latest = useRef({ level, game });
  const previous = useRef({ position: 0, level });
  latest.current = { level, game };
  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    const background = new Image();
    const sprites = new Image();
    background.src = `${import.meta.env.BASE_URL}assets/jungle.png`;
    sprites.src = `${import.meta.env.BASE_URL}assets/sprites.png`;
    let frame;
    let animation = { start: 0, from: 0, to: 0, jumping: false };
    function draw(now) {
      const { level: current, game: state } = latest.current;
      if (previous.current.level !== current) {
        animation = { start: now, from: 0, to: 0, jumping: false };
        previous.current = { position: 0, level: current };
      }
      if (previous.current.position !== state.position) {
        animation = { start: now, from: previous.current.position, to: state.position, jumping: state.lastAction === 'jump' };
        previous.current.position = state.position;
      }
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#9cad6c'; ctx.fillRect(0,0,WIDTH,HEIGHT);
      if (background.complete && background.naturalWidth) ctx.drawImage(background,0,0,WIDTH,HEIGHT);
      ctx.imageSmoothingEnabled = true;
      const spriteWidth = sprites.naturalWidth / 2;
      const spriteHeight = sprites.naturalHeight / 2;
      const sprite = (column, row, x, y, width, height = width) => {
        if (sprites.complete && spriteWidth) ctx.drawImage(sprites, column * spriteWidth, row * spriteHeight, spriteWidth, spriteHeight, x, y, width, height);
      };
      // The light grid makes counting stones easier without obscuring the artwork.
      ctx.strokeStyle = 'rgba(52,85,42,.12)'; ctx.lineWidth = 1;
      for (let x = 0; x < 10; x++) for (let y = 0; y < 7; y++) {
        const [gx,gy] = location([x,y]); ctx.strokeRect(gx-CELL/2,gy-CELL/2,CELL,CELL);
      }
      current.path.forEach((point, i) => {
        const [x,y] = location(point);
        ctx.fillStyle = '#b4b498'; ctx.fillRect(x-CELL/2,y-CELL/2,CELL,CELL);
        sprite(1,1,x-CELL/2,y-CELL/2,CELL);
        ctx.strokeStyle = 'rgba(75,74,51,.2)';ctx.strokeRect(x-CELL/2,y-CELL/2,CELL,CELL);
        if (i > 0 && !current.rocks.includes(i) && i !== current.path.length - 1) {
          ctx.fillStyle = 'rgba(66,68,45,.52)'; ctx.font = '11px monospace';ctx.textAlign='center';ctx.fillText(String(i),x,y+25);
        }
      });
      current.rocks.forEach(index => { const [x,y] = location(current.path[index]); sprite(0,1,x-32,y-39,64); });
      const [goalX,goalY] = location(current.path.at(-1));
      if (!state.won) {
        const pulse = Math.sin(now / 350) * 4;
        const glow = ctx.createRadialGradient(goalX,goalY,2,goalX,goalY,58);
        glow.addColorStop(0,'rgba(255,225,99,.65)');glow.addColorStop(1,'rgba(255,225,99,0)');
        ctx.fillStyle=glow;ctx.fillRect(goalX-60,goalY-60,120,120);
        sprite(1,0,goalX-34,goalY-40+pulse,68);
      }
      function sign(text,x,y) {
        ctx.fillStyle = '#9b703b';ctx.fillRect(x-25,y-13,50,24);
        ctx.fillStyle = '#f8dc9e';ctx.fillRect(x-23,y-11,46,20);
        ctx.fillStyle = '#60452e';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(text,x,y+3);
      }
      sign('GOAL',goalX,goalY-58);
      const [startX,startY] = location(current.path[0]);sign('START',startX,startY+47);
      state.clones.forEach((position,i) => {
        const [x,y] = location(current.path[position]);
        ctx.save();ctx.globalAlpha=.78; sprite(0,0,x-44+i*8,y-38-i*5,58);ctx.restore();
      });
      const progress = Math.min(1, (now - animation.start) / 300);
      const eased = 1 - (1-progress)**3;
      const from = location(current.path[Math.min(animation.from,current.path.length-1)]);
      const to = location(current.path[animation.to]);
      const x = from[0] + (to[0]-from[0])*eased;
      const y = from[1] + (to[1]-from[1])*eased - (animation.jumping ? Math.sin(progress*Math.PI)*60 : Math.sin(progress*Math.PI)*9);
      ctx.fillStyle='rgba(38,56,25,.22)';ctx.beginPath();ctx.ellipse(x,y+20,24,7,0,0,Math.PI*2);ctx.fill();
      sprite(0,0,x-42,y-53+(state.won ? Math.sin(now/160)*5 : 0),84);
      if (state.won) {
        for (let i=0;i<22;i++) {
          ctx.fillStyle=['#ffe374','#b7a0fa','#d5f29a'][i%3];
          const px=(i*137+Math.sin(i)*80)%WIDTH;
          const py=(now/18+i*47)%HEIGHT;
          ctx.fillRect(px,py,5,9);
        }
      }
      frame=requestAnimationFrame(draw);
    }
    frame=requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={canvas} width={WIDTH} height={HEIGHT} aria-label={`Jungle puzzle. Milo is on stone ${game.position}. Banana is on stone ${level.path.length - 1}. Rocks are on stones ${level.rocks.join(', ')}. Monkey friends: ${game.clones.length}.`} role="img" />;
}
