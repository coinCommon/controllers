const nodemailer = require('nodemailer')
const sitemap = require('express-sitemap')
const path = require("path");
const ApiError = require("../error/ApiError");
const uuid = require('uuid');
const {Token} = require("../models/models");

class OtherController {


    async sitemap(req, res, next) {
        try {
            let {object} = req.body
            const send = await sitemap({
                http: 'https',
                url: process.env.SITEMAP_URL,
                // port: 5000,
                map: object,
                route: {
                    'ALL': {
                        lastmod: new Date().toISOString(),
                        changefreq: 'always',
                        priority: 1.0,
                        allow: true,
                    },
                    '/admin': {
                        disallow: true,
                        hide: true,
                    },
                    '/auth': {
                        disallow: true,
                        hide: true,
                    },
                },
            });
            send.XMLtoFile(path.join(__dirname, '../static', 'sitemap.xml'));
            return res.json(send)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async createToken(req, res, next) {
        try {
            const {access, refresh} = req.body
            // // хеширование токена <--->
            // const hashAccess = await bcrypt.hash(access, 5)
            // const hashRefresh = await bcrypt.hash(refresh, 5)
            let token
            const tokenGet =  await Token.findAll()
            if (tokenGet.length === 0) {
                token = await Token.create({access, refresh})
            } else {
                token = await Token.update(
                    {access: access, refresh: refresh},
                    {where: {id: 1}})
            }
            return res.json(token)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async telegram(req, res, next) {
        try {
            const {message, type} = req.body
            const config = {
                "telegram": {
                    "token": "5845158824:AAF6OQhTszwkYPFAZE-PDplQOjWZY-k18Ts",
                    "chat": "-776257182" //
                }
            }
            let fields
            if (type === 'CALCULATION') {
                fields = [
                    "<i>Заявка с сайта</i>",
                    "\n<b>Время:</b>" + new Date().toString().split('GMT')[0],
                    "<b>Тип груза:</b> " + message.typeOfCargo,
                    "<b>Загрузка:</b> " + message.cityLoad,
                    "<b>Разгрузка:</b> " + message.cityUnload,
                    "<b>Вес:</b> " + message.weight,
                    "<b>Объем:</b> " + message.volume,
                    "<b>Температура:</b> " + message.temperature,
                    "\n<b>Имя:</b> " + message.name,
                    "<b>Телефон:</b> " + message.phone,
                ]
            }
            if (type === 'FEEDBACK') {
                fields = [
                    "<i>Заявка с сайта</i>",
                    "\n<b>Время:</b> " + new Date().toString().split('GMT')[0],
                    "<b>Имя:</b> "+ message.name,
                    "<b>Телефон:</b> "+ message.phone
                ]
            }

            let msg = ''
            fields.forEach(field => { // проходимся по массиву и склеиваем все в одну строку
                msg += field + '\n'
            });
            msg = encodeURI(msg) // кодируем

            const response = await fetch(`https://api.telegram.org/bot${config.telegram.token}/sendMessage?chat_id=${config.telegram.chat}&parse_mode=html&text=${msg}`, function (error, response, body) {
                console.log('error:', error);
                console.log('statusCode:', response && response.statusCode);
                console.log('body:', body);
                if(response.statusCode===200){
                    res.status(200).json({status: 'ok', message: 'Успешно отправлено!'});
                }
                if(response.statusCode!==200){
                    res.status(400).json({status: 'error', message: 'Произошла ошибка!'});
                }
            })

            return res.json('Успешно отправлено!')

            // return res.json('Успешно отправлено!')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async amoCRMToken(req, res, next) {
        try {

            // // для получения токена <------
            // const url = 'https://tkuventa.amocrm.ru/oauth2/access_token';
            // // // для обмена ключа на access и refresh токены
            // const body = {
            //     'client_id': '4707c2a2-0a0d-48a4-9b79-db911590d504',
            //     'client_secret': 'YvdzwuAOuPooh2BLHVInIt7N2t2e2BpodA6Stn1SwL8mg0CHk2t20MVZ4OIdBcUF',
            //     'grant_type': 'authorization_code',
            //     'code': 'def50200835f124e7e5c318f379d6cd7d3b721381c6f06087b7f4701d354421e3d896dbd8de7451a2f59faf8302fef0ae09a9087b4e4a19241b5012112094e98b4f22bdf16f170a8ca952312309981bff618560cf54617893460a5656854532f46a75d91b0861ce87a5c8a87aa8324bf7bf73b0d94ec0b4f68df4924bcce235207d7e0063978351cec118075a611c81226cff1686403d94b8a40af960ec82cac04bdde478b4354f399c2f0f1ded2faa9dbbec43cef22480b27283695fb8729c970fd4e2a2c8d7f1cab161bcf08136162bc42a71cfd1d6ae5a56b4c1ef7b663df8bf4cc9728c73754e536567f2b8750861c981a9b5dd0c027a170ff07499d413dc7e0b096f9b44f58470a1689a91828dc58e38a1b2e31678230144d62d75fc22ec50c3d606842a20f65c88a80be1ee8320dff9124bd76fae853d5c88d0fba5bf02987080322bb5f5ee204050379a334a32d09dd0e456659736134cfd64d044be6399ee8daf468f1df43411300594880d12851c220eb06096c0524bd132ce2cbbdbc3d841e9cbe3b0e0acd2f9322c1361dd9d393ade9ff890d1f110a10d300044213884d8a42eb3455a4800aa3e5a82afcec6c1e9a060bff77eb0c47a4178de3abe63d0787bbe1b2bb8f05cf60a7a3b4650e2dba2e11eadc65690f8c1735b7efb3e07bac2d9f5e1e5080f7c7347e',
            //     'redirect_uri': 'https://uventa-transport.ru/'
            // };
            // // для получения токена <------

            // получаем токен из бд
            const refresh = await Token.findAll()
            let refresh_token = refresh[0].refresh

            // для обновления токена <------
            const url = 'https://tkuventa.amocrm.ru/oauth2/access_token';
            const body = {
                    'client_id': '4707c2a2-0a0d-48a4-9b79-db911590d504',
                    'client_secret': 'YvdzwuAOuPooh2BLHVInIt7N2t2e2BpodA6Stn1SwL8mg0CHk2t20MVZ4OIdBcUF',
                    'grant_type': 'refresh_token',
                    'refresh_token': refresh_token,
                    'redirect_uri': 'https://uventa-transport.ru/',
        };

            let response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(body)
                });

            let result = await response.json();
            let token = await Token.update({access: result.access_token, refresh: result.refresh_token}, {where: {id: 1}});
            return res.json(token); // статус обновления токена в БД
            // return res.json(result); // ответ
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async amoCRMData(req, res, next) {
        try {
            const {message, type} = req.body

            // получаем токен из бд
            const access = await Token.findAll()
            let access_token = access[0].access

            const url = 'https://tkuventa.amocrm.ru/api/v4/leads/unsorted/forms';
            const headers = {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json;charset=utf-8'
            };

            let body
            if (type === 'FEEDBACK') {
                body = [
                    {
                        "request_id": new Date().getTime(),
                        "source_name": "TEST url",
                        "source_uid": uuid.v4(),
                        "created_at": new Date().getTime(),
                        "_embedded": {
                            "leads": [
                                {
                                    "name": "Заявка (Контакты)",
                                    "visitor_uid": uuid.v4(),
                                    "price": 0,
                                    "custom_fields_values": [

                                    ],
                                    "_embedded": {
                                        "tags": [
                                            {
                                                "name": "TEST"
                                            }
                                        ]
                                    }
                                }
                            ],
                            "contacts": [
                                {
                                    "name": message.name,
                                    "first_name": message.name,
                                    "custom_fields_values": [
                                            {"field_code": "PHONE", "values": [{"value": message.phone}]} // телефон
                                        ]
                                }
                            ],
                            "companies": [{"name": message.name}] // name
                        },
                        "metadata": {
                                "ip": '192.168.0.1', // ip adress
                                "form_id": "Sending contacts",
                                "form_sent_at": new Date().getTime(),
                                "form_name": "Sending contacts",
                                "form_page": "https://uventa-transport.ru",
                                "referer": "https://uventa-transport.ru"
                            }
                    }
                ];
            }
            else {
                body = [
                    {
                        "request_id": new Date().getTime(),
                        "source_name": "TEST url",
                        "source_uid": uuid.v4(),
                        "created_at": new Date().getTime(),
                        "_embedded": {
                            "leads": [
                                {
                                    "name": "Заявка (Грузоперевозка)",
                                    "visitor_uid": uuid.v4(),
                                    "price": 0,
                                    "custom_fields_values": [
                                        {
                                            "field_id": 1132319, // Тип груза
                                            "values": [{"value": message.typeOfCargo}]
                                        },
                                        {
                                            "field_id": 1132321, // температура
                                            "values": [{"value": String(message.temperature)}]
                                        },
                                        {
                                            "field_id": 1152403, // откуда
                                            "values": [{"value": message.cityLoad}]
                                        },
                                        {
                                            "field_id": 1152405, // куда
                                            "values": [{"value": String(message.cityUnload)}]
                                        },
                                        {
                                            "field_id": 1132325, // вес
                                            "values": [{"value": String(message.weight)}]
                                        },
                                        {
                                            "field_id": 1132327, // объем
                                            "values": [{"value": String(message.volume)}]
                                        },
                                        {
                                            "field_id": 1132311, // чекбокс
                                            "values": [{"value": 'Да'}]
                                        }
                                    ],
                                    "_embedded": { "tags": [{"name": "TEST"}]}
                                }
                            ],
                            "contacts": [
                                {
                                    "name": message.name,
                                    "first_name": message.name,
                                    "custom_fields_values":
                                        [
                                            {"field_code": "PHONE", "values": [{"value": message.phone}]}, // телефон
                                        ]
                                }
                            ],
                            "companies": [{"name": message.name}] // name
                        },
                        "metadata":
                            {
                                "ip": '192.168.0.1', // ip adress
                                "form_id": "Price calculation",
                                "form_sent_at": new Date().getTime(),
                                "form_name": "Price calculation",
                                "form_page": "https://uventa-transport.ru",
                                "referer": "https://uventa-transport.ru"
                            }
                    }];
            }


            let response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            let result = await response.json();
            return res.json(result)

        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }


    // Main Mailer
    async mainMailer(req, res, next) {
        let {text} = req.body
        let transporter = nodemailer.createTransport({
            host: "smtp.mail.ru",
            port: 465,
            secure: true,
            auth: {
                user: 'transport.logist777@yandex.ru',
                pass: 'password',
            },
        });
        let info = await transporter.sendMail({
            from: '"transport.logist777@yandex.ru 👻" <transport.logist777@yandex.ru>', // sender address адрес отправителя
            // to: "transport.logist777@yandex.ru, transport.logist777@yandex.ru", // list of receivers список получателей
            to: "transport.logist777@yandex.ru",
            subject: "Обратная связь",
            text: "Обратная связь",
            html: `${text}`,
        });
        return res.json(text);
    }

}


module.exports = new OtherController()