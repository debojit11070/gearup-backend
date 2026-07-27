import { Router } from 'express';
import { addGear, updateGear, removeGear, myGear } from './provider.controller';
import { validate } from '../../middlewares/validate';
import { createGearSchema, updateGearSchema } from '../gear/gear.validation';
import { auth, requireRole } from '../../middlewares/auth';

const router = Router();

router.use(auth, requireRole('PROVIDER'));

router.get('/gear', myGear);
router.post('/gear', validate(createGearSchema), addGear);
router.put('/gear/:id', validate(updateGearSchema), updateGear);
router.delete('/gear/:id', removeGear);

export const providerRouter = router;
