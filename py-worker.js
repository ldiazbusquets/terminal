/* Python for the AI terminal: the real CPython interpreter (Pyodide, compiled to WebAssembly) in a worker,
   so a runaway loop can be stopped without freezing the page. Files live in /work, saved in the browser. */
let py = null, ready = null;
const BASE = (self.location.search.match(/[?&]base=([^&]+)/) || [])[1];
const URL_ = BASE ? decodeURIComponent(BASE) : 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/';
function boot() {
  if (ready) return ready;
  ready = (async () => {
    importScripts(URL_ + 'pyodide.js');
    py = await loadPyodide({ indexURL: URL_ });
    try { py.FS.mkdir('/work'); } catch (e) {}
    try { py.FS.mount(py.FS.filesystems.IDBFS, {}, '/work'); await new Promise(r => py.FS.syncfs(true, () => r())); } catch (e) {}
    py.FS.chdir('/work');
    py.runPython('import sys, os\nsys.setrecursionlimit(3000)');
    return py.version;
  })();
  return ready;
}
function sync() { return new Promise(r => { try { py.FS.syncfs(false, () => r()); } catch (e) { r(); } }); }
self.onmessage = async (e) => {
  const { id, op, code, path, content } = e.data, reply = (o) => self.postMessage(Object.assign({ id }, o));
  try {
    const ver = await boot();
    if (op === 'init') return reply({ ok: true, version: ver });
    if (op === 'run') {
      let out = '', err = '';
      py.setStdout({ batched: s => { out += s + '\n'; } }); py.setStderr({ batched: s => { err += s + '\n'; } });
      try { await py.loadPackagesFromImports(code, { messageCallback: () => {}, errorCallback: () => {} }); } catch (x) {}
      let result = null;
      try { const r = await py.runPythonAsync(code); if (r !== undefined && r !== null) { result = String(r && r.toString ? r.toString() : r); if (r && r.destroy) r.destroy(); } }
      catch (x) { err += String(x.message || x).split('\n').filter(l => !/^  File "\/lib\/python|_pyodide|pyodide\/|^PythonError/.test(l)).join('\n'); await sync(); return reply({ ok: false, out: out, err: err.trim() }); }
      await sync(); return reply({ ok: true, out: out, err: err.trim(), result: result });
    }
    if (op === 'ls') { const walk = (d) => { let r = []; for (const n of py.FS.readdir(d)) { if (n === '.' || n === '..') continue; const p = d + '/' + n, st = py.FS.stat(p); if (py.FS.isDir(st.mode)) r = r.concat(walk(p)); else r.push({ path: p.replace(/^\/work\//, ''), size: st.size }); } return r; }; return reply({ ok: true, files: walk('/work') }); }
    if (op === 'read') return reply({ ok: true, content: py.FS.readFile('/work/' + path, { encoding: 'utf8' }) });
    if (op === 'write') { const parts = ('/work/' + path).split('/'); for (let i = 2; i < parts.length; i++) { try { py.FS.mkdir(parts.slice(0, i).join('/')); } catch (x) {} } py.FS.writeFile('/work/' + path, content); await sync(); return reply({ ok: true }); }
    if (op === 'rm') { py.FS.unlink('/work/' + path); await sync(); return reply({ ok: true }); }
  } catch (x) { reply({ ok: false, err: String(x && x.message || x) }); }
};
