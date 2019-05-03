'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const modules = yaml.safeLoad(fs.readFileSync(`${__dirname}/module-list.yaml`, 'utf8')).sort((a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  }
  else if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  }
  return 0;
});
const version = require(`${__dirname}/package.json`).version;

let file = '';
let bundle = `'use strict';\n\n`;
let bundleExports = 'export {\n';

for (const module of modules) {
  const versions = module.versions.sort();
  for (const [index, version] of versions.entries()) {
    const data = fs.readFileSync(`${__dirname}/src/modules/${module.pathName}/${version}/${module.pathName}.js`, 'utf8');
    file = `'use strict';\n\n${data}\nexport default ${module.name};\n`;
    fs.mkdirSync(`${__dirname}/dist/modules/${module.pathName}/${version}`, {recursive: true});
    fs.writeFile(`${__dirname}/dist/modules/${module.pathName}/${version}/${module.pathName}.js`, file, (err) => {
      if (err) throw err;
      console.log(`${module.name}@${version} has been saved`);
    });
    if (index === versions.length - 1) {
      bundle += `// v${version}\n${data}\n`;
      bundleExports += `  ${module.name},\n`;
    }
  }
}

bundle += `${bundleExports}};\n`;

fs.mkdirSync(`${__dirname}/dist/bundles`, {recursive: true});
fs.writeFile(`${__dirname}/dist/bundles/bundle-${version}.js`, bundle, (err) => {
  if (err) throw err;
  console.log(`Bundle@${version} has been saved`);
});
