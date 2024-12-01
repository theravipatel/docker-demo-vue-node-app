const conn = require("../../configs/v1/postgresql_connection");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

var response_message = { };

const login = async (req, res) => {  
    if (req && req.body.email != '' && req.body.password != '') {
        let query = `SELECT * FROM admins WHERE email = '${ req.body.email }' LIMIT 1`;
        conn.query(query, (err, result) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(400).send(response_message);
            } else {
                if (result.rows[0] != null) {
                    bcrypt.compare(req.body.password, result.rows[0].password, (err, isPasswordMatched) => {
                        if (isPasswordMatched) {
                            /**
                             * Generate JWT Token 
                             * */ 
                            let user_data = result.rows[0];
                            const token = jwt.sign(
                                { user_data },
                                process.env.JWT_TOKEN_SECRET_KEY,
                                { expiresIn: process.env.JWT_TOKEN_EXPIRY }
                            );
    
                            const update_data = [token, user_data.id];
                            const update_query = "UPDATE admins SET token = $1 WHERE id = $2";
                            conn.query(update_query, update_data, (err, result, fields) => {
                                if (err) {
                                    response_message.status = 'fail';
                                    response_message.message = 'Error! Email or Password is not valid.';
                                    res.status(401).send(response_message);
                                } else {
                                    user_data.token = token;
    
                                    response_message.status = 'success';
                                    response_message.message = 'Success! You\'re logged in successfully.';
                                    response_message.result = user_data;
                                    res.status(200).send(response_message);
                                }
                            });
                        } else {
                            response_message.status = 'fail';
                            response_message.message = 'Error! Email or Password is not valid.';
                            res.status(401).send(response_message);
                        }
                    });
                } else {
                    response_message.status = 'fail';
                    response_message.message = 'Error! Email or Password is not valid.';
                    res.status(401).send(response_message);
                }
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Invalid Credentials. Please try again.';
        res.status(400).send(response_message);
    }
}

const signup = async (req, res) => {
    if (req && req.body.name != '' && req.body.email != '' && req.body.password != '') {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        let data = [
            req.body.name,
            req.body.email,
            hashPassword,
        ];
        let query = "INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING *";
        conn.query(query, data, (err, result, fields) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(400).send(response_message);
            } else {
                if (result.rows[0].id > 0) {
                    let query = `SELECT * FROM admins WHERE id = '${ result.rows[0].id }' LIMIT 1`;
                    conn.query(query, (err, result) => {
                        /**
                         * Generate JWT Token 
                         * */ 
                        let user_data = result.rows[0];
                        const token = jwt.sign(
                            { user_data },
                            process.env.JWT_TOKEN_SECRET_KEY,
                            { expiresIn: process.env.JWT_TOKEN_EXPIRY }
                        );

                        const update_data = [token, user_data.id];
                        const update_query = "UPDATE admins SET token = $1 WHERE id = $2";
                        conn.query(update_query, update_data, (err, result, fields) => {
                            if (err) {
                                response_message.status = 'fail';
                                response_message.message = 'Error! '+err.message;
                                res.status(401).send(response_message);
                            } else {
                                user_data.token = token;

                                response_message.status = 'success';
                                response_message.message = 'Success! Registration has been successfully completed.';
                                response_message.result = user_data;
                                res.status(200).send(response_message);
                            }
                        });
                    });
                } else {
                    response_message.status = 'fail';
                    response_message.message = 'Error! Something went wrong. Please try again.';
                    res.status(400).send(response_message);
                }
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Please provide all valid required data.';
        res.status(400).send(response_message);
    }
}

const me = (req, res) => {    
    res.send({ "user": req.user })
}

const logout = (req, res) => {  
    if (req && req.user.user_data.id > 0) {
        let query = `SELECT * FROM admins WHERE id = '${ req.user.user_data.id }' LIMIT 1`;
        conn.query(query, (err, result) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(400).send(response_message);
            } else {
                const token = '';
                const update_data = [token, req.user.user_data.id];
                const update_query = "UPDATE admins SET token = $1 WHERE id = $2";
                conn.query(update_query, update_data, (err, result, fields) => {
                    if (err) {
                        response_message.status = 'fail';
                        response_message.message = 'Error! Something went wrong. Please try again.1';
                        res.status(401).send(response_message);
                    } else {
                        response_message.status = 'success';
                        response_message.message = 'Success! You\'re logged out successfully.';
                        res.status(200).send(response_message);
                    }
                });
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Something went wrong. Please try again2.';
        res.status(400).send(response_message);
    }
}

const updateProfile = (req, res) => {  
    if (req && req.user && req.body.name != '' && req.body.email != '') {
        const update_data = [req.body.name, req.body.email, req.user.user_data.id];
        const update_query = "UPDATE admins SET name = $1, email = $2 WHERE id = $3";
        conn.query(update_query, update_data, (err, result, fields) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(401).send(response_message);
            } else {
                let query = `SELECT * FROM admins WHERE id = '${ req.user.user_data.id }' LIMIT 1`;
                conn.query(query, (err, result) => {
                    let user_data = result.rows[0];
                    response_message.status = 'success';
                    response_message.message = 'Success! Profile has been updated successfully.';
                    response_message.result = user_data;
                    res.status(200).send(response_message);
                });
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Something went wrong. Please try again.';
        res.status(400).send(response_message);
    }
}

const changePassword = async (req, res) => {  
    if (req && req.user && req.body.old_password != '' && req.body.new_password != '' && req.body.confirm_new_password != '') {
        const isPasswordMatched = await bcrypt.compare(req.body.old_password, req.user.user_data.password);
        if (isPasswordMatched) {
            if (req.body.new_password == req.body.confirm_new_password) {
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(req.body.new_password, salt);
                const update_data = [hashPassword, req.user.user_data.id];
                const update_query = "UPDATE admins SET password = $1 WHERE id = $2";
                conn.query(update_query, update_data, (err, result, fields) => {
                    if (err) {
                        response_message.status = 'fail';
                        response_message.message = 'Error! ' + err.message;
                        res.status(401).send(response_message);
                    } else {
                        let query = `SELECT * FROM admins WHERE id = '${ req.user.user_data.id }' LIMIT 1`;
                        conn.query(query, (err, result) => {
                            let user_data = result.rows[0];
                            response_message.status = 'success';
                            response_message.message = 'Success! Password has been updated successfully.';
                            response_message.result = user_data;
                            res.status(200).send(response_message);
                        });
                    }
                });
            } else {
                response_message.status = 'fail';
                response_message.message = 'Error! The New and Confirm New Passwords are not the same.';
                res.status(400).send(response_message);
            }
        } else {
            response_message.status = 'fail';
            response_message.message = 'Error! Please enter correct old password.';
            res.status(400).send(response_message);
        }
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Something went wrong. Please try again.';
        res.status(400).send(response_message);
    }
}

const getCounts = (req, res) => {  
    if (req && req.user) {
        let query = `
            SELECT * FROM (
                (SELECT COUNT(*) AS category_count FROM categories) AS category_count,
                (SELECT COUNT(*) AS post_count FROM posts) AS post_count
            )
        `;
        conn.query(query, (err, result) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(400).send(response_message);
            } else {
                let results = {
                    'category': {
                        'title': 'Category',
                        'value': result.rows[0].category_count,
                    },
                    'post': {
                        'title': 'Post',
                        'value': result.rows[0].post,
                    }
                }
                response_message.status = 'success';
                response_message.message = 'Success..!';
                response_message.result = results;
                res.status(200).send(response_message);
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Something went wrong. Please try again.';
        res.status(400).send(response_message);
    }
}

module.exports = {
    login,
    signup,
    me,
    logout,
    updateProfile,
    changePassword,
    getCounts,
}