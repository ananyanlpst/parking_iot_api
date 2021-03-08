const create_connnection = require('./create_connnection')

var index = (req, res) => {
    const { floor } = req.body
    const { total } = req.body
    const { car_size } = req.body

    var park_slot = []
    var slot_car = []
    for(var i = 1; i <= total; ++i){
        var slot = floor.concat(i.toString())
        park_slot.push(slot)
        slot_car.push(new Array(slot, true))
    }

    const available = total
    const unavailable = 0

    var con = create_connnection.con

    // check floor in table db_parking
    var query_check_parking = "SELECT * FROM db_parking WHERE floor = '"+floor+"'"
    con.query(query_check_parking, (err, result) => {
        if(err){
            console.error(err.stack)
            return
        }

        if(result.length > 0){
            res.json({
                message: "Sorry! floor '"+floor+"' is already in the system."
            })
        } else {
            
            // insert create parking iot into table db_parking
            var query_create_parking = "INSERT INTO db_parking(floor, park_slot, car_size, total, available, unavailable) VALUES ('"+floor+"', '"+park_slot+"', '"+car_size+"', '"+total+"', '"+available+"', '"+unavailable+"')"
            con.query(query_create_parking, (err, result) => {
                if(err){
                    console.error(err.stack)
                    return
                }
            })

            // insert parking slot number into table db_park_slot
            var query_park_slot = "INSERT INTO db_park_slot(slot, active) VALUES ?"
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
        }
    })
}

module.exports = {
    index
}