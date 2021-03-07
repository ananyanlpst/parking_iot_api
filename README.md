# parking_iot_api

1. Instructions Code 8 File
2. Test/Specs 6 API

################################################################################################################################
**1. Instructions Code**

**server.js**

app.post('/create_parking', (req, res) => {
    create_parking.index(req, res) // เรียก function การทำงานจากไฟล์ create_parking.js
})

app.post('/park_the_car', (req, res) => {
    park_the_car.index(req, res) // เรียก function การทำงานจากไฟล์ park_the_car.js
})

app.post('/leave_the_slot', (req, res) => {
    leave_the_slot.index(req, res) // เรียก function การทำงานจากไฟล์ leave_the_slot.js
})

app.post('/get_status_parking_iot', (req, res) => {
    get_status_parking_iot.index(req, res) // เรียก function การทำงานจากไฟล์ get_status_parking_iot.js
})

app.post('/get_plate_number_list_by_car_size', (req, res) => {
    get_plate_number_list_by_car_size.index(req, res) // เรียก function การทำงานจากไฟล์ get_plate_number_list_by_car_size.js
})

app.post('/get_slot_number_list_by_car_size', (req, res) => {
    get_slot_number_list_by_car_size.index(req, res) // เรียก function การทำงานจากไฟล์ get_slot_number_list_by_car_size.js
})

################################################################################################################################

**create_parking.js** // API สร้างที่จอดรถ

