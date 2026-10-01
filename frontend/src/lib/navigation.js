// Full-page navigation. Used where a client-side transition is wrong: after sign-out or an expired session
// we want a fresh document so no data tied to the old session survives in memory.
export const hardNavigate = url => { window.location.href = url; };

export const loginUrl = () => '/login?next=' + encodeURIComponent(window.location.pathname + window.location.search);
