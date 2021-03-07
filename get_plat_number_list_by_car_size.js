const express = require('express')
const create_connnection = require('./create_connnection')
const app = express()

app.use(express.json())

app.post('/get_plat_number_list_by_car_size', (req, res) => {
    const { car_size } = req.body

    var con = create_connnection.con

    con.connect((err) => {
        if(err){
            console.error(err.stack)
            return
        }

        // get plate number list from car size
        var query_get_list = "SELECT db_parking_list.plate_number FROM db_parking_list INNER JOIN db_parking ON db_parking_list.floor = db_parking.floor WHERE car_size = '"+car_size+"' and active = true"
        con.query(query_get_list, (err,result) => {
            if(err){
                console.error(err.stack)
                return
            }

            var plate_number_list = []
            result.forEach(element => {
                plate_number_list.push(element.plate_number)
            })
            
            res.json({
                result: {
                    car_size,
                    status: 'active',
                    total: plate_number_list.length,
                    plate_number_list
                }
            })
        })
    })
})

app.listen(3000)