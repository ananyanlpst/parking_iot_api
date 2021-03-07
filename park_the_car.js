const create_connnection = require('./create_connnection')

var index = (req, res) => {
    const { plate_number } = req.body
    const { car_size } = req.body

    var con = create_connnection.con

    // find floor of car size
    var query_floor = "SELECT floor, total, available, unavailable FROM db_parking WHERE car_size = '"+car_size+"' and available > 0"
    con.query(query_floor, (err, result) => {
        if(err){
            console.error(err.stack)
            return
        }

        if(result.length == 0) {
            res.json({
                message: "Sorry! there isn't available parking lot."
            })
            return

        } else {

            var floor = result['0'].floor
            var available = result['0'].available
            var unavailable = result['0'].unavailable

            // find this plate number active : true
            var query_plate_number = "SELECT * FROM db_parking_list WHERE plate_number = '"+plate_number+"' and active = true"
            con.query(query_plate_number, (err, result) => {
                if(err){
                    console.error(err.stack)
                    return
                }

                if(result.length > 0){
                    res.json({
                        message: "Sorry! plate_number : '"+plate_number+"' is already in the system."
                    })
                } else {
                    
                    // allocate parking slot to a car
                    var query_find_slot = "SELECT db_park_slot.slot FROM db_park_slot INNER JOIN db_parking ON db_park_slot.slot LIKE CONCAT('%', db_parking.floor, '%') WHERE floor = '"+floor+"' and active = true order by no asc limit 1"
                    con.query(query_find_slot, (err, result) => {
                        if(err){
                            console.error(err.stack)
                            return
                        }
                        
                        const timestamp = Date.now()
                        
                        const park_slot = result[0].slot
                        const ticket_id = timestamp
                        const datetime = new Date(timestamp).toLocaleDateString()+" "+new Date(timestamp).toLocaleTimeString()
        
                        // insert parking list
                        var data_parking_list = new Array(new Array(ticket_id, floor, park_slot, plate_number, timestamp, true))
                        var query_add_parking_list = "INSERT INTO db_parking_list(ticket_id, floor, park_slot, plate_number, datetime, active) VALUES ?"
                        con.query(query_add_parking_list, [data_parking_list], (err, result) => {
                            if(err){
                                console.error(err.stack)
                                return
                            }
                        })
        
                        // update total , available, unvailable in db_parking
                        available = available - 1
                        unavailable = unavailable + 1
        
                        var query_update_total = "UPDATE db_parking SET available = "+available+", unavailable = "+unavailable+" WHERE floor = '"+floor+"'"
                        con.query(query_update_total, (err, result) => {
                            if(err){
                                console.error(err.stack)
                                return
                            }
                        })
        
        
                        // update slot in db_park_slot
                        var query_update_total = "UPDATE db_park_slot SET active = false WHERE slot = '"+park_slot+"'"
                        con.query(query_update_total, (err, result) => {
                            if(err){
                                console.error(err.stack)
                                return
                            }
                        })
        
                        // response result to json
                        res.json({
                            message: "Successfully allocated parking!",
                            parking_ticket: {
                                ticket_id,
                                floor,
                                park_slot,
                                plate_number,
                                car_size,
                                datetime
                            }
        
                        })
                        return
        
                    })
        
                }

            })
        }
    })
}

module.exports = {
    index
}