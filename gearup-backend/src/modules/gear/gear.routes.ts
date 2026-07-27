import { Router } from 'express';
import { listGear, getGear } from './gear.controller';
import { validate } from '../../middlewares/validate';
import { gearQuerySchema } from './gear.validation';

const router = Router();

router.get('/', validate(gearQuerySchema, 'query'), listGear);
router.get('/:id', getGear);

export const gearRouter = router;
