const express = require('express')
const create_connnection = require('./create_connnection')
const app = express()

app.use(express.json())

app.post('/get_status_parking_lot', (req, res) => {
    const { floor } = req.body
    
    var con = create_connnection.con

    con.connect((err) => {
        if(err){
            console.error(err.stack)
            return
        }

        // get all data of this floor
        var query_get_status = "SELECT * FROM db_parking WHERE floor = '"+floor+"'"
        con.query(query_get_status, (ree,result) => {
            if(err){
                console.error(err.stack)
                return
            }

            res.json({
                result: result[0]
            })
        })
    })
})

app.listen(3000)