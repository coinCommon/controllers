const {ActiveTask} = require('../models/models')
const ApiError = require('../error/ApiError')

class TaskController {
    async create(req, res, next) {
        try {
            const {userId, topic, message, status} = req.body
            const task = await ActiveTask.create({userId, topic, message, status})
            return res.json(task)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getAll(req, res) {
        let {page, limit} = req.query
        page = page || 1
        limit = limit || 100000
        let offset = page * limit - limit
        let task;
        if (!limit) {task = await ActiveTask.findAndCountAll()}
        if (limit) {task = await ActiveTask.findAndCountAll({limit, offset})}
        return res.json(task)
    }
    async destroy(req, res, next) {
        const {id} = req.params
        try {
            const task = await ActiveTask.destroy(
                {
                    where: {id},
                })
            return res.json(task)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const {id} = req.params
            const task = await ActiveTask.findAndCountAll(
                {
                    where: {userId: id}
                })
            return res.json(task)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


}


module.exports = new TaskController()