/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import { name, version } from '../../package.json';

const zip = require('bestzip');
const nameZip = `${name}-js-v${version}.zip`;

zip({ 
  cwd: path.join(process.cwd(), 'dist'),
  source: '*', 
  destination: nameZip
}).then(function() {
    console.log(`file ${nameZip} created`);
});