import express from "express";
import helmet from "helmet";
import bodyParser from "body-parser";

import routes from "./routes";

const ADDRESS = process.env.ADDRESS || "0.0.0.0";
const PORT = (process.env.PORT) ? parseInt(process.env.PORT) : 3000; 

const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(routes);

app.listen(PORT, ADDRESS, () => {
  console.log(`API listening at ${ADDRESS}:${PORT}`);
});
