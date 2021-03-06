const express = require('express')
const mysql = require('mysql')
const app = express()

app.use(express.json())

app.post('/create_parking', (req, res) => {
    const { floor } = req.body
    const { total } = req.body
    const { car_size } = req.body

    var park_slot = []
    var slot_car = []
    for(var i = 1; i <= total; ++i){
        var slot = floor.concat(i.toString())
        park_slot.push(slot)
        slot_car.push(new Array(slot, floor, true))
    }

    const available = total
    const unavailable = 0

    var con = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'parking_iot'
    })

    con.connect((err) => {
        if(err){
            console.error(err.stack)
            return
        }

        var query_create_parking = "INSERT INTO db_parking(floor, park_slot, car_size, total, available, unavailable) VALUES ('"+floor+"', '"+park_slot+"', '"+car_size+"', '"+total+"', '"+available+"', '"+unavailable+"')"
        con.query(query_create_parking, (err, result) => {
            if(err){
                console.error(err.stack)
                return
            }
        })

        var query_park_slot = "INSERT INTO db_park_slot(slot, floor, active) VALUES ?"
        con.query(query_park_slot, [slot_car], (err, result) => {
            if(err){
                console.error(err.stack)
                return
            }
        })

        res.json({
            message: "Create Successfully!",
            data: {
                floor,
                total,
                car_size,
                park_slot,
                available,
                unavailable
            }
        })
    })

})

app.listen(3000)