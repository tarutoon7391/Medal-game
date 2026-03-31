/**
 * script.js – Medal Game ランディングページ
 * アニメーション・インタラクション管理
 */

'use strict';

/* ── コイン雨アニメーション ───────────────── */
(function initCoinRain() {
  const container = document.getElementById('coinRain');
  if (!container) return;

  const COINS = ['🪙', '💰', '⭐', '🏆', '✨', '🎰'];
  const COIN_COUNT = 18;

  function createCoin() {
    const el = document.createElement('span');
    el.className = 'rain-coin';
    el.textContent = COINS[Math.floor(Math.random() * COINS.length)];
    el.style.left = Math.random() * 100 + 'vw';
    const dur = 4 + Math.random() * 5;
    const delay = Math.random() * 6;
    el.style.animationDuration = dur + 's';
    el.style.animationDelay = delay + 's';
    el.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
    el.style.opacity = (0.4 + Math.random() * 0.5).toString();
    container.appendChild(el);
  }

  for (let i = 0; i < COIN_COUNT; i++) {
    createCoin();
  }
})();

/* ── ヒーローセクション スタッガードリビール ─ */
(function initHeroReveal() {
  const items = document.querySelectorAll('.hero .reveal-item');

  // 少し遅らせてからページロードアニメ実行
  requestAnimationFrame(() => {
    items.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('revealed');
      }, 150 + i * 160);
    });
  });
})();

/* ── スクロールリビール (IntersectionObserver) ─ */
(function initScrollReveal() {
  const targets = document.querySelectorAll('.scroll-reveal');

  if (!targets.length) return;

  // IntersectionObserver 非対応ブラウザは即表示
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 同じ親要素内のインデックスで遅延を付ける
          const siblings = entry.target.parentElement
            ? Array.from(entry.target.parentElement.querySelectorAll('.scroll-reveal'))
            : [];
          const idx = siblings.indexOf(entry.target);
          const delay = idx >= 0 ? idx * 100 : 0;

          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: '0px 0px 100px 0px', // 画面に入る前から発火
    }
  );

  targets.forEach((el) => observer.observe(el));
})();

/* ── スコアカウンターアニメ（モックアップ用）─ */
(function initMockScore() {
  const scoreEl = document.getElementById('mockScore');
  if (!scoreEl) return;

  let current = 0;
  let target = 0;
  let rAF = null;

  function tick() {
    if (current < target) {
      current = Math.min(current + Math.ceil((target - current) / 8), target);
      scoreEl.textContent = current;
      rAF = requestAnimationFrame(tick);
    } else {
      rAF = null;
    }
  }

  function newTarget() {
    target = target + Math.floor(Math.random() * 50 + 10);
    scoreEl.style.animation = 'none';
    void scoreEl.offsetWidth; // 強制リフロー（アニメーションリセット用）
    scoreEl.style.animation = 'score-tick 0.4s ease';
    if (!rAF) rAF = requestAnimationFrame(tick);
  }

  // 定期的にスコアを更新（デモ演出）
  setInterval(newTarget, 1800);
  setTimeout(newTarget, 400);
})();

/* ── ヘッダー スクロール時の背景変化 ────────── */
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;

  function updateHeader() {
    if (window.scrollY > 60) {
      header.style.background = 'rgba(13, 13, 26, 0.95)';
    } else {
      header.style.background = 'rgba(13, 13, 26, 0.7)';
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
})();

/* ── パララックス的装飾図形の微小動き ────────── */
(function initShapeParallax() {
  const shapes = document.querySelectorAll('.hero-bg-shapes .shape');
  if (!shapes.length) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        shapes.forEach((shape, i) => {
          const speed = 0.08 + i * 0.04;
          shape.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── CTA ボタン キラキラエフェクト ─────────── */
(function initCTASparkles() {
  const btn = document.getElementById('ctaPlay');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const SPARKS = ['✨', '⭐', '🌟', '💥'];

    for (let i = 0; i < 8; i++) {
      const spark = document.createElement('span');
      spark.textContent = SPARKS[Math.floor(Math.random() * SPARKS.length)];
      spark.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        pointer-events: none;
        z-index: 9999;
        font-size: ${0.8 + Math.random() * 1.2}rem;
        transition: transform 0.7s ease-out, opacity 0.7s ease-out;
        opacity: 1;
        will-change: transform, opacity;
      `;
      document.body.appendChild(spark);

      const angle = (i / 8) * 360 + Math.random() * 30;
      const dist = 60 + Math.random() * 80;
      const rad = (angle * Math.PI) / 180;
      const tx = Math.cos(rad) * dist;
      const ty = Math.sin(rad) * dist;

      requestAnimationFrame(() => {
        spark.style.transform = `translate(${tx}px, ${ty}px) scale(0.2)`;
        spark.style.opacity = '0';
      });

      setTimeout(() => spark.remove(), 750);
    }
  });
})();

/* ── スムーズスクロール（nav リンク）────────── */
(function initSmoothNav() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector('.site-header')?.offsetHeight ?? 70;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
