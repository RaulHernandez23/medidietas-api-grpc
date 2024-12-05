const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require("path");
const fs = require("fs");

const PROTO_PATH = path.join(__dirname, "../proto/imageService.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const imagenProto = grpc.loadPackageDefinition(packageDefinition).imageService;

function main() {
    const profileClient = new imagenProto.ProfileImageService("localhost:50051",
        grpc.credentials.createInsecure()
    );

    const profilePath = path.join(__dirname, "../resources/juan23_profile.jpg");

    profileClient.downloadFile({ path: profilePath }, (error, response) => {
        if(!error) {
            const outputPath = path.join(__dirname, "downloaded_profile.jpg");
            fs.writeFile(outputPath, response.imageData, "base64", (err) => {
                if (err) {
                    console.error("Error al guardar la imagen: ", err.message);
                } else {
                    console.log("Imagen de perfil guardada en: ", outputPath);
                }
            });
        } else {
            console.error("Error: ", error.message);
        }
    });

    const filePath = path.join(__dirname, "./pedro12_profile.png");
    fs.readFile(filePath, "base64", (err, imageData) => {
        if (err) {
            console.error("Error al leer el archivo para subir: ", err.message);
            return;
        }

        const uploadRequest = {
            username: "juan23",
            userType: "nutritionExpert",
            fileName: "pedro12_profile.png",
            imageData: imageData,
        };

        profileClient.uploadFile(uploadRequest, (error, response) => {
            if (!error) {
                console.log("Respuesta del servidor: ", response.success);
            } else {
                console.error("Error al subir la imagen: ", error.message);
            }
        });
    });
}

main();