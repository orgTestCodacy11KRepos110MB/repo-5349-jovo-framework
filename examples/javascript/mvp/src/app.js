import { App } from '@jovotech/framework';
import { Alexa } from '@jovotech/platform-alexa';

import { MainComponent } from './components/MainComponent/MainComponent';

/*
  |--------------------------------------------------------------------------
  | APP CONFIGURATION
  |--------------------------------------------------------------------------
  |
  | All relevant components, plugins, and configurations for your Jovo app
  | Learn more here: www.jovo.tech/docs/app-config
  |
  */

const app = new App({
  /*
    |--------------------------------------------------------------------------
    | Components
    |--------------------------------------------------------------------------
    |
    | Components contain the Jovo app logic
    | Learn more here: www.jovo.tech/docs/components
    |
    */

  components: [MainComponent],

  /*
    |--------------------------------------------------------------------------
    | Plugins
    |--------------------------------------------------------------------------
    |
    | Includes platforms, database integrations, third-party plugins, and more
    | Learn more here: www.jovo.tech/docs/plugins, www.jovo.tech/marketplace
    |
    */

  plugins: [
    new Alexa(),
    // new FileDb({
    //   pathToFile: './../../db/db.json',
    // }),
  ],

  /*
    |--------------------------------------------------------------------------
    | Other options
    |--------------------------------------------------------------------------
    |
    | Includes all other configuration options like logging
    | Learn more here: www.jovo.tech/docs/app-config
    |
    */

  logging: true,

  intentMap: {
    'AMAZON.StopIntent': 'END',
  },
});

module.exports = {
  app,
};
