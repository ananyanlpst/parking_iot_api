const create_connnection = require('./create_connnection')

var index = (req, res) => {
    const { floor } = req.body
    
    var con = create_connnection.con

    // get all data of this floor
    var query_get_status = "SELECT * FROM db_parking WHERE floor = '"+floor+"'"
    con.query(query_get_status, (err,result) => {
        if(err){
            console.error(err.stack)
            return
        }

        if(result.length > 0){
            res.json({
                result: result[0]
            })
        } else {
            res.json({
                result: "Sorry! floor "+floor+" does not exit. please try again."
            })
        }
        
    })
}

module.exports = {
    index
}