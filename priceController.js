const {Prices, Services} = require('../models/models')
const ApiError = require('../error/ApiError')

class PriceController {
    async create(req, res, next) {
        try {
            const {title, description, price} = req.body
            const prices = await Prices.create({title, description, price})
            return res.json(prices)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getAll(req, res) {
        let {page, limit} = req.query
        page = page || 1
        limit = limit || 100000
        let offset = page * limit - limit
        let price;
        if (!limit) {price = await Prices.findAndCountAll()}
        if (limit) {price = await Prices.findAndCountAll({limit, offset})}
        return res.json(price)
    }
    async destroy(req, res, next) {
        const {id} = req.params
        try {
            const service = await Prices.destroy(
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
            const price = await Prices.findOne(
                {
                    where: {id}
                })
            return res.json(price)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async update(req, res, next) {
        try {
            const {id} = req.params
            let {dataEdit} = req.body
            const price = await Prices.update(
                {title: dataEdit.title, description: dataEdit.description, price: dataEdit.price},
                {where: {id: id}}
            );
            return res.json(price)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


}


module.exports = new PriceController()