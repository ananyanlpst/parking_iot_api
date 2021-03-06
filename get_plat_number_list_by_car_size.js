const express = require('express')
const mysql = require('mysql')
const app = express()

app.use(express.json())

app.post('/get_plat_number_list_by_car_size', (req, res) => {
    const { car_size } = req.body

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

        // get plate number list from car size
        var query_get_status = "SELECT plate_number FROM db_parking_list WHERE car_size = '"+car_size+"' and active = 1"
        con.query(query_get_status, (err,result) => {
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