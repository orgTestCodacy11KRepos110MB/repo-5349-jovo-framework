import { registerPlatformSpecificJovoReference } from '@jovotech/framework';
import { CorePlatform, CorePlatformConfig } from './CorePlatform';
import { Core } from './Core';

declare module '@jovotech/framework/dist/types/Extensible' {
  interface ExtensiblePluginConfig {
    CorePlatform?: CorePlatformConfig;
  }

  interface ExtensiblePlugins {
    CorePlatform?: CorePlatform;
  }
}

declare module '@jovotech/framework/dist/types/Jovo' {
  interface Jovo {
    $core?: Core;
  }
}
registerPlatformSpecificJovoReference('$core', Core);

export * from './Core';
export * from './CorePlatform';
export * from './CoreRequest';
export * from './CoreUser';
export type { CorePlatformResponse as CoreResponse } from '@jovotech/output-core';
export * from './interfaces';
