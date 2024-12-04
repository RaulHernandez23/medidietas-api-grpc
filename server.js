const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require("path");

const PROTO_PATH = path.join(__dirname, "./proto/imageService.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const imagenProto = grpc.loadPackageDefinition(packageDefinition).imageService;

const imageServiceImpl = require('./services/imageService');

function main() {
    const server = new grpc.Server();

    server.addService(imagenProto.ImageService.service, imageServiceImpl);

    const port = "0.0.0.0:50051";

    server.bindAsync(
        port,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error(`Error al iniciar el servidor: ${error.message}`);
                return;
            }
            console.log(`Servidor gRPC escuchando en ${port}`);
        }
    )
}

main();