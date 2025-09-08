import { APP_INITIALIZER, FactoryProvider } from '@angular/core';
import { RuntimeConfigService } from './runtime-config.service';

function loadRuntimeConfig(config: RuntimeConfigService) {
  return () => fetch('/runtime-config.json', { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : {}))
    .then((json: any) => {
      if (json && typeof json.apiUrl === 'string') {
        config.set('apiUrl', json.apiUrl);
      }
    })
    .catch(() => void 0);
}

export const RUNTIME_CONFIG_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: loadRuntimeConfig,
  deps: [RuntimeConfigService],
  multi: true,
};


