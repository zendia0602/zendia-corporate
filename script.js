(function () {
  "use strict";

  // Add .js only once this script has actually run, so a failed/blocked
  // load falls back to the CSS default (content fully visible, no reveal).
  document.documentElement.classList.add("js");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".reveal, .reveal-zoom");

  if (!targets.length) return;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();

// CTA shooting stars — a single thin, pale streak crosses the upper
// "sky" band of the night-view photo every 5-10s, then fades within
// about a second. Starts within the top 10% of the image and ends by
// the top 40% at the latest, so it never reaches the building
// skyline. Only runs where #ctaStars exists (the zendia.jp CTA on the
// homepage), and is skipped entirely under reduced-motion.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var container = document.getElementById("ctaStars");
  if (!container) return;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function spawnStar() {
    var el = document.createElement("div");

    var goingRight = Math.random() < 0.5;
    // Angle and travel distance are kept modest enough that, combined
    // with a start point in the top 9%, the vertical drop never pushes
    // the streak past ~30% of the container height — well clear of the
    // 40% ceiling even at the shortest container height in use.
    var angle = goingRight ? rand(15, 32) : 180 - rand(15, 32);
    var startX = goingRight ? rand(5, 55) : rand(45, 95);
    var startY = rand(1, 9);
    var length = rand(90, 150);
    var travel = rand(100, 160);
    var duration = rand(850, 1150);

    el.style.cssText =
      "position:absolute;" +
      "left:" + startX + "%;" +
      "top:" + startY + "%;" +
      "width:" + length + "px;" +
      "height:1.5px;" +
      "border-radius:999px;" +
      "background:linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(214,231,255,0.75) 60%, rgba(255,255,255,0.95) 100%);" +
      "box-shadow:0 0 4px rgba(255,255,255,0.5);" +
      "transform-origin:left center;" +
      "pointer-events:none;" +
      "will-change:transform,opacity;";

    container.appendChild(el);

    if (!el.animate) {
      el.remove();
      return;
    }

    var anim = el.animate(
      [
        { transform: "rotate(" + angle + "deg) translateX(0)", opacity: 0 },
        { transform: "rotate(" + angle + "deg) translateX(" + travel * 0.18 + "px)", opacity: 1, offset: 0.18 },
        { transform: "rotate(" + angle + "deg) translateX(" + travel + "px)", opacity: 0 }
      ],
      { duration: duration, easing: "ease-out", fill: "forwards" }
    );

    anim.onfinish = function () {
      el.remove();
    };
  }

  (function loop() {
    setTimeout(function () {
      spawnStar();
      loop();
    }, rand(5000, 10000));
  })();
})();

// Partner pages — animations restored from the former zendia.jp pages.
// Both are progressive enhancement: with no JS, no IntersectionObserver
// or reduced motion, the markup already shows the finished diagram.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  // Travel: 4-step story. Each number lights up, then the line to the
  // next step draws itself; runs once when the list scrolls into view
  // and keeps the finished state.
  var flow = document.querySelector("[data-pt-flow]");
  if (flow) {
    var steps = flow.querySelectorAll(":scope > li");
    flow.classList.add("pt-flow-ready");

    var flowObserver = new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        flowObserver.disconnect();
        steps.forEach(function (li, i) {
          setTimeout(function () { li.classList.add("is-active"); }, i * 2300);
          if (i < steps.length - 1) {
            setTimeout(function () { li.classList.add("is-drawn"); }, i * 2300 + 900);
          }
        });
      },
      { threshold: 0.3 }
    );
    flowObserver.observe(flow);
  }

  // Medical: ZENDIA hub. Each connection brightens, then its party is
  // emphasised, one after another (~2 s each), only while in view.
  var hub = document.querySelector("[data-pt-hub]");
  if (hub) {
    var lines = hub.querySelectorAll(".pt-hub-lines line");
    var nodes = hub.querySelectorAll(".pt-hub-node");
    var LINE_LEAD = 400;
    var NODE_DURATION = 1000;
    var STEP = LINE_LEAD + NODE_DURATION + 600;
    var index = 0;
    var timers = [];
    var running = false;

    var clearAll = function () {
      timers.forEach(clearTimeout);
      timers = [];
      lines.forEach(function (l) { l.classList.remove("is-active"); });
      nodes.forEach(function (n) { n.classList.remove("is-active"); });
    };

    var step = function () {
      var line = lines[index];
      var node = nodes[index];
      line.classList.add("is-active");
      timers.push(setTimeout(function () { node.classList.add("is-active"); }, LINE_LEAD));
      timers.push(setTimeout(function () { node.classList.remove("is-active"); }, LINE_LEAD + NODE_DURATION));
      timers.push(setTimeout(function () { line.classList.remove("is-active"); }, LINE_LEAD + NODE_DURATION));
      index = (index + 1) % nodes.length;
      timers.push(setTimeout(step, STEP));
    };

    new IntersectionObserver(
      function (entries) {
        var visible = entries[0].isIntersecting;
        if (visible && !running) {
          running = true;
          timers.push(setTimeout(step, 1200));
        } else if (!visible && running) {
          running = false;
          clearAll();
        }
      },
      { threshold: 0.3 }
    ).observe(hub);
  }
})();
