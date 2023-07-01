import {
  performImageUpload,
  getUserImages,
  deleteUserImage,
  updateUserImage,
  imageFilter,
  getParseUser,
  createParseFile,
  saveImage,
  imageUploadHelper,
} from '../src/routes/images';
import * as parseHelper from '../src/routes/assests/parseHelper';
import { Request, Response } from 'express';
import Parse from 'parse/node';
import {MASTER_KEY} from "../src/routes/app_constants"
jest.spyOn(parseHelper, 'getParseUser').mockImplementation(() => Promise.resolve(mockUser));
// Mock the Parse.File.prototype.save method to throw an error
Parse.File.prototype.save = jest.fn().mockRejectedValue(new Error('Failed to save file'));
// Add this line to mock the getParseUser function
// getParseUser.mockImplementation(() => Promise.resolve(mockUser));
const mockRequest = (file: Express.Multer.File, sessionToken: string) => {
  return {
    file,
    headers: {
      sessiontoken: sessionToken,
    },
  } as Request;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockUser = {
  username: "test",
  createdAt: "2023-02-17T04:41:30.244Z",
  updatedAt: "2023-02-17T04:41:30.244Z",
  ACL: {"*": {read: true}, G1WhgToMPP: {read: true, write: true}},
  signUp: jest.fn(),
  getSessionToken: jest.fn(),
};

// jest.spyOn(getParseUser, 'getParseUser').mockImplementation(() => Promise.resolve(mockUser));
describe('Image upload tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle image upload failure due to lack of master key', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'image',
      originalname: 'test_image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('mock image content'),
      size: 100,
    };

    const sessionToken = 'mock-session-token';
    const req = mockRequest(mockFile, sessionToken);
    const res = mockResponse();

    await performImageUpload(req, res);
    console.log("Error message:", res.json.mock.calls); //[0][0].error);
    // Add your assertions based on your performImageUpload implementation
    expect(res.status).toHaveBeenCalledWith(400);

  });

  it('should handle errors during image upload', async () => {
    const sessionToken = 'mock-session-token';
    const req = mockRequest(undefined, sessionToken);
    const res = mockResponse();

    await performImageUpload(req, res);

    // Add your assertions based on your performImageUpload implementation when there's an error
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });
});

// Failure test for imageFilter
describe('imageFilter', () => {
  it('should reject non-image files', (done) => {
    const req = {} as multer.Request;
    const file = {
      originalname: 'test.txt',
    } as multer.File;
    const cb = (error: Error | null, acceptFile: boolean) => {
      expect(error).toBeTruthy();
      expect(error.message).toBe('Only images of type .png, .jpg, and .jpeg are allowed');
      expect(acceptFile).toBeFalsy();
      done();
    };

    imageFilter(req, file, cb);
  });
});

// Failure test for createParseFile
describe('createParseFile', () => {
  it('should throw an error when saving a Parse File fails', async () => {
    const buffer = Buffer.from('test');
    const fileName = 'testFile';
    const fileExtension = '.jpg';
    const sessionToken = 'testSessionToken';

    await expect(createParseFile(buffer, fileName, fileExtension, sessionToken)).rejects.toThrow('Failed to save file');
  });
});

// Mock the Parse.Object.prototype.save method to throw an error
Parse.Object.prototype.save = jest.fn().mockRejectedValue(new Error('Failed to save image'));

// Failure test for saveImage
describe('saveImage', () => {
  it('should throw an error when saving an Image object fails', async () => {
    const parseFile = new Parse.File('test.jpg', { base64: 'dGVzdA==' });
    const userId = 'testUserId';
    const sessionToken = 'testSessionToken';

    await expect(saveImage(parseFile, userId, sessionToken)).rejects.toThrow('Failed to save image');
  });
});

// Mock the metadata function in sharp to throw an error
jest.mock('sharp', () => {
  return () => {
    return {
      metadata: jest.fn().mockRejectedValue(new Error('Failed to get metadata')),
    };
  };
});

// Failure test for imageUploadHelper
describe('imageUploadHelper', () => {
  it('should throw an error when getting metadata fails', async () => {
    const uploadedImage = {
      buffer: Buffer.from('test'),
      originalname: 'test.jpg',
    } as unknown as multer.File;
    const sessionToken = 'testSessionToken';
    const currentUser = new Parse.User();

    await expect(imageUploadHelper(uploadedImage, sessionToken, currentUser)).rejects.toThrow('Failed to get metadata');
  });
});