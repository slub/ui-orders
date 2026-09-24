import { webcrypto } from 'crypto';

// The jsdom version used by the current jest environment does not implement the `crypto` global,
// which `uuid` relies on (e.g. `@folio/stripes-template-editor` generates ids in its constructor).
if (!global.crypto?.getRandomValues) {
  Object.defineProperty(global, 'crypto', {
    configurable: true,
    writable: true,
    value: webcrypto,
  });
}
