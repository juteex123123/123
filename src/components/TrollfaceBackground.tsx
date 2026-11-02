import React, { useEffect, useRef } from 'react';

interface TrollfaceParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSpeed: number;
  angle: number;
  angularVelocity: number;
  size: number;
  mass: number;
  depth: number;
  isSpecial?: boolean; // The 1 special Anonymous trollface
}

export const TrollfaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: TrollfaceParticle[] = [];
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    // Track cursor/touch
    const mouse = {
      x: -9999,
      y: -9999,
      active: false,
      lastMoved: 0,
    };

    // Pre-rendered 3D sprites
    let primarySprite: HTMLCanvasElement | null = null;
    let primaryRatio = 1942 / 1730;

    let anonymousSprite: HTMLCanvasElement | null = null;
    let anonymousRatio = 735 / 671;

    const primaryImg = new Image();
    primaryImg.src = '/trollface_primary.png';

    const anonymousImg = new Image();
    anonymousImg.src = '/trollface_anonymous.png';

    const prepareSprite = (img: HTMLImageElement) => {
      const bakeWidth = 360;
      const ratio = img.width / img.height || 1.1;
      const bakeHeight = Math.round(bakeWidth / ratio);

      const bakeCanvas = document.createElement('canvas');
      bakeCanvas.width = bakeWidth;
      bakeCanvas.height = bakeHeight;
      const bCtx = bakeCanvas.getContext('2d');
      if (!bCtx) return null;

      // 1. Draw solid opaque image with lines
      bCtx.drawImage(img, 0, 0, bakeWidth, bakeHeight);

      // 2. Add subtle 3D sculptural volume and specular reflection onto solid body
      bCtx.save();
      bCtx.globalCompositeOperation = 'source-atop';

      const pillowGrad = bCtx.createRadialGradient(
        bakeWidth * 0.42,
        bakeHeight * 0.38,
        bakeWidth * 0.08,
        bakeWidth * 0.5,
        bakeHeight * 0.5,
        bakeWidth * 0.55
      );
      pillowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      pillowGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.45)');
      pillowGrad.addColorStop(0.75, 'rgba(235, 238, 243, 0.25)');
      pillowGrad.addColorStop(0.92, 'rgba(195, 200, 210, 0.45)');
      pillowGrad.addColorStop(1, 'rgba(145, 150, 160, 0.6)');

      bCtx.fillStyle = pillowGrad;
      bCtx.fillRect(0, 0, bakeWidth, bakeHeight);

      // Rim sheen
      const rimGrad = bCtx.createLinearGradient(0, 0, 0, bakeHeight);
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      rimGrad.addColorStop(0.15, 'rgba(255, 255, 255, 0.0)');
      rimGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.0)');
      rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
      bCtx.fillStyle = rimGrad;
      bCtx.fillRect(0, 0, bakeWidth, bakeHeight);

      bCtx.restore();

      // 3. Crisp outlines
      bCtx.save();
      bCtx.globalCompositeOperation = 'multiply';
      bCtx.drawImage(img, 0, 0, bakeWidth, bakeHeight);
      bCtx.restore();

      return bakeCanvas;
    };

    primaryImg.onload = () => {
      primaryRatio = primaryImg.width / primaryImg.height || 1.1;
      primarySprite = prepareSprite(primaryImg);
    };
    if (primaryImg.complete && primaryImg.naturalWidth > 0) {
      primaryRatio = primaryImg.width / primaryImg.height || 1.1;
      primarySprite = prepareSprite(primaryImg);
    }

    anonymousImg.onload = () => {
      anonymousRatio = anonymousImg.width / anonymousImg.height || 1.1;
      anonymousSprite = prepareSprite(anonymousImg);
    };
    if (anonymousImg.complete && anonymousImg.naturalWidth > 0) {
      anonymousRatio = anonymousImg.width / anonymousImg.height || 1.1;
      anonymousSprite = prepareSprite(anonymousImg);
    }

    let particleIdSeq = 1;

    const createParticle = (
      x: number,
      y: number,
      isMobile: boolean,
      isSpecial = false
    ): TrollfaceParticle => {
      const rand = Math.random();
      let size = 80;
      if (isSpecial) {
        size = 96; // Distinct medium-hero size for the special one
      } else if (rand < 0.25) {
        size = 55 + Math.random() * 20; // 55-75px
      } else if (rand < 0.8) {
        size = 75 + Math.random() * 35; // 75-110px
      } else {
        size = 110 + Math.random() * 35; // 110-145px
      }

      if (isMobile) {
        size *= 0.76;
      }

      const mass = (size / 80) ** 1.5;
      const depth = Math.min(1, Math.max(0, (size - 55) / 90));

      const baseSpeed = 0.32 + Math.random() * 0.4;
      const dir = Math.random() * Math.PI * 2;
      const vx = Math.cos(dir) * baseSpeed;
      const vy = Math.sin(dir) * baseSpeed;

      return {
        id: particleIdSeq++,
        x,
        y,
        vx,
        vy,
        baseSpeed,
        angle: (Math.random() - 0.5) * 0.6,
        angularVelocity: (Math.random() - 0.5) * 0.005,
        size,
        mass,
        depth,
        isSpecial,
      };
    };

    const initParticles = (width: number, height: number) => {
      const isMobile = width < 768;
      const targetCount = isMobile ? 22 : Math.min(42, Math.floor((width * height) / 32000) + 12);

      const list: TrollfaceParticle[] = [];

      // Exactly ONE special Anonymous trollface
      list.push(createParticle(Math.random() * width, Math.random() * height, isMobile, true));

      // All remaining particles are classic trollfaces
      for (let i = 1; i < targetCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        list.push(createParticle(x, y, isMobile, false));
      }

      particles = list;
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const isMobile = width < 768;
      const targetCount = isMobile ? 22 : Math.min(42, Math.floor((width * height) / 32000) + 12);

      if (particles.length === 0) {
        initParticles(width, height);
      } else {
        const scaleX = width / Math.max(lastWidth, 1);
        const scaleY = height / Math.max(lastHeight, 1);

        particles.forEach((p) => {
          p.x = Math.max(p.size * 0.5, Math.min(width - p.size * 0.5, p.x * scaleX));
          p.y = Math.max(p.size * 0.5, Math.min(height - p.size * 0.5, p.y * scaleY));
        });

        // Ensure there is always exactly one special particle
        const hasSpecial = particles.some((p) => p.isSpecial);
        if (!hasSpecial && particles.length > 0) {
          particles[0].isSpecial = true;
        }

        if (particles.length < targetCount) {
          const needed = targetCount - particles.length;
          for (let i = 0; i < needed; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            particles.push(createParticle(x, y, isMobile, false));
          }
        }
      }

      lastWidth = width;
      lastHeight = height;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      mouse.lastMoved = performance.now();
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
        mouse.lastMoved = performance.now();
      }
    };

    const onTouchEnd = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (
        canvas.width !== Math.round(width * dpr) ||
        canvas.height !== Math.round(height * dpr) ||
        Math.abs(width - lastWidth) > 5 ||
        Math.abs(height - lastHeight) > 5
      ) {
        handleResize();
      }

      ctx.clearRect(0, 0, width, height);

      if (mouse.active && performance.now() - mouse.lastMoved > 2500) {
        mouse.active = false;
      }

      if (!prefersReducedMotion) {
        // 1. Mouse repulsion
        if (mouse.active) {
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            const repelRadius = Math.max(180, p.size * 1.8);

            if (dist < repelRadius && dist > 1) {
              const normalDist = dist / repelRadius;
              const force = (1 - normalDist) * (1 - normalDist) * 3.8;
              const nx = dx / dist;
              const ny = dy / dist;

              p.vx += (nx * force) / p.mass;
              p.vy += (ny * force) / p.mass;
              p.angularVelocity += ((Math.random() - 0.5) * 0.008) / p.mass;
            }
          }
        }

        // 2. Physical Elastic Collision between all trollfaces (NO passing through each other)
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const radiusP = p.size * 0.46;

          for (let j = i + 1; j < particles.length; j++) {
            const other = particles[j];
            const radiusOther = other.size * 0.46;
            const minDistance = radiusP + radiusOther;

            const cdx = p.x - other.x;
            const cdy = p.y - other.y;
            const cdist = Math.hypot(cdx, cdy);

            if (cdist < minDistance && cdist > 0.001) {
              const nx = cdx / cdist;
              const ny = cdy / cdist;
              const overlap = minDistance - cdist;

              // Immediate un-overlap
              const totalMass = p.mass + other.mass;
              p.x += nx * (overlap * (other.mass / totalMass));
              p.y += ny * (overlap * (other.mass / totalMass));
              other.x -= nx * (overlap * (p.mass / totalMass));
              other.y -= ny * (overlap * (p.mass / totalMass));

              // Elastic bounce
              const rvx = p.vx - other.vx;
              const rvy = p.vy - other.vy;
              const velAlongNormal = rvx * nx + rvy * ny;

              if (velAlongNormal < 0) {
                const restitution = 0.82;
                const impulseMag = -(1 + restitution) * velAlongNormal / (1 / p.mass + 1 / other.mass);

                p.vx += (impulseMag / p.mass) * nx;
                p.vy += (impulseMag / p.mass) * ny;
                other.vx -= (impulseMag / other.mass) * nx;
                other.vy -= (impulseMag / other.mass) * ny;

                p.angularVelocity += ((Math.random() - 0.5) * 0.004) / p.mass;
                other.angularVelocity -= ((Math.random() - 0.5) * 0.004) / other.mass;
              }
            }
          }
        }

        // 3. Natural velocity damping
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const currentSpeed = Math.hypot(p.vx, p.vy);
          if (currentSpeed > p.baseSpeed * 1.05) {
            p.vx *= 0.97;
            p.vy *= 0.97;
          } else if (currentSpeed < p.baseSpeed * 0.7 && currentSpeed > 0.01) {
            p.vx *= 1.02;
            p.vy *= 1.02;
          }

          // 4. Coordinates & rotation
          p.x += p.vx * (dt * 60);
          p.y += p.vy * (dt * 60);
          p.angle += p.angularVelocity * (dt * 60);
          p.angularVelocity *= 0.995;

          if (p.angle > Math.PI * 2) p.angle -= Math.PI * 2;
          if (p.angle < -Math.PI * 2) p.angle += Math.PI * 2;

          // 5. Boundary Bounce
          const padding = p.size * 0.45;
          if (p.x < padding && p.vx < 0) {
            p.vx = Math.abs(p.vx) * 0.96;
            p.x = padding;
          } else if (p.x > width - padding && p.vx > 0) {
            p.vx = -Math.abs(p.vx) * 0.96;
            p.x = width - padding;
          }

          if (p.y < padding && p.vy < 0) {
            p.vy = Math.abs(p.vy) * 0.96;
            p.y = padding;
          } else if (p.y > height - padding && p.vy > 0) {
            p.vy = -Math.abs(p.vy) * 0.96;
            p.y = height - padding;
          }
        }
      }

      // 6. Draw 3D solid trollfaces
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const isAnon = p.isSpecial;
        const sprite = isAnon
          ? anonymousSprite || (anonymousImg.complete ? anonymousImg : null)
          : primarySprite || (primaryImg.complete ? primaryImg : null);

        if (!sprite) continue;

        const ratio = isAnon ? anonymousRatio : primaryRatio;
        const h = p.size / ratio;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        const shadowBlur = Math.round(p.size * 0.18);
        const shadowOffset = Math.round(p.size * 0.08);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = Math.round(p.size * 0.02);
        ctx.shadowOffsetY = shadowOffset;

        ctx.drawImage(sprite, -p.size / 2, -h / 2, p.size, h);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block w-full h-full"
      aria-hidden="true"
    />
  );
};
