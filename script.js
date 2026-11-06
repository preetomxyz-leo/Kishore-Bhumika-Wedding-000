(function () {
  'use strict';

  /* ===== CONFIG (edit here) ===== */
  var CONFIG = {
    whatsapp: "",                              // RSVP number like 8801XXXXXXXXX ; leave "" to hide RSVP
    weddingISO: "2026-11-25T18:01:00+06:00",   // countdown target
    music: "music.mp3"                         // optional file next to index.html
  };

  var $ = function (s) { return document.querySelector(s); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toBn(n) {
    return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'.charAt(d); });
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ===== Guest name from ?to= ===== */
  var guestName = '';
  try { guestName = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 40); } catch (e) {}
  if (guestName) {
    var g = $('#guest');
    g.textContent = 'প্রিয় ' + guestName + ', আপনার জন্য বিশেষ আমন্ত্রণ';
    g.hidden = false;
  }
  /* ===== Toast ===== */
  function toast(m) {
    var t = $('#toast');
    t.textContent = m;
    t.classList.add('show');
    clearTimeout(toast.h);
    toast.h = setTimeout(function () { t.classList.remove('show'); }, 2000);
  }

  /* ===== Scroll reveal ===== */
  function startObserver() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add('show');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add('show'); io.unobserve(x.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  /* ===== Petals ===== */
  function makePetals() {
    if (reduce) return;
    var box = $('#petals');
    var n = window.innerWidth < 500 ? 12 : 16;
    for (var i = 0; i < n; i++) {
      var p = document.createElement('span');
      p.className = 'petal' + (i % 3 === 0 ? ' r' : '');
      var s = 10 + Math.random() * 12;
      p.style.cssText = 'left:' + (Math.random() * 100) + '%;--s:' + s + 'px;animation-duration:' +
        (9 + Math.random() * 8) + 's;animation-delay:-' + (Math.random() * 14) + 's';
      box.appendChild(p);
    }
  }

  /* ===== Music ===== */
  var audio = $('#bgm');
  var mbtn = $('#musicBtn');
  function playMusic() {
    if (!audio || !CONFIG.music) return;
    audio.src = CONFIG.music;
    audio.volume = 0.6;
    var p = audio.play();
    if (p && p.then) {
      p.then(function () { mbtn.hidden = false; mbtn.textContent = '🔊'; }).catch(function () {});
    }
  }
  if (audio) audio.addEventListener('error', function () { mbtn.hidden = true; });
  mbtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (audio.paused) { audio.play().catch(function () {}); mbtn.textContent = '🔊'; }
    else { audio.pause(); mbtn.textContent = '🔇'; }
  });

  /* ===== Open the invitation ===== */
  var opened = false;
  function openCard() {
    if (opened) return;
    opened = true;
    var cover = $('#cover');
    cover.classList.add('open');
    document.body.classList.remove('locked');
    document.body.classList.add('opened');
    window.scrollTo(0, 0);
    setTimeout(function () { cover.classList.add('gone'); }, 1800);
    startObserver();
    makePetals();
    playMusic();
  }
  $('#cover').addEventListener('click', openCard);

  /* ===== Countdown ===== */
  var target = new Date(CONFIG.weddingISO).getTime();
  function tick() {
    var d = target - Date.now();
    if (isNaN(d) || d <= 0) {
      $('#count').hidden = true;
      $('#countDone').hidden = false;
      return false;
    }
    var s = Math.floor(d / 1000);
    $('#cd').textContent = toBn(Math.floor(s / 86400));
    $('#ch').textContent = toBn(pad(Math.floor((s % 86400) / 3600)));
    $('#cm').textContent = toBn(pad(Math.floor((s % 3600) / 60)));
    $('#cs').textContent = toBn(pad(s % 60));
    return true;
  }
  if (tick()) {
    var timer = setInterval(function () { if (!tick()) clearInterval(timer); }, 1000);
  }

  /* ===== RSVP (hidden unless CONFIG.whatsapp is set) ===== */
  if (CONFIG.whatsapp) {
    $('#rsvp').hidden = false;
    var links = document.querySelectorAll('[data-rsvp]');
    for (var i = 0; i < links.length; i++) {
      var yes = links[i].getAttribute('data-rsvp') === 'yes';
      var msg = (guestName ? 'আমি ' + guestName + '। ' : '') + (yes
        ? 'আপনার আমন্ত্রণের জন্য ধন্যবাদ। আমি অনুষ্ঠানে উপস্থিত থাকব 🙏'
        : 'আপনার আমন্ত্রণের জন্য অনেক ধন্যবাদ। দুঃখিত, আমি উপস্থিত থাকতে পারছি না। আপনাদের জন্য শুভকামনা রইল 🙏');
      links[i].href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg);
    }
  }

  /* ===== Share ===== */
  var shareUrl = location.href.split('#')[0].split('?')[0];
  var shareText = 'কিশোর ও ভূমিকার শুভ বিবাহে আপনার সাদর আমন্ত্রণ 💌 ';
  $('#shareWA').href = 'https://wa.me/?text=' + encodeURIComponent(shareText + shareUrl);

  function copyLink() {
    function done() { toast('লিংক কপি হয়েছে ✓'); }
    function fallback() {
      var t = document.createElement('textarea');
      t.value = shareUrl;
      t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t);
      t.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('কপি করা যায়নি'); }
      document.body.removeChild(t);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareUrl).then(done, fallback);
    } else { fallback(); }
  }
  $('#shareCopy').addEventListener('click', copyLink);
  $('#shareNative').addEventListener('click', function () {
    if (navigator.share) {
      navigator.share({ title: document.title, text: shareText, url: shareUrl }).catch(function () {});
    } else { copyLink(); }
  });

  /* ===== Scroll progress bar ===== */
  var bar = $('#progress');
  var busy = false;
  window.addEventListener('scroll', function () {
    if (busy) return;
    busy = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
      busy = false;
    });
  }, { passive: true });

  /* ===== Tap sparkles ===== */
  var live = 0;
  document.addEventListener('pointerdown', function (e) {
    if (reduce || live > 18) return;
    for (var i = 0; i < 6; i++) {
      var s = document.createElement('span');
      s.className = 'spark';
      s.textContent = '✦';
      var a = Math.PI * 2 * i / 6 + Math.random() * 0.5;
      var r = 26 + Math.random() * 26;
      s.style.cssText = 'left:' + e.clientX + 'px;top:' + e.clientY + 'px;--dx:' + (Math.cos(a) * r) + 'px;--dy:' + (Math.sin(a) * r) + 'px';
      document.body.appendChild(s);
      live++;
      (function (el) { setTimeout(function () { el.remove(); live--; }, 700); })(s);
    }
  });
})();
