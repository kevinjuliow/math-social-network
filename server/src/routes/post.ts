import { authenticateToken } from './../middleware/auth.js';
import { Router } from 'express';
import { createRoot, getPost, reply } from '../controller/postController.js';

const router = Router();

router.get('/post', getPost);
router.post('/post', authenticateToken , createRoot);
router.post('/post/reply', authenticateToken , reply);

export default router;