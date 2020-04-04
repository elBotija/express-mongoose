const express = require('express')
const Sale = require('../models/sale')
const Car = require('../models/car')
const User = require('../models/user')
const mongoose = require('mongoose')

const router = express.Router()

router.get('/', async(req, res)=> {
    const sale = await Sale.find()
        .find()
    res.send(sale)
})

router.get('/:id', async(req, res)=>{
    const car = await Car.findById(req.params.id)
    if(!car) return res.status(404).send('No encontramos un coche con ese Id')
    res.send(car)
})

// Post Modelo de datos embebidos
router.post('/',async(req, res)=>{
  const user = await User.findById(req.body.userId)
  if(!user) return res.status(400).send('El usuario no existe')
  
  const car = await Car.findById(req.body.carId)
  if(!car) return res.status(400).send('El coche no existe')

  if(car.sold) return res.status(400).send('El coche fue vendido')
  
  const sale = new Sale({
    user:{
      _id: user._id,
      name: user.name,
      mail: user.mail
    },
    car:{
      _id: car._id,
      model: car.model
    },
    price: req.body.price
  })

//   const result = await sale.save()
//   user.isCustomer = true
//   user.save()
//   car.sold = true
//   car.save()
//   res.status(201).send(result)

    const session = await mongoose.startSession()
    session.startTransaction()
    try{
    const result = await sale.save()
        user.isCustomer = true
        user.save()
        car.sold = true
        car.save()
        await session.commitTransaction()
        session.endSession()
        res.status(201).send(result)
    }catch(err){
        await session.abortTransaction()
        session.endSession()
        res.status(500).send(err.message)
    }


})

router.put('/:id', async(req, res)=>{

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

router.delete('/:id', async(req, res)=>{

    const car = await Car.findByIdAndDelete(req.params.id)

    if(!car){
        return res.status(404).send('El coche con ese ID no esta, no se puede borrar')
    }

    res.status(200).send('coche borrado')

})

module.exports = router