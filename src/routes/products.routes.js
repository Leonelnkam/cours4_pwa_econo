import { Router } from 'express'; 
import * as controller from '../controllers/products.controller.js'; 
import { idParam, listQuery, createBody, updateBody } from 
'../validators/products.validator.js'; 
 
const router = Router(); 
router.get('/', listQuery, controller.list); 
router.get('/:id', idParam, controller.getById); 
router.post('/', createBody, controller.create); 
router.put('/:id', updateBody, controller.update); 
router.delete('/:id', idParam, controller.remove); 
export default router; 