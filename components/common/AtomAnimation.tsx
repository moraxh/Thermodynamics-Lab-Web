"use client"

import { useEffect, useRef } from 'react';

interface Electron {
  angle: number;
  speed: number;
  radius: number;
  orbitRotation: number;
}

export default function AtomAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Atom properties
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const nucleusRadius = 20;

    // Create electrons with different orbits
    const electrons: Electron[] = [
      { angle: 0, speed: 0.01, radius: 150, orbitRotation: 0 },
      { angle: Math.PI, speed: 0.01, radius: 150, orbitRotation: 0 },
      { angle: Math.PI / 2, speed: 0.015, radius: 230, orbitRotation: Math.PI / 3 },
      { angle: Math.PI * 1.5, speed: 0.015, radius: 230, orbitRotation: Math.PI / 3 },
      { angle: 0, speed: 0.02, radius: 310, orbitRotation: Math.PI / 6 },
      { angle: Math.PI * 0.66, speed: 0.02, radius: 310, orbitRotation: Math.PI / 6 },
      { angle: Math.PI * 1.33, speed: 0.02, radius: 310, orbitRotation: Math.PI / 6 },
    ];

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw nucleus with glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, nucleusRadius * 3);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, nucleusRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw nucleus core
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw inner glow
      ctx.fillStyle = 'rgba(246, 195, 8, 0.6)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, nucleusRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Draw orbits and electrons
      electrons.forEach((electron) => {
        // Calculate orbit ellipse
        const a = electron.radius; // semi-major axis
        const b = electron.radius * 0.3; // semi-minor axis (flattened)

        // Draw orbit path
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(electron.orbitRotation);
        
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Calculate electron position on ellipse
        const x = a * Math.cos(electron.angle);
        const y = b * Math.sin(electron.angle);

        // Draw electron glow
        const electronGradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
        electronGradient.addColorStop(0, 'rgba(246, 195, 8, 1)');
        electronGradient.addColorStop(0.5, 'rgba(246, 195, 8, 0.5)');
        electronGradient.addColorStop(1, 'rgba(246, 195, 8, 0)');
        
        ctx.fillStyle = electronGradient;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Draw electron core
        ctx.fillStyle = '#f6c308';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw electron trail
        ctx.strokeStyle = 'rgba(246, 195, 8, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const trailLength = 0.3;
        const startAngle = electron.angle - trailLength;
        for (let i = 0; i <= 10; i++) {
          const t = startAngle + (trailLength * i / 10);
          const tx = a * Math.cos(t);
          const ty = b * Math.sin(t);
          if (i === 0) ctx.moveTo(tx, ty);
          else ctx.lineTo(tx, ty);
        }
        ctx.stroke();

        ctx.restore();

        // Update electron angle
        electron.angle += electron.speed;
      });

      // Draw connecting energy lines occasionally
      if (Math.random() > 0.97) {
        const randomElectron = electrons[Math.floor(Math.random() * electrons.length)];
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(randomElectron.orbitRotation);
        
        const x = randomElectron.radius * Math.cos(randomElectron.angle);
        const y = randomElectron.radius * 0.3 * Math.sin(randomElectron.angle);
        
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-40"
      style={{ pointerEvents: 'none' }}
    />
  );
}
