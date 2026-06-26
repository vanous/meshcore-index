// Historical metadata + changelogs for the repeater CLI cheat sheet.
//
// Loaded on demand (see `loadHistory` in repeaterCommands.js) so the default
// view — the current release — does not pay for the full release history.
//
// Derived directly from the firmware source: the set of CLI command tokens in
// `src/helpers/CommonCLI.cpp`, `examples/simple_repeater/main.cpp` and (later)
// `examples/simple_repeater/MyMesh.cpp` was extracted at every `repeater-vX.Y.Z`
// tag and diffed between consecutive releases. Dates are the tag commit dates.
// Releases not listed in CHANGELOG had no change to the CLI command surface.

/**
 * Every tracked release, newest-first. `version` matches the `addedIn` keys in
 * the catalogue; `date` is the tag commit date; `current` marks the default.
 * @type {{ version: string, label: string, date: string, current?: boolean }[]}
 */
export const VERSIONS = [
  { version: 'v1.16.0', label: 'v1.16.0', date: '2026-06-06', current: true },
  { version: 'v1.15.0', label: 'v1.15.0', date: '2026-04-19' },
  { version: 'v1.14.1', label: 'v1.14.1', date: '2026-03-20' },
  { version: 'v1.14.0', label: 'v1.14.0', date: '2026-03-06' },
  { version: 'v1.13.0', label: 'v1.13.0', date: '2026-02-15' },
  { version: 'v1.12.0', label: 'v1.12.0', date: '2026-01-29' },
  { version: 'v1.11.0', label: 'v1.11.0', date: '2025-11-30' },
  { version: 'v1.10.0', label: 'v1.10.0', date: '2025-11-13' },
  { version: 'v1.9.1', label: 'v1.9.1', date: '2025-10-02' },
  { version: 'v1.9.0', label: 'v1.9.0', date: '2025-09-28' },
  { version: 'v1.8.1', label: 'v1.8.1', date: '2025-09-01' },
  { version: 'v1.8.0', label: 'v1.8.0', date: '2025-08-31' },
  { version: 'v1.7.4', label: 'v1.7.4', date: '2025-07-24' },
  { version: 'v1.7.3', label: 'v1.7.3', date: '2025-07-15' },
  { version: 'v1.7.2', label: 'v1.7.2', date: '2025-07-02' },
  { version: 'v1.7.1', label: 'v1.7.1', date: '2025-06-29' },
  { version: 'v1.7.0', label: 'v1.7.0', date: '2025-06-07' },
  { version: 'v1.6.2', label: 'v1.6.2', date: '2025-05-24' },
  { version: 'v1.6.1', label: 'v1.6.1', date: '2025-05-17' },
  { version: 'v1.6.0', label: 'v1.6.0', date: '2025-05-09' },
  { version: 'v1.5.1', label: 'v1.5.1', date: '2025-04-21' },
  { version: 'v1.5.0', label: 'v1.5.0', date: '2025-04-21' },
  { version: 'v1.4.3', label: 'v1.4.3', date: '2025-04-07' },
  { version: 'v1.4.2', label: 'v1.4.2', date: '2025-03-30' },
  { version: 'v1.4.1', label: 'v1.4.1', date: '2025-03-25' },
  { version: 'v1.4.0', label: 'v1.4.0', date: '2025-03-19' },
  { version: 'v1.3.0', label: 'v1.3.0', date: '2025-03-13' },
  { version: 'v1.2.2', label: 'v1.2.2', date: '2025-03-09' },
  { version: 'v1.2.1', label: 'v1.2.1', date: '2025-03-07' },
  { version: 'v1.2.0', label: 'v1.2.0', date: '2025-03-07' },
  { version: 'v1.0.0d', label: 'v1.0.0d', date: '2025-03-06' },
  { version: 'v1.0.0c', label: 'v1.0.0c', date: '2025-03-05' },
  { version: 'v1.0.0a', label: 'v1.0.0a', date: '2025-03-05' }
];

/**
 * Per-version changes to the repeater CLI surface. Only releases that changed a
 * command are listed; the page shows a "no changes" note for the rest.
 *   added      — new commands
 *   deprecated — still present but superseded
 *   note       — extra context
 * @type {Record<string, { added?: string[], deprecated?: string[], note?: string }>}
 */
export const CHANGELOG = {
  'v1.16.0': {
    added: ['get/set flood.max.unscoped', 'get/set flood.max.advert', 'region def']
  },
  'v1.15.0': {
    added: [
      'get/set dutycycle',
      'full region management (region get/put/remove/load/save/home/default/allowf/denyf/list)'
    ],
    deprecated: ['get/set af — use dutycycle instead']
  },
  'v1.14.1': {
    added: ['poweroff', 'shutdown', 'get/set radio.rxgain']
  },
  'v1.14.0': {
    added: [
      'advert.zerohop',
      'discover.neighbors',
      'get/set loop.detect',
      'get/set path.hash.mode',
      'get bootloader.ver'
    ]
  },
  'v1.12.0': {
    added: [
      'clkreboot',
      'get/set owner.info',
      'powersaving (on/off)',
      'get pwrmgt.support / pwrmgt.source / pwrmgt.bootreason / pwrmgt.bootmv'
    ]
  },
  'v1.11.0': {
    added: ['get/set adc.multiplier']
  },
  'v1.10.0': {
    added: [
      'bridge.* (type/enabled/delay/source/baud/channel/secret)',
      'gps + gps on/off/sync/setloc/advert',
      'region (list)',
      'sensor list/get/set',
      'stats-core / stats-radio / stats-packets'
    ]
  },
  'v1.9.1': {
    added: ['board']
  },
  'v1.9.0': {
    added: ['setperm', 'get acl']
  },
  'v1.8.0': {
    added: ['neighbor.remove', 'get/set prv.key']
  },
  'v1.7.4': {
    added: ['get/set multi.acks', 'tempradio']
  },
  'v1.7.1': {
    added: ['get/set agc.reset.interval']
  },
  'v1.7.0': {
    added: ['get/set int.thresh']
  },
  'v1.6.1': {
    added: ['clear stats']
  },
  'v1.6.0': {
    added: ['neighbors']
  },
  'v1.4.2': {
    added: ['get public.key', 'get role']
  },
  'v1.4.1': {
    added: ['get/set allow.read.only', 'get/set flood.advert.interval']
  },
  'v1.3.0': {
    added: ['get/set flood.max']
  },
  'v1.0.0a': {
    note: 'First public release — the baseline command set.'
  }
};
