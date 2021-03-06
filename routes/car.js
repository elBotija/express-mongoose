const mongoose = require('mongoose')
const express = require('express')
const Car = require('../models/car')
const {Company} = require('../models/company')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth')
const Role = require('../helpers/role')
const authorize = require('../middleware/role')

router.get('/', [auth, authorize([Role.Admin, Role.User, Role.Editor])],async(req, res)=> {
    const cars = await Car
        .find()
        // .populate('company', 'name country')
    res.send(cars)
})

router.get('/:id', [auth, authorize([Role.Admin, Role.User, Role.Editor])], async(req, res)=>{
    const car = await Car.findById(req.params.id)
    if(!car) return res.status(404).send('No encontramos un coche con ese Id')
    res.send(car)
})

// Post Modelo de datos embebidos
router.post('/', [
    check('year').isLength({min: 3}),
    check('model').isLength({min: 3}),
    auth, 
    authorize([Role.Admin, Role.Editor]),
],async(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const company = await Company.findById(req.body.companyId)
    if(!company) return res.status(400).send("no tenemos esa  compania")

    const car = new Car({
        company: company,
        model: req.body.model,
        year: req.body.year,
        sold: req.body.sold,
        price: req.body.price,
        extras: req.body.extras
    })

    const result = await car.save()
    res.status(201).send(result)
})

//pos para modelo de datos normalizado
// router.post('/', [
//     check('model').isLength({min: 3})
// ],async(req, res)=>{
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(422).json({ errors: errors.array() });
//     }

//     const car = new Car({
//         company: req.body.company,
//         model: req.body.model,
//         year: req.body.year,
//         sold: req.body.sold,
//         price: req.body.price,
//         extras: req.body.extras
//     })

//     const result = await car.save()
//     res.status(201).send(result)
// })

router.put('/:id', [
    check('model').isLength({min: 3}),
    auth, 
    authorize([Role.Admin, Role.Editor]),
], async(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const car = await Car.findByIdAndUpdate(req.params.id, {
            company: req.body.company,
            model: req.body.model,
            year: req.body.year,
            sold: req.body.sold,
            price: req.body.price,
            extras: req.body.extras
        },
        {
            new: true
        }
    )

    if(!car){
        return res.status(404).send('El coche con ese ID no esta')
    }
    
    res.status(204).send()

})

router.delete('/:id', [auth, authorize([Role.Admin, Role.Editor])],async(req, res)=>{

    const car = await Car.findByIdAndDelete(req.params.id)

    if(!car){
        return res.status(404).send('El coche con ese ID no esta, no se puede borrar')
    }

    res.status(200).send('coche borrado')

})

module.exports = router