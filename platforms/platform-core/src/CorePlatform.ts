import { AnyObject, ExtensibleConfig, Platform } from '@jovotech/framework';
import { CorePlatformOutputTemplateConverterStrategy } from '@jovotech/output-core';
import { CoreResponse } from '.';
import { Core } from './Core';
import { CoreDevice } from './CoreDevice';
import { CoreRequest } from './CoreRequest';
import { CoreUser } from './CoreUser';

export interface CorePlatformConfig extends ExtensibleConfig {
  type: 'jovo-platform-core' | string;
}

export class CorePlatform extends Platform<
  CoreRequest,
  CoreResponse,
  Core,
  CoreUser,
  CoreDevice,
  CorePlatform,
  CorePlatformConfig
> {
  // TODO: determine how useful this is and if this is required somewhere
  // Creates a class with the given name that only supports requests with the given type.
  // Allows making new platforms on the fly
  static create(
    name: string,
    type: CorePlatformConfig['type'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): new (...args: any[]) => CorePlatform {
    // workaround to make the anonymous' class name equal to `name`
    const obj = {
      [name]: class extends CorePlatform {
        getDefaultConfig(): CorePlatformConfig {
          return {
            ...super.getDefaultConfig(),
            type,
          };
        }
      },
    };
    return obj[name];
  }

  outputTemplateConverterStrategy = new CorePlatformOutputTemplateConverterStrategy();
  requestClass = CoreRequest;
  jovoClass = Core;
  userClass = CoreUser;
  deviceClass = CoreDevice;

  getDefaultConfig(): CorePlatformConfig {
    return {
      type: 'jovo-platform-core',
    };
  }

  isRequestRelated(request: AnyObject | CoreRequest): boolean {
    return request.version && request.request?.type && request.type === this.config.type;
  }

  isResponseRelated(response: AnyObject | CoreResponse): boolean {
    return (
      response.version &&
      response.output &&
      response.session &&
      response.context &&
      response.type === this.config.type
    );
  }

  finalizeResponse(
    response: CoreResponse,
    corePlatformApp: Core,
  ): CoreResponse | Promise<CoreResponse> {
    response.type = this.config.type;
    response.session.data = corePlatformApp.$session;
    return response;
  }
}
