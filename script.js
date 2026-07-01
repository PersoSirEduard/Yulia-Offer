(function () {
  'use strict';

  /* ---------------- floating hearts background ---------------- */

  var heartsBg = document.getElementById('hearts-bg');
  var MAX_HEARTS = 55;

  function spawnHeart() {
    if (heartsBg.childElementCount > MAX_HEARTS) return;

    var heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = Math.random() < 0.7 ? '❤' : '💗';

    var size = 14 + Math.random() * 22;
    var left = Math.random() * 100;
    var duration = 7 + Math.random() * 8;
    var drift = (Math.random() * 2 - 1) * 70;
    var rot = Math.random() * 60 - 30;

    heart.style.left = left + 'vw';
    heart.style.fontSize = size + 'px';
    heart.style.opacity = (0.45 + Math.random() * 0.5).toFixed(2);
    heart.style.animationDuration = duration + 's';
    heart.style.setProperty('--drift', drift + 'px');
    heart.style.setProperty('--rot', rot + 'deg');

    heartsBg.appendChild(heart);
    setTimeout(function () {
      if (heart.parentNode) heart.parentNode.removeChild(heart);
    }, duration * 1000 + 300);
  }

  // seed the screen so it isn't empty on first paint
  for (var i = 0; i < 14; i++) {
    setTimeout(spawnHeart, i * 90);
  }
  setInterval(spawnHeart, 260);

  /* ---------------- runaway "No" button ---------------- */

  var noBtn = document.getElementById('noBtn');
  var yesBtn = document.getElementById('yesBtn');
  var answered = false;
  var noIsFixed = false;
  var dodgeCount = 0;

  var teaseMessages = [
    'No',
    'Nope!',
    'Try again!',
    'Almost 😏',
    'Nice try!',
    'Nuh-uh 😹',
    'Catch me first',
    'Not today!',
    'Missed me!',
    'Keep trying 💕'
  ];

  function safeRandomPos() {
    var margin = 16;
    var w = noBtn.offsetWidth || 90;
    var h = noBtn.offsetHeight || 50;
    var maxX = Math.max(margin, window.innerWidth - w - margin);
    var maxY = Math.max(margin, window.innerHeight - h - margin);
    return {
      x: margin + Math.random() * (maxX - margin),
      y: margin + Math.random() * (maxY - margin)
    };
  }

  function activateFixed() {
    if (noIsFixed) return;
    var rect = noBtn.getBoundingClientRect();
    noBtn.style.position = 'fixed';
    noBtn.style.margin = '0';
    noBtn.style.left = rect.left + 'px';
    noBtn.style.top = rect.top + 'px';
    noIsFixed = true;
  }

  function dodge(px, py) {
    if (answered) return;
    activateFixed();

    var pos, tries = 0, ok = false;
    var w = noBtn.offsetWidth || 90;
    var h = noBtn.offsetHeight || 50;

    while (tries < 12 && !ok) {
      pos = safeRandomPos();
      if (px == null) {
        ok = true;
      } else {
        var cx = pos.x + w / 2;
        var cy = pos.y + h / 2;
        ok = Math.hypot(cx - px, cy - py) > 160;
      }
      tries++;
    }

    noBtn.style.left = pos.x + 'px';
    noBtn.style.top = pos.y + 'px';

    dodgeCount++;
    noBtn.textContent = teaseMessages[Math.min(dodgeCount, teaseMessages.length - 1)];
  }

  function distanceToRect(px, py, rect) {
    var dx = Math.max(rect.left - px, 0, px - rect.right);
    var dy = Math.max(rect.top - py, 0, py - rect.bottom);
    return Math.hypot(dx, dy);
  }

  var DODGE_RADIUS = 110;
  var rafPending = false;

  function checkProximity(px, py) {
    if (answered || rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      var rect = noBtn.getBoundingClientRect();
      if (distanceToRect(px, py, rect) < DODGE_RADIUS) {
        dodge(px, py);
      }
    });
  }

  // desktop: mouse approaching
  document.addEventListener('mousemove', function (e) {
    checkProximity(e.clientX, e.clientY);
  }, { passive: true });

  // failsafe if the pointer somehow lands on it
  noBtn.addEventListener('mouseenter', function (e) {
    dodge(e.clientX, e.clientY);
  });
  noBtn.addEventListener('mousedown', function (e) {
    e.preventDefault();
    dodge(e.clientX, e.clientY);
  });

  // mobile: finger approaching, and definitely dodge before a tap can land
  document.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    if (!t) return;
    checkProximity(t.clientX, t.clientY);
  }, { passive: true });

  noBtn.addEventListener('touchstart', function (e) {
    e.preventDefault();
    var t = e.touches[0];
    dodge(t ? t.clientX : null, t ? t.clientY : null);
  }, { passive: false });

  // absolute last resort: never let a real click register as "No"
  noBtn.addEventListener('click', function (e) {
    e.preventDefault();
    dodge(null, null);
  });

  window.addEventListener('resize', function () {
    if (!noIsFixed || answered) return;
    var rect = noBtn.getBoundingClientRect();
    var maxX = window.innerWidth - rect.width - 16;
    var maxY = window.innerHeight - rect.height - 16;
    noBtn.style.left = Math.min(rect.left, Math.max(16, maxX)) + 'px';
    noBtn.style.top = Math.min(rect.top, Math.max(16, maxY)) + 'px';
  });

  /* ---------------- "Yes" reveal sequence ---------------- */

  var questionScreen = document.getElementById('question-screen');
  var revealScreen = document.getElementById('reveal-screen');
  var questionTitle = document.getElementById('question-title');
  var answerRow = document.querySelector('.answer-row');
  var present = document.getElementById('present');
  var boxLid = document.getElementById('boxLid');
  var catWrap = document.getElementById('catWrap');
  var pawHeart = document.getElementById('pawHeart');
  var forMiss = document.getElementById('forMiss');

  function startSequence() {
    if (answered) return;
    answered = true;

    answerRow.classList.add('buttons-out');
    questionTitle.classList.add('fall');

    setTimeout(function () {
      questionScreen.classList.add('hidden');
      revealScreen.classList.remove('hidden');

      requestAnimationFrame(function () {
        present.classList.add('drop');
      });

      // box lands ~1050ms after it starts dropping
      setTimeout(function () {
        boxLid.classList.add('open');
      }, 950);

      setTimeout(function () {
        catWrap.classList.add('rise');
      }, 1150);

      setTimeout(function () {
        pawHeart.classList.add('pop');
      }, 1650);

      setTimeout(function () {
        pawHeart.classList.add('beat');
      }, 2200);

      setTimeout(function () {
        forMiss.classList.add('show');
      }, 1300);

      setTimeout(function () {
        forMiss.classList.add('floaty');
      }, 2000);

    }, 750);
  }

  yesBtn.addEventListener('click', startSequence);
})();
