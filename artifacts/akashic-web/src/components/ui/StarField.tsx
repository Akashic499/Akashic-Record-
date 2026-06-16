import { useEffect, useRef } from "react";

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; radius: number; vx: number; vy: number; opacity: number; life: number; maxLife: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < numStars; i++) {
        stars.push(createStar());
      }
    };

    const createStar = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        opacity: Math.random(),
        life: 0,
        maxLife: Math.random() * 200 + 100
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach((star, i) => {
        star.x += star.vx;
        star.y += star.vy;
        star.life++;
        
        if (star.life >= star.maxLife) {
          stars[i] = createStar();
        } else {
          // Fade in and out based on life
          const fade = Math.sin((star.life / star.maxLife) * Math.PI);
          star.opacity = fade * 0.8;
        }

        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        ctx.beginPath();
        // Golden stars
        ctx.fillStyle = `rgba(201, 168, 76, ${star.opacity})`;
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Slight glow
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgba(201, 168, 76, ${star.opacity})`;
      });

      // Draw constellation connections
      ctx.lineWidth = 0.2;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(201, 168, 76, ${(1 - distance / 100) * 0.2})`;
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[-1] pointer-events-none opacity-50" />;
}