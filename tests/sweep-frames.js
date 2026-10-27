/*
 * Plain Words for Enterprise AI SWE: svep i portalens ramar.
 *
 * Kör i själva sidan på portal.azure.com (konsolen eller Claudes
 * javascript_tool), med utvecklarversionen av tillägget inläst. Den ber
 * extension/sweep-frame.js i varje synlig ram från reactblade.portal.azure.net
 * att svepa, och samlar svaren i window.__pwFrames.
 *
 * Läge: sätt window.__pwFrameMode = "inventory" före körningen för att bara
 * lista ankarna i ramen, eller "inventory-deep" för att också få föräldrarna
 * och ramens adress. Standard är "sweep".
 * Fråga efter window.__pwFrames.finished i högst 40 sekunder i taget.
 */
void (function pwSweepFrames() {
  const mode = window.__pwFrameMode || "sweep";
  const frames = Array.from(document.querySelectorAll("iframe")).filter((f) => {
    const r = f.getBoundingClientRect();
    return r.width > 50 && r.height > 50 && /(\.reactblade\.portal\.azure\.net|^ux\.console\.azure\.com)$/.test(new URL(f.src || "about:blank", location.href).hostname);
  });
  const state = { mode, frames: frames.length, replies: [], finished: frames.length === 0 };
  window.__pwFrames = state;
  if (window.__pwFrameListener) window.removeEventListener("message", window.__pwFrameListener);
  window.__pwFrameListener = (event) => {
    if (!/(\.reactblade\.portal\.azure\.net|^ux\.console\.azure\.com)$/.test(new URL(event.origin).hostname)) return;
    if (!event.data || event.data.pwFrameReply !== mode) return;
    state.replies.push(event.data.data);
    if (state.replies.length >= state.frames) state.finished = true;
  };
  window.addEventListener("message", window.__pwFrameListener);
  for (const f of frames) f.contentWindow.postMessage({ pwFrame: mode }, new URL(f.src).origin);
})();
"startat";
