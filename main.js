import {createHelia} from 'helia'
import {unixfs} from '@helia/unixfs'
import {promises as fs} from 'fs' // Import file system promises API
import path from 'path' // Import path module to resolve file paths
import {CID} from 'multiformats/cid'
import fileupload from 'express-fileupload'
import express from 'express'

const app = express()
const port = 3021
app.use(fileupload());

// Create the Helia node
const helia = await createHelia()

// Create a UnixFS instance
const ufs = await unixfs(helia)

async function upload(file) {


    // The file you want to upload


    // Add the file to IPFS
    const cid = await ufs.addFile({
        content: file
    })


    return cid.toString()
}

async function download(id) {

    console.log('Downloading ...')
    const cid = CID.parse(id)

    const file = await ufs.cat(cid)

    const fileChunks = []
    for await (const chunk of file) {
        fileChunks.push(chunk)
    }

    console.log('Wait ...')

    // Combine all chunks into a single buffer
    const fileContent = Buffer.concat(fileChunks)

    // Write the file to disk (optional)
    await fs.writeFile(id, fileContent)
    console.log('Finished')

    return fileContent
}

// await upload();


app.get('/', (req, res) => {
    res.send('Ok')
})


app.route('/upload').post(async function (req, res, next) {

    const file = req.files.file.data

    const cid = await upload(file);


    return res.json({
        cid
    })
});


app.route('/download/:id').get(async function (req, res, next) {

    const id = req.params.id

    return await download(id);


    // return res.download(id)
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
