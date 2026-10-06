    (function () {
      var root = document.documentElement;
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion) root.classList.add('js-motion');

      var params = new URLSearchParams(window.location.search);
      var requested = params.get('theme');
      if (requested === 'light' || requested === 'dark') root.setAttribute('data-theme', requested);

      var toggle = document.getElementById('themeToggle');
      function isDark() {
        return root.getAttribute('data-theme') === 'dark' || (!root.hasAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
      function syncToggle() {
        var dark = isDark();
        toggle.setAttribute('aria-pressed', String(dark));
        toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      }
      syncToggle();
      toggle.addEventListener('click', function () {
        var next = isDark() ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        var url = new URL(window.location.href);
        url.searchParams.set('theme', next);
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
        syncToggle();
        updateCanvasColors();
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      });

      function splitWords(el) {
        if (!el || el.dataset.split === 'words') return;
        var words = el.textContent.trim().split(/\s+/);
        el.textContent = '';
        words.forEach(function (text, index) {
          var mask = document.createElement('span');
          mask.className = 'word-mask';
          var word = document.createElement('span');
          word.className = 'word';
          word.textContent = text;
          mask.appendChild(word);
          el.appendChild(mask);
          if (index < words.length - 1) el.appendChild(document.createTextNode(' '));
        });
        el.dataset.split = 'words';
      }

      function splitLetters(el) {
        if (!el || el.dataset.split === 'letters') return;
        var chars = el.textContent.split('');
        el.textContent = '';
        chars.forEach(function (char) {
          if (char === ' ') {
            el.appendChild(document.createTextNode(' '));
          } else {
            var span = document.createElement('span');
            span.className = 'motion-letter';
            span.textContent = char;
            el.appendChild(span);
          }
        });
        el.dataset.split = 'letters';
      }

      function setupTicker() {
        var viewport = document.querySelector('.ticker');
        var track = document.getElementById('tickerTrack');
        if (!viewport || !track) return;
        if (track._tween) track._tween.kill();
        track.style.transform = '';
        track.style.animation = '';
        while (track.children.length > 1) track.removeChild(track.lastElementChild);
        var base = track.firstElementChild;
        var unit = Math.ceil(base.getBoundingClientRect().width);
        if (!unit) return;
        var copies = Math.max(2, Math.ceil(viewport.clientWidth / unit) + 2);
        for (var i = 1; i < copies; i++) track.appendChild(base.cloneNode(true));
        if (!reduceMotion && window.gsap) {
          track._tween = gsap.to(track, { x: -unit, duration: Math.max(12, unit / 72), ease: 'none', repeat: -1 });
          viewport.addEventListener('pointerenter', function () { if (track._tween) gsap.to(track._tween, { timeScale: .28, duration: .35 }); });
          viewport.addEventListener('pointerleave', function () { if (track._tween) gsap.to(track._tween, { timeScale: 1, duration: .5 }); });
        } else if (!reduceMotion) {
          track.style.setProperty('--ticker-distance', '-' + unit + 'px');
          track.style.animation = 'ticker-fallback ' + Math.max(12, unit / 72) + 's linear infinite';
        }
      }

      function initMotion() {
        document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
        splitWords(document.querySelector('.hero-title'));
        document.querySelectorAll('.section-head h2').forEach(splitWords);
        splitLetters(document.querySelector('.contact h2'));

        if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);
        gsap.defaults({ ease: 'power3.out' });

        var heroTimeline = gsap.timeline({ defaults: { duration: 1.05 } });
        heroTimeline
          .from('.hero-title .word', { yPercent: 118, rotate: 5, opacity: 0, filter: 'blur(10px)', stagger: .055 }, 0)
          .from('.status-line', { y: -18, opacity: 0, filter: 'blur(7px)', duration: .7 }, .15)
          .from('.hero-copy', { y: 26, opacity: 0, filter: 'blur(7px)', duration: .8 }, .52)
          .from('.hero-actions .btn', { y: 24, opacity: 0, stagger: .1, duration: .72 }, .68)
          .from('.system-card', { x: 70, rotateY: -13, opacity: 0, filter: 'blur(10px)', duration: 1.2 }, .28);

        gsap.to('.hero-title', {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });
        gsap.to('#systemCard', {
          yPercent: 18,
          rotateZ: 1.5,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
        });
        gsap.to('#field', {
          yPercent: 13,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });

        document.querySelectorAll('.section-head').forEach(function (head) {
          var words = head.querySelectorAll('h2 .word');
          gsap.from(head.querySelector('.section-index'), {
            x: -28, opacity: 0, duration: .7,
            scrollTrigger: { trigger: head, start: 'top 82%', once: true }
          });
          gsap.from(words, {
            yPercent: 110, rotate: 4, opacity: 0, stagger: .04, duration: .85,
            scrollTrigger: { trigger: head, start: 'top 80%', once: true }
          });
          var paragraph = head.querySelector('p');
          if (paragraph) gsap.from(paragraph, {
            y: 22, opacity: 0, duration: .7,
            scrollTrigger: { trigger: head, start: 'top 76%', once: true }
          });
        });

        gsap.from('.work-card', {
          y: 84,
          rotateX: 7,
          opacity: 0,
          clipPath: 'inset(18% 0 0 0 round 26px)',
          stagger: .14,
          duration: 1,
          scrollTrigger: { trigger: '.work-grid', start: 'top 82%', once: true }
        });
        document.querySelectorAll('.work-no').forEach(function (number) {
          gsap.to(number, {
            yPercent: -48,
            ease: 'none',
            scrollTrigger: { trigger: number.closest('.work-card'), start: 'top bottom', end: 'bottom top', scrub: 1 }
          });
        });

        gsap.to('.kinetic-forward', {
          xPercent: -22,
          ease: 'none',
          scrollTrigger: { trigger: '.kinetic-band', start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
        gsap.fromTo('.kinetic-reverse', { xPercent: -24 }, {
          xPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.kinetic-band', start: 'top bottom', end: 'bottom top', scrub: 1 }
        });

        gsap.from('.role', {
          x: function (index) { return index % 2 ? 52 : -52; },
          opacity: 0,
          stagger: .1,
          duration: .8,
          scrollTrigger: { trigger: '.timeline', start: 'top 84%', once: true }
        });
        gsap.to('.role .plus', {
          rotate: 360,
          stagger: .07,
          duration: .85,
          scrollTrigger: { trigger: '.timeline', start: 'top 76%', once: true }
        });

        gsap.from('.skills-intro > *', {
          x: -52, opacity: 0, stagger: .13, duration: .85,
          scrollTrigger: { trigger: '.skills-layout', start: 'top 78%', once: true }
        });
        document.querySelectorAll('.skill-group').forEach(function (group) {
          gsap.from(group.querySelectorAll('.skill-list span'), {
            y: 24, scale: .86, opacity: 0, stagger: .055, duration: .55,
            scrollTrigger: { trigger: group, start: 'top 86%', once: true }
          });
        });
        gsap.from('.cert', {
          y: 34, rotate: function (index) { return index % 2 ? 2 : -2; }, opacity: 0, stagger: .08, duration: .65,
          scrollTrigger: { trigger: '.certs', start: 'top 88%', once: true }
        });

        gsap.from('.education-panel', {
          scaleX: .82, skewX: -5, opacity: 0, duration: 1,
          scrollTrigger: { trigger: '.education-panel', start: 'top 86%', once: true }
        });
        gsap.from('.education-panel h2, .education-year', {
          y: 45, opacity: 0, stagger: .14, duration: .75,
          scrollTrigger: { trigger: '.education-panel', start: 'top 78%', once: true }
        });

        gsap.from('.contact h2 .motion-letter', {
          yPercent: 120,
          rotate: function (index) { return index % 2 ? 8 : -8; },
          opacity: 0,
          stagger: .025,
          duration: .82,
          scrollTrigger: { trigger: '.contact h2', start: 'top 84%', once: true }
        });
        gsap.from('.contact p, .contact-links .btn', {
          y: 28, opacity: 0, stagger: .08, duration: .7,
          scrollTrigger: { trigger: '.contact p', start: 'top 86%', once: true }
        });

        gsap.to('#scrollProgress', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: .2 }
        });

        gsap.to('.node.n1', { y: -9, x: 5, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.node.n2', { y: 8, x: -7, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: -.8 });
        gsap.to('.node.n3', { y: -7, x: -4, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: -.35 });
        gsap.to('.node.n4', { y: 8, x: 6, duration: 2.65, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: -1.2 });
        gsap.to('.node.core', { scale: 1.045, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });

        ScrollTrigger.refresh();
      }

      var card = document.getElementById('systemCard');
      if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - .5;
          var y = (e.clientY - r.top) / r.height - .5;
          if (window.gsap) gsap.to(card, { rotationY: x * 8, rotationX: -y * 7, transformPerspective: 900, duration: .5, overwrite: 'auto' });
        });
        card.addEventListener('pointerleave', function () {
          if (window.gsap) gsap.to(card, { rotationY: 0, rotationX: 0, duration: .75, ease: 'elastic.out(1,.55)' });
        });

        document.querySelectorAll('.magnetic').forEach(function (el) {
          el.addEventListener('pointermove', function (e) {
            var r = el.getBoundingClientRect();
            var x = (e.clientX - r.left - r.width / 2) * .16;
            var y = (e.clientY - r.top - r.height / 2) * .2;
            if (window.gsap) gsap.to(el, { x: x, y: y - 3, duration: .35, ease: 'power2.out', overwrite: true });
          });
          el.addEventListener('pointerleave', function () {
            if (window.gsap) gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.38)' });
          });
        });

        document.querySelectorAll('.work-card').forEach(function (el) {
          el.addEventListener('pointermove', function (e) {
            var r = el.getBoundingClientRect();
            var px = ((e.clientX - r.left) / r.width) * 100;
            var py = ((e.clientY - r.top) / r.height) * 100;
            el.style.setProperty('--spot-x', px + '%');
            el.style.setProperty('--spot-y', py + '%');
            if (window.gsap) gsap.to(el, { rotationY: (px - 50) * .045, rotationX: (50 - py) * .04, transformPerspective: 1000, duration: .45, overwrite: 'auto' });
          });
          el.addEventListener('pointerleave', function () {
            if (window.gsap) gsap.to(el, { rotationY: 0, rotationX: 0, duration: .75, ease: 'elastic.out(1,.5)' });
          });
        });
      }

      var canvas = document.getElementById('field');
      var ctx = canvas.getContext('2d');
      var points = [];
      var cw = 0, ch = 0, dpr = 1, mx = 0, my = 0, active = true;
      var accent = '#36e0b7', line = 'rgba(54,224,183,.18)';
      function updateCanvasColors() {
        var styles = getComputedStyle(root);
        accent = styles.getPropertyValue('--accent').trim();
        line = isDark() ? 'rgba(54,224,183,.18)' : 'rgba(0,111,95,.14)';
      }
      function resize() {
        var r = canvas.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cw = r.width; ch = r.height;
        canvas.width = Math.max(1, Math.floor(cw * dpr));
        canvas.height = Math.max(1, Math.floor(ch * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      function createPoints() {
        points = [];
        var rings = 8, steps = 28;
        for (var i = 0; i < rings; i++) {
          var phi = Math.PI * (i + .5) / rings;
          for (var j = 0; j < steps; j++) {
            var theta = Math.PI * 2 * j / steps;
            points.push({ x: Math.sin(phi) * Math.cos(theta), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta), ring: i, step: j });
          }
        }
      }
      function project(p, ax, ay) {
        var x = p.x, y = p.y, z = p.z;
        var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
        var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        var y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        var scale = Math.min(cw, ch) * .34;
        var depth = 3.1 + z2;
        return { x: cw * .78 + x1 * scale / depth * 2.2, y: ch * .5 + y1 * scale / depth * 2.2, z: z2, a: Math.max(.08, (z2 + 1.2) / 2.2), r: 1.1 + (z2 + 1) * .8 };
      }
      function draw(t) {
        if (!active) return;
        ctx.clearRect(0, 0, cw, ch);
        var time = t * .00018;
        var ax = .25 + my * .28;
        var ay = time + mx * .42;
        var projected = points.map(function (p) { return project(p, ax, ay); });
        ctx.lineWidth = .6;
        for (var i = 0; i < points.length; i++) {
          var p = projected[i];
          var sameRing = projected[points[i].ring * 28 + ((points[i].step + 1) % 28)];
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(sameRing.x, sameRing.y); ctx.strokeStyle = line; ctx.globalAlpha = Math.min(p.a, sameRing.a); ctx.stroke();
          if (points[i].ring < 7) {
            var nextRing = projected[(points[i].ring + 1) * 28 + points[i].step];
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nextRing.x, nextRing.y); ctx.globalAlpha = Math.min(p.a, nextRing.a) * .7; ctx.stroke();
          }
        }
        projected.forEach(function (p, index) {
          if (index % 2) return;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.globalAlpha = p.a * .7; ctx.fill();
        });
        ctx.globalAlpha = 1;
        if (!reduceMotion) requestAnimationFrame(draw);
      }

      updateCanvasColors();
      resize();
      createPoints();
      window.addEventListener('resize', function () {
        resize();
        clearTimeout(window.__tickerResize);
        window.__tickerResize = setTimeout(setupTicker, 180);
      }, { passive: true });
      window.addEventListener('pointermove', function (e) {
        mx = e.clientX / window.innerWidth - .5;
        my = e.clientY / window.innerHeight - .5;
      }, { passive: true });
      document.addEventListener('visibilitychange', function () {
        active = !document.hidden;
        if (active && !reduceMotion) requestAnimationFrame(draw);
      });
      if (reduceMotion) draw(0); else requestAnimationFrame(draw);

      function ready() {
        setupTicker();
        initMotion();
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready); else window.addEventListener('load', ready);
    })();
  </script>
