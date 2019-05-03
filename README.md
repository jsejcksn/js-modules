# js-modules

Personal modules for re-use in prototyping, demos, etc.

To add a new module or update an existing one:
  
 > See examples in `src/modules/`

  1. Add the module code to a new `.js` file, but don't include the `export` statement.
  2. Save that file in `src/modules/<module-name>/<module-version>/`.
  3. Update `module-list.yaml` with the new module info. The `name` property will be used to create a default export from the code in the `.js` file. The `pathName` and `version` must match the location where the `.js` file was saved.
  4. Increment the version number in `package.json` so the bundle output in the next step reflects the new version number (instead of overwriting an existing one)
  5. Run `npm run build`, which will export the module code for consumption as a standalone file (in `dist/modules/<module-name>/<module-version>/` and incorporate it into a bundle file in `dist/bundles/`
