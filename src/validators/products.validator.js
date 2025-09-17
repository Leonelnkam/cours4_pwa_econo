import { body, param, query } from 'express-validator'; 
 
export const idParam = [ param('id').isInt({ min: 1 }) ]; 
export const listQuery = [ 
  query('page').optional().isInt({ min: 1 }), 
  query('limit').optional().isInt({ min: 1, max: 100 }), 
  query('sort').optional().isString(), 
  query('q').optional().isString().isLength({ min: 1, max: 255 }), 
  query('category_id').optional().isInt({ min: 1 }) 
]; 
export const createBody = [ 
  body('name').isString().trim().isLength({ min: 2, max: 255 }), 
  body('description').optional().isString().isLength({ max: 5000 }), 
  body('price').isFloat({ min: 0 }), 
  body('stock').isInt({ min: 0 }), 
  body('sku').isString().trim().isLength({ min: 2, max: 64 }), 
  body('category_id').optional().isInt({ min: 1 }), 
  body('image_url').optional().isURL() 
]; 
export const updateBody = [ ...idParam, ...createBody ];