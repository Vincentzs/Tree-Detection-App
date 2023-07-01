import * as dotenv from "dotenv";

// load environment variables from .env file
dotenv.config();


// login app constants
export const PARSE_APP_ID: string = process.env.PARSE_APP_ID;
export const PARSE_JAVASCRIPT_KEY: string = process.env.PARSE_JAVASCRIPT_KEY;
export const MASTER_KEY: string = process.env.MASTER_KEY;