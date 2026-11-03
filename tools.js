/* Tools for the AI terminal: Python, a file workspace, Python documentation and a Linux machine.
   The model can use them in agent mode, and you can use them directly with /py, /sh, /ws and /docs. */
(function () {
  var q = new URLSearchParams(location.search), PYBASE = q.get('pyodide'), VBASE = q.get('v86') || '/linux/v86/';
  /* ---------- Python, in a worker ---------- */
  var worker = null, seq = 0, waiting = {}, pyState = 'off', pyVersion = '';
  function spawn() {
    worker = new Worker('py-worker.js' + (PYBASE ? '?base=' + encodeURIComponent(PYBASE) : ''));
    worker.onmessage = function (e) { var w = waiting[e.data.id]; if (w) { delete waiting[e.data.id]; w(e.data); } };
    worker.onerror = function (e) { Object.keys(waiting).forEach(function (k) { waiting[k]({ ok: false, err: 'Python failed to start: ' + (e.message || 'network error') }); delete waiting[k]; }); pyState = 'off'; };
  }
  function call(msg, timeout) {
    if (!worker) spawn();
    return new Promise(function (ok) {
      var id = ++seq, t = timeout ? setTimeout(function () { if (!waiting[id]) return; delete waiting[id]; worker.terminate(); worker = null; pyState = 'off'; ok({ ok: false, err: 'Stopped after ' + Math.round(timeout / 1000) + ' seconds (an endless loop?). Python was restarted; files in the workspace are kept.' }); }, timeout) : null;
      waiting[id] = function (r) { clearTimeout(t); ok(r); };
      msg.id = id; worker.postMessage(msg);
    });
  }
  var python = {
    state: function () { return pyState; }, version: function () { return pyVersion; },
    init: function () { pyState = 'loading'; return call({ op: 'init' }, 120000).then(function (r) { pyState = r.ok ? 'ready' : 'off'; pyVersion = r.version || ''; return r; }); },
    run: function (code, timeoutMs) { var go = function () { return call({ op: 'run', code: code }, timeoutMs || 30000); }; return pyState === 'ready' ? go() : python.init().then(function (r) { return r.ok ? go() : r; }); }
  };
  var fs = {
    ls: function () { return python.init().then(function () { return call({ op: 'ls' }, 15000); }); },
    read: function (p) { return call({ op: 'read', path: p }, 15000); },
    write: function (p, c) { return call({ op: 'write', path: p, content: c }, 15000); },
    rm: function (p) { return call({ op: 'rm', path: p }, 15000); }
  };
  /* Python's own documentation, so answers can be checked against the real thing */
  function docs(topic) {
    topic = String(topic || '').trim().replace(/[^\w.]/g, ''); if (!topic) return Promise.resolve({ ok: false, err: 'Name a module, function or keyword, e.g. str.split or itertools.' });
    var code = 'import pydoc, importlib\nname = ' + JSON.stringify(topic) + '\nobj = None\ntry:\n    obj = pydoc.locate(name)\nexcept Exception:\n    obj = None\nif obj is None:\n    try:\n        obj = importlib.import_module(name)\n    except Exception:\n        obj = None\nif obj is None:\n    import keyword\n    print("No documentation found for " + name + (" (it is a Python keyword: see the language reference)" if keyword.iskeyword(name) else ""))\nelse:\n    txt = pydoc.render_doc(obj, renderer=pydoc.plaintext)\n    print(txt[:6000] + ("\\n... (cut)" if len(txt) > 6000 else ""))\n';
    return python.run(code, 30000);
  }
  /* ---------- Linux, the same machine as the Linux Sandbox, running headless ---------- */
  var emu = null, lxState = 'off', serial = '', lxQueue = Promise.resolve();
  function strip(t) { return t.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '').replace(/\r/g, ''); }
  function loadScript(src) { return new Promise(function (ok, no) { if (window.V86) return ok(); var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = function () { no(new Error('could not load the Linux emulator')); }; document.head.appendChild(s); }); }
  var linux = {
    state: function () { return lxState; },
    boot: function (onStatus) {
      if (lxState === 'ready') return Promise.resolve(true); if (linux._boot) return linux._boot;
      lxState = 'booting';
      return linux._boot = loadScript(VBASE + 'libv86.js').then(function () {
        return new Promise(function (ok, no) {
          emu = new window.V86({ wasm_path: VBASE + 'v86.wasm', memory_size: 64 * 1024 * 1024, vga_memory_size: 2 * 1024 * 1024, bios: { url: VBASE + 'seabios.bin' }, vga_bios: { url: VBASE + 'vgabios.bin' }, cdrom: { url: VBASE + 'linux.iso' }, autostart: true, disable_keyboard: true, disable_mouse: true, disable_speaker: true });
          emu.add_listener('serial0-output-byte', function (b) { serial += String.fromCharCode(b); if (serial.length > 200000) serial = serial.slice(-100000); });
          var t0 = Date.now(), loggedIn = false, iv = setInterval(function () {
            if (!loggedIn && /login:\s*$/.test(serial)) { loggedIn = true; emu.serial0_send('root\n'); }
            if (loggedIn && /% $|# $/.test(serial)) { clearInterval(iv); emu.serial0_send('export PS1="$ "; stty -echo 2>/dev/null\n'); setTimeout(function () { lxState = 'ready'; ok(true); }, 600); }
            if (Date.now() - t0 > 90000) { clearInterval(iv); lxState = 'off'; linux._boot = null; no(new Error('Linux did not finish booting')); }
            if (onStatus) onStatus(Math.round((Date.now() - t0) / 1000));
          }, 250);
        });
      });
    },
    run: function (cmd, timeoutMs) {
      var job = lxQueue.then(function () { return linux.boot(); }).then(function () {
        return new Promise(function (ok) {
          var mark = '__LDB_' + Math.random().toString(36).slice(2, 8), start = serial.length, t0 = Date.now();
          emu.serial0_send(String(cmd).replace(/\n+$/, '') + '\necho ' + mark + '_$?\n');
          var iv = setInterval(function () {
            var s = serial.slice(start), m = new RegExp(mark + '_(\\d+)').exec(s);
            if (m) { clearInterval(iv); var body = strip(s.slice(0, m.index)).split('\n'); body = body.filter(function (l, i) { return !(i === 0 && l.trim() === String(cmd).trim()) && l.indexOf('echo ' + mark) < 0; }); ok({ ok: m[1] === '0', code: +m[1], out: body.join('\n').replace(/^\$ ?/gm, '').trim() }); }
            else if (Date.now() - t0 > (timeoutMs || 20000)) { clearInterval(iv); emu.serial0_send('\x03\n'); ok({ ok: false, code: -1, out: strip(s).trim().slice(-3000) + '\n[stopped after ' + Math.round((timeoutMs || 20000) / 1000) + ' s]' }); }
          }, 60);
        });
      });
      lxQueue = job.catch(function () {}); return job;
    }
  };
  window.LDBTools = { python: python, fs: fs, docs: docs, linux: linux };
})();
