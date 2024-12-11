const grpc = require('@grpc/grpc-js');
const fs = require('fs');
const path = require('path');
const profileImageService = require('../services/profileImageService');
const { constants } = require('buffer');

jest.mock('fs', () => ({
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    unlink: jest.fn(),
    constants: {
        F_OK: 0
    }
}));

describe('Descargar imagen de perfil', () => {
    const baseDir = path.join(__dirname, "../resources/profileImage");
    const mockCall = {
        request: {
            name: 'testImage.jpg'
        }
    };
    const mockCallBack = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debería regresar una imagen si la encuentra', () => {
        const mockData = 'mockBase64ImageData';
        const filePath = path.join(baseDir, mockCall.request.name);

        fs.readFile.mockImplementation((path, encoding, callback) => {
            callback(null, mockData);
        });

        profileImageService.downloadProfileImage(mockCall, mockCallBack);

        expect(fs.readFile).toHaveBeenCalledWith(filePath, 'base64', expect.any(Function));
        expect(mockCallBack).toHaveBeenCalledWith(null, { imageData: mockData });
    });

    test('Deberia regresar NOT_FOUND si no existe', () => {
        const mockError = new Error('File not found');
        const filePath = path.join(baseDir, mockCall.request.name);

        fs.readFile.mockImplementation((_, __, callback) => {
            callback(mockError, null);
        });

        profileImageService.downloadProfileImage(mockCall, mockCallBack);

        expect(fs.readFile).toHaveBeenCalledWith(filePath, 'base64', expect.any(Function));
        expect(mockCallBack).toHaveBeenCalledWith({
            code: grpc.status.NOT_FOUND,
            details: 'Imagen no encontrada',
        });
    });
});

describe('Subir imagen de perfil', () => {
    const baseDir = path.join(__dirname, "../resources/profileImage");
    const mockCall = {
        request: {
            name: 'testImage',
            extension: 'jpg',
            imageData: 'mockBase64ImageData'
        }
    };
    const mockCallBack = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debería guardar la imagen correctamente', () => {
        const fileName = `${mockCall.request.name}.${mockCall.request.extension}`;
        const filePath = path.join(baseDir, fileName);

        fs.writeFile.mockImplementation((path, data, callback) => {
            callback(null);
        });

        profileImageService.uploadProfileImage(mockCall, mockCallBack);

        expect(fs.writeFile).toHaveBeenCalledWith(filePath, Buffer.from(mockCall.request.imageData, 'base64'), expect.any(Function));
        expect(mockCallBack).toHaveBeenCalledWith(null, { result: true, imageName: fileName });
    });

    test('Debería regresar INTERNAL si hay un error al guardar la imagen', () => {
        const mockError = new Error('Error al guardar la imagen');
        const fileName = `${mockCall.request.name}.${mockCall.request.extension}`;
        const filePath = path.join(baseDir, fileName);

        fs.writeFile.mockImplementation((path, data, callback) => {
            callback(mockError);
        });

        profileImageService.uploadProfileImage(mockCall, mockCallBack);

        expect(fs.writeFile).toHaveBeenCalledWith(filePath, Buffer.from(mockCall.request.imageData, 'base64'), expect.any(Function));
        expect(mockCallBack).toHaveBeenCalledWith({
            code: grpc.status.INTERNAL,
            details: 'Error al guardar la imagen',
        });
    });

});

describe('Eliminar imagen de perfil', () => {
    const baseDir = path.join(__dirname, "../resources/profileImage");
    const mockCall = {
        request: {
            name: 'testImage.jpg'
        }
    };
    const mockCallBack = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debería eliminar la imagen correctamente', () => {
        const filePath = path.join(baseDir, mockCall.request.name);

        fs.access.mockImplementation((path, mode, callback) => {
            callback(null);
        });

        fs.unlink.mockImplementation((path, callback) => {
            callback(null);
        });

        profileImageService.deleteProfileImage(mockCall, mockCallBack);

        expect(fs.access).toHaveBeenCalledWith(filePath, fs.constants.F_OK, expect.any(Function));
        expect(fs.unlink).toHaveBeenCalledWith(filePath, expect.any(Function));
        expect(mockCallBack).toHaveBeenCalledWith(null, { result: true });
    });

    test('Debería regresar NOT_FOUND si la imagen no existe', () => {
        const mockError = new Error('File not found');
        const filePath = path.join(baseDir, mockCall.request.name);

        fs.access.mockImplementation((path, mode, callback) => {
            callback(mockError);
        });

        profileImageService.deleteProfileImage(mockCall, mockCallBack);

        expect(fs.access).toHaveBeenCalledWith(filePath, fs.constants.F_OK, expect.any(Function));
        expect(mockCallBack).toHaveBeenCalledWith({
            code: grpc.status.NOT_FOUND,
            details: 'Imagen no encontrada',
        });
    });

    test('Debería regresar INTERNAL si hay un error al eliminar la imagen', () => {
        const mockError = new Error('Error al eliminar la imagen');
        const filePath = path.join(baseDir, mockCall.request.name);

        fs.access.mockImplementation((path, mode, callback) => {
            callback(null);
        });

        fs.unlink.mockImplementation((path, callback) => {
            callback(mockError);
        });

        profileImageService.deleteProfileImage(mockCall, mockCallBack);

        expect(fs.access).toHaveBeenCalledWith(filePath, fs.constants.F_OK, expect.any(Function));
        expect(fs.unlink).toHaveBeenCalledWith(filePath, expect.any(Function));
        expect(mockCallBack).toHaveBeenCalledWith({
            code: grpc.status.INTERNAL,
            details: 'Error al eliminar la imagen',
        });
    });
});