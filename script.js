let highestZ = 1;

class Paper {
  holdingPaper = false;
  pointerTouchX = 0;
  pointerTouchY = 0;
  pointerX = 0;
  pointerY = 0;
  prevPointerX = 0;
  prevPointerY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;
  activePointerId = null;

  init(paper) {
    // Pointer Events cobrem mouse, toque e caneta com a mesma lógica
    paper.addEventListener('pointerdown', (e) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;
      this.activePointerId = e.pointerId;
      paper.setPointerCapture(e.pointerId);
      paper.style.cursor = 'grabbing';

      paper.style.zIndex = highestZ;
      highestZ += 1;

      this.pointerX = e.clientX;
      this.pointerY = e.clientY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      if (e.button === 0 || e.pointerType === 'touch') {
        this.pointerTouchX = this.pointerX;
        this.pointerTouchY = this.pointerY;
      }
      if (e.button === 2) {
        this.rotating = true;
      }
    });

    paper.addEventListener('pointermove', (e) => {
      if (!this.holdingPaper || e.pointerId !== this.activePointerId) return;

      if (!this.rotating) {
        this.pointerX = e.clientX;
        this.pointerY = e.clientY;
        this.velX = this.pointerX - this.prevPointerX;
        this.velY = this.pointerY - this.prevPointerY;
      }

      const dirX = e.clientX - this.pointerTouchX;
      const dirY = e.clientY - this.pointerTouchY;
      const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;
      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;

      if (this.rotating) {
        this.rotation = degrees;
      }

      if (!this.rotating) {
        this.currentPaperX += this.velX;
        this.currentPaperY += this.velY;
      }
      this.prevPointerX = this.pointerX;
      this.prevPointerY = this.pointerY;

      paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
    });

    const release = (e) => {
      if (e.pointerId !== this.activePointerId) return;
      this.holdingPaper = false;
      this.rotating = false;
      this.activePointerId = null;
      paper.style.cursor = 'grab';
    };

    paper.addEventListener('pointerup', release);
    paper.addEventListener('pointercancel', release);

    // Long press com o dedo (toque e segure) gira o papel, já que não existe botão direito no celular
    let longPressTimer = null;
    paper.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      longPressTimer = setTimeout(() => {
        this.rotating = true;
      }, 450);
    });
    const cancelLongPress = () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    };
    paper.addEventListener('pointerup', cancelLongPress);
    paper.addEventListener('pointercancel', cancelLongPress);
    paper.addEventListener('pointermove', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });

    // Evita o menu de contexto ao segurar (clique direito no desktop)
    paper.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}

const papers = Array.from(document.querySelectorAll('.paper'));
papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

// --- Contador de dias juntos (desde 03/02/2026) ---
function updateDaysCounter() {
  const startDate = new Date(2026, 1, 3); // mês em JS é 0-indexado: 1 = fevereiro
  const today = new Date();
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = today - startDate;
  const diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const el = document.getElementById('daysCounterNumber');
  if (el) el.textContent = diffDays;
}
updateDaysCounter();

// --- Corações flutuando no fundo (efeito visual leve, não atrapalha o toque) ---
function spawnFloatingHearts() {
  const container = document.getElementById('floatingHearts');
  if (!container) return;
  const heartChars = ['❤️', '💕', '💗'];
  const total = window.innerWidth < 600 ? 8 : 14;
  for (let i = 0; i < total; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${8 + Math.random() * 10}s`;
    heart.style.animationDelay = `${Math.random() * 10}s`;
    heart.style.fontSize = `${16 + Math.random() * 16}px`;
    container.appendChild(heart);
  }
}
spawnFloatingHearts();
