# MeshCore Ninja

A catalog of official and community MeshCore firmwares and the devices they run on — with details, node roles, and a compatibility matrix.

It's a static [SvelteKit](https://kit.svelte.dev) site built from human-readable YAML files under [`data/`](data/). The YAML is validated against JSON Schema and compiled into a single `data.json` that the app consumes.

## Quick start

```bash
npm install
npm run dev        # start the dev server (builds data first)
npm run build      # production build
npm run preview    # preview the production build
```

## Working with the data

All content lives as YAML under [`data/`](data/):

- `devices/` — supported LoRa hardware
- `firmwares/` — official and community MeshCore firmwares
- `compatibility/` — which firmwares run on which devices
- `vendors/` — hardware/firmware vendors
- `globals.yaml` — shared definitions (node roles, etc.)

```bash
npm test           # validate all YAML against JSON Schema + referential checks
npm run build:data # regenerate data.json and static/schema/*.json
```

Run `npm test` after every data change. Before authoring or editing data, read [`data/RULES.md`](data/RULES.md) (the authoring guide) and [`data/SCHEMA.md`](data/SCHEMA.md) (the field reference). Machine-readable contracts live in [`schema/`](schema/).

## Contributing

Edits are made by changing the YAML files in `data/`. See [`AGENTS.md`](AGENTS.md) for repo conventions and [`data/RULES.md`](data/RULES.md) for the authoring guide.
