import express, {Express} from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import login, {initializeParse} from "./routes/login";
import images from "./routes/images";

dotenv.config();

const app: Express = express();
const port= (process.env.PORT || process.env.DEV_PORT)

initializeParse();

app.use(express.json());
app.use(cors())
app.use("/draft", login);
app.use("/draft/images", images)

app.get("/", async (req, res, next) => {
    res.status(200).json({ ping: "pong" });
});

app.listen(port, () => {
    console.log(`Korotu server listening on ${port}`);
});
