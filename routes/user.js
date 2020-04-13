const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const express = require('express')
const User = require('../models/user')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const Role = require('../helpers/role')
const auth = require('../middleware/auth')
const authorize = require('../middleware/role')

router.get('/', [auth, authorize([Role.Admin, Role.Editor])], async(req, res)=> {
    const users = await User.find()
    res.send(users)
})

router.get('/:id', [auth, authorize([Role.Admin, Role.Editor, Role.User])], async(req, res)=>{
    const user = await User.findById(req.params.id)
    if(!user) return res.status(404).send('No encontramos un usuario con ese Id')
    res.send(user)
})

router.post('/', [
    check('name').isLength({min: 3}),
    check('mail').isLength({min: 3}),
    check('password').isLength({min: 3})
],async(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }


    let user = await User.findOne({email: req.body.mail})
    if(user) return res.status(400).send("El usuario ya existe")

    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    user = new User({
        name: req.body.name,
        lastname: req.body.lastname,
        isCustomer: false,
        mail: req.body.mail,
        password: hashPassword,
        role: Role.User
    })

    const result = await user.save()

    const jwtToken = user.generateJWT()

    res.status(201).header('Authorization', jwtToken).send({
        _id: user._id,
        name: user.name,
        mail: user.mail,
    })
})

router.put('/:id', [
    check('name').isLength({min: 3}),
    check('mail').isLength({min: 3}),
    auth, authorize([Role.Admin, Role.Editor])
], async(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(req.params.id, {
          name: req.body.name,
          lastname: req.body.lastname,
          isCustomer: req.body.isCustomer,
          mail: req.body.mail,
        },
        {
            new: true
        }
    )

    if(!user){
        return res.status(404).send('El usuario con ese ID no esta')
    }
    
    res.status(204).send()

})

router.delete('/:id', [auth, authorize([Role.Admin, Role.Editor])], async(req, res)=>{

    const user = await User.findByIdAndDelete(req.params.id)

    if(!user){
        return res.status(404).send('El usuario con ese ID no esta, no se puede borrar')
    }

    res.status(200).send('usuario borrado')

})

module.exports = router