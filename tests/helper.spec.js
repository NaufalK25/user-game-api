const { getEndpoint, generateRenderObject, generateErrorRenderObject,
    generateFlash, generateFlashObject } = require('../helper');

const mockRequest = () => ({ flash: jest.fn() });

describe('getEndpoint function', () => {
    test('endpoint / should return /', done => {
        expect(getEndpoint('/')).toBe('/');
        done();
    });
    test('endpoint /api/v1/ should return /', done => {
        expect(getEndpoint('/api/v1/')).toBe('/');
        done();
    });
    test('endpoint /api/v1/user_games/ should return /users', done => {
        expect(getEndpoint('/api/v1/user_games/')).toBe('/user_games');
        done();
    });
    test('endpoint /api/v1/user_game/1/ should return /user_game/1', done => {
        expect(getEndpoint('/api/v1/user_game/1/')).toBe('/user_game/1');
        done();
    });
    test('endpoint \'\' should return \'\'', done => {
        expect(getEndpoint('')).toBe('');
        done();
    });
    test('no arguments', done => {
        expect(getEndpoint()).toBe('');
        done();
    });
});

describe('generateRenderObject function', () => {
    test('title, scripts, styles, extras', done => {
        const renderObject = generateRenderObject({
            title: 'title',
            scripts: ['script'],
            styles: ['style'],
            extras: { extra: 'extra' }
        });
        expect(renderObject.title).toBe('title');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.scripts).toEqual(['script']);
        expect(renderObject.styles).toEqual(['style']);
        expect(renderObject.extra).toBe('extra');
        done();
    });
    test('title, scripts, styles', done => {
        const renderObject = generateRenderObject({
            title: 'title',
            scripts: ['script'],
            styles: ['style']
        });
        expect(renderObject.title).toBe('title');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.scripts).toEqual(['script']);
        expect(renderObject.styles).toEqual(['style']);
        done();
    });
    test('title, scripts, extras', done => {
        const renderObject = generateRenderObject({
            title: 'title',
            scripts: ['script'],
            extras: { extra: 'extra' }
        });
        expect(renderObject.title).toBe('title');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.scripts).toEqual(['script']);
        expect(renderObject.extra).toBe('extra');
        done();
    });
    test('title, styles, extras', done => {
        const renderObject = generateRenderObject({
            title: 'title',
            styles: ['style'],
            extras: { extra: 'extra' }
        });
        expect(renderObject.title).toBe('title');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.styles).toEqual(['style']);
        expect(renderObject.extra).toBe('extra');
        done();
    });
    test('title, scripts', done => {
        const renderObject = generateRenderObject({
            title: 'title',
            scripts: ['script']
        });
        expect(renderObject.title).toBe('title');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.scripts).toEqual(['script']);
        done();
    });
    test('title, styles', done => {
        const renderObject = generateRenderObject({
            title: 'title',
            styles: ['style']
        });
        expect(renderObject.title).toBe('title');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.styles).toEqual(['style']);
        done();
    });
    test('title, extras', done => {
        const renderObject = generateRenderObject({
            title: 'title',
            extras: { extra: 'extra' }
        });
        expect(renderObject.title).toBe('title');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.extra).toBe('extra');
        done();
    });
    test('scripts, styles, extras', done => {
        const renderObject = generateRenderObject({
            scripts: ['script'],
            styles: ['style'],
            extras: { extra: 'extra' }
        });
        expect(renderObject.title).toBe('User Game API');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.scripts).toEqual(['script']);
        expect(renderObject.styles).toEqual(['style']);
        expect(renderObject.extra).toBe('extra');
        done();
    });
    test('scripts, styles', done => {
        const renderObject = generateRenderObject({
            scripts: ['script'],
            styles: ['style']
        });
        expect(renderObject.title).toBe('User Game API');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.scripts).toEqual(['script']);
        expect(renderObject.styles).toEqual(['style']);
        done();
    });
    test('scripts, extras', done => {
        const renderObject = generateRenderObject({
            scripts: ['script'],
            extras: { extra: 'extra' }
        });
        expect(renderObject.title).toBe('User Game API');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.scripts).toEqual(['script']);
        expect(renderObject.extra).toBe('extra');
        done();
    });
    test('styles, extras', done => {
        const renderObject = generateRenderObject({
            styles: ['style'],
            extras: { extra: 'extra' }
        });
        expect(renderObject.title).toBe('User Game API');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.styles).toEqual(['style']);
        expect(renderObject.extra).toBe('extra');
        done();
    });
    test('extras', done => {
        const renderObject = generateRenderObject({ extras: { extra: 'extra' } });
        expect(renderObject.title).toBe('User Game API');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.extra).toBe('extra');
        done();
    });
    test('empty object', done => {
        const renderObject = generateRenderObject({});
        expect(renderObject.title).toBe('User Game API');
        expect(renderObject.layout).toBe('layouts/layout');
        done();
    });
    test('no arguments', done => {
        const renderObject = generateRenderObject();
        expect(renderObject.title).toBe('User Game API');
        expect(renderObject.layout).toBe('layouts/layout');
        done();
    });
});

describe('generateErrorRenderObject function', () => {
    test('success', done => {
        const errorRenderObject = generateErrorRenderObject({
            title: '404 Page Not Found',
            message: 'Page not found'
        });

        expect(errorRenderObject.title).toBe('404 Page Not Found');
        expect(errorRenderObject.layout).toBe('layouts/layout');
        expect(errorRenderObject.scripts).toEqual([]);
        expect(errorRenderObject.styles).toEqual([]);
        expect(errorRenderObject.message).toBe('Page not found');
        done();
    });
    test('empty object', done => {
        const errorRenderObject = generateErrorRenderObject({});
        expect(errorRenderObject).toBeInstanceOf(Object);
        expect(errorRenderObject).toEqual({});
        done();
    });
    test('no arguments', done => {
        const errorRenderObject = generateErrorRenderObject();
        expect(errorRenderObject).toBeInstanceOf(Object);
        expect(errorRenderObject).toEqual({});
        done();
    });
});

describe('generateFlash function', () => {
    test('danger', done => {
        const req = mockRequest();
        const flash = generateFlash(req, {
            type: 'danger',
            errors: [{ param: 'username', msg: 'Username not found' }]
        });
        expect(flash).toBeUndefined();
        done();
    });
    test('success or info', done => {
        const req = mockRequest();
        const flash = generateFlash(req, {
            type: 'success',
            message: 'Success'
        });
        expect(flash).toBeUndefined();
        done();
    });
    test('no arguments', done => {
        expect(generateFlash()).toBeUndefined();
        done();
    });
});

describe('generateFlashObject function', done => {
    test('success', done => {
        const req = mockRequest();
        const flashObject = generateFlashObject(req);
        expect(flashObject).toBeInstanceOf(Object);
        expect(flashObject.type).toBe(req.flash('type') || '');
        expect(flashObject.svg).toBe(req.flash('svg') || '');
        expect(flashObject.message).toBe(req.flash('message') || '');
        expect(flashObject.errors).toEqual(req.flash('errors') || []);
        done();
    });
    test('no arguments', done => {
        expect(generateFlashObject()).toEqual({});
        done();
    });
});