var index = (req, res) => { // function index รับค่า parameter คือ req (รับค่าจาก method post) และ res (ส่งค่าออกเป็น response รูปแบบ json)
    
    // รับค่า floor, total, car_size จาก req
    const { floor } = req.body
    const { total } = req.body
    const { car_size } = req.body
    
    // เก็บ data ชื่อช่องจอดรถที่ array park_slot , slot_car
    var park_slot = []
    var slot_car = []
    for(var i = 1; i <= total; ++i){
        var slot = floor.concat(i.toString())
        park_slot.push(slot)
        slot_car.push(new Array(slot, true))
    }
    
    // กำหนดค่า available (ว่าง), unavailable (ไม่ว่าง) ของที่จอดรถ
    const available = total
    const unavailable = 0

    var con = create_connnection.con // เชื่อมต่อ database
    
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

    res.json({ // response data รูปแบบ json
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

module.exports = { // exports ให้ไฟล์ server.js เรียกใช้ function index
    index
}

################################################################################################################################

**park_the_car.js**

var index = (req, res) => { // function index รับค่า parameter คือ req (รับค่าจาก method post) และ res (ส่งค่าออกเป็น response รูปแบบ json)
    
    // รับค่า plate_number, car_size จาก req
    const { plate_number } = req.body
    const { car_size } = req.body

    var con = create_connnection.con // เชื่อมต่อ database

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
        
                        // response result to json (response data รูปแบบ json)
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

module.exports = { // exports ให้ไฟล์ server.js เรียกใช้ function index
    index
}

################################################################################################################################

**get_status_parking_iot.js**

var index = (req, res) => { // function index รับค่า parameter คือ req (รับค่าจาก method post) และ res (ส่งค่าออกเป็น response รูปแบบ json)
    
    // รับค่า floor จาก req
    const { floor } = req.body
    
    var con = create_connnection.con // เชื่อมต่อ database

    // get all data of this floor
    var query_get_status = "SELECT * FROM db_parking WHERE floor = '"+floor+"'"
    con.query(query_get_status, (err,result) => {
        if(err){
            console.error(err.stack)
            return
        }

        if(result.length > 0){
            res.json({ // response data รูปแบบ json กรณีมี data ใน db
                result: result[0]
            })
        } else {
            res.json({ // response data รูปแบบ json กรณีไม่มี data ใน db
                result: "Sorry! floor "+floor+" does not exit. please try again."
            })
        }
        
    })
}

module.exports = { // exports ให้ไฟล์ server.js เรียกใช้ function index
    index
}

################################################################################################################################

**get_plate_number_list_by_car_size.js**

var index = (req, res) => { // function index รับค่า parameter คือ req (รับค่าจาก method post) และ res (ส่งค่าออกเป็น response รูปแบบ json)
    
    // รับค่า car_size จาก req
    const { car_size } = req.body

    var con = create_connnection.con // เชื่อมต่อ database

    // get plate number list from car size
    var query_get_list = "SELECT db_parking_list.plate_number, db_parking_list.active FROM db_parking_list INNER JOIN db_parking ON db_parking_list.floor = db_parking.floor WHERE car_size = '"+car_size+"'"
    con.query(query_get_list, (err,result) => {
        if(err){
            console.error(err.stack)
            return
        }

        if(result.length > 0) {
            var plate_number_list = result
            
            res.json({ // response data รูปแบบ json กรณีมี data ใน db
                result: {
                    car_size,
                    total: plate_number_list.length,
                    plate_number_list
                }
            })
        }else{
            res.json({ // response data รูปแบบ json กรณีไม่มี data ใน db
                message: "Sorry! car size '"+car_size+"' does not exist. please try again."
            })
        }
    })
}

module.exports = { // exports ให้ไฟล์ server.js เรียกใช้ function index
    index
}

################################################################################################################################

**get_slot_number_list_by_car_size.js**

var index = (req, res) => { // function index รับค่า parameter คือ req (รับค่าจาก method post) และ res (ส่งค่าออกเป็น response รูปแบบ json)
    
    // รับค่า car_size จาก req
    const { car_size } = req.body

    var con = create_connnection.con // เชื่อมต่อ database

    // get slot number list from car size
    var query_get_list = "SELECT db_parking_list.park_slot, db_parking_list.active FROM db_parking_list INNER JOIN db_parking ON db_parking_list.floor = db_parking.floor WHERE car_size = '"+car_size+"'"
    con.query(query_get_list, (err,result) => {
        if(err){
            console.error(err.stack)
            return
        }

        if(result.length > 0) {
            var slot_number_list = result
            
            res.json({ // response data รูปแบบ json กรณีมี data ใน db
                result: {
                    car_size,
                    total: slot_number_list.length,
                    slot_number_list
                }
            })

        }else{
            res.json({ // response data รูปแบบ json กรณีไม่มี data ใน db
                message: "Sorry! car size '"+car_size+"' does not exist. please try again."
            })
        }
    })
}

module.exports = { // exports ให้ไฟล์ server.js เรียกใช้ function index
    index
}

################################################################################################################################

**create_connection.js**

var con = mysql.createConnection({ // สร้างการเชื่อมต่อ db
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'parking_iot'
    })

module.exports = { // exports ให้ไฟล์อื่นสามารถเรียกใช้ function con เพื่อเชื่อมต่อ db
    con
}

################################################################################################################################

### 2. Test/Specs API

##### 1. create_parking

URL : http://host:port/create_parking

**require** :
{
    "floor": (String),
    "total": (Integer),
    "car_size": (String)
}

Ex. :
{
    "floor": "F",
    "total": 10,
    "car_size": "small"
}

**response** :
{
    "message": (String),
    "data": {
        "floor": (String),
        "total": (Integer),
        "car_size": (String),
        "park_slot": (Array),
        "available": (Integer),
        "unavailable": (Integer)
    }
}

Ex. :
{
    "message": "Create Successfully!",
    "data": {
        "floor": "J",
        "total": 10,
        "car_size": "small",
        "park_slot": [
            "J1",
            "J2",
            "J3",
            "J4",
            "J5",
            "J6",
            "J7",
            "J8",
            "J9",
            "J10"
        ],
        "available": 10,
        "unavailable": 0
    }
}

-----------------------------------------------------------------------------------------------------------------------------------

##### 2. park_the_car

URL : http://host:port/park_the_car

**require** :
{
    "plate_number" : (String),
    "car_size": (String)
}

Ex. :
{
    "plate_number" : "U513D",
    "car_size": "medium"
}

**response** :
{
    "message": (String),
    "parking_ticket": {
        "ticket_id": (Timestamp),
        "floor": (String),
        "park_slot": (String),
        "plate_number": (String),
        "car_size": (String),
        "datetime": (String),
    }
}

Ex. :
{
    "message": "Successfully allocated parking!",
    "parking_ticket": {
        "ticket_id": 1615132629439,
        "floor": "B",
        "park_slot": "B1",
        "plate_number": "TES32",
        "car_size": "medium",
        "datetime": "3/7/2021 10:57:09 PM"
    }
}

-----------------------------------------------------------------------------------------------------------------------------------

##### 3. leave_the_slot

URL : http://host:port/leave_the_slot

**require** :
{
    "ticket_id": (String)
}

Ex. :
{
    "ticket_id": "1615096572047"
}

**response** :
{
    "message": (String),
    "result": {
        "plate_number": (String),
        "car_size": (String),
        "floor": (String),
        "park_slot": (String),
        "taketime": (String)"
    }
}

Ex. :
{
    "message": "Sucessfully! updated ticket id : '1615096516988' is active : false",
    "result": {
        "plate_number": "ET97D",
        "car_size": "medium",
        "floor": "B",
        "park_slot": "B2",
        "taketime": "10:06:43 hrs."
    }
}

-----------------------------------------------------------------------------------------------------------------------------------

##### 4. get_status_parking_iot

URL : http://host:port/get_status_parking_iot

**require** :
{
    "floor": (String)
}

Ex. :
{
    "floor": "B"
}

**response** :
{
    "result": {
        "floor": (String),
        "park_slot": (String),
        "car_size": (String),
        "total": (Integer),
        "available": (Integer),
        "unavailable": (Integer)
    }
}

Ex. :
{
    "result": {
        "floor": "B",
        "park_slot": "B1,B2,B3,B4,B5,B6,B7,B8,B9,B10",
        "car_size": "medium",
        "total": 10,
        "available": 8,
        "unavailable": 2
    }
}

-----------------------------------------------------------------------------------------------------------------------------------

##### 5. get_plate_number_list_by_car_size

URL : http://host:port/get_plate_number_list_by_car_size

**require** :
{
    "car_size": (String)
}

Ex. :
{
    "car_size": "large"
}

**response** :
{
    "result": {
        "car_size": (String),
        "total": (Integer),
        "plate_number_list": (Array)
    }
}

Ex. :
{
    "result": {
        "car_size": "large",
        "total": 2,
        "plate_number_list": [
            {
                "plate_number": "PQ24G",
                "active": 0
            },
            {
                "plate_number": "OI861",
                "active": 0
            }
        ]
    }
}

-----------------------------------------------------------------------------------------------------------------------------------

##### 6. get_slot_number_list_by_car_size

URL : http://host:port/get_slot_number_list_by_car_size

**require** :
{
    "car_size": (String)
}

Ex. :
{
    "car_size": "medium"
}

**response** :
{
    "result": {
        "car_size": (String),
        "total": (Integer),
        "slot_number_list": (Array)
    }
}

Ex. :
{
    "result": {
        "car_size": "medium",
        "total": 7,
        "slot_number_list": [
            {
                "park_slot": "B1",
                "active": 0
            },
            {
                "park_slot": "B1",
                "active": 0
            },
            {
                "park_slot": "B2",
                "active": 1
            },
            {
                "park_slot": "B3",
                "active": 1
            },
            {
                "park_slot": "B4",
                "active": 0
            },
            {
                "park_slot": "B5",
                "active": 1
            },
            {
                "park_slot": "B6",
                "active": 1
            }
        ]
    }
}

-----------------------------------------------------------------------------------------------------------------------------------
