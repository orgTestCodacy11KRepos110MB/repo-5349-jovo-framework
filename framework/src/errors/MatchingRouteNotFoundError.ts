import { UnknownObject } from '../index';
import { JovoError } from '../JovoError';
import { StateStack } from '../JovoSession';
import { RouteMatch } from '../plugins/RouteMatch';

export interface MatchingRouteNotFoundErrorOptions {
  request: UnknownObject;
  intent: string;
  mappedIntent?: string;
  state?: StateStack;
  matches?: RouteMatch[];
}

export class MatchingRouteNotFoundError extends JovoError {
  constructor({
    request,
    intent,
    mappedIntent,
    state,
    matches,
  }: MatchingRouteNotFoundErrorOptions) {
    super({
      message: 'No matching route was found for the request.',
      context: {
        intent,
        mappedIntent,
        state,
        matches,
        request,
      },
    });
  }
}
