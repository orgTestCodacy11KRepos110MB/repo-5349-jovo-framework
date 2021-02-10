"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _get = require("lodash.get");
const _merge = require("lodash.merge");
const _set = require("lodash.set");
const __1 = require("..");
const Jovo_1 = require("../core/Jovo");
const ComponentPlugin_1 = require("./ComponentPlugin");
const Router_1 = require("./Router");
class Handler {
    /**
     * Calls 'NEW_USER' if the current user is not in the database
     * @param {Jovo} jovo
     * @return {any}
     */
    static async handleOnNewUser(jovo) {
        if (!jovo.$user || !jovo.$user.isNew()) {
            return Promise.resolve();
        }
        __1.Log.verbose(__1.Log.subheader('NEW_USER'));
        __1.Log.verboseStart(' NEW_USER');
        await Handler.handleOnPromise(jovo, _get(jovo.$handlers, __1.EnumRequestType.NEW_USER));
        __1.Log.verbose();
        __1.Log.verboseEnd(' NEW_USER');
        __1.Log.verbose();
    }
    /**
     * Calls 'ON_REQUEST' on every request
     * @param {Jovo} jovo
     * @returns {Promise<any>}
     */
    static async handleOnRequest(jovo) {
        __1.Log.verbose(__1.Log.subheader('ON_REQUEST'));
        __1.Log.verboseStart(' ON_REQUEST');
        await Handler.handleOnPromise(jovo, _get(jovo.$handlers, __1.EnumRequestType.ON_REQUEST));
        __1.Log.verbose();
        __1.Log.verboseEnd(' ON_REQUEST');
        __1.Log.verbose();
    }
    /**
     * Calls 'NEW_SESSION' if the session is new
     * @param {Jovo} jovo
     * @return {any}
     */
    static async handleOnNewSession(jovo) {
        if (!jovo.isNewSession()) {
            return Promise.resolve();
        }
        __1.Log.verbose(__1.Log.subheader('NEW_SESSION'));
        __1.Log.verboseStart(' NEW_SESSION');
        await Handler.handleOnPromise(jovo, _get(jovo.$handlers, __1.EnumRequestType.NEW_SESSION));
        __1.Log.verbose();
        __1.Log.verboseEnd(' NEW_SESSION');
        __1.Log.verbose();
    }
    /**
     * Allows execute logic synchronously and asynchronously
     * Returns Promise when the code inside of the handler is synchronous,
     * executed with a callback function or a promise.
     * @param {Jovo} jovo
     * @param {Function} func
     * @return {Promise<any>}
     */
    static async handleOnPromise(jovo, func) {
        // resolve if there is no ON_REQUEST in the handler
        if (!func) {
            return;
        }
        // resolve if toIntent was triggered before
        if (jovo && jovo.triggeredToIntent) {
            return;
        }
        const params = getParamNames(func);
        // no callback 'done' parameter
        if (params.length < 2) {
            const result = await func.apply(Object.assign(jovo, jovo.$handlers), [jovo]); // tslint:disable-line
            if (typeof result === 'undefined' || result === null) {
                return;
            }
            else if (result.constructor.name === 'Promise') {
                return result;
            }
            else {
                jovo.triggeredToIntent = true;
                return;
            }
        }
        else {
            return new Promise((resolve) => {
                func.apply(Object.assign(jovo, jovo.$handlers), [jovo, resolve]); // tslint:disable-line
            });
        }
    }
    /**
     * Calls the function given in the path.
     * Skips execution when toIntent or toStateIntent are called before.
     *
     * @param {Jovo} jovo
     * @param route
     * @param {Config} config
     * @param {boolean} fromIntent
     * @return {Promise<any>}
     */
    static async applyHandle(jovo, route, fromIntent) {
        // resolve, if toIntent was triggered before
        if (jovo && jovo.triggeredToIntent && !fromIntent) {
            return;
        }
        // set type and path to Unhandled, if no type was matched
        if (!route || typeof route.type === 'undefined') {
            route = {
                path: __1.EnumRequestType.UNHANDLED,
                type: __1.EnumRequestType.UNHANDLED,
            };
        }
        // end session when type === END and no END handler defined
        if ((route.type === __1.EnumRequestType.END || // RequestType is END
            (route.type === __1.EnumRequestType.INTENT && // Mapped Intent to END
                route.intent === __1.EnumRequestType.END)) &&
            !_get(jovo.$handlers, route.path)) {
            __1.Log.verbose('Skip END handler');
            return;
        }
        // skip on non-existing AudioPlayer requests
        if (route.type === __1.EnumRequestType.AUDIOPLAYER && !_get(jovo.$handlers, route.path)) {
            return;
        }
        // throw error if no handler and no UNHANDLED on same level
        if (!(_get(jovo.$handlers, __1.EnumRequestType.NEW_SESSION) ||
            _get(jovo.$handlers, __1.EnumRequestType.NEW_USER) ||
            _get(jovo.$handlers, __1.EnumRequestType.ON_REQUEST)) &&
            !_get(jovo.$handlers, route.path)) {
            if (!jovo.$type.optional) {
                throw new __1.JovoError(`Could not find the route "${route.path}" in your handler function.`, 'ERR_NO_ROUTE', 'jovo-framework');
            }
        }
        if (_get(jovo.$handlers, route.path)) {
            const func = _get(jovo.$handlers, route.path);
            const params = getParamNames(func);
            // no callback 'done' parameter
            if (params.length < 2) {
                const result = await func.apply(Object.assign(jovo, jovo.$handlers), [jovo]); // tslint:disable-line
                if (typeof result === 'undefined' || result === null) {
                    return;
                }
                else if (result.constructor.name === 'Promise') {
                    return result;
                }
                else {
                    return;
                }
            }
            else {
                return new Promise((resolve) => {
                    func.apply(Object.assign(jovo, jovo.$handlers), [jovo, resolve]); // tslint:disable-line
                });
            }
        }
    }
    install(app) {
        app.middleware('before.router').use((handleRequest) => {
            if (!handleRequest.jovo) {
                return;
            }
            handleRequest.jovo.$handlers = Object.assign(
            // tslint:disable-line:prefer-object-spread
            {}, handleRequest.jovo.$config.handlers);
            const platform = handleRequest.jovo.getPlatformType();
            if (handleRequest.jovo.$config.plugin &&
                handleRequest.jovo.$config.plugin[platform] &&
                handleRequest.jovo.$config.plugin[platform].handlers) {
                const platformHandlers = Object.assign(
                // tslint:disable-line:prefer-object-spread
                {}, handleRequest.jovo.$config.plugin[platform].handlers);
                Object.assign(handleRequest.jovo.$handlers, platformHandlers);
            }
        });
        app.middleware('handler').use(this.handle);
        app.middleware('fail').use(this.error);
        this.mixin(app);
    }
    async handle(handleRequest) {
        if (!handleRequest.jovo) {
            return;
        }
        __1.Log.verbose(__1.Log.header('Jovo handler ', 'framework'));
        handleRequest.jovo.mapInputs(handleRequest.jovo.$config.inputMap || {});
        const route = handleRequest.jovo.$plugins.Router.route;
        await Handler.handleOnNewUser(handleRequest.jovo);
        await Handler.handleOnNewSession(handleRequest.jovo);
        await Handler.handleOnRequest(handleRequest.jovo);
        __1.Log.verbose(__1.Log.header('Handle ', 'framework'));
        __1.Log.yellow().verbose(route);
        await Handler.applyHandle(handleRequest.jovo, route);
    }
    async error(handleRequest) {
        if (!handleRequest.jovo) {
            __1.Log.warn(`WARN: Jovo instance is not available. ON_ERROR doesn't work here`);
            return;
        }
        if (_get(handleRequest.jovo.$config.handlers, __1.EnumRequestType.ON_ERROR)) {
            const route = {
                path: __1.EnumRequestType.ON_ERROR,
                type: __1.EnumRequestType.ON_ERROR,
            };
            await Handler.applyHandle(handleRequest.jovo, route, true);
            await handleRequest.app.middleware('platform.output').run(handleRequest);
            await handleRequest.app.middleware('response').run(handleRequest);
        }
    }
    mixin(app) {
        __1.BaseApp.prototype.setHandler = function (...handlers) {
            for (const handler of handlers) {
                if (typeof handler !== 'object') {
                    throw new Error('Handler must be of type object.');
                }
                this.config.handlers = _merge(this.config.handlers || {}, handler);
            }
            return this;
        };
        __1.BaseApp.prototype.setPlatformHandler = function (platformName, ...handlers) {
            if (!this.$platform.has(platformName)) {
                throw new __1.JovoError(`Can not set handlers for ${platformName}. No platform with the name ${platformName} is installed.`, __1.ErrorCode.ERR, 'Handler', `Installed platforms: ${Array.from(this.$platform.keys()).join(', ')}.`);
            }
            for (const handler of handlers) {
                if (typeof handler !== 'object') {
                    throw new Error('Handler must be of type object.');
                }
                const handlersPath = `plugin.${platformName}.handlers`;
                const sourceHandler = _get(this.config, handlersPath);
                _set(this.config, handlersPath, _merge(sourceHandler, handler));
            }
            return this;
        };
        /**
         * Jumps to an intent in the order state > global > unhandled > error
         * @public
         * @param {string} intent name of intent
         */
        Jovo_1.Jovo.prototype.toIntent = async function (intent) {
            // tslint:disable-line
            this.triggeredToIntent = true;
            const route = Router_1.Router.intentRoute(this.$handlers, this.getState(), intent, this.$config.intentsToSkipUnhandled);
            route.from = this.getRoute().from
                ? this.getRoute().from + '/' + this.getRoute().path
                : this.getRoute().path;
            this.$plugins.Router.route = route;
            __1.Log.verbose(` toIntent: ${intent}`);
            return Handler.applyHandle(this, route, true);
        };
        Jovo_1.Jovo.prototype.$handlers = undefined;
        /**
         * Checks if the given state contains the name of a initialized component.
         * @private
         * @param {string | undefined} state
         * @return {void}
         * @throws {JovoError}
         */
        Jovo_1.Jovo.prototype.checkStateForInitializedComponentName = function (state) {
            if (state && this.$components) {
                const components = Object.keys(this.$components);
                const matched = state.split('.').filter((s) => components.includes(s));
                if (matched.length > 0) {
                    throw new __1.JovoError(`Can not use component names as states. Please rename the following states: ${matched.join(', ')}`, __1.ErrorCode.ERR, 'jovo-framework', 'The used state contains at least one component name.', 'Use this.delegate() or rename the listed states to prevent interference.');
                }
            }
        };
        /**
         * Jumps to state intent in the order state > unhandled > error
         * @public
         * @param {string} state name of state
         * @param {string} intent name of intent
         * @param {boolean} [validate=true] state validation toggle
         */
        Jovo_1.Jovo.prototype.toStateIntent = async function (state, intent, validate = true) {
            // tslint:disable-line
            this.triggeredToIntent = true;
            // Check for Component State Validation
            if (validate === true) {
                this.checkStateForInitializedComponentName(state);
                const componentState = this.getActiveComponentsRootState();
                if (componentState && state) {
                    let states = componentState.split('.');
                    if (states[states.length - 1] !== state) {
                        states = [...states, state];
                    }
                    state = states.join('.');
                }
            }
            this.setState(state);
            __1.Log.verbose(` Changing state to: ${state}`);
            const route = Router_1.Router.intentRoute(this.$handlers, state, intent, this.$config.intentsToSkipUnhandled);
            route.from = this.getRoute().from
                ? this.getRoute().from + '/' + this.getRoute().path
                : this.getRoute().path;
            this.$plugins.Router.route = route;
            __1.Log.verbose(` toStateIntent: ${state}.${intent}`);
            return Handler.applyHandle(this, route, true);
        };
        /**
         * Delegates the requests & responses to the component defined with "componentName"
         * @param {string} componentName
         * @param {ComponentDelegationOptions} options
         * @returns {Promise<void>}
         */
        Jovo_1.Jovo.prototype.delegate = function (componentName, options) {
            if (!this.$components[componentName]) {
                throw new __1.JovoError(`Couldn\'t find component named ${componentName}`, __1.ErrorCode.ERR, 'jovo-framework', `The component to which you want to delegate to, doesn't exist`, `Components are initialized using app.useComponents(...components)`, 'https://www.jovo.tech/docs/advanced-concepts/components');
            }
            if (!this.$session.$data[__1.SessionConstants.COMPONENT]) {
                this.$session.$data[__1.SessionConstants.COMPONENT] = [];
            }
            this.$session.$data[__1.SessionConstants.COMPONENT].push([
                componentName,
                {
                    data: options.data || {},
                    onCompletedIntent: options.onCompletedIntent,
                    stateBeforeDelegate: options.stateBeforeDelegate || this.getState(),
                },
            ]);
            ComponentPlugin_1.ComponentPlugin.initializeComponents(this.$handleRequest);
            const state = this.getActiveComponentsRootState()
                ? `${this.getActiveComponentsRootState()}.${componentName}`
                : componentName;
            return this.toStateIntent(state, 'START', false);
        };
        /**
         * Returns the active components root state value.
         * @return {string | undefined}
         */
        Jovo_1.Jovo.prototype.getActiveComponentsRootState = function () {
            const currentState = this.getState();
            if (currentState && this.$components) {
                const components = Object.keys(this.$components);
                const states = currentState.split('.');
                // Remove last State until we hit a Component
                while (states.length > 0) {
                    if (components.includes(states[states.length - 1])) {
                        break;
                    }
                    else {
                        states.pop();
                    }
                }
                return states.length === 0 ? undefined : states.join('.');
            }
            return undefined;
        };
        Jovo_1.Jovo.prototype.getActiveComponent = function () {
            const componentState = this.getActiveComponentsRootState();
            if (componentState) {
                const states = componentState.split('.');
                const activeComponent = this.$components[states[states.length - 1]];
                return activeComponent;
            }
            return undefined;
        };
        /**
         * Updates the componentSessionStack.
         *
         * Routes back to the `onCompletedIntent` in the state, from which `delegate()` was called
         * and sets the component's $response object.
         * @param {ComponentResponse} response
         */
        Jovo_1.Jovo.prototype.sendComponentResponse = function (response) {
            const componentSessionStack = this.$session.$data[__1.SessionConstants.COMPONENT];
            const activeComponentSessionData = componentSessionStack[componentSessionStack.length - 1];
            const activeComponent = this.$components[activeComponentSessionData[0]];
            // save data from the current active component, before it is deleted by `initializeComponents()`
            const componentName = activeComponent.name;
            const stateBeforeDelegate = activeComponent.stateBeforeDelegate;
            const onCompletedIntent = activeComponent.onCompletedIntent;
            // remove last element from stack as its not the active component anymore
            componentSessionStack.pop();
            ComponentPlugin_1.ComponentPlugin.initializeComponents(this.$handleRequest);
            /**
             * $components is not the same object as the one above anymore,
             * as all of its data was reset by `initializedComponents()`
             * The prior component is the active one now (or $baseComponents), which means
             * the component that's response we want to set, also has an object initialized
             * in $components, since its a member of the active one's `components`
             */
            this.$components[componentName].$response = response;
            return this.toStateIntent(stateBeforeDelegate, onCompletedIntent, false);
        };
        /**
         * Jumps from the inside of a state to a global intent
         * @public
         * @param {string} intent name of intent
         */
        Jovo_1.Jovo.prototype.toStatelessIntent = async function (intent) {
            const componentState = this.getActiveComponentsRootState();
            // Check for Component Root State to prevent leaving any Active Components
            if (componentState) {
                const activeComponent = this.getActiveComponent();
                __1.Log.verbose(` Removing state from component. ${activeComponent ? `(${activeComponent.name})` : ''}`);
                __1.Log.verbose(` toStatelessIntent: ${intent}`);
                return this.toStateIntent(componentState, intent, false);
            }
            this.triggeredToIntent = true;
            __1.Log.verbose(` Removing state.`);
            __1.Log.verbose(` toStatelessIntent: ${intent}`);
            this.removeState();
            return this.toStateIntent(undefined, intent);
        };
        /**
         * Adds state to session attributes
         * @param {string} state
         * @return {Jovo}
         */
        Jovo_1.Jovo.prototype.followUpState = function (state) {
            this.checkStateForInitializedComponentName(state);
            const componentState = this.getActiveComponentsRootState();
            if (componentState) {
                let states = componentState.split('.');
                if (states[states.length - 1] !== state) {
                    states = [...states, state];
                }
                state = states.join('.');
            }
            return this.setState(state);
        };
        /**
         * Returns path to function inside the handler
         * Examples
         * LAUNCH = Launch function
         * State1:IntentA => IntentA in state 'State1'
         * @public
         * @return {string}
         */
        Jovo_1.Jovo.prototype.getHandlerPath = function () {
            if (!this.$type || !this.$type.type) {
                return 'No type';
            }
            let path = this.$type.type;
            const route = this.$plugins.Router.route;
            if (this.$type.type === __1.EnumRequestType.END && this.$type.subType) {
                path += `: ${this.$type.subType}`;
            }
            if (this.$type.type === __1.EnumRequestType.INTENT) {
                path = route.intent;
            }
            if (route.state) {
                path = `${route.state}: ${path}`;
            }
            return path;
        };
        /**
         * Skips intent handling when called in NEW_USER, NEW_SESSION, ON_REQUEST
         * @public
         * @return {*}
         */
        Jovo_1.Jovo.prototype.skipIntentHandling = async function () {
            this.triggeredToIntent = true;
        };
        /**
         * Returns mapped intent name.
         * @public
         * @return {*}
         */
        Jovo_1.Jovo.prototype.getMappedIntentName = function () {
            return this.$plugins.Router.route.intent;
        };
        /**
         * Returns route object.
         * @public
         * @return {*}
         */
        Jovo_1.Jovo.prototype.getRoute = function () {
            return this.$plugins.Router.route;
        };
    }
}
exports.Handler = Handler;
function getParamNames(func) {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
    const ARGUMENT_NAMES = /([^\s,]+)/g;
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null) {
        result = [];
    }
    return result;
}
//# sourceMappingURL=Handler.js.map