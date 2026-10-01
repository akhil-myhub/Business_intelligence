// Feature-detect WebGL once so unsupported/blocked GPUs get a clear fallback instead of a blank canvas.
let cached;

export function isWebGLSupported() {
  if (cached !== undefined) return cached;
  try {
    const c = document.createElement('canvas');
    cached = Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    cached = false;
  }
  return cached;
}
