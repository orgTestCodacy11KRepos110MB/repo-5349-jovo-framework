import { GenericOutput, Message, OutputConverterStrategy, QuickReply, toSSML } from '@jovotech/output';
import { GoogleAssistantResponse, SimpleResponse, Suggestion } from './index';
import _merge from 'lodash.merge';

export class GoogleAssistantOutputConverterStrategy
  implements OutputConverterStrategy<GoogleAssistantResponse> {
  responseClass = GoogleAssistantResponse;

  toResponse(output: GenericOutput): GoogleAssistantResponse {
    const response: GoogleAssistantResponse = {
      richResponse: {
        items: [],
      },
    };

    // TODO: fully determine when to set listen
    const listen = output.platforms?.GoogleAssistant?.listen ?? output.listen;
    if (typeof listen !== 'undefined') {
      response.expectUserResponse = listen;
    }

    const message = output.platforms?.GoogleAssistant?.message || output.message;
    if (message) {
      response.richResponse.items.push({
        simpleResponse: this.convertMessageToSimpleResponse(message),
      });
    }

    const reprompt = output.platforms?.GoogleAssistant?.reprompt || output.reprompt;
    if (reprompt) {
      response.noInputPrompts = [this.convertMessageToSimpleResponse(reprompt)];
    }

    const quickReplies = output.platforms?.GoogleAssistant?.quickReplies || output.quickReplies;
    if (quickReplies?.length) {
      response.richResponse.suggestions = quickReplies.map(this.convertQuickReplyToSuggestion);
    }

    const card = output.platforms?.GoogleAssistant?.card || output.card;
    if (card) {
      response.richResponse.items.push({
        basicCard: card.toGoogleAssistantBasicCard?.(),
      });
    }

    const carousel = output.platforms?.GoogleAssistant?.carousel || output.carousel;
    if (carousel) {
      response.systemIntent = {
        intent: 'actions.intent.OPTION',
        data: {
          '@type': 'type.googleapis.com/google.actions.v2.OptionValueSpec',
          'carouselSelect': carousel.toGoogleAssistantCarousel?.(),
        },
      };
    }

    if (output.platforms?.GoogleAssistant?.nativeResponse) {
      _merge(response, output.platforms.GoogleAssistant.nativeResponse);
    }

    return response;
  }

  fromResponse(response: GoogleAssistantResponse): GenericOutput {
    const output: GenericOutput = {};

    const simpleResponse = response.richResponse?.items?.[0]?.simpleResponse;
    if (simpleResponse?.ssml && simpleResponse?.toMessage) {
      output.message = simpleResponse.toMessage();
    }

    if (response.noInputPrompts?.length) {
      output.reprompt = response.noInputPrompts[0].toMessage?.();
    }

    if (typeof response.expectUserResponse === 'boolean') {
      output.listen = response.expectUserResponse;
    }

    const suggestions = response.richResponse.suggestions;
    if (suggestions?.length) {
      output.quickReplies = suggestions.map((suggestion) => {
        return suggestion.toQuickReply!();
      });
    }

    const basicCard = response.richResponse.items.find((item) => item.basicCard)?.basicCard;
    if (basicCard?.toGenericCard) {
      output.card = basicCard?.toGenericCard();
    }

    if (
      response.systemIntent?.intent === 'actions.intent.OPTION' &&
      response.systemIntent?.data?.carouselSelect
    ) {
      output.carousel = response.systemIntent.data.carouselSelect.toGenericCarousel?.();
    }

    return output;
  }

  convertMessageToSimpleResponse(message: Message): SimpleResponse {
    return typeof message === 'string'
      ? { ssml: toSSML(message) }
      : message.toGoogleAssistantSimpleResponse?.() || {
          ssml: toSSML(message.text),
          displayText: message.displayText,
        };
  }

  convertQuickReplyToSuggestion(quickReply: QuickReply): Suggestion {
    return typeof quickReply === 'string'
      ? { title: quickReply }
      : quickReply.toGoogleAssistantSuggestion?.() || {
          title: quickReply.text,
        };
  }
}
