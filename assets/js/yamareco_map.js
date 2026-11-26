(function () {
  "use strict";

  function renderMap(container) {
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

    var width = Math.min(800, Math.max(280, Math.floor(parentWidth)));
    var ratio = window.innerWidth < 480 ? 0.75 : 0.62;
    var mapHeight = Math.round(width * ratio);
    var graphOffset = mapUrl.searchParams.get("graph") === "1" ? 182 : 36;
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
    iframe.height = String(mapHeight + graphOffset);
    iframe.style.display = "block";
    iframe.style.maxWidth = "100%";
    var nextSource = mapUrl.toString();
    if (iframe.getAttribute("src") !== nextSource) {
      iframe.src = nextSource;
    }
  }

  function initializeMaps() {
    var maps = document.querySelectorAll(".yamareco-map[data-url]");
    maps.forEach(renderMap);
  }

  var resizeTimer;
  window.addEventListener("load", initializeMaps);
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(initializeMaps, 150);
  });
})();
