import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { API_BASE_URL } from './core/api-tokens';
import { environment } from '../environments/environment';
import { RUNTIME_CONFIG_INITIALIZER } from './core/runtime-config.initializer';
import { RuntimeConfigService } from './core/runtime-config.service';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
    RUNTIME_CONFIG_INITIALIZER,
    {
      provide: API_BASE_URL,
      deps: [RuntimeConfigService],
      useFactory: (rc: RuntimeConfigService) => rc.get('apiUrl') ?? environment.apiUrl,
    },
  ]
};
