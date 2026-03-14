// Génère des icônes PNG minimalistes pour PWA
// Crée des PNG valides avec un fond dégradé simple

const fs = require('fs');

function createPNG(size) {
    // Créer un PNG basique avec un fond coloré
    // Structure PNG: signature + IHDR + IDAT + IEND
    
    const width = size;
    const height = size;
    
    // Pixel data (RGBA) - gradient purple to pink
    const rawData = [];
    for (let y = 0; y < height; y++) {
        rawData.push(0); // filter byte
        for (let x = 0; x < width; x++) {
            const t = (x + y) / (width + height);
            const r = Math.round(155 + t * 87);  // 155 -> 242
            const g = Math.round(114 - t * 47);  // 114 -> 167
            const b = Math.round(207 - t * 12);  // 207 -> 195
            
            // Circle mask
            const cx = x - width/2, cy = y - height/2;
            const dist = Math.sqrt(cx*cx + cy*cy);
            const radius = width * 0.45;
            const alpha = dist < radius ? 255 : 0;
            
            rawData.push(r, g, b, alpha);
        }
    }
    
    const raw = Buffer.from(rawData);
    
    // Deflate the raw data
    const zlib = require('zlib');
    const compressed = zlib.deflateSync(raw);
    
    // PNG signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    
    // IHDR chunk
    const ihdr = createChunk('IHDR', Buffer.from([
        ...uint32(width), ...uint32(height),
        8, // bit depth
        6, // color type (RGBA)
        0, // compression
        0, // filter
        0  // interlace
    ]));
    
    // IDAT chunk
    const idat = createChunk('IDAT', compressed);
    
    // IEND chunk
    const iend = createChunk('IEND', Buffer.alloc(0));
    
    return Buffer.concat([signature, ihdr, idat, iend]);
}

function uint32(val) {
    return [(val >> 24) & 0xff, (val >> 16) & 0xff, (val >> 8) & 0xff, val & 0xff];
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    
    const typeBuffer = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBuffer, data]);
    
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData));
    
    return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
        crc ^= buf[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

fs.writeFileSync('icon-192.png', createPNG(192));
fs.writeFileSync('icon-512.png', createPNG(512));
console.log('Created icon-192.png and icon-512.png');
