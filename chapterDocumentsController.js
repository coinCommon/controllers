const {DocumentsType} = require('../models/models')
const ApiError = require('../error/ApiError')

class ChapterDocumentsController {
    async create(req, res, next) {
        try {
            const {name} = req.body
            const chapter = await DocumentsType.create({name})
            return res.json(chapter)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getAll(req, res) {
        let {page, limit} = req.query
        page = page || 1
        limit = limit || 100000
        let offset = page * limit - limit
        let chapter;
        if (!limit) {chapter = await DocumentsType.findAndCountAll()}
        if (limit) {chapter = await DocumentsType.findAndCountAll({limit, offset})}
        return res.json(chapter)
    }
    async destroy(req, res, next) {
        const {id} = req.params
        try {
            const chapter = await DocumentsType.destroy(
                {
                    where: {id},
                })
            return res.json(chapter)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const {id} = req.params
            const chapter = await DocumentsType.findOne(
                {
                    where: {id}
                })
            return res.json(chapter)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async update(req, res, next) {
        try {
            const {id} = req.params
            let {dataEdit} = req.body
            const chapter = await DocumentsType.update(
                {name: dataEdit.name},
                {where: {id: id}}
            );
            return res.json(chapter)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }



}


module.exports = new ChapterDocumentsController()