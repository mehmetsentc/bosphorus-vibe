/**
 * iOS Safari blocks unmuted video autoplay until the user explicitly interacts
 * with audio at least once. Once unlocked in a session, subsequent play() calls
 * with muted=false also work (browser remembers the permission).
 *
 * Call markAudioUnlocked() when the user successfully plays with sound.
 * Call isAudioUnlocked() before play() to decide whether to start muted.
 */

let _unlocked = false;

export function isAudioUnlocked(): boolean {
  return _unlocked;
}

export function markAudioUnlocked(): void {
  _unlocked = true;
}
