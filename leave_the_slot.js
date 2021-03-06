const express = require('express')
const mysql = require('mysql')
const app = express()

app.use(express.json())

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

        var query_get_ticket_id = "SELECT * FROM db_parking_list WHERE ticket_id = '"+ticket_id+"'"
        con.query(query_get_ticket_id, (err, result) => {
            if(err){
                console.error(err.stack)
                return
            }

            console.log(result)
            return
        })
    })
})

app.listen(3000)