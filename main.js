import {createHelia} from 'helia'
import {unixfs} from '@helia/unixfs'
import {promises as fs} from 'fs' // Import file system promises API
import path from 'path' // Import path module to resolve file paths
import {CID} from 'multiformats/cid'
import {MemoryBlockstore} from 'blockstore-core/memory'


// Create the Helia node
const helia = await createHelia()

// Create a UnixFS instance
const ufs = await unixfs(helia)

async function upload() {


    // The file you want to upload
    const blockstore = new MemoryBlockstore()


    const imagePath = path.resolve('test.png') // Change this to your image path
    const imageContent = await fs.readFile(imagePath) // Read the image as binary data (Buffer)

    // Add the file to IPFS
    const cid = await ufs.addFile({
        content: imageContent
    })

    console.log(cid)

    await download(cid)
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
    await fs.writeFile('tester.jpg', fileContent)
    console.log('Finished')

    return 'OKay'
}

// await upload();
await download('QmfA6Reuorke4MyqNEX9ppAhdfB3dwDKzBXH5agaFJPpNb');


