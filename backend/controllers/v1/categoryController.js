const conn = require("../../configs/v1/postgresql_connection");
const config = require("../../configs/v1/config");
const fs = require("fs");

var response_message = { };

const saveCategory = (req, res) => {  
    if (req && req.user && req.body.name != '' && req.body.status != '') {
        let save_data   = '';
        let save_query  = '';
        req.body.image = (req.body.id != undefined && req.body.id > 0 && req.body.old_image_file != '') ? req.body.old_image_file : null;
        if (req.body.new_file_name != undefined && req.body.new_file_name != '') {
            req.body.image = req.body.new_file_name;
        }
        if (req.body.id != undefined && req.body.id > 0) {
            save_data   = [req.body.name, req.body.image, req.body.status, req.body.id];
            save_query  = "UPDATE categories SET name = $1, image = $2, status = $3 WHERE id = $4";
        } else {
            save_data   = [req.body.name, req.body.image, req.body.status];
            save_query  = "INSERT INTO categories (name, image, status) VALUES ($1, $2, $3)";
        }
        conn.query(save_query, save_data, (err, result, fields) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(401).send(response_message);
            } else {
                response_message.status = 'success';
                response_message.message = 'Success! Data has been saved successfully.';
                response_message.result = result.rows[0];
                res.status(200).send(response_message);
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Something went wrong. Please try again.';
        res.status(400).send(response_message);
    }
}

const getCategories = (req, res) => {  
    if (req && req.user) {
        let where = ` 1=1 `;
        if (req.params.id && req.params.id > 0) {
            where = ` id = '${ req.params.id }'`;
        }
        let query = `SELECT * FROM categories WHERE ${ where } ORDER BY id DESC`;
        conn.query(query, (err, result) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(400).send(response_message);
            } else {
                response_message.status = 'success';
                response_message.message = 'Success..!';
                response_message.result = result.rows;
                res.status(200).send(response_message);
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Something went wrong. Please try again.';
        res.status(400).send(response_message);
    }
}

const deleteCategory = (req, res) => {  
    if (req && req.user && req.params.id && req.params.id > 0) {
        let query = `SELECT * FROM categories WHERE id = '${ req.params.id }'`;
        conn.query(query, (err, result) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(400).send(response_message);
            } else {
                /**
                 * Delete image from the folder before deleting the record from database
                 */
                if (fs.existsSync(config.filePath['category']) && result.rows[0].image != '') {
                    const dbFilePath = config.filePath['category']+"/"+result.rows[0].image;
                    if(fs.existsSync(dbFilePath)) {
                        fs.unlinkSync(dbFilePath); 
                    }
                }

                let data = [req.params.id];
                let del_query = "DELETE FROM categories WHERE id = $1";
                conn.query(del_query, data, (err, result, fields) => {
                    if (err) {
                        response_message.status = 'fail';
                        response_message.message = 'Error! ' + err.message;
                        res.status(401).send(response_message);
                    } else {
                        response_message.status = 'success';
                        response_message.message = 'Success! Data has been deleted successfully.';
                        response_message.result = result.rows[0];
                        res.status(200).send(response_message);
                    }
                });     
            }
        });
    } else {
        response_message.status = 'fail';
        response_message.message = 'Error! Something went wrong. Please try again.';
        res.status(400).send(response_message);
    }
}

module.exports = {
    saveCategory,
    getCategories,
    deleteCategory,
}