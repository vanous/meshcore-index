import { error } from '@sveltejs/kit';
import { networks, getNetwork, devicesForNetwork } from '$lib/data.js';
import { maybeRedirect, redirectEntries } from '$lib/redirects.js';

export function entries() {
  return [...networks.map((n) => ({ id: n.id })), ...redirectEntries('networks')];
}

export function load({ params }) {
  maybeRedirect('networks', params.id);
  const network = getNetwork(params.id);
  if (!network) throw error(404, `Unknown network: ${params.id}`);
  const parentNetworks = (network.part_of ?? []).map((id) => getNetwork(id)).filter(Boolean);
  const subnetworkIds = network.subnetworks?.length
    ? network.subnetworks
    : networks.filter((n) => (n.part_of ?? []).includes(network.id)).map((n) => n.id);
  const subnetworks = subnetworkIds.map((id) => getNetwork(id)).filter(Boolean);

  return {
    network,
    parentNetworks,
    subnetworks,
    devices: devicesForNetwork(network)
  };
}
