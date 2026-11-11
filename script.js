document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const menuButtons = document.querySelectorAll('.menu-toggle');
  const hero = document.querySelector('.hero');
  const logo = document.querySelector('.lab-logo');
  const buddy = document.querySelector('.lab-buddy');
  const balloonField = document.querySelector('.hero .balloon-field');

  if (balloonField && hero) {
    const balloonCount = 700;
    const balloons = [];

    for (let i = 0; i < balloonCount; i += 1) {
      const balloon = document.createElement('span');
      balloon.className = 'balloon';
      const size = 8 + Math.random() * 72;
      const x = 1 + Math.random() * 98;
      const y = 2 + Math.random() * 96;
      const opacity = 0.28 + Math.random() * 0.72;

      balloon.style.width = `${size}px`;
      balloon.style.height = `${size}px`;
      balloon.style.left = `${x}%`;
      balloon.style.top = `${y}%`;
      balloon.style.opacity = `${opacity}`;
      balloon.style.setProperty('--scale', (0.8 + Math.random() * 2.2).toFixed(2));
      balloon.style.setProperty('--depth', `${(Math.random() * 28 - 14).toFixed(2)}px`);
      balloon.style.setProperty('--float-duration', `${(8 + Math.random() * 12).toFixed(2)}s`);
      balloonField.appendChild(balloon);

      balloons.push({
        el: balloon,
        baseX: x,
        baseY: y,
        radius: 140 + size * 1.2,
      });
    }

    const updateBalloons = (mouseX, mouseY) => {
      const rect = hero.getBoundingClientRect();

      balloons.forEach((balloon) => {
        const px = rect.left + (rect.width * balloon.baseX / 100);
        const py = rect.top + (rect.height * balloon.baseY / 100);
        const dx = mouseX - px;
        const dy = mouseY - py;
        const distSq = dx * dx + dy * dy;
        const activeRadiusSq = balloon.radius * balloon.radius;

        if (distSq > activeRadiusSq) {
          balloon.el.style.setProperty('--bx', '0px');
          balloon.el.style.setProperty('--by', '0px');
          return;
        }

        const dist = Math.sqrt(distSq) || 1;
        const push = (1 - dist / balloon.radius) * 26;
        const dirX = dx / dist;
        const dirY = dy / dist;
        const offsetX = -dirX * push;
        const offsetY = -dirY * push;

        balloon.el.style.setProperty('--bx', `${offsetX.toFixed(2)}px`);
        balloon.el.style.setProperty('--by', `${offsetY.toFixed(2)}px`);
      });
    };

    let currentMouseX = window.innerWidth * 0.5;
    let currentMouseY = window.innerHeight * 0.5;
    let lastRender = 0;

    hero.addEventListener('pointermove', (event) => {
      currentMouseX = event.clientX;
      currentMouseY = event.clientY;
      updateBalloons(currentMouseX, currentMouseY);
    });

    hero.addEventListener('pointerleave', () => {
      balloons.forEach((balloon) => {
        balloon.el.style.setProperty('--bx', '0px');
        balloon.el.style.setProperty('--by', '0px');
      });
    });

    const tickBalloons = (timestamp) => {
      if (timestamp - lastRender > 32) {
        updateBalloons(currentMouseX, currentMouseY);
        lastRender = timestamp;
      }
      requestAnimationFrame(tickBalloons);
    };

    requestAnimationFrame(tickBalloons);
  }

  const setMenuOpen = (open) => {
    body.classList.toggle('menu-open', open);
  };

  menuButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = !body.classList.contains('menu-open');
      setMenuOpen(open);
    });
  });

  document.addEventListener('click', (event) => {
    const clickedMenu = event.target.closest('.floating-menu');
    const clickedTrigger = event.target.closest('.menu-toggle');
    const clickedBuddy = event.target.closest('.lab-buddy');

    if (clickedBuddy) {
      setMenuOpen(!body.classList.contains('menu-open'));
      return;
    }

    if (body.classList.contains('menu-open') && !clickedMenu && !clickedTrigger) {
      setMenuOpen(false);
    }
  });

  if (hero && logo) {
    const chars = [...logo.querySelectorAll('.char')];
    const state = {
      pointerX: 0,
      pointerY: 0,
      currentX: 0,
      currentY: 0,
      active: false,
      time: 0,
    };

    const baseOffsets = chars.map((char, index) => ({
      x: (index - chars.length / 2) * 0,
      y: 0,
    }));

    const updateLogo = () => {
      const moveX = state.currentX;
      const moveY = state.currentY;
      const tiltY = (moveX / 18) * 20;
      const tiltX = (moveY / 18) * -20;

      logo.style.setProperty('--mx', `${moveX}px`);
      logo.style.setProperty('--my', `${moveY}px`);
      logo.style.setProperty('--tilt-x', `${tiltX}deg`);
      logo.style.setProperty('--tilt-y', `${tiltY}deg`);

      chars.forEach((char, index) => {
        const drift = (index - chars.length / 2) * 2.2;
        const dragX = Number(char.dataset.dragX || 0);
        const dragY = Number(char.dataset.dragY || 0);
        const offsetX = moveX * (0.5 + index * 0.08) + Math.sin(state.time * 0.002 + index * 0.9) * 7 + dragX;
        const offsetY = moveY * (0.42 + index * 0.06) + Math.cos(state.time * 0.0017 + index * 1.2) * 7 + dragY;
        const rotate = (moveX * 0.8) + drift * 1.1 + Math.sin(state.time * 0.004 + index) * 12;
        const blur = state.active ? Math.min(3, Math.abs(moveX) * 0.04 + Math.abs(moveY) * 0.03) : 0;

        char.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotate}deg)`;
        char.style.filter = `blur(${blur}px)`;
      });
    };

    const tick = () => {
      const idleX = Math.sin(state.time * 0.0014) * 6;
      const idleY = Math.cos(state.time * 0.0011) * 5;

      if (!state.active) {
        state.pointerX = idleX;
        state.pointerY = idleY;
      }

      state.currentX += (state.pointerX - state.currentX) * 0.08;
      state.currentY += (state.pointerY - state.currentY) * 0.08;
      state.time += 1;
      updateLogo();
      requestAnimationFrame(tick);
    };

    chars.forEach((char) => {
      char.dataset.dragX = '0';
      char.dataset.dragY = '0';
      char.style.touchAction = 'none';
      char.style.cursor = 'grab';

      char.addEventListener('pointerdown', (event) => {
        char.setPointerCapture(event.pointerId);
        char.dataset.dragging = 'true';
        char.dataset.dragStartX = String(Number(char.dataset.dragX || 0));
        char.dataset.dragStartY = String(Number(char.dataset.dragY || 0));
        char.dataset.pointerStartX = String(event.clientX);
        char.dataset.pointerStartY = String(event.clientY);
      });

      char.addEventListener('pointermove', (event) => {
        if (char.dataset.dragging !== 'true') return;

        const dx = event.clientX - Number(char.dataset.pointerStartX);
        const dy = event.clientY - Number(char.dataset.pointerStartY);
        char.dataset.dragX = String(Number(char.dataset.dragStartX) + dx * 0.9);
        char.dataset.dragY = String(Number(char.dataset.dragStartY) + dy * 0.9);
      });

      char.addEventListener('pointerup', () => {
        char.dataset.dragging = 'false';
      });

      char.addEventListener('pointerleave', () => {
        char.dataset.dragging = 'false';
      });
    });

    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const maxDistance = 260;

      state.active = distance < maxDistance;
      const normalized = distance === 0 ? 0 : Math.min(1, distance / maxDistance);
      const repel = 1 - normalized;
      const forceX = (dx / Math.max(distance, 1)) * 110 * repel;
      const forceY = (dy / Math.max(distance, 1)) * 90 * repel;

      state.pointerX = -forceX * 0.18;
      state.pointerY = -forceY * 0.18;

    });

    if (buddy) {
      const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
      const buddyColor = {
        r: 156,
        g: 210,
        b: 255,
        targetR: 156,
        targetG: 210,
        targetB: 255,
      };

      const applyBuddyColor = () => {
        buddy.style.setProperty('--buddy-r', `${Math.round(buddyColor.r)}`);
        buddy.style.setProperty('--buddy-g', `${Math.round(buddyColor.g)}`);
        buddy.style.setProperty('--buddy-b', `${Math.round(buddyColor.b)}`);
      };

      applyBuddyColor();

      const animateBuddyColor = () => {
        buddyColor.r += (buddyColor.targetR - buddyColor.r) * 0.08;
        buddyColor.g += (buddyColor.targetG - buddyColor.g) * 0.08;
        buddyColor.b += (buddyColor.targetB - buddyColor.b) * 0.08;
        applyBuddyColor();
        requestAnimationFrame(animateBuddyColor);
      };

      requestAnimationFrame(animateBuddyColor);

      buddy.addEventListener('pointermove', (event) => {
        const rect = buddy.getBoundingClientRect();
        const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        const hue = (px * 360 + py * 80 + Date.now() * 0.01) % 360;

        let r = 255;
        let g = 255;
        let b = 255;

        if (hue < 60) {
          r = 255; g = Math.round(255 * hue / 60); b = 0;
        } else if (hue < 120) {
          r = Math.round(255 * (120 - hue) / 60); g = 255; b = 0;
        } else if (hue < 180) {
          r = 0; g = 255; b = Math.round(255 * (hue - 120) / 60);
        } else if (hue < 240) {
          r = 0; g = Math.round(255 * (240 - hue) / 60); b = 255;
        } else if (hue < 300) {
          r = Math.round(255 * (hue - 240) / 60); g = 0; b = 255;
        } else {
          r = 255; g = 0; b = Math.round(255 * (360 - hue) / 60);
        }

        buddyColor.targetR = r * (0.72 + py * 0.3);
        buddyColor.targetG = g * (0.72 + px * 0.3);
        buddyColor.targetB = b * (0.72 + (1 - py) * 0.3);
      });
    }

    hero.addEventListener('pointerleave', () => {
      state.active = false;
      state.pointerX = 0;
      state.pointerY = 0;
    });

    window.addEventListener('pointerup', () => {
      state.active = false;
      state.pointerX = 0;
      state.pointerY = 0;
    });

    requestAnimationFrame(tick);
  }
});
