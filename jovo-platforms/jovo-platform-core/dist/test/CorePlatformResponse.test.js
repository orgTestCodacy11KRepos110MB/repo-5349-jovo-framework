"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const askJSON = require('../sample-response-json/v1/Ask.json'); // tslint:disable-line
const tellJSON = require('../sample-response-json/v1/Tell.json'); // tslint:disable-line
process.env.NODE_ENV = 'TEST';
test('test getReprompt', () => {
    const tellResponse = src_1.CorePlatformResponse.fromJSON(tellJSON);
    expect(tellResponse.getReprompt()).toBeUndefined();
    const askResponse = src_1.CorePlatformResponse.fromJSON(askJSON);
    expect(askResponse.getReprompt()).toBe('Sample reprompt text');
});
test('test isTell', () => {
    const tellResponse = src_1.CorePlatformResponse.fromJSON(tellJSON);
    expect(tellResponse.isTell()).toBe(true);
    expect(tellResponse.isTell('Sample response text')).toBe(true);
    expect(tellResponse.isTell(['Sample response text', 'some', 'text'])).toBe(true);
    expect(tellResponse.isTell('Test text')).toBe(false);
    expect(tellResponse.isTell(['some', 'text'])).toBe(false);
    const askResponse = src_1.CorePlatformResponse.fromJSON(askJSON);
    expect(askResponse.isTell()).toBe(false);
});
test('test isAsk', () => {
    const askResponse = src_1.CorePlatformResponse.fromJSON(askJSON);
    expect(askResponse.isAsk()).toBe(true);
    expect(askResponse.isAsk('Sample text')).toBe(true);
    expect(askResponse.isAsk('Sample text', 'Sample reprompt text')).toBe(true);
    expect(askResponse.isAsk(['Sample text', 'some', 'text'])).toBe(true);
    expect(askResponse.isAsk(['Sample text', 'some', 'text'], ['Sample reprompt text', 'some', 'text'])).toBe(true);
    expect(askResponse.isAsk('Example')).toBe(false);
    expect(askResponse.isAsk(['Some', 'text example'])).toBe(false);
    const tellResponse = src_1.CorePlatformResponse.fromJSON(tellJSON);
    expect(tellResponse.isAsk()).toBe(false);
});
test('test hasState', () => {
    const responseWithState = src_1.CorePlatformResponse.fromJSON(askJSON);
    responseWithState.session.data = { _JOVO_STATE_: 'test' };
    expect(responseWithState.hasState('test')).toBe(true);
    expect(responseWithState.hasState('test123')).toBe(false);
    const responseWithoutState = src_1.CorePlatformResponse.fromJSON(tellJSON);
    expect(responseWithoutState.hasState('test123')).toBe(false);
});
//# sourceMappingURL=CorePlatformResponse.test.js.map