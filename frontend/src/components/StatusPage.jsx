import React from 'react';
import { AavtorLogo } from './AavtorLogo';

// Full-page branded message (404, crashes) in the same glass card style as sign-in.
export function StatusPage({ code, title, message, children, role }) {
  return (
    <div className="app">
      <div className="bg" />
      <main className="status-page" role={role}>
        <section className="status-card">
          <AavtorLogo size={52} />
          {code && <span className="status-code">{code}</span>}
          <h1>{title}</h1>
          <p>{message}</p>
          <div className="status-actions">{children}</div>
        </section>
      </main>
    </div>
  );
}
