import { Router, type IRouter } from "express";
import healthRouter from "./health";
import oracleRouter from "./oracle";
import tomesRouter from "./tomes";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tomesRouter);
router.use(oracleRouter);
router.use(adminRouter);

export default router;
