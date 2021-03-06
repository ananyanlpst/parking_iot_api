const express = require('express')
const mysql = require('mysql')
const app = express()

app.use(express.json())

app.post('/test', (req, res) => {
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
        var query_get_list = "SELECT db_parking_list.ticket_id FROM db_parking_list INNER JOIN db_parking ON db_parking_list.floor = db_parking.floor"
        con.query(query_get_list, (err,result) => {
            if(err){
                console.error(err.stack)
                return
            }
            
            res.json({
                result
            })
        })
    })
})

app.listen(3000)