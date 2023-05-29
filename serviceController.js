const uuid = require('uuid');
const path = require('path');
const {Services, News} = require('../models/models')
const ApiError = require('../error/ApiError')
const fs = require("node:fs");

class ServiceController {
    async create(req, res, next) {
        try {
            let {title, description} = req.body
            let {img, icon} = req.files
            let fileName = uuid.v4() + ".webp"
            let fileNameIcon = uuid.v4() + ".webp"

            if (!img || !icon) {
                return res.status(400).json({message: 'Выберите файл'})
            } else {
                img.mv(path.resolve(__dirname, '..', 'static', fileName))
                icon.mv(path.resolve(__dirname, '..', 'static', fileNameIcon))
                const service = await Services.create({title, description, img: fileName, icon: fileNameIcon})
                return res.json(service)
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
        let service;
        if (!limit) {service = await Services.findAndCountAll()}
        if (limit) {service = await Services.findAndCountAll({limit, offset})}
        return res.json(service)
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
            if (fs.existsSync(path.resolve(__dirname, '..', 'static', fileName[1]))) {
                fs.unlink(path.resolve(__dirname, '..', 'static', fileName[1]), err => {
                    if(err) throw err;
                });
            }

            const service = await Services.destroy(
                {
                    where: {id},
                })
            return res.json(service)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const {id} = req.params
            const service = await Services.findOne(
                {
                    where: {id}
                })
            return res.json(service)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        try {
            const {id} = req.params
            let {dataEdit} = req.body
            const service = await Services.update(
                {title: dataEdit.title, description: dataEdit.description},
                {where: {id: id}}
            );
            return res.json(service)
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

            let {img, icon} = req.files
            let fileName = uuid.v4() + ".webp"
            if (!img && !icon) {
                return res.status(400).json({message: 'Выберите файл'})
            }
            if (img) {
                img.mv(path.resolve(__dirname, '..', 'static', fileName))
                const service = await Services.update(
                    {img: fileName},
                    {where: {id: id}}
                );
                return res.json(service)
            }
            if (icon) {
                icon.mv(path.resolve(__dirname, '..', 'static', fileName))
                const service = await Services.update(
                    {icon: fileName},
                    {where: {id: id}}
                );
                return res.json(service)
            }
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }



}


module.exports = new ServiceController()