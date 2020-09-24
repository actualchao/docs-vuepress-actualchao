<template>
  <div id="home-animation">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script type="text/ecmascript-6">
import C from "../util/canvasUtils"
import Ball from "../util/canvasBall"

let renderFlag = true

export default {

  mounted() {
    const canvas = this.$refs.canvas
    const ctx = canvas.getContext('2d');
  
    let W, H;
    
    let particles = [], spring = 0.00005;
    
    window.onresize = function (){
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      createParticles(W * H / 17000);
    };
    
    window.onresize();
    
    function createParticles(num){
      if(num !== particles.length){
        particles.length = 0;
      }
      for(let i=0; i<num; i++){
        let size = C.rp([1, 3]);
        particles.push(new Ball({
          x: C.rp([0, W]),
          y: C.rp([0, H]),
          fillStyle: 'rgba(62,175,124,0.4)',
          vx: C.rp([-1.5, 1.5]),
          vy: C.rp([-1.5, 1.5]),
          r: size,
          m: size
        }));
      }
    }
    
    function move(p, i){
      p.x += p.vx;
      p.y += p.vy;
      
      for(let j=i+1; j<particles.length; j++){
        let target = particles[j];
        checkSpring(p, target);
        C.checkBallHit(p, target);
      }
      
      if(p.x - p.r > W){
        p.x = -p.r;
      }else if(p.x + p.r < 0){
        p.x = W + p.r;
      }
      if(p.y - p.r > H){
        p.y = -p.r;
      }else if(p.y + p.r < 0){
        p.y = H + p.r;
      }
    }
    
    function checkSpring(current, target){
      let dx = target.x - current.x;
      let dy = target.y - current.y;
      let dist = Math.sqrt(dx**2 + dy**2);
      let minDist = W > H ? W / 10 : H / 5;
      if(dist < minDist){
        drawLine(current, target, dist, minDist);
        let ax = dx * spring;
        let ay = dy * spring;
        current.vx += ax / current.m;
        current.vy += ay / current.m;
        target.vx -= ax / target.m;
        target.vy -= ay / target.m;
      }
    }
    
    function drawLine(current, target, dist, minDist){
      ctx.save();
      ctx.lineWidth = 2 * Math.max(0, (1 - dist / minDist));
      ctx.globalAlpha = Math.max(0, (1 - dist / minDist));
      ctx.strokeStyle = 'rgba(62,175,124,0.4)';
      ctx.beginPath();
      ctx.lineTo(current.x, current.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
      ctx.restore();
    }
    
    function draw(p){
      p.render(ctx);
    }
  
    (function drawFrame(){
      renderFlag&&window.requestAnimationFrame(drawFrame);
      
      ctx.clearRect(0, 0, W, H);
      
      particles.forEach(move);
      particles.forEach(draw);
    })();
  },
  beforeDestroy() {
    renderFlag = false
  }
}
</script>

<style lang="stylus" scoped>
#home-animation {
  width: 100vw;
  height: 100vh;
  position: fixed;
  pointer-events: none;
  z-index: 20;

  #canvas-animation {
    width: 100%;
    height: 100%;
    display: block;
    margin: 0 auto;
  }
}
</style>