const path = require('path');
const multer = require('multer');
const { v4 } = require('uuid');

const createStorage = (uploadField = '') => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, `uploads/${uploadField}`);
            } else {
                cb(new Error('Invalid image type'), null);
            }
        },
        filename: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, `${v4().replace(/-/g, '')}${path.extname(file.originalname)}`);
            } else {
                cb(new Error('Invalid image type'), null);
            }
        }
    });
}

const profileStorage = createStorage('profiles');
const gameStorage = createStorage('games');

module.exports = {
    createStorage,
    gameStorage,
    profileStorage
};
