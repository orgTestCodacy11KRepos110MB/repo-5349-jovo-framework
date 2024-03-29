import { BaseComponent, ComponentConstructor } from '../BaseComponent';
import { InternalIntent } from '../enums';
import { DuplicateChildComponentsError } from '../errors/DuplicateChildComponentsError';
import { ComponentMetadata, ComponentOptions } from '../metadata/ComponentMetadata';
import { HandlerMetadata } from '../metadata/HandlerMetadata';
import { HandlerOptionMetadata } from '../metadata/HandlerOptionMetadata';
import { MetadataStorage } from '../metadata/MetadataStorage';
import { getMethodKeys } from '../utilities';

export function Component<COMPONENT extends BaseComponent = BaseComponent>(
  options?: ComponentOptions<COMPONENT>,
): (target: ComponentConstructor<COMPONENT>) => void {
  return function (target) {
    if (options?.components) {
      const componentNameSet = new Set<string>();
      options.components.forEach((component) => {
        const componentName =
          typeof component === 'function'
            ? component.name
            : component.options?.name || component.component.name;
        if (componentNameSet.has(componentName)) {
          throw new DuplicateChildComponentsError(componentName, target.name);
        }
        componentNameSet.add(componentName);
      });
    }
    const metadataStorage = MetadataStorage.getInstance();

    const keys = getMethodKeys(target.prototype);
    keys.forEach((key) => {
      // it could be checked for more built-in Intents here in order to skip them in the future, i.e. START
      const hasHandlerMetadata = metadataStorage.handlerMetadata.some(
        (handlerMetadata) =>
          handlerMetadata.target === target && handlerMetadata.propertyKey === key,
      );
      const hasHandlerOptionMetadata = metadataStorage.handlerOptionMetadata.some(
        (optionMetadata) => optionMetadata.target === target && optionMetadata.propertyKey === key,
      );
      if (!hasHandlerMetadata && !hasHandlerOptionMetadata) {
        metadataStorage.addHandlerMetadata(new HandlerMetadata(target, key as keyof COMPONENT));
      }
    });
    // make launch global if it is set
    if (target.prototype[InternalIntent.Launch]) {
      // unshift to not overwrite any other explicitly set HandlerOptionMetadata when merging
      metadataStorage.handlerOptionMetadata.unshift(
        new HandlerOptionMetadata(target, InternalIntent.Launch as keyof COMPONENT, {
          global: true,
        }) as HandlerOptionMetadata,
      );
    }
    metadataStorage.addComponentMetadata(new ComponentMetadata<COMPONENT>(target, options));
    return;
  };
}
