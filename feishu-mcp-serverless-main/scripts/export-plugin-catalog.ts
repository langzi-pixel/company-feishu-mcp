import { catalog, annotationsFor } from '../src/catalog.js';
console.log(JSON.stringify(catalog.map(t=>({name:t.name,project:t.project,description:t.description,read_only:annotationsFor(t).readOnlyHint}))));
