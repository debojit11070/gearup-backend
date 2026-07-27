import { Router } from 'express';
import { createReview, gearReviews } from './reviews.controller';
import { validate } from '../../middlewares/validate';
import { createReviewSchema } from './reviews.validation';
import { auth, requireRole } from '../../middlewares/auth';

const router = Router();

router.post('/', auth, requireRole('CUSTOMER'), validate(createReviewSchema), createReview);
router.get('/gear/:gearItemId', gearReviews);

export const reviewsRouter = router;
