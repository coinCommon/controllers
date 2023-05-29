const fs = require('node:fs')

const path = require('path');
const {Documents} = require('../models/models')
const ApiError = require('../error/ApiError')

class DocumentsController {
    async create(req, res, next) {
        try {
            const {title, description, chapter, name} = req.body
            let {file} = req.files
            let type = name.split('-').pop()
            let fileName = name + `.${type}`

            if (!file) {
                return res.status(400).json({message: 'Выберите файл'})
            } else {
                if (fs.existsSync(path.resolve(__dirname, '..', 'static', fileName))) {
                    return res.status(400).json({message: 'Файл с данным именем уже существует'})
                }
                else {
                    file.mv(path.resolve(__dirname, '..', 'static', fileName))
                    const document = await Documents.create({title, description, chapter, file: fileName})
                    return res.json(document)
                }
            }
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getAll(req, res) {
        let {page, limit} = req.query
        page = page || 1
        limit = limit || 100000
        let offset = page * limit - limit
        let document;
        if (!limit) {document = await Documents.findAndCountAll()}
        if (limit) {document = await Documents.findAndCountAll({limit, offset})}
        return res.json(document)
    }
    async destroy(req, res, next) {
        try {
            const {id} = req.params
            let {fileName} = req.body
            if (fs.existsSync(path.resolve(__dirname, '..', 'static', fileName[0]))) {
                fs.unlink(path.resolve(__dirname, '..', 'static', fileName[0]), err => {
                    if(err) throw err;
                });
            }
            const document = await Documents.destroy(
                {
                    where: {id},
                })
            return res.json(document)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async download(req, res, next) {
        try {
            const {fileName} = req.params
            const paths = path.resolve(__dirname, '..', 'static', fileName)

            if (paths) {
                return res.download(paths, fileName)
            }
            return res.status(400).json({message: 'Файл не найден'})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const {id} = req.params
            const document = await Documents.findOne(
                {
                    where: {id}
                })
            return res.json(document)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async update(req, res, next) {
        try {
            const {id} = req.params
            let {dataEdit} = req.body
            const document = await Documents.update(
                {title: dataEdit.title, description: dataEdit.description},
                {where: {id: id}}
            );
            return res.json(document)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }



}


module.exports = new DocumentsController()