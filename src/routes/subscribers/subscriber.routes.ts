import express from "express";
import { subscribe } from "../../controllers/subscribers/subscriber.controller";

const router = express.Router();

router.post("/", subscribe);

export default router;
