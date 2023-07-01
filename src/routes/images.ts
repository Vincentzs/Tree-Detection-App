import express, {Request, Response} from "express";
import Parse from "parse/node";
import multer from "multer";
import * as dotenv from "dotenv";
import * as fuzzysort from "fuzzysort";
import * as path from "path";
import sharp from "sharp";
import {v4 as uuidv4} from "uuid";
import exifParser from "exif-parser";
// import multer from "./assests/multerConfig"

// load environment variables from .env file
dotenv.config();

const router = express.Router();

// Set maximum image dimensions and file size (in bytes)
// Multer uses bytes for file size
const MEGABYTE_IN_BYTES: number = 1024 * 1024;
const MAX_IMAGE_WIDTH: number = 800;
const MAX_IMAGE_HEIGHT: number = 1600;
const MAX_IMAGE_SIZE: number = 5 * MEGABYTE_IN_BYTES; // 5 MB
const MAX_SPECIES_CHARACTER_LENGTH: number = 300;
const upload_limits = {fileSize: MAX_IMAGE_SIZE};

// Set up Multer for file uploads
// TODO: Add justification to write up
// Use Multer because Multer has the following benefits:
// - Automatically parses multipart/form-data requests
// - Automatically handles file uploads
const storage: multer.StorageEngine = multer.memoryStorage();

function imageFilter(req: Request, file: multer.File, cb: multer.FileFilterCallback) {
    const file_extension = path.extname(file.originalname).toLowerCase();
    if (file_extension !== ".png" && file_extension !== ".jpg" && file_extension !== ".jpeg") {
        cb(new Error("Only images of type .png, .jpg, and .jpeg are allowed"));
    } else {
        cb(null, true);
    }
}

const upload: multer = multer({
    storage: storage,
    limits: upload_limits,
    fileFilter: imageFilter,
});

// Helper functions for image uploads

// Helper function to check if an image needs to be resized
function requiresResize(metadata: sharp.Metadata) {
    return metadata.width > MAX_IMAGE_WIDTH || metadata.height > MAX_IMAGE_HEIGHT;
}

// Helper function to resize an image using sharp
async function resizeImage(buffer: Buffer) {
    return await sharp(buffer)
        .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {fit: "inside"})
        .toBuffer();
}

// Helper function to extract location data from EXIF metadata
function getLocationFromExif(metadata: sharp.Metadata) {
    let location;
    if (metadata.exif) {
        try {
            const parser = exifParser.create(metadata.exif);
            const result = parser.parse();
            if (
                result.tags.GPSLatitude &&
                result.tags.GPSLongitude &&
                result.tags.GPSLatitudeRef &&
                result.tags.GPSLongitudeRef
            ) {
                location = {
                    GPSLatitude: result.tags.GPSLatitude,
                    GPSLongitude: result.tags.GPSLongitude,
                    GPSLatitudeDirection: result.tags.GPSLatitudeRef,
                    GPSLongitudeDirection: result.tags.GPSLongitudeRef,
                };
            }
        } catch (error) {
        }
    }
    return location;
}

// Helper function to create a new Parse File from an uploaded image
async function createParseFile(processedBuffer, fileName: string, fileExtension: string,
                               sessionToken: string | string[], imagePointer?: Parse.Object): Parse.File {
    if (imagePointer) {
        const oldImage = imagePointer.get("image_file");
        console.log(imagePointer)
        await oldImage.destroy();
    }
    const imageName: string = `${uuidv4()}-${fileName}${fileExtension}`;
    const parseFile = new Parse.File(imageName, {base64: processedBuffer.toString("base64")});
    await parseFile.save({sessionToken: sessionToken});
    // await parseFile.save();
    return parseFile;
}

// Helper function to create a new Image object and associate it with a user
async function saveImage(parseFile: Parse.File, userId: string, sessionToken: string,
                         species?: string, location?: {}, imagePointer?: Parse.Object): Parse.Object {
    const Image: Parse.Object = Parse.Object.extend("Image");
    const image = imagePointer ? imagePointer : new Image();

    // Saving fields of the Image object
    image.set("image_file", parseFile);
    image.set("user_id", Parse.User.createWithoutData(userId));

    if (species) {
        image.set("species", species);
    }

    if (location) {
        image.set("location", location);
    }

    await image.save(null, {sessionToken: sessionToken});
    // await image.save();
    return image;
}

async function imageUploadHelper(uploadedImage: multer.File, sessionToken: string | string[], currentUser: Parse.user,
                                 species?: string, imagePointer?: Parse.Object): Promise<Parse.Object> {
    // Resize image if necessary
    let processedBuffer = uploadedImage.buffer;
    const metadata = await sharp(processedBuffer).metadata();
    let location = getLocationFromExif(metadata);

    // Get filename and extension
    const fileExtension: string = path.extname(uploadedImage.originalname);
    const fileName = path.basename(uploadedImage.originalname, fileExtension);

    if (requiresResize(metadata)) {
        processedBuffer = await resizeImage(processedBuffer);
    }

    // Create new ParseFile and save it
    const file: Parse.File = await createParseFile(processedBuffer, fileName, fileExtension, sessionToken, imagePointer);

    // Create new Image object and associate it with the user
    const savedImage: Parse.Object = await saveImage(file, currentUser.id, sessionToken, species, location, imagePointer);

    return savedImage;
}

// Parse helper to authenticate user in Node.js environment
async function getParseUser(sessionToken: string | string[]): Promise<Parse.User> {
    const query = new Parse.Query(Parse.Session);
    console.log(sessionToken);
    query.equalTo("sessionToken", sessionToken);
    query.include("user");
    query.include("sessionToken");
    const session = await query.first({useMasterKey: true});
    if (session) {
        return session.get("user");
    } else {
        throw new Error("Invalid session token");
    }
}


