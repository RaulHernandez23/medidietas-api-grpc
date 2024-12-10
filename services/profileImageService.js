const fs = require('fs');
const path = require('path');

function downloadProfileImage(call, callback) {
    const baseDir = path.join(__dirname, "../resources/profileImage");
    const filePath = path.join(baseDir, call.request.name);
    
    fs.readFile(filePath, "base64", (err, data) => {
        if (err) {
            console.log(`Error al leer la imagen: ${err}`);
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
            console.log(`Error al guardar la imagen: ${err}`);
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

function deleteProfileImage(call, callback) {
    const baseDir = path.join(__dirname, "../resources/profileImage");
    const filePath = path.join(baseDir, call.request.name);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`Error al acceder a la imagen: ${err}`);
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Imagen no encontrada",
            });
        } else {
            fs.unlink(filePath, (err) => {
                if (err) {
                    callback({
                        code: grpc.status.INTERNAL,
                        details: "Error al eliminar la imagen",
                    })
                } else {
                    console.log(`Imagen eliminada de: ${filePath}`);
                    callback(null, { result: true });
                }
            })
        }
    })
}



module.exports = {
    uploadProfileImage,
    downloadProfileImage,
    deleteProfileImage,
};