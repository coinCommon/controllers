const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Task} = require('../models/models')
const path = require("path");

const generateJwt = (id, email, role, name) => {
    return jwt.sign(
        {id, email, role, name},
        process.env.SECRET_KEY,
        {expiresIn: '48h'}
        )
}

class UserController {
    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.internal('Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Неверный пароль'))
        }
        const token = generateJwt(user.id, user.email, user.role, user.name)
        return res.json({token})
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role, req.user.name)
        return res.json({token})
    }




    async create(req, res, next) {
        try {

            const {email, password, role, name} = req.body

            if (!email || !password) {
                return next(ApiError.badRequest('Некорректный email или пароль'))
            }
            if (email.length < 8 || email.length > 64) {
                return next(ApiError.badRequest('Email должен содержать не менее 8 и не более 64 символов'))
            }
            if (password.length <= 5 || password.length > 34) {
                return next(ApiError.badRequest('Пароль должен содержать не менее 6 и не более 34 символов'))
            }
            if (name.length < 2 || name.length > 34) {
                return next(ApiError.badRequest('Некорректное имя'))
            }

            const candidate = await User.findOne({where: {email}})
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'))
            }

            const hashPassword = await bcrypt.hash(password, 5)
            const user = await User.create({email, role, password: hashPassword, name})
            const task = await Task.create({userId: user.id})
            return res.json(user)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }


    async getAll(req, res) {
        const user = await User.findAll()
        return res.json(user)
    }
    async destroy(req, res, next) {
        const {id} = req.params
        try {
            const user = await User.destroy(
                {
                    where: {id},
                })
            return res.json(user)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

}


module.exports = new UserController()