// Device comparison selection. Persisted to sessionStorage so the chosen set
// survives navigation between the devices list and the /compare page.
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const KEY = 'atlas:compare';

function initial() {
  if (!browser) return [];
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export const compareIds = writable(initial());

if (browser) {
  compareIds.subscribe((ids) => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      // ignore quota / privacy-mode errors
    }
  });
}

export function toggleCompare(id) {
  compareIds.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
}

export function clearCompare() {
  compareIds.set([]);
}
