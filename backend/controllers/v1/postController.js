const conn = require("../../configs/v1/postgresql_connection");
const config = require("../../configs/v1/config");
const fs = require("fs");

var response_message = { };

const savePost = (req, res) => {  
    if (req && req.user && req.body.category_id != '' && req.body.title != '' && req.body.status != '') {
        let save_data   = '';
        let save_query  = '';
        req.body.image = (req.body.id != undefined && req.body.id > 0 && req.body.old_image_file != '') ? req.body.old_image_file : null;
        if (req.body.new_file_name != undefined && req.body.new_file_name != '') {
            req.body.image = req.body.new_file_name;
        }
        if (req.body.id != undefined && req.body.id > 0) {
            save_data   = [req.body.category_id, req.body.title, req.body.image, req.body.status, req.body.id];
            save_query  = "UPDATE posts SET category_id = $1, title = $2, image = $3, status = $4 WHERE id = $5";
        } else {
            save_data   = [req.body.category_id, req.body.title, req.body.image, req.body.status];
            save_query  = "INSERT INTO posts (category_id, title, image, status) VALUES ($1, $2, $3, $4)";
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

const getPosts = (req, res) => {  
    if (req && req.user) {
        let where = ` 1=1 `;
        if (req.params.id && req.params.id > 0) {
            where = ` posts.id = '${ req.params.id }'`;
        }
        let query = `
            SELECT 
                posts.*,
                categories.id as category_id, categories.name as category_name 
            FROM 
                posts
            INNER JOIN
                categories
            ON
                posts.category_id = categories.id 
            WHERE 
                ${ where } 
            ORDER BY 
                posts.id DESC
        `;
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

const deletePost = (req, res) => {  
    if (req && req.user && req.params.id && req.params.id > 0) {
        let query = `SELECT * FROM posts WHERE id = '${ req.params.id }'`;
        conn.query(query, (err, result) => {
            if (err) {
                response_message.status = 'fail';
                response_message.message = 'Error! ' + err.message;
                res.status(400).send(response_message);
            } else {
                /**
                 * Delete image from the folder before deleting the record from database
                 */
                if (fs.existsSync(config.filePath['post']) && result.rows[0].image != '') {
                    const dbFilePath = config.filePath['post']+"/"+result.rows[0].image;
                    if(fs.existsSync(dbFilePath)) {
                        fs.unlinkSync(dbFilePath); 
                    }
                }

                let data = [req.params.id];
                let del_query = "DELETE FROM posts WHERE id = $1";
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
    savePost,
    getPosts,
    deletePost,
}