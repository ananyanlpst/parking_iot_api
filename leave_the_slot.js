const e = require('express')
const create_connnection = require('./create_connnection')

var calculate_taketime = (ms) => {
    var second = parseInt((ms/1000) % 60)
    var minute = parseInt((ms/(1000*60)) % 60)
    var hour = parseInt((ms/(1000*60*60)) % 24)

    hour = (hour < 10) ? "0"+hour : hour
    minute = (minute < 10) ? "0"+minute : minute
    second = (second < 10) ? "0"+second : second

    return hour + ":" + minute + ":" + second
}

var index = (req, res) => {
    const { ticket_id } = req.body

    var con = create_connnection.con

    // check ticket id is active : true
    var query_get_ticket_id = "SELECT * FROM db_parking_list WHERE ticket_id = '"+ticket_id+"' and active = true"
    con.query(query_get_ticket_id, (err, result) => {
        if(err){
            console.error(err.stack)
            return
        }

        if(result.length > 0) {
            // get data of ticket id
            var query_get_ticket_id = "SELECT * , db_parking_list.park_slot as slot_car FROM db_parking_list INNER JOIN db_parking ON db_parking.floor = db_parking_list.floor WHERE ticket_id = '"+ticket_id+"'"
            con.query(query_get_ticket_id, (err, result) => {
                if(err){
                    console.error(err.stack)
                    return
                }

                const floor = result[0].floor
                const park_slot = result[0].slot_car
                const plate_number = result[0].plate_number
                const car_size = result[0].car_size
                const total = result[0].total
                const datetime = result[0].datetime

                var differencetime = Date.now() - datetime
                const taketime = calculate_taketime(differencetime)+" hrs."
                
                if(total > result[0].available){
                    const available = result[0].available + 1
                    const unavailable = result[0].unavailable - 1

                    var query_update_parking = "UPDATE db_parking SET available = "+available+", unavailable = "+unavailable+" WHERE floor = '"+floor+"'"
                    con.query(query_update_parking, (err, result) => {
                        if(err){
                            console.error(err.stack)
                            return
                        }
                    })
                } else {
                    res.json({
                        message: "Sorry! parking slot unavailable does not exit."
                    })
                    return
                }

                // update active db_parking_list
                var query_update_db_parking_list = "UPDATE db_parking_list SET active = false WHERE ticket_id = '"+ticket_id+"'"
                con.query(query_update_db_parking_list, (err, result) => {
                    if(err){
                        console.error(err.stack)
                        return
                    }
                })

                // update active db_park_slot
                var query_update_db_park_slot = "UPDATE db_park_slot SET active = true WHERE slot = '"+park_slot+"'"
                con.query(query_update_db_park_slot, (err, result) => {
                    if(err){
                        console.error(err.stack)
                        return
                    }
                })
                
                res.json({
                    message: "Sucessfully! updated ticket id : '"+ticket_id+"' is active : false",
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
        } else {
            res.json({
                message: "Sorry! ticket id : '"+ticket_id+"' is already active : false in the system."
            })
        }
    })
}

module.exports = {
    index
}