# RIDR Lifecycle

Learn more about one of the key concepts of Jovo: The RIDR (Request - Interpretation - Dialogue & Logic - Response) Lifecycle.

- [Introduction](#introduction)
- [Request](#request)
- [Interpretation](#interpretation)
- [Dialogue & Logic](#dialogue--logic)
- [Response](#response)

## Introduction

![RIDR Lifecycle: Request - Interpretation - Dialogue & Logic - Response](https://ghost.jovo.tech/content/images/2021/05/ridr-lifecycle-1.png)

The RIDR Lifecycle is an essential process of a Jovo app. Each user request flows through the lifecycle that integrates with various services. At the end, RIDR returns a response back to the user.

RIDR includes four key elements:

* [Request](#request): Collecting raw data and native platform requests
* [Interpretation](#interpretation): Turing raw data into structured input
* [Dialogue & Logic](#dialogue--logic): Mapping structured input to structured output
* [Response](#response): Turning structured output into native platform responses

You can find a long-form introduction to RIDR on [Context-First: An Introduction to Voice and Multimodal Interactions](https://www.context-first.com/introduction-voice-multimodal-interactions/).


## Request

The Request step starts the interaction and captures necessary data.

This step includes a few things, depending on the platform you're building for:

* Platforms like Alexa and Google Assistat do a lot of the gruntwork (capturing input, doing speech recognition and natural language understanding) for you  and already come with fully populated JSON requests that include a user ID, data about the user inquiry (sometimes even `intents` and `entities`) and more
* For custom interfaces (for example web, mobile, or custom hardware), you need to take care of the user input recording yourself. Jovo helps with this process. [Take a look at our clients for more information](https://www.jovo.tech/marketplace/tag/clients).

This step populates the Jovo `$request` object.


## Interpretation

The Interpretation step tries to make sense of the data gathered from the [Request](#request).

Some platforms (like Alexa and Google Assistant) already come with structured data like `intents` and `entities`. For others, there is the need to integrate with additional services.

Here are some of the things that might happen in this step:

* [ASR](https://www.jovo.tech/marketplace/tag/asr): If the `$request` contains raw audio, a speech recognition service could be used to turn it into raw text
* [NLU](https://www.jovo.tech/marketplace/tag/nlu): A natural language understanding service turns raw text into structured input (`intents`, `entities`)
* Potentially, you can plug in any other service, e.g. emotion detection, sentiment analysis, and more

This step populates the Jovo `$input` object, among others (like `$nlu`, depending on the integration).

> The `$input` object is currently in development.


## Dialogue & Logic

In the Dialogue & Logic step it is determined how and what should be responded to the user.

This step consists of both dialogue management and domain/business logic. You can find a long-form [introduction to dialogue management on Context-First](https://www.context-first.com/dialogue-management-introduction/).

Here are some of the things that happen in this step:

* [Routing](./routing.md): Determines the component and handler that should fulfill the request
* [Components](./components.md): The key elements that structure the dialogue into reusable elements
* [Handlers](./handlers.md): Functions that fulfill a specific request
* Services: Utility classes that keep business logic separated dialogue (handlers)
* [Output](./output.md): The result of a handler is to return an appropriate output

The Dialogue & Logic step usually ends with a populated Jovo `$output` object.


## Response

In the final Response step, the `$output` object from the previous step is translated into a native platform `$response`.

This response is then returned back to the platform.
