import pool from "../db.js";
import { validationResult } from "express-validator";

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
}

export async function list(req, res, next) {
  try {
    const v = validate(req, res);
    if (v) return;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
    const offset = (page - 1) * limit;

    const sortParam = String(req.query.sort || "created_at:desc");
    const [field, dirRaw] = sortParam.split(":");
    const allowed = [
      "id",
      "name",
      "price",
      "stock",
      "created_at",
      "updated_at",
    ];
    const dir = (dirRaw || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const orderBy = allowed.includes(field) ? field : "created_at";

    const q = req.query.q ? `%${req.query.q}%` : null;
    const categoryId = req.query.category_id
      ? Number(req.query.category_id)
      : null;

    let where = "WHERE 1=1";
    const params = {};
    if (q) {
      where += " AND (name LIKE :q OR description LIKE :q OR sku LIKE :q)";
      params.q = q;
    }
    if (categoryId) {
      where += " AND category_id = :categoryId";
      params.categoryId = categoryId;
    }

    const [items] = await pool.query(
      `SELECT SQL_CALC_FOUND_ROWS 
id,name,description,price,stock,sku,category_id,image_url,created_at,upd
 ated_at 
       FROM products ${where} 
       ORDER BY ${orderBy} ${dir} 
       LIMIT :limit OFFSET :offset`,
      { ...params, limit, offset }
    );
    const [[{ total }]] = await pool.query("SELECT FOUND_ROWS() AS total");
    res.json({ page, limit, total, items });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const v = validate(req, res);
    if (v) return;
    const id = Number(req.params.id);
    const [rows] = await pool.query("SELECT * FROM products WHERE id = :id", {
      id,
    });
    if (!rows.length)
      return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const v = validate(req, res);
    if (v) return;
    const { name, description, price, stock, sku, category_id, image_url } =
      req.body;
    const [result] = await pool.query(
      `INSERT INTO products 
(name,description,price,stock,sku,category_id,image_url) 
       VALUES 
(:name,:description,:price,:stock,:sku,:category_id,:image_url)`,
      { name, description, price, stock, sku, category_id, image_url }
    );
    const [rows] = await pool.query("SELECT * FROM products WHERE id = :id", {
      id: result.insertId,
    });
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY")
      return res.status(409).json({
        message: "SKU already exists",
      });
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const v = validate(req, res);
    if (v) return;
    const id = Number(req.params.id);
    const { name, description, price, stock, sku, category_id, image_url } =
      req.body;

    const [[exists]] = await pool.query(
      "SELECT id FROM products WHERE id = :id",
      { id }
    );
    if (!exists) return res.status(404).json({ message: "Product not found" });

    await pool.query(
      `UPDATE products SET 
        name=:name, description=:description, price=:price, 
stock=:stock, 
        sku=:sku, category_id=:category_id, image_url=:image_url 
       WHERE id=:id`,
      { id, name, description, price, stock, sku, category_id, image_url }
    );
    const [[row]] = await pool.query("SELECT * FROM products WHERE id = :id", {
      id,
    });
    res.json(row);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "SKU already exists" });
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const v = validate(req, res);
    if (v) return;
    const id = Number(req.params.id);
    const [[exists]] = await pool.query(
      "SELECT id FROM products WHERE id = :id",
      { id }
    );
    if (!exists) return res.status(404).json({ message: "Product not found" });
    await pool.query("DELETE FROM products WHERE id = :id", { id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
