// Module-level flag: true on first JS load, false after boot sequence fires.
// Persists across SPA navigations (same JS module); resets on hard refresh.
let _firstBoot = true;

export const isFirstBoot = () => _firstBoot;
export const markBooted  = () => { _firstBoot = false; };
