import { error } from '@sveltejs/kit';
import { vendors, getVendor, devicesForVendor } from '$lib/data.js';
import { maybeRedirect, redirectEntries } from '$lib/redirects.js';

export function entries() {
  return [...vendors.map((v) => ({ id: v.id })), ...redirectEntries('vendors')];
}

export function load({ params }) {
  maybeRedirect('vendors', params.id);
  const vendor = getVendor(params.id);
  if (!vendor) throw error(404, `Unknown vendor: ${params.id}`);
  return { vendor, devices: devicesForVendor(params.id) };
}
