const fs = require('fs');
const path = require('path');

function downloadProfileImage(call, callback) {
    const baseDir = path.join(__dirname, "../resources/profileImage");
    const filePath = path.join(baseDir, call.request.name);
    
    fs.readFile(filePath, "base64", (err, data) => {
        if (err) {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Imagen no encontrada",
            });
        } else {
            console.log(`Imagen encontrada en: ${filePath}`);
            callback(null, { imageData: data });
        }
    });
}

function uploadProfileImage(call, callback) {
    const { name, extension, imageData} = call.request;
    
    const baseDir = path.join(__dirname, "../resources/profileImage");
    const fileName = `${name}.${extension}`;
    const filePath = path.join(baseDir, fileName);

    fs.writeFile(filePath, Buffer.from(imageData, "base64"), (err) => {
        if (err) {
            callback({
                code: grpc.status.INTERNAL,
                details: "Error al guardar la imagen",
            });
        } else {
            console.log(`Imagen guardada en: ${filePath}`);
            callback(null, { 
                result: true,
                imageName: fileName 
            });
        }
    });
}



module.exports = {
    uploadProfileImage,
    downloadProfileImage,
};