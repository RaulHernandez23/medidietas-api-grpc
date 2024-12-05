const fs = require('fs');
const path = require('path');

function downloadFile(call, callback) {
    const filePath = call.request.path;
    fs.readFile(filePath, "base64", (err, data) => {
        if (err) {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Imagen no encontrada",
            });
        } else {
            callback(null, { imageData: data });
        }
    });
}

function uploadFile(call, callback) {
    const { username, userType, fileName, imageData} = call.request;
    
    const fileExtension = path.extname(fileName);
    const baseDir = path.join(__dirname, "../resources", userType);
    const newFileName = `${username}${fileExtension}`;
    const filePath = path.join(baseDir, newFileName);

    fs.writeFile(filePath, Buffer.from(imageData, "base64"), (err) => {
        if (err) {
            callback({
                code: grpc.status.INTERNAL,
                details: "Error al guardar la imagen",
            });
        } else {
            console.log(`Imagen de ${username} guardada en: ${filePath}`);
            callback(null, { success: true });
        }
    });
}



module.exports = {
    downloadFile,
    uploadFile,
};