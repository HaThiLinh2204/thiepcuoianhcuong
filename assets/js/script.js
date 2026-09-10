import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

(function () {
  'use strict';

  // ---------- Firebase ----------
  var firebaseConfig = {
    apiKey: 'AIzaSyCFTDlxeU7FIMMv-13dw8lJ8sG6hKE9LFI',
    authDomain: 'thiep-cuoi-cuong-huong.firebaseapp.com',
    projectId: 'thiep-cuoi-cuong-huong',
    storageBucket: 'thiep-cuoi-cuong-huong.firebasestorage.app',
    messagingSenderId: '772072177',
    appId: '1:772072177:web:2cac06c25b84d61cce7f50',
  };
  var fbApp = initializeApp(firebaseConfig);
  var db = getFirestore(fbApp);
  var wishesCol = collection(db, 'wishes');

  // ---------- Envelope intro ----------
  var overlay = document.getElementById('envelope-overlay');
  var openBtn = document.getElementById('open-invite');
  var site = document.getElementById('site');

  function openInvite() {
    overlay.classList.add('closed');
    site.classList.remove('hidden');
    document.body.style.overflow = '';
    playMusic();
  }

  if (openBtn) {
    document.body.style.overflow = 'hidden';
    openBtn.addEventListener('click', openInvite);
  } else {
    site.classList.remove('hidden');
  }

  // ---------- Background music ----------
  var music = document.getElementById('bg-music');
  var musicBtn = document.getElementById('music-toggle');

  function playMusic() {
    if (!music) return;
    music.play().catch(function () {
      // Autoplay blocked (e.g. no prior user gesture) — leave paused, toggle stays off.
      if (musicBtn) {
        musicBtn.classList.remove('is-playing');
        musicBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  if (musicBtn && music) {
    musicBtn.addEventListener('click', function () {
      if (music.paused) {
        music.play().catch(function () {});
        musicBtn.classList.add('is-playing');
        musicBtn.setAttribute('aria-pressed', 'true');
      } else {
        music.pause();
        musicBtn.classList.remove('is-playing');
        musicBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  // ---------- Reveal on scroll ----------
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      revealEls.forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', Math.min(i % 3, 2) * 0.12 + 's');
      });
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
      );
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }
  }

  // ---------- Back to top ----------
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    var toggleBackToTop = function () {
      if (window.scrollY > window.innerHeight * 0.8) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    };
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- Countdown ----------
  var WEDDING_DATE = new Date('2026-09-14T09:05:00+07:00').getTime();
  var elDays = document.getElementById('cd-days');
  var elHours = document.getElementById('cd-hours');
  var elMins = document.getElementById('cd-mins');
  var elSecs = document.getElementById('cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tickCountdown() {
    var diff = WEDDING_DATE - Date.now();
    if (diff <= 0) {
      elDays.textContent = elHours.textContent = elMins.textContent = elSecs.textContent = '00';
      return;
    }
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);
    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }

  if (elDays) {
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  // ---------- Copy account number ----------
  var copyBtn = document.querySelector('.btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var value = copyBtn.dataset.copy;
      var label = copyBtn.querySelector('span');
      var restore = function () {
        setTimeout(function () {
          label.textContent = 'Sao chép';
          copyBtn.classList.remove('copied');
        }, 1800);
      };
      var done = function () {
        label.textContent = 'Đã sao chép!';
        copyBtn.classList.add('copied');
        restore();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

  // ---------- Wishes wall (shared, stored in Firestore) ----------
  var form = document.getElementById('wish-form');
  var list = document.getElementById('wish-list');
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderWishes(docs) {
    if (!docs.length) {
      list.innerHTML = '<p class="wish-empty">Hãy là người đầu tiên gửi lời chúc phúc đến cô dâu chú rể 💕</p>';
      return;
    }
    list.innerHTML = docs
      .map(function (w) {
        return '<div class="wish-card"><strong>' + escapeHtml(w.name) + '</strong><p>' + escapeHtml(w.message) + '</p></div>';
      })
      .join('');
  }

  if (list) {
    var wishesQuery = query(wishesCol, orderBy('time', 'desc'), limit(200));
    onSnapshot(
      wishesQuery,
      function (snapshot) {
        var docs = snapshot.docs.map(function (d) { return d.data(); });
        renderWishes(docs);
      },
      function () {
        list.innerHTML = '<p class="wish-empty">Không tải được lời chúc, vui lòng thử lại sau.</p>';
      }
    );
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameInput = document.getElementById('wish-name');
      var msgInput = document.getElementById('wish-msg');
      var name = nameInput.value.trim();
      var message = msgInput.value.trim();
      if (!name || !message) return;

      if (submitBtn) submitBtn.disabled = true;
      addDoc(wishesCol, { name: name, message: message, time: serverTimestamp() })
        .then(function () {
          form.reset();
        })
        .catch(function () {
          window.alert('Gửi lời chúc thất bại, vui lòng thử lại.');
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
