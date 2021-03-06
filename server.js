const express = require('express')
const test = require('./test')
const create_parking = require('./create_parking')
const park_the_car = require('./park_the_car')
const leave_the_slot = require('./leave_the_slot')
const get_status_parking_iot = require('./get_status_parking_iot')
const get_plate_number_list_by_car_size = require('./get_plate_number_list_by_car_size')
const get_slot_number_list_by_car_size = require('./get_slot_number_list_by_car_size')
const app = express()
const port = 8000

app.use(express.json())

app.get('/', (req, res) => {
    test.index(req, res)
})

app.post('/test', (req, res) => {
    const { text } = req.body
    res.json({
        message: "text is : " + text
    })
})

app.post('/create_parking',(req, res) => {
    create_parking.index(req, res)
})

app.post('/park_the_car', (req, res) => {
    park_the_car.index(req, res)
})

app.post('/leave_the_slot', (req, res) => {
    leave_the_slot.index(req, res)
})

app.post('/get_status_parking_iot', (req, res) => {
    get_status_parking_iot.index(req, res)
})

app.post('/get_plate_number_list_by_car_size', (req, res) => {
    get_plate_number_list_by_car_size.index(req, res)
})

app.post('/get_slot_number_list_by_car_size', (req, res) => {
    get_slot_number_list_by_car_size.index(req, res)
})

app.listen(port, () => {
    console.log("Running port : "+port)
})