const { UserGame, UserGameBiodata } = require('../database/models');
const {
    getDataBySpecificField,
    getEndpoint,
    generateRenderObject,
    generateErrorRenderObject,
    generateFlash,
    generateFlashObject
} = require('../helper');

process.env.NODE_ENV = 'test';
const mockRequest = () => ({ flash: jest.fn() });

describe('getDataBySpecificFiled function', () => {
    it('should return a function', done => {
        expect(getDataBySpecificField(UserGame, 'id')).toBeInstanceOf(Function);
        done();
    });
    it('should return user game data by id', async () => {
        const userGame = await getDataBySpecificField(UserGame, 'id')(1);
        userGame ? expect(userGame).toBeInstanceOf(Object) : expect(userGame).toBeNull();
    });
    it('should return user game by username with includes', async () => {
        const userGame = await getDataBySpecificField(UserGame, 'username')('johndoe_', [{ model: UserGameBiodata }]);
        userGame ? expect(userGame).toBeInstanceOf(Object) : expect(userGame).toBeNull();
    });

    it('no arg(s) for inner function', async () => {
        const userGame = await getDataBySpecificField(UserGame, 'id')();
        expect(userGame).toStrictEqual([]);
    });
    it('no model or field arg(s)', async () => {
        const userGame = await getDataBySpecificField(UserGame)()
        expect(userGame).toStrictEqual([]);
    });
    it('no arg(s)', done => {
        expect(getDataBySpecificField()).toStrictEqual([]);
        done();
    });
});

describe('getEndpoint function', () => {
    it('endpoint / should return /', done => {
        expect(getEndpoint('/')).toBe('/');
        done();
    });
    it('endpoint /api/v1/ should return /', done => {
        expect(getEndpoint('/api/v1/')).toBe('/');
        done();
    });
    it('endpoint /api/v1/user_games/ should return /users', done => {
        expect(getEndpoint('/api/v1/user_games/')).toBe('/user_games');
        done();
    });
    it('endpoint /api/v1/user_game/1/ should return /user_game/1', done => {
        expect(getEndpoint('/api/v1/user_game/1/')).toBe('/user_game/1');
        done();
    });
    it('endpoint \'\' should return \'\'', done => {
        expect(getEndpoint('')).toBe('');
        done();
    });
    it('no arg(s)', done => {
        expect(getEndpoint()).toBe('');
        done();
    });
});

describe('generateRenderObject function', () => {
    it('title, scripts, styles, extras', done => {
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
    it('title, scripts, styles', done => {
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
    it('title, scripts, extras', done => {
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
    it('title, styles, extras', done => {
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
    it('title, scripts', done => {
        const renderObject = generateRenderObject({
            title: 'title',
            scripts: ['script']
        });
        expect(renderObject.title).toBe('title');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.scripts).toEqual(['script']);
        done();
    });
    it('title, styles', done => {
        const renderObject = generateRenderObject({
            title: 'title',
            styles: ['style']
        });
        expect(renderObject.title).toBe('title');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.styles).toEqual(['style']);
        done();
    });
    it('title, extras', done => {
        const renderObject = generateRenderObject({
            title: 'title',
            extras: { extra: 'extra' }
        });
        expect(renderObject.title).toBe('title');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.extra).toBe('extra');
        done();
    });
    it('scripts, styles, extras', done => {
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
    it('scripts, styles', done => {
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
    it('scripts, extras', done => {
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
    it('styles, extras', done => {
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
    it('extras', done => {
        const renderObject = generateRenderObject({ extras: { extra: 'extra' } });
        expect(renderObject.title).toBe('User Game API');
        expect(renderObject.layout).toBe('layouts/layout');
        expect(renderObject.extra).toBe('extra');
        done();
    });
    it('empty object', done => {
        const renderObject = generateRenderObject({});
        expect(renderObject.title).toBe('User Game API');
        expect(renderObject.layout).toBe('layouts/layout');
        done();
    });
    it('no arg(s)', done => {
        const renderObject = generateRenderObject();
        expect(renderObject.title).toBe('User Game API');
        expect(renderObject.layout).toBe('layouts/layout');
        done();
    });
});

describe('generateErrorRenderObject function', () => {
    it('should return error object', done => {
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
    it('empty object', done => {
        expect(generateErrorRenderObject({})).toEqual({});
        done();
    });
    it('no arg(s)', done => {
        expect(generateErrorRenderObject()).toEqual({});
        done();
    });
});

describe('generateFlash function', () => {
    it('arg(s) (Danger)', done => {
        const req = mockRequest();
        const flash = generateFlash(req, {
            type: 'danger',
            errors: [{ param: 'username', msg: 'Username not found' }]
        });
        expect(flash).toBeUndefined();
        done();
    });
    it('arg(s) (Success or Info)', done => {
        const req = mockRequest();
        const flash = generateFlash(req, {
            type: 'success',
            message: 'Success'
        });
        expect(flash).toBeUndefined();
        done();
    });
    it('no arg(s)', done => {
        expect(generateFlash()).toBeUndefined();
        done();
    });
});

describe('generateFlashObject function', done => {
    it('arg(s)', done => {
        const req = mockRequest();
        const flashObject = generateFlashObject(req);
        expect(flashObject).toBeInstanceOf(Object);
        expect(flashObject.type).toBe(req.flash('type') || '');
        expect(flashObject.svg).toBe(req.flash('svg') || '');
        expect(flashObject.message).toBe(req.flash('message') || '');
        expect(flashObject.errors).toEqual(req.flash('errors') || []);
        done();
    });
    it('no arg(s)', done => {
        expect(generateFlashObject()).toEqual({});
        done();
    });
});
