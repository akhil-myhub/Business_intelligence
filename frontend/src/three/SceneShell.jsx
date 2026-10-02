'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { catchError } from 'next/error';
import { logger } from '@/lib/logger';
import { isWebGLSupported } from '@/lib/webgl';
import { usePrefs } from '@/providers/PrefsProvider';
import { BrandLoader } from '@/components/BrandLoader';

function Message({ title, onRetry, error, name }) {
  useEffect(() => { if (error) logger.error('scene_crashed', { scene: name, err: error }); }, [error, name]);
  return (
    <div className="scene-fallback" role="status">
      <span>{title}</span>
      {onRetry && <button className="btn primary" onClick={onRetry}>Retry</button>}
    </div>
  );
}

// Boundary around the WebGL tree: a thrown render error shows a retryable message, not a blank panel.
const SceneBoundary = catchError(({ name }, { error, retry }) => (
  <Message title="3D view unavailable" error={error} name={name} onRetry={() => retry()} />
));

/**
 * Shared shell for every 3D scene. Gives each scene, uniformly:
 *  - the user's "3D effects" preference (off → `fallback`, a useful 2D alternative, instead of WebGL)
 *  - WebGL feature detection with a readable fallback
 *  - context-loss handling (GPU reset / backgrounding) with automatic remount on restore
 *  - an error boundary
 *  - loading / error overlays for the data the scene depends on (`status`)
 */
export default function SceneShell({ name, label, className = '', status, fallback, tone = 'light', children, ...canvasProps }) {
  const supported = useMemo(() => isWebGLSupported(), []);
  const prefs = usePrefs()?.prefs;
  const enabled = prefs?.effects3d ?? true;
  const [epoch, setEpoch] = useState(0);

  const onCreated = useCallback(({ gl }) => {
    const el = gl.domElement;
    // ANGLE/D3D reports harmless "double precision" notes while compiling three's physical-material shaders; they are
    // logged as console issues on every load, so program-log checking is off (a real failure still renders blank).
    gl.debug.checkShaderErrors = false;
    el.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      // React unmounting a scene also releases its context (normal navigation) — only a lost context on a
      // canvas that is still on the page is a real GPU reset worth a warning.
      if (el.isConnected) logger.warn('webgl_context_lost', { scene: name });
    });
    el.addEventListener('webglcontextrestored', () => { logger.info('webgl_context_restored', { scene: name }); setEpoch(n => n + 1); });
  }, [name]);

  const wrap = (content, cls = '') => <div className={`canvas-wrap ${className} ${cls}`} role={cls ? undefined : 'img'} aria-label={cls ? undefined : label}>{content}</div>;

  if (!enabled) return wrap(fallback ?? <Message title="3D effects are turned off in Settings." />, 'plain');
  if (!supported) return wrap(fallback ?? <Message title="3D view needs WebGL, which is unavailable on this device." />, 'plain');

  return wrap(
    <>
      <SceneBoundary name={name}>
        <Canvas key={epoch} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }} onCreated={onCreated} {...canvasProps}>
          {children}
        </Canvas>
      </SceneBoundary>
      {status?.status === 'loading' && <BrandLoader overlay label="Loading map data" tone={tone} />}
      {status?.status === 'error' && <Message title="Map data could not be loaded." onRetry={status.retry} />}
    </>
  );
}
