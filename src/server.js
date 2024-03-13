import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import { ErrorHandling } from "./core/universal-helper/utils/utils.js";
import helmet from "helmet";

import authRouter from "./routes/auth.js";
import userRouther from "./routes/user.js";

dotenv.config();

const app = express();
// const port = parseInt(process.env.SERVER_PORT || 4000);

// console.log("Server is running on port", port);
app.use(cors({
    credentials: true,
    origin: ["https://pin-chatting.web.app/"]
}));

app.use((req, res, next) => {
    const allowedOrigins = ["https://pin-chatting.web.app/"];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
})

app.use(morgan('dev'));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouther);

app.use(ErrorHandling);

// app.listen(port, () => {
//     console.log("Server is running on port", port);
// });

export default app;