import express from "express";
import router from "./route.js";

const app = express();

app.use("/", router);

app.listen(3310, () => {
  console.log("app is listening to the port 3310");
});
