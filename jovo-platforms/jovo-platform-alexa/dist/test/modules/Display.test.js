"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jovo_framework_1 = require("jovo-framework");
const src_1 = require("../../src");
const _get = require("lodash.get");
process.env.NODE_ENV = 'UNIT_TEST';
let app;
let t;
jest.setTimeout(550);
beforeEach(() => {
    app = new jovo_framework_1.App();
    const alexa = new src_1.Alexa();
    app.use(alexa);
    t = alexa.makeTestSuite();
});
describe('test Display functions', () => {
    test('test showVideo', async (done) => {
        app.setHandler({
            LAUNCH() {
                this.setSessionAttribute('myKey', 'myValue');
                this.$alexaSkill.showVideo('https://url.to.video', 'titleABC');
            },
        });
        const launchRequest = await t.requestBuilder.launch();
        launchRequest.setVideoInterface();
        app.handle(jovo_framework_1.ExpressJS.dummyRequest(launchRequest));
        app.on('response', (handleRequest) => {
            const response = handleRequest.jovo.$response;
            expect(_get(response, 'response.directives[0].type')).toEqual('VideoApp.Launch');
            expect(_get(response, 'response.shouldEndSession')).toBeUndefined();
            expect(_get(response, 'response.directives[0].videoItem.source')).toEqual('https://url.to.video');
            expect(_get(response, 'response.directives[0].videoItem.metadata.title')).toEqual('titleABC');
            // verify that session attributes are returned in response
            expect(_get(response, 'sessionAttributes')).toStrictEqual({
                myKey: 'myValue',
            });
            done();
        });
    });
    test('test ON_ELEMENT_SELECTED with nested token as function', async (done) => {
        app.setHandler({
            ON_ELEMENT_SELECTED: {
                token() {
                    done();
                },
            },
        });
        const request = await t.requestBuilder.rawRequestByKey('Display.ElementSelected');
        app.handle(jovo_framework_1.ExpressJS.dummyRequest(request));
    });
    test('test ON_ELEMENT_SELECTED', async (done) => {
        app.setHandler({
            ON_ELEMENT_SELECTED() {
                done();
            },
        });
        const request = await t.requestBuilder.rawRequestByKey('Display.ElementSelected');
        app.handle(jovo_framework_1.ExpressJS.dummyRequest(request));
    });
});
//# sourceMappingURL=Display.test.js.map