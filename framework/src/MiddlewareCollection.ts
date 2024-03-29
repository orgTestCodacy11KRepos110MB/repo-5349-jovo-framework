import { ArrayElement } from './index';
import { Middleware, MiddlewareFunction } from './Middleware';

export type PossibleMiddlewareName<MIDDLEWARES extends string[]> =
  | ArrayElement<MIDDLEWARES>
  | `after.${ArrayElement<MIDDLEWARES>}`
  | `before.${ArrayElement<MIDDLEWARES>}`;

export class MiddlewareCollection<MIDDLEWARES extends string[] = string[]> {
  readonly middlewares: Record<string, Middleware>;

  constructor(...names: MIDDLEWARES) {
    this.middlewares = names.reduce((middlewares: Record<string, Middleware>, middlewareName) => {
      middlewares[middlewareName] = new Middleware(middlewareName);
      return middlewares;
    }, {});
  }

  get names(): Array<PossibleMiddlewareName<MIDDLEWARES> | string> {
    return Object.keys(this.middlewares);
  }

  use(name: PossibleMiddlewareName<MIDDLEWARES>, ...fns: MiddlewareFunction[]): this;
  use(name: string, ...fns: MiddlewareFunction[]): this;
  use(name: string | PossibleMiddlewareName<MIDDLEWARES>, ...fns: MiddlewareFunction[]): this {
    let middleware = this.get(name);
    if (!middleware) {
      middleware = new Middleware(name);
      this.add(middleware);
    }
    middleware.use(...fns);
    return this;
  }

  add(...names: string[]): this;
  add(...middlewares: Middleware[]): this;
  add(...namesOrMiddlewares: Array<Middleware | string>): this {
    namesOrMiddlewares.forEach((nameOrMiddleware) => {
      if (typeof nameOrMiddleware === 'string') {
        this.middlewares[nameOrMiddleware] = new Middleware(nameOrMiddleware);
      } else {
        this.middlewares[nameOrMiddleware.name] = nameOrMiddleware;
      }
    });
    return this;
  }

  has(name: PossibleMiddlewareName<MIDDLEWARES>): boolean;
  has(name: string): boolean;
  has(name: string | PossibleMiddlewareName<MIDDLEWARES>): boolean {
    return !!this.middlewares[name] && this.middlewares[name] instanceof Middleware;
  }

  get<MIDDLEWARE extends PossibleMiddlewareName<MIDDLEWARES>>(
    name: MIDDLEWARE,
  ): Middleware<MIDDLEWARE> | undefined;
  get<MIDDLEWARE extends string>(name: MIDDLEWARE): Middleware<MIDDLEWARE> | undefined;
  get(name: string | PossibleMiddlewareName<MIDDLEWARES>): Middleware | undefined {
    return this.middlewares[name];
  }

  remove(...names: PossibleMiddlewareName<MIDDLEWARES>[]): this;
  remove(...names: string[]): this;
  remove(...names: Array<string | PossibleMiddlewareName<MIDDLEWARES>>): this {
    names.forEach((name) => {
      if (this.has(name)) {
        delete this.middlewares[name];
      }
    });
    return this;
  }

  async run<T extends unknown[]>(
    name: PossibleMiddlewareName<MIDDLEWARES>,
    ...args: T
  ): Promise<void>;
  async run<T extends unknown[]>(name: string, ...args: T): Promise<void>;
  async run<T extends unknown[]>(
    name: string | PossibleMiddlewareName<MIDDLEWARES>,
    ...args: T
  ): Promise<void> {
    const middleware = this.get(name);
    if (!middleware) return;
    const beforeName = `before.${name}`;
    if (this.has(beforeName)) {
      await this.run(beforeName, ...args);
    }

    await middleware.run(...args);

    const afterName = `after.${name}`;
    if (this.has(afterName)) {
      await this.run(afterName, ...args);
    }
  }

  disable(...names: PossibleMiddlewareName<MIDDLEWARES>[]): this;
  disable(...names: string[]): this;
  disable(...names: Array<string | PossibleMiddlewareName<MIDDLEWARES>>): this {
    names.forEach((name) => {
      const middleware = this.get(name);
      if (middleware) {
        middleware.enabled = false;
      }
    });
    return this;
  }

  enable(...names: PossibleMiddlewareName<MIDDLEWARES>[]): this;
  enable(...names: string[]): this;
  enable(...names: Array<string | PossibleMiddlewareName<MIDDLEWARES>>): this {
    names.forEach((name) => {
      const middleware = this.get(name);
      if (middleware) {
        middleware.enabled = true;
      }
    });
    return this;
  }
}
