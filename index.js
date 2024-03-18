import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import { ErrorHandling } from "./src/core/universal-helper/utils/utils.js";
import helmet from "helmet";
import morgan from "morgan";

import authRouter from "./src/routes/auth.js";
import userRouther from "./src/routes/user.js";

dotenv.config();

const app = express();
const port = parseInt(process.env.SERVER_PORT || 4000);

app.use(cors({
    origin: 'https://pin-chatting.web.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(morgan('dev'));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouther);

app.use(ErrorHandling);

app.listen(port, () => {
    console.log("Server is running on port", port);
});