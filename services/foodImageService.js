const fs = require('fs');
const path = require('path');

function downloadFoodImage(call, callback) {
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

function uploadFoodImage(call, callback) {
    const { fileName, imageData} = call.request;
    
    const baseDir = path.join(__dirname, "../resources/food");
    const filePath = path.join(baseDir, fileName);

    fs.writeFile(filePath, Buffer.from(imageData, "base64"), (err) => {
        if (err) {
            callback({
                code: grpc.status.INTERNAL,
                details: "Error al guardar la imagen",
            });
        } else {
            callback(null, { success: true });
        }
    });
}

module.exports = {
    downloadFoodImage,
    uploadFoodImage,
};