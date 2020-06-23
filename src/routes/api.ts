import * as express from 'express';
import {biggest100, biggestdb} from "../controllers/api";

const router = express.Router()

router.get('/biggest100', biggest100)
router.get('/biggestdb', biggestdb)

export {router}