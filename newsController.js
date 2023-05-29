const uuid = require('uuid');
const path = require('path');
const {News} = require('../models/models')
const ApiError = require('../error/ApiError')
const fs = require("node:fs");

class NewsController {
    async create(req, res, next) {
        try {
            let {title, min_description, description} = req.body
            let {img} = req.files
            let fileName = uuid.v4() + ".webp"

            if (!img) {
                return res.status(400).json({message: 'Выберите файл'})
            } else {
                img.mv(path.resolve(__dirname, '..', 'static', fileName))
                const news = await News.create({title, min_description, description, img: fileName})
                return res.json(news)
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
        let news;
        if (!limit) {news = await News.findAndCountAll()}
        if (limit) {news = await News.findAndCountAll({limit, offset})}
        return res.json(news)
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

            const news = await News.destroy(
                {
                    where: {id},
                })
            return res.json(news)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const {id} = req.params
            const news = await News.findOne(
                {
                    where: {id}
                })
            return res.json(news)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async update(req, res, next) {
        try {
            const {id} = req.params
            let {dataEdit} = req.body
            const news = await News.update(
                {title: dataEdit.title, min_description: dataEdit.min_description, description: dataEdit.description},
                {where: {id: id}}
            );
            return res.json(news)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async destroyAndUpdateIMG(req, res, next) {
        try {
            const {id} = req.params
            let {deleteFile} = req.body

            if (fs.existsSync(path.resolve(__dirname, '..', 'static', deleteFile))) {
                fs.unlink(path.resolve(__dirname, '..', 'static', deleteFile), err => {
                    if(err) throw err;
                });
            }
            let {img} = req.files
            let fileName = uuid.v4() + ".webp"
            if (!img) {
                return res.status(400).json({message: 'Выберите файл'})
            }
            if (img) {
                img.mv(path.resolve(__dirname, '..', 'static', fileName))
                const news = await News.update(
                    {img: fileName},
                    {where: {id: id}}
                );
                return res.json(news)
            }
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


}


module.exports = new NewsController()