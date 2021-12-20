import { Router } from 'express';
const router = Router();

router.get('/test', (_, res) => {
  res.send({ response: 'I am alive' }).status(200);
});

export default router;
