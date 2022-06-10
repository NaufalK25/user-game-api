const multer = require('multer');
const { v4 } = require('uuid');
const { createStorage } = require('../../middlewares/file');

jest.mock('multer');
jest.mock('uuid');

describe('createStorage function', () => {
    beforeEach(() => {
        multer.diskStorage.mockImplementation(() => ({
            destination: jest.fn(),
            filename: jest.fn()
        }));
        v4.mockImplementation(() => 'token');
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('success', done => {
        const storage = createStorage('profiles');
        expect(storage).toBeInstanceOf(Object);
        expect(storage).toBeDefined();
        done();
    });
    test('no arguments', done => {
        const storage = createStorage();
        expect(storage).toBeInstanceOf(Object);
        expect(storage).toBeDefined();
        done();
    });
});
