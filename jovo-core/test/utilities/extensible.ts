import { Extensible, ExtensibleConfig, MiddlewareCollection } from '../../src';

export class EmptyExtensible extends Extensible {
  getDefaultConfig() {
    return {};
  }

  readonly middlewareCollection = new MiddlewareCollection();

  mount(parent: Extensible): Promise<void> | void {
    return;
  }
}

export interface ExampleExtensibleConfig extends ExtensibleConfig {
  text: string;
}

export class ExampleExtensible extends Extensible<ExampleExtensibleConfig> {
  getDefaultConfig(): ExampleExtensibleConfig {
    return {
      text: 'default',
    };
  }

  readonly middlewareCollection = new MiddlewareCollection();

  mount(parent: Extensible): Promise<void> | void {
    return;
  }
}

export class AppLikeExtensible extends Extensible {
  getDefaultConfig() {
    return {};
  }

  readonly middlewareCollection = new MiddlewareCollection();

  mount(): Promise<void> | void {
    return this.mountPlugins();
  }

  initialize(): Promise<void> {
    return this.initializePlugins();
  }
}
