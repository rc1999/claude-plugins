#!/usr/bin/env node
// rawcdp.cjs — minimal Chrome DevTools Protocol driver over a SINGLE page target.
//
// Why this exists: Playwright's connectOverCDP attaches to ALL targets. On a
// managed machine the persistent profile picks up force-installed / Chrome-Sync'd
// extensions (password managers, endpoint agents); their service-worker / background_page
// targets never ack the attach and connectOverCDP hangs ~30s (flaky, not
// version-gated; --disable-extensions does NOT clear force-installed ones).
// This driver talks raw CDP to one page target only — no worker attach, no hang.
//
// Zero deps: Node 18+ global fetch + WebSocket. Never run `npm i` in a repo
// subdir (it hoists into the app's package.json/lock).
//
// Usage:
//   node rawcdp.cjs <steps.json> [--port 9222] [--width 1280] [--height 800]
// steps.json (array, run in order):
//   {"goto":"https://app.../route"}   navigate (+ optional "settle": ms)
//   {"click":"text=Next"}             click by visible text (a/button/[role=button]/submit)
//   {"click":"#css-selector"}         or by CSS selector
//   {"wait": 1500}                    sleep ms
//   {"shot":"/abs/frame-01.png"}      screenshot at the fixed viewport
//   {"eval":"location.href"}          Runtime.evaluate, value into the report
// Prints a JSON report: { steps, mainStatus, consoleErrors, failedRequests, final }.

const fs = require('fs');
const argv = process.argv;
const argN = (name, def) => { const i = argv.indexOf(name); return i > 0 ? +argv[i + 1] : def; };
const argS = (name, def) => { const i = argv.indexOf(name); return i > 0 ? argv[i + 1] : def; };
const PORT = argS('--port', '9222'), W = argN('--width', 1280), H = argN('--height', 800);
const steps = JSON.parse(fs.readFileSync(argv[2], 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const r = await fetch(`http://localhost:${PORT}/json/new?about:blank`, { method: 'PUT' }); // PUT, not GET, on Chrome 136+
  const tgt = await r.json();
  const ws = new WebSocket(tgt.webSocketDebuggerUrl);
  let id = 0; const pending = {};
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending[i] = { res, rej }; ws.send(JSON.stringify({ id: i, method, params })); });
  const consoleErrors = [], failedRequests = []; let mainStatus = null;

  await new Promise(res => ws.addEventListener('open', res));
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pending[m.id]) { m.error ? pending[m.id].rej(new Error(m.error.message)) : pending[m.id].res(m.result); delete pending[m.id]; return; }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consoleErrors.push((m.params.args || []).map(a => a.value || a.description || '').join(' '));
    if (m.method === 'Runtime.exceptionThrown') consoleErrors.push('exception: ' + (m.params.exceptionDetails && m.params.exceptionDetails.text));
    if (m.method === 'Network.responseReceived') { const rsp = m.params.response; if (m.params.type === 'Document' && mainStatus === null) mainStatus = rsp.status; if (rsp.status >= 400) failedRequests.push({ url: rsp.url, status: rsp.status }); }
  });

  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });

  const evalJs = expr => send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }).then(x => x.result && x.result.value);
  const report = { steps: [] };
  for (const s of steps) {
    if ('goto' in s) { mainStatus = null; await send('Page.navigate', { url: s.goto }); await sleep(s.settle || 2500); report.steps.push({ goto: s.goto, status: mainStatus }); }
    else if ('click' in s) {
      const sel = s.click; let hit;
      if (sel.startsWith('text=')) { const t = sel.slice(5).toLowerCase().replace(/'/g, "\\'"); hit = await evalJs(`(()=>{const el=[...document.querySelectorAll('a,button,[role=button],input[type=submit]')].find(e=>((e.innerText||e.value||'')+'').trim().toLowerCase().includes('${t}'));if(el){el.click();return true}return false})()`); }
      else hit = await evalJs(`(()=>{const el=document.querySelector(${JSON.stringify(sel)});if(el){el.click();return true}return false})()`);
      await sleep(s.settle || 1500); report.steps.push({ click: sel, hit: !!hit });
    }
    else if ('wait' in s) { await sleep(s.wait); }
    else if ('shot' in s) { const png = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(s.shot, Buffer.from(png.data, 'base64')); report.steps.push({ shot: s.shot }); }
    else if ('eval' in s) { report.steps.push({ eval: s.eval, value: await evalJs(s.eval) }); }
  }
  const final = await evalJs('JSON.stringify({url:location.href,host:location.host,title:document.title,bodyLen:(document.body&&document.body.innerText||"").length})');
  report.final = JSON.parse(final || '{}'); report.mainStatus = mainStatus; report.consoleErrors = consoleErrors; report.failedRequests = failedRequests;
  console.log(JSON.stringify(report, null, 2));
  await fetch(`http://localhost:${PORT}/json/close/${tgt.id}`).catch(() => {}); ws.close();
})().catch(e => { console.error(JSON.stringify({ error: e.message })); process.exit(1); });
