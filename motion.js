/* Smooth scrolling with Lenis (https://github.com/darkroomengineering/lenis), plus a slow parallax
   drift for the tamaraw background. Touch scrolling stays native (Lenis default); skipped entirely
   when the user prefers reduced motion or Lenis failed to load. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || typeof window.Lenis !== 'function') return;

  var lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true });
  window.lenis = lenis;

  // Inner scroll areas keep their own scrolling: the AI tutor panel and reading passages.
  function protect() {
    var ai = document.querySelector('free-llm'); if (ai) ai.setAttribute('data-lenis-prevent', '');
    [].forEach.call(document.querySelectorAll('.passage'), function (el) { el.setAttribute('data-lenis-prevent', ''); });
  }
  protect();
  new MutationObserver(protect).observe(document.getElementById('app'), { childList: true });
  new MutationObserver(protect).observe(document.body, { childList: true });

  // The background herd drifts at a fraction of the scroll speed for a sense of depth.
  var herd = document.querySelector('.herd');
  lenis.on('scroll', function (e) { if (herd) herd.style.transform = 'translate3d(0,' + (-Math.min((e.scroll || 0) * 0.06, 300)).toFixed(1) + 'px,0)'; });

  function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
})();
