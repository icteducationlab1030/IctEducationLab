document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const menuButtons = document.querySelectorAll('.menu-toggle');
  const hero = document.querySelector('.hero');
  const logo = document.querySelector('.lab-logo');
  const buddy = document.querySelector('.lab-buddy');
  const balloonField = document.querySelector('.hero .balloon-field');

  if (balloonField && hero) {
    const balloonCount = 560;
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
      balloon.style.setProperty('--bx', `${(Math.random() * 14 - 7).toFixed(2)}px`);
      balloon.style.setProperty('--by', `${(Math.random() * 14 - 7).toFixed(2)}px`);
      balloonField.appendChild(balloon);

      balloons.push({
        el: balloon,
        baseX: x,
        baseY: y,
        driftX: (Math.random() * 18 - 9),
        driftY: (Math.random() * 18 - 9),
        layer: Math.random(),
      });
    }

    const updateBalloons = (mouseX, mouseY) => {
      const rect = hero.getBoundingClientRect();
      const localX = (mouseX - rect.left) / rect.width;
      const localY = (mouseY - rect.top) / rect.height;
      const now = Date.now() * 0.001;

      balloons.forEach((balloon, index) => {
        const dx = localX * 100 - balloon.baseX;
        const dy = localY * 100 - balloon.baseY;
        const dist = Math.hypot(dx, dy);
        const repelRadius = 18 + balloon.layer * 30;
        const idleX = balloon.driftX + Math.sin(now * 1.2 + index * 0.7) * 2.6;
        const idleY = balloon.driftY + Math.cos(now * 1.5 + index * 0.9) * 2.2;

        let offsetX = idleX;
        let offsetY = idleY;

        if (dist < repelRadius * 7) {
          const push = (1 - dist / (repelRadius * 7)) * 46;
          const dirX = dx / (dist || 1);
          const dirY = dy / (dist || 1);
          offsetX -= dirX * push;
          offsetY -= dirY * push;
        }

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
        balloon.el.style.setProperty('--bx', `${balloon.driftX.toFixed(2)}px`);
        balloon.el.style.setProperty('--by', `${balloon.driftY.toFixed(2)}px`);
      });
    });

    const tickBalloons = (timestamp) => {
      if (timestamp - lastRender > 24) {
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

      if (buddy) {
        const reveal = Math.abs(dx) > 70 || Math.abs(dy) > 70;
        if (reveal) {
          buddy.classList.add('visible');
        }
      }
    });

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
