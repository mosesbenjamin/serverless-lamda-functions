const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const serverless = require('serverless-http')


const app = express()
app.use(cors())

const videos = [
    {
        id: 0,
        poster: '/video/0/poster',
        duration: '3 mins',
        name: 'Sample 1'
    },
    {
        id: 1,
        poster: '/video/1/poster',
        duration: '4 mins',
        name: 'Sample 2'
    },
    {
        id: 2,
        poster: '/video/2/poster',
        duration: '2 mins',
        name: 'Sample 3'
    },
]



const router = express.Router()


router.get('/video', (req, res)=>{
    res.json(videos)
})

router.get('/video/:id/data', (req, res)=>{
    const id = parseInt(req.params.id, 10)
    res.json(videos[id])
})

router.get('/video/:id', function(req, res) {
    const path = `assets/${req.params.id}.mp4`;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1
        const chunksize = (end-start)+1
        const file = fs.createReadStream(path, {start, end})
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
})

app.get('/video/:id/caption', (req, res)=>{
    res.sendFile('assets/captions/sample.vtt', {
        root: __dirname
    })
})


app.use('/.netlify/functions/api', router)

module.exports.handler = serverless(app)



