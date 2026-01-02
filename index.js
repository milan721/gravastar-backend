require('dotenv').config()
const cors = require('cors')
const express = require('express')
const fs = require('fs')
const path = require('path')
const routes = require('./routes/routes')
require('./config/db')
const gravastarServer = express()

gravastarServer.use(cors())
gravastarServer.use(express.json())


const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}
gravastarServer.use('/uploads', express.static(uploadsDir))

gravastarServer.use(routes)
const PORT = process.env.PORT || 4000;
gravastarServer.listen(PORT,()=>{
    console.log('server started');
    
})
gravastarServer.get('/',(req,res)=>{
    res.status(200).send(`<h1>server started</h1>`)
})
