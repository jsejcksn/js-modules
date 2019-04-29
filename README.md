# js-modules

Personal modules for re-use in prototyping, demos, etc.

To add a new module:

  - add the module code to a new `.js` file
  - save that file in `src/modules/`
  - update `module-list.json` with the new module info
  - run `npm run build`, which exports the module code for consumption as a standalone file and incorporates it into the bundle file, both in `dist/`