// Image upload route handlers

export async function performImageUpload(req: Request, res: Response): Promise<void> {
    try {
        // @ts-ignore
        const uploadedImage: multer.File = req.file;
        if (!uploadedImage) {
            throw new Error("No image provided");
        }

        const sessionToken: string | string[] = req.headers.sessiontoken;
        console.log("sessionToken: ", sessionToken, "req.headers: ", req.headers)
        const currentUser = await getParseUser(sessionToken);
        console.log(currentUser)
        const species: string = req.body.species;

        const savedImage = await imageUploadHelper(uploadedImage, sessionToken, currentUser, species);

        console.log(savedImage)

        // Status code 201 "Created"
        res.status(201);
        res.json({success: true, savedImage: savedImage});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export async function getUserImages(req: Request, res: Response) {
    try {
        const sessionToken: string | string[] = req.headers.sessiontoken;
        const currentUser = await getParseUser(sessionToken);
        let species: string | string[] = req.query.species;

        if (typeof species === 'string' || species instanceof String){
            species = [species];
        }

        // Create query to get images associated with current user
        const Image: Parse.Object = Parse.Object.extend("Image");
        const query = new Parse.Query(Image);
        query.equalTo("user_id", currentUser);

        // Execute query and return results
        let results = await query.find({sessionToken: sessionToken});

        // Filter results by species if provided
        let tooLongSpecies = [];
        if (species) {
            tooLongSpecies = species.filter(s => s.length > MAX_SPECIES_CHARACTER_LENGTH);
            species = species.filter(s => s.length <= MAX_SPECIES_CHARACTER_LENGTH);
            // Determine images to keep based on fuzzy search
            // Keep image if any of the species match
            results = results.filter(image => {
                return species.some(s => fuzzysort.single(s, image.get("species")));
            });
        }


        let successStatus = true;
        if (tooLongSpecies.length > 0 || results.length === 0) {
            successStatus = false;
        }

        // Status code 200 "OK"
        res.status(200);
        res.json({success: successStatus, data: results, tooLongSpecies: tooLongSpecies});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export async function deleteUserImage(req: Request, res: Response) {
    try {
        const sessionToken: string | string[] = req.headers.sessiontoken;
        const imageId: string = req.body.imageId;

        // Create a pointer to the Image object with the specified imageId
        const Image: Parse.Object = Parse.Object.extend("Image");
        const imagePointer = Image.createWithoutData(imageId);

        // Delete the Image object
        await imagePointer.destroy({sessionToken});

        // Status code 200 "OK"
        res.status(200);
        res.json({success: true});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export async function updateUserImage(req: Request, res: Response) {
    try {
        const sessionToken: string | string[] = req.headers.sessiontoken;
        const imageId: string = req.body.imageId;
        const currentUser = await getParseUser(sessionToken);
        const species: string = req.body.species;
        const location: {
            GPSLatitude: number,
            GPSLongitude: number,
            GPSLatitudeDirection: string,
            GPSLongitudeDirection: string
        } = req.body.location;

        // Create a pointer to the Image object with the specified imageId
        const Image: Parse.Object = Parse.Object.extend("Image");

        // Query for the Image object matching the imageId
        const query = new Parse.Query(Image);
        query.equalTo("objectId", imageId);
        let imagePointer = await query.first({sessionToken});

        console.log(imagePointer.get("species"), imagePointer.get("image_file"));

        // Update the species and location fields of the Image object
        if (species) {
            if (species.length > MAX_SPECIES_CHARACTER_LENGTH) {
                throw new Error("Species name too long");
            }
            imagePointer.set("species", species);
        }

        // Location should be a dictionary with keys GPSLatitude and GPSLongitude
        // and GPSLatitudeDirection and GPSLongitudeDirection
        if (location) {
            if (
                location.GPSLatitude &&
                location.GPSLongitude &&
                location.GPSLatitudeDirection &&
                location.GPSLongitudeDirection
            ) {
                imagePointer.set("location", location);
            } else {
                // Return error with missing fields
                let missingFields = [];
                if (!location.GPSLatitude) {
                    missingFields.push("GPSLatitude");
                }
                if (!location.GPSLongitude) {
                    missingFields.push("GPSLongitude");
                }
                if (!location.GPSLatitudeDirection) {
                    missingFields.push("GPSLatitudeDirection");
                }
                if (!location.GPSLongitudeDirection) {
                    missingFields.push("GPSLongitudeDirection");
                }
                throw new Error(`Missing fields: ${missingFields.join(", ")}`);
            }
        }

        // If an image file was provided in the request, update the image field of the Image object
        if (req.file) {
            // @ts-ignore
            const uploadedImage: multer.File = req.file;
            imagePointer = await imageUploadHelper(uploadedImage, sessionToken, currentUser, species, imagePointer);
        }else{ 
            await imagePointer.save(null, {sessionToken});
        }

        // Status code 200 "OK"
        res.status(200);
        res.json({success: true, savedImage: imagePointer});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

/**
 CRUD routes for user images
 **/

// Route for uploading user images
// Form should upload the field "image" as a file
router.post("/uploadImage", upload.single("image"), performImageUpload);

// Route for getting user images
router.get("/getImages", getUserImages);

// Route for updating user images
router.put("/updateImage", upload.single("image"), updateUserImage);

// Route for deleting user images
router.delete("/deleteImage", deleteUserImage);

export default router;
export {
  imageFilter,
  getParseUser,
  createParseFile,
  saveImage,
  imageUploadHelper,
};
