document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const menuButtons = document.querySelectorAll('.menu-toggle');
  const hero = document.querySelector('.hero');
  const logo = document.querySelector('.lab-logo');
  const buddy = document.querySelector('.lab-buddy');
  const balloonField = document.querySelector('.hero .balloon-field');

  if (balloonField && hero) {
    const balloonCount = 420;
    const balloons = [];

    for (let i = 0; i < balloonCount; i += 1) {
      const balloon = document.createElement('span');
      balloon.className = 'balloon';
      const size = 8 + Math.random() * 38;
      const x = 10 + Math.random() * 78;
      const y = 12 + Math.random() * 70;
      const opacity = 0.28 + Math.random() * 0.56;

      balloon.style.width = `${size}px`;
      balloon.style.height = `${size}px`;
      balloon.style.left = `${x}%`;
      balloon.style.top = `${y}%`;
      balloon.style.opacity = `${opacity}`;
      balloon.style.setProperty('--scale', (0.8 + Math.random() * 1.6).toFixed(2));
      balloon.style.setProperty('--bx', `${(Math.random() * 18 - 9).toFixed(2)}px`);
      balloon.style.setProperty('--by', `${(Math.random() * 18 - 9).toFixed(2)}px`);
      balloonField.appendChild(balloon);
      balloons.push({
        el: balloon,
        baseX: (Math.random() * 20 - 10).toFixed(2),
        baseY: (Math.random() * 20 - 10).toFixed(2),
      });
    }

    const updateBalloons = (mouseX, mouseY) => {
      const rect = hero.getBoundingClientRect();
      const localX = (mouseX - rect.left) / rect.width;
      const localY = (mouseY - rect.top) / rect.height;

      balloons.forEach((balloon, index) => {
        const wave = Math.sin((Date.now() * 0.0012) + index * 0.8);
        const offsetX = (localX - 0.5) * 58 * (1 + index / 30);
        const offsetY = (localY - 0.5) * 46 * (1 + index / 30);
        const x = Number(balloon.baseX) + offsetX + wave * 6;
        const y = Number(balloon.baseY) + offsetY + Math.cos(index + Date.now() * 0.0017) * 5;
        balloon.el.style.setProperty('--bx', `${x}px`);
        balloon.el.style.setProperty('--by', `${y}px`);
      });
    };

    let currentMouseX = window.innerWidth * 0.5;
    let currentMouseY = window.innerHeight * 0.5;

    hero.addEventListener('pointermove', (event) => {
      currentMouseX = event.clientX;
      currentMouseY = event.clientY;
      updateBalloons(currentMouseX, currentMouseY);
    });

    hero.addEventListener('pointerleave', () => {
      balloons.forEach((balloon) => {
        balloon.el.style.setProperty('--bx', `${balloon.baseX}px`);
        balloon.el.style.setProperty('--by', `${balloon.baseY}px`);
      });
    });

    const tickBalloons = () => {
      updateBalloons(currentMouseX, currentMouseY);
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
        const offsetX = moveX * (0.5 + index * 0.08) + Math.sin(state.time * 0.002 + index * 0.9) * 7;
        const offsetY = moveY * (0.42 + index * 0.06) + Math.cos(state.time * 0.0017 + index * 1.2) * 7;
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

    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const maxDistance = 260;

      state.active = true;
      const normalized = distance === 0 ? 0 : Math.min(1, distance / maxDistance);
      const repel = 1 - normalized;
      const forceX = (dx / Math.max(distance, 1)) * 110 * repel;
      const forceY = (dy / Math.max(distance, 1)) * 90 * repel;

      state.pointerX = -forceX;
      state.pointerY = -forceY;

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
