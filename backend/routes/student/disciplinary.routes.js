import express from 'express';
import {
    getMyDisciplinaryRecords,
    getDisciplinaryRecord,
    createDisciplinaryRecord,
    updateDisciplinaryRecord,
    resolveRecord,
    deleteDisciplinaryRecord
} from '../../controllers/student/disciplinary.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Student — read only
router.get('/', authorize('student', 'admin', 'faculty'), getMyDisciplinaryRecords);
router.get('/:id', authorize('student', 'admin', 'faculty'), getDisciplinaryRecord);

// Faculty / Admin — create + update
router.post('/', authorize('admin', 'faculty'), createDisciplinaryRecord);
router.put('/:id', authorize('admin', 'faculty'), updateDisciplinaryRecord);
router.put('/:id/resolve', authorize('admin', 'faculty'), resolveRecord);
router.delete('/:id', authorize('admin'), deleteDisciplinaryRecord);

export default router;
