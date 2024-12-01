const conn = require("../../configs/v1/postgresql_connection");
const config = require("../../configs/v1/config");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

var response_message = { };

const checkUserExist = (req, res, next) => {
    if (req && req.body.email != '') {
        let query = `SELECT * FROM admins WHERE email = '${ req.body.email }' LIMIT 1`;
        conn.query(query, (err, result) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(400).send(response_message);
            } else if (!err && result.rows[0] != null) {
                response_message.status = 'fail';
                response_message.message = 'Email is already exist.';
                res.status(429).send(response_message);
            } else {
                next();
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Invalid request.';
        res.status(400).send(response_message);
    }
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer')) {
        const token = authHeader.split(" ")[1];
        if (token) {
            jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY, (err, user_data) => {
                if (err) {
                    response_message.status = 'fail';
                    response_message.message = 'Error! Invalid token.'+ err.message;
                    res.status(498).send(response_message);
                } else {
                    req.user = user_data;
                    
                    let query = `SELECT * FROM admins WHERE id = '${ req.user.user_data.id }' AND token = '${ token }' LIMIT 1`;
                    conn.query(query, (err, result) => {
                        if (err) {
                            response_message.status = 'fail';
                            response_message.message = 'Error! Invalid token.'+ err.message;
                            res.status(498).send(response_message);
                        } else {
                            if (result.rows[0].length <=0) {
                                response_message.status = 'fail';
                                response_message.message = 'Error! Invalid token.';
                                res.status(498).send(response_message);
                            } else {
                                next();
                            }
                        }
                    });
                }
            });
        } else {
            response_message.status = 'fail';
            response_message.message = 'Error! Unauthorized User.';
            res.status(401).send(response_message);
        }
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Unauthorized User.';
        res.status(401).send(response_message);
    }
}

const checkCategoryExists = (req, res, next) => {  
    if (req && req.user && req.body.name != '') {
        let where = ` name = '${ req.body.name }' `;
        if (req.body.id && req.body.id > 0) {
            where += ` AND id != '${ req.body.id }'`;
        }
        let query = `SELECT * FROM categories WHERE ${ where } ORDER BY id DESC`;
        conn.query(query, (err, result) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(400).send(response_message);
            } else if (!err && result.rows[0] != null) {
                response_message.status = 'fail';
                response_message.message = 'Category name is already exist.';
                res.status(429).send(response_message);
            } else {
                next();
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Something went wrong. Please try again.';
        res.status(400).send(response_message);
    }
}

const mult_storage = multer.diskStorage({
    destination: function(req, file, call_back) {
        if (!file) {
            console.log("hereer");
            call_back(null, true);
        }
        const moduleName = req.body.moduleName;

        /**
         * Make new folder if not exist.
         */
        if(!fs.existsSync(config.filePath[moduleName])) {
            fs.mkdirSync(config.filePath[moduleName], { recursive: true });
        }

        /**
         * Check if request has old/current uploaded image name or not
         * if old/current uploaded image available then it should be deleted 
         * before uploading new image and save file name to database. 
         */
        if(fs.existsSync(config.filePath[moduleName])) {
            if(req.body.old_image_file != '') {
                const old_file_path = config.filePath[moduleName]+"/"+req.body.old_image_file;
                if(fs.existsSync(old_file_path)) {
                    fs.unlinkSync(old_file_path);
                }
            }
            call_back(null, config.filePath[moduleName])
        } else {
            call_back(null, false);
        }
    },
    filename: function(req, file, call_back) {
        /**
         * Rename file before uploading to the directory and save its name to database.
         */
        if (file) {
            req.body.new_file_name = path.parse(file.originalname).name + '-' + Date.now() + path.parse(file.originalname).ext;
            call_back(null, req.body.new_file_name)
        } else {
            call_back(null, false);
        }
    }
});

const mult_file_filter = function(req, file, call_back){
    /**
     * Defined allowed file extention types.
     */
    const filetypes = /png|jpg|jpeg/;
    
    /**
     * Check file extention of requested new file
     */
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    /**
     * Check file mime type to make sure that file is valid with allowed types only.
     */
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        call_back(null, true);
    } else {
        call_back(null, false);
        return call_back(new Error('Only png/jpg/jpeg format allowed!'));
    }
};

const uploadFile = multer({
    storage: mult_storage,
    fileFilter: mult_file_filter
});

const upload = uploadFile.single('image_file');

const uploadFileMiddleware = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            response_message.status = 'fail';
            response_message.message = 'Error! ' + err.message;
            return res.status(401).send(response_message);
        } else if (err) {
            response_message.status = 'fail';
            response_message.message = 'Error! ' + err.message;
            return res.status(401).send(response_message);
        } else {
            next();
        }
    });
};

const checkPostExists = (req, res, next) => {  
    if (req && req.user && req.body.category_id != '' && req.body.title != '') {
        let where = ` category_id = '${ req.body.category_id }' AND title = '${ req.body.title }' `;
        if (req.body.id && req.body.id > 0) {
            where += ` AND id != '${ req.body.id }'`;
        }
        let query = `SELECT * FROM posts WHERE ${ where } ORDER BY id DESC`;
        conn.query(query, (err, result) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(400).send(response_message);
            } else if (!err && result.rows[0] != null) {
                response_message.status = 'fail';
                response_message.message = 'Post title is already exist.';
                res.status(429).send(response_message);
            } else {
                next();
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Something went wrong. Please try again.';
        res.status(400).send(response_message);
    }
}

module.exports = {
    checkUserExist,
    authenticateToken,
    checkCategoryExists,
    uploadFileMiddleware,
    checkPostExists,
}