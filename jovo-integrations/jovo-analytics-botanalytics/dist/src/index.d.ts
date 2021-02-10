import { Config as AlexaConfig } from './BotanalyticsAlexa';
import { Config as GoogleAssistantConfig } from './BotanalyticsGoogleAssistant';
interface AppBotanalyticsConfig {
    BotanalyticsAlexa?: AlexaConfig;
    BotanalyticsGoogleAssistant?: GoogleAssistantConfig;
}
declare module 'jovo-core/dist/src/Interfaces' {
    interface AppAnalyticsConfig extends AppBotanalyticsConfig {
    }
    interface ExtensiblePluginConfigs extends AppBotanalyticsConfig {
    }
}
export { BotanalyticsAlexa, Config as AlexaConfig } from './BotanalyticsAlexa';
export { BotanalyticsGoogleAssistant, Config as GoogleAssistantConfig, } from './BotanalyticsGoogleAssistant';
