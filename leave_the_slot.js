const express = require('express')
const mysql = require('mysql')
const app = express()

app.use(express.json())

var calculate_taketime = (ms) => {
    var second = parseInt((ms/1000) % 60)
    var minute = parseInt((ms/(1000*60)) % 60)
    var hour = parseInt((ms/(1000*60*60)) % 24)

    hour = (hour < 10) ? "0"+hour : hour
    minute = (minute < 10) ? "0"+minute : minute
    second = (second < 10) ? "0"+second : second

    return hour + ":" + minute + ":" + second
}

app.post('/leave_the_slot', (req, res) => {
    const { ticket_id } = req.body
    
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

        // get data of ticket id
        var query_get_ticket_id = "SELECT * FROM db_parking_list WHERE ticket_id = '"+ticket_id+"'"
        con.query(query_get_ticket_id, (err, result) => {
            if(err){
                console.error(err.stack)
                return
            }

            const floor = result[0].floor
            const park_slot = result[0].park_slot
            const plate_number = result[0].plate_number
            const car_size = result[0].car_size
            const datetime = result[0].datetime

            var differencetime = Date.now() - datetime
            const taketime = calculate_taketime(differencetime)+" hrs."

            // get available, unavailable of table db_parking
            var query_get_db_parking = "SELECT * FROM db_parking WHERE floor = '"+floor+"'"
            con.query(query_get_db_parking, (err, result) => {
                if(err){
                    console.error(err.stack)
                    return
                }
                const available = result[0].available + 1
                const unavailable = result[0].unavailable - 1

                var query_update_parking = "UPDATE db_parking SET available = "+available+", unavailable = "+unavailable+" WHERE floor = '"+floor+"'"
                con.query(query_update_parking, (err, result) => {
                    if(err){
                        console.error(err.stack)
                        return
                    }
                })
            })

            // update active db_parking_list
            var query_update_db_parking_list = "UPDATE db_parking_list SET active = false WHERE ticket_id = '"+ticket_id+"'"
            con.query(query_update_db_parking_list, (err, result) => {
                if(err){
                    console.error(err.stack)
                    return
                }
            })

            // update active db_park_slot
            var query_update_db_park_slot = "UPDATE db_park_slot SET active = false WHERE slot = '"+park_slot+"'"
            con.query(query_update_db_park_slot, (err, result) => {
                if(err){
                    console.error(err.stack)
                    return
                }
            })
            
            res.json({
                message: "Thank You!",
                result: {
                    plate_number,
                    car_size,
                    floor,
                    park_slot,
                    taketime
                }
            })
            return
        })
    })
})

app.listen(3000)