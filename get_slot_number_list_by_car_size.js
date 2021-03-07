const create_connnection = require('./create_connnection')

var index = (req, res) => {
    const { car_size } = req.body

    var con = create_connnection.con

    // get slot number list from car size
    var query_get_list = "SELECT db_parking_list.park_slot, db_parking_list.active FROM db_parking_list INNER JOIN db_parking ON db_parking_list.floor = db_parking.floor WHERE car_size = '"+car_size+"'"
    con.query(query_get_list, (err,result) => {
        if(err){
            console.error(err.stack)
            return
        }

        if(result.length > 0) {
            var slot_number_list = result
            
            res.json({
                result: {
                    car_size,
                    total: slot_number_list.length,
                    slot_number_list
                }
            })

        }else{
            res.json({
                message: "Sorry! car size '"+car_size+"' does not exist. please try again."
            })
        }
    })
}

module.exports = {
    index
}