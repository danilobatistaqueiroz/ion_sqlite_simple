import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { defineCustomElements as pwaElements} from '@ionic/pwa-elements/loader';
import { defineCustomElements as jeepSqlite} from 'jeep-sqlite/loader';
import { Capacitor } from '@capacitor/core';

if (environment.production) {
  enableProdMode();
}

// --> Below only required if you want to use a web platform
const platform = Capacitor.getPlatform();
console.log('platform',platform);
if(platform === "web") {
  // Web platform
  // required for toast component in Browser
  console.log('pwa');
  pwaElements(window);

  // required for jeep-sqlite Stencil component
  // to use a SQLite database in Browser
  console.log('jeep');
  jeepSqlite(window);

  window.addEventListener('DOMContentLoaded', async () => {
    console.log('creating jeep-sqlite');
      const jeepEl = document.createElement("jeep-sqlite");
      document.body.appendChild(jeepEl);
//      jeepEl.autoSave = true;
  });
}
// Above only required if you want to use a web platform <--

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
