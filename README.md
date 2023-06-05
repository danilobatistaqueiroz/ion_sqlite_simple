
ionic start simples blank --type=angular --capacitor --project-id=sql-simples --package-id=br.labs.simple

"simples" será o appName, nome que vai aparecer no ícone e nas listagens no Android.

"sql-simples" é o nome da pasta, o nome do projeto no package.json

"br.labs.simple" é o nome do pacote Java e identificador da aplicação no Android.



pnpm install --save @capacitor-community/sqlite
pnpm install --save jeep-sqlite
pnpm install --save sql.js
pnpm i @ionic/pwa-elements


copyfiles node_modules/sql.js/dist/sql-wasm.wasm src/assets


app.module.ts  
```ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
```

capacitor.config.ts  
```ts
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth : false,
        biometricTitle : "Biometric login for capacitor sqlite",
        biometricSubTitle : "Log in using your biometric"
      }
    }
  }
```

main.ts  
```ts
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
      const jeepEl = document.createElement("jeep-sqlite");
      document.body.appendChild(jeepEl);
//      jeepEl.autoSave = true;
  });
}
// Above only required if you want to use a web platform <--
```



### Install ionic app in an Android device ###
export JAVA_HOME=~/android-studio/jbr
sudo update-alternatives --config java
cd android
gradle signingReport

### install using gradle ###
jarsigner -verbose -keystore ~/.android/debug.keystore ./app/build/outputs/apk/debug/app-debug.apk AndroidDebugKey
alias zipalign=~/android-sdk/build-tools/30.0.3/zipalign
zipalign -v 4 ./app/build/outputs/apk/debug/app-debug.apk authemail.apk

cd android
    ./gradlew clean
    ./gradlew build
    ./gradlew assembleDebug
    ./gradlew installDebug
adb shell am start -n "br.labs.simple/br.labs.simple.MainActivity" -a android.intent.action.MAIN -c android.intent.category.LAUNCHER

### Analisar logcat da aplicação ###

adb logcat --pid=`adb shell pidof -s br.labs.simple`

**consultar os últimos 500 logs**  
adb logcat -t 500

**listar apenas os logs da sessão excluindo anteriores**  
adb logcat -L

**listar por data**  
adb logcat -T '2023-06-05'

https://sleticalboy.github.io/android/2020/03/25/logcat-doc/
