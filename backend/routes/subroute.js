import { addNewSubscriber, allSubscribers } from "../controllers/subs.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";
import { Router } from "express";

const subRouter = Router();

subRouter.post("/add", authMiddleware,adminOnly,addNewSubscriber);
subRouter.get("/", authMiddleware, adminOnly, allSubscribers);

export default subRouter;
