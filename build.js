'use strict';

const fs = require('fs');
const modules = require('./module-list.json');

let file = '';
let bundle = `'use strict';\n\n`;
let bundleExports = 'export {\n';

for (const module of modules) {
  const data = fs.readFileSync(`./src/modules/${module.fileName}`, 'utf8');
  bundle += `${data}\n`;
  bundleExports += `  ${module.name},\n`;
  file = `'use strict';\n\n${data}\nexport default ${module.name};\n`;
  fs.writeFile(`./dist/modules/${module.fileName}`, file, (err) => {
    if (err) throw err;
    console.log(`${module.name} has been saved`);
  });
}

bundle += `${bundleExports}};\n`;

fs.writeFile('./dist/bundle.js', bundle, (err) => {
  if (err) throw err;
  console.log('Bundle has been saved');
});
