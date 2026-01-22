import { authenticateToken } from './../middleware/auth';
import { Router } from 'express';
import { createRoot, getPost, reply } from '../controller/postController';

const router = Router();

router.get('/post', getPost);
router.post('/post', authenticateToken , createRoot);
router.post('/post/reply', authenticateToken , reply);

export default router;