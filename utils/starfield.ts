// utils/starfield.ts

interface Star {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  opacity: number;
  opacityDirection: number; // 1 for increasing, -1 for decreasing
}

export function initStarfield() {
  const canvas = document.getElementById('starfield-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error("Starfield canvas not found");
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error("Could not get canvas context");
    return;
  }

  let stars: Star[] = [];
  const numStars = 50; // A subtle number of stars
  const starColor = 'rgba(255, 255, 255, 0.7)';
  const blinkSpeed = 0.005;

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = []; // Re-initialize stars on resize
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5, // Small stars
        vx: (Math.random() - 0.5) * 0.3, // Slow horizontal velocity
        vy: (Math.random() - 0.5) * 0.3, // Slow vertical velocity
        opacity: Math.random(),
        opacityDirection: Math.random() > 0.5 ? 1 : -1,
      });
    }
  };

  const animate = () => {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
      // Update position
      star.x += star.vx;
      star.y += star.vy;

      // Bounce off edges (the "pong" effect)
      if (star.x - star.radius < 0 || star.x + star.radius > canvas.width) {
        star.vx *= -1;
      }
      if (star.y - star.radius < 0 || star.y + star.radius > canvas.height) {
        star.vy *= -1;
      }

      // Update opacity for the blinking effect
      star.opacity += blinkSpeed * star.opacityDirection;
      if (star.opacity > 1 || star.opacity < 0.1) {
        star.opacityDirection *= -1;
        // Clamp the value to prevent it from going out of bounds
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));
      }

      // Draw the star
      ctx.beginPath();
      ctx.globalAlpha = star.opacity;
      ctx.fillStyle = starColor;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.globalAlpha = 1.0; // Reset global alpha for the next frame
    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas(); // Initial setup
  animate();
}
