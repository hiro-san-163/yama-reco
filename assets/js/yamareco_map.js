(function () {
  "use strict";

  function renderMap(container) {
    if (container.hidden) return;

    var source = container.getAttribute("data-url");
    if (!source) return;

    var mapUrl;
    try {
      mapUrl = new URL(source, window.location.href);
    } catch (error) {
      console.error("Invalid Yamareco map URL.", error);
      return;
    }

    if (mapUrl.protocol !== "https:" && mapUrl.protocol !== "http:") {
      console.error("Yamareco map URL must use HTTP or HTTPS.");
      return;
    }

    var parentWidth = container.parentElement
      ? container.parentElement.clientWidth
      : container.clientWidth;
    if (!parentWidth) return;

    var width = window.innerWidth < 480
      ? Math.floor(parentWidth)
      : Math.min(800, Math.floor(parentWidth));
    width = Math.max(280, width);
    var graphOffset = mapUrl.searchParams.get("graph") === "1" ? 182 : 36;
    var availableHeight = Math.max(320, window.innerHeight - 120);
    var maxFrameHeight = availableHeight;
    var ratio = window.innerWidth < 480 ? 0.75 : 0.62;
    var mapHeight = Math.round(width * ratio);
    mapHeight = Math.min(mapHeight, maxFrameHeight - graphOffset);
    mapHeight = Math.max(220, mapHeight);
    var frameHeight = Math.min(maxFrameHeight, mapHeight + graphOffset);
    mapUrl.searchParams.set("w", String(width));
    mapUrl.searchParams.set("h", String(mapHeight));

    var iframe = container.querySelector("iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.title = "ヤマレコ山行地図";
      iframe.loading = "lazy";
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("scrolling", "no");
      iframe.style.border = "0";
      container.appendChild(iframe);
    }

    iframe.width = String(width);
    iframe.height = String(frameHeight);
    iframe.style.display = "block";
    iframe.style.maxWidth = "100%";
    iframe.style.width = "100%";
    iframe.style.maxHeight = String(maxFrameHeight) + "px";
    var nextSource = mapUrl.toString();
    if (iframe.getAttribute("src") !== nextSource) {
      iframe.src = nextSource;
    }
  }

  function initializeMaps() {
    var maps = document.querySelectorAll(".yamareco-map[data-url]");
    maps.forEach(renderMap);
  }

  function initializeMapToggles() {
    var toggles = document.querySelectorAll(".record-map-toggle[aria-controls]");
    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var container = document.getElementById(toggle.getAttribute("aria-controls"));
        if (!container) return;

        var isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        container.hidden = isOpen;
        if (!isOpen) {
          renderMap(container);
        }
      });
    });
  }

  var resizeTimer;
  initializeMapToggles();
  window.addEventListener("load", initializeMaps);
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(initializeMaps, 150);
  });
})();
