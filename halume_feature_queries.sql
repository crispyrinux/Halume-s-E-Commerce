-- ==========================================================
-- HALUME E-COMMERCE CORE QUERY LIBRARY
-- ==========================================================
-- Digunakan untuk fitur utama e-commerce parfum
-- ==========================================================

-- ==========================================================
-- 1. USER MANAGEMENT
-- ==========================================================

-- Register user baru
INSERT INTO users (email, password_hash, full_name)
VALUES ('[user@email.com](mailto:user@email.com)', 'hashed_password', 'Nama User');

-- Login (mencari user berdasarkan email)
SELECT *
FROM users
WHERE email = '[user@email.com](mailto:user@email.com)';

-- Mendapatkan profil user
SELECT id, email, full_name, role, created_at
FROM users
WHERE id = 1;

-- ==========================================================
-- 2. ADDRESS MANAGEMENT
-- ==========================================================

-- Menambahkan alamat baru
INSERT INTO addresses
(user_id, recipient_name, phone_number, address_line, city, postal_code, is_primary)
VALUES
(1,'Hammam Yazid','08123456789','Jl. Kaliurang KM 10','Yogyakarta','55281',1);

-- Melihat semua alamat user
SELECT *
FROM addresses
WHERE user_id = 1;

-- Update alamat
UPDATE addresses
SET address_line = 'Jl. Kaliurang KM 11'
WHERE id = 2;

-- Menghapus alamat
DELETE FROM addresses
WHERE id = 2;

-- ==========================================================
-- 3. PRODUCT & CATEGORY
-- ==========================================================

-- Melihat semua kategori parfum
SELECT *
FROM categories;

-- Menambahkan kategori
INSERT INTO categories (name, slug)
VALUES ('Floral','floral');

-- Menambahkan produk parfum
INSERT INTO products
(category_id, name, description, price, stock, sku, image_url)
VALUES
(1,'Rose Elegance','Parfum floral dengan aroma mawar',350000,50,'PRF001','rose.jpg');

-- Detail produk
SELECT
p.id,
p.name,
p.description,
p.price,
p.stock,
c.name AS category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.id = 1;

-- ==========================================================
-- 4. SEARCH & DISCOVERY
-- ==========================================================

-- Melihat semua produk aktif
SELECT
p.id,
p.name,
p.price,
p.stock,
p.image_url,
c.name AS category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = 1;

-- Search parfum berdasarkan nama
SELECT *
FROM products
WHERE name LIKE '%rose%'
AND is_active = 1;

-- Filter produk berdasarkan kategori
SELECT p.*
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'floral';

-- Filter berdasarkan harga
SELECT *
FROM products
WHERE price BETWEEN 100000 AND 500000
AND is_active = 1;

-- Sorting produk berdasarkan harga termurah
SELECT *
FROM products
WHERE is_active = 1
ORDER BY price ASC;

-- Produk stok hampir habis
SELECT *
FROM products
WHERE stock < 5;

-- ==========================================================
-- 5. CART MANAGEMENT
-- ==========================================================

-- Membuat cart untuk user
INSERT INTO carts (user_id)
VALUES (1);

-- Menambahkan produk ke cart
INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES (1,5,2);

-- Update quantity produk di cart
UPDATE cart_items
SET quantity = 3
WHERE cart_id = 1
AND product_id = 5;

-- Menghapus produk dari cart
DELETE FROM cart_items
WHERE cart_id = 1
AND product_id = 5;

-- Melihat isi cart user
SELECT
p.id,
p.name,
p.price,
ci.quantity,
(p.price * ci.quantity) AS subtotal
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
JOIN carts c ON ci.cart_id = c.id
WHERE c.user_id = 1;

-- Total harga cart
SELECT
SUM(p.price * ci.quantity) AS total_price
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
JOIN carts c ON ci.cart_id = c.id
WHERE c.user_id = 1;

-- ==========================================================
-- 6. CHECKOUT PROCESS
-- ==========================================================

-- Membuat order dari cart
INSERT INTO orders (user_id, total_amount, status)
VALUES (1, 750000, 'awaiting_payment');

-- Memasukkan item order
INSERT INTO order_items
(order_id, product_id, quantity, price_at_purchase)
VALUES
(10,3,1,250000),
(10,7,2,250000);

-- Mengurangi stok setelah checkout
UPDATE products
SET stock = stock - 1
WHERE id = 3;

-- ==========================================================
-- 7. ORDER MANAGEMENT
-- ==========================================================

-- Melihat semua order user
SELECT *
FROM orders
WHERE user_id = 1
ORDER BY created_at DESC;

-- Detail order
SELECT
p.name,
oi.quantity,
oi.price_at_purchase,
(oi.quantity * oi.price_at_purchase) AS subtotal
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = 10;

-- Update status order
UPDATE orders
SET status = 'processing'
WHERE id = 10;

-- ==========================================================
-- 8. PAYMENT PROCESSING
-- ==========================================================

-- Membuat data pembayaran
INSERT INTO payments
(order_id, payment_method, payment_status)
VALUES
(10,'midtrans','pending');

-- Update pembayaran sukses
UPDATE payments
SET payment_status = 'success',
transaction_time = NOW()
WHERE order_id = 10;

-- Update order setelah pembayaran sukses
UPDATE orders
SET status = 'processing'
WHERE id = 10;

-- ==========================================================
-- 9. SHIPPING MANAGEMENT
-- ==========================================================

-- Membuat data pengiriman
INSERT INTO shipments
(order_id, courier_name, tracking_number, shipped_at)
VALUES
(10,'JNE','JNE123456789',NOW());

-- Update status pengiriman
UPDATE shipments
SET status = 'terkirim'
WHERE order_id = 10;

-- Melihat status pengiriman
SELECT
o.id AS order_id,
s.courier_name,
s.tracking_number,
s.status
FROM shipments s
JOIN orders o ON s.order_id = o.id
WHERE o.user_id = 1;

-- ==========================================================
-- 10. ADMIN PRODUCT MANAGEMENT
-- ==========================================================

-- Update stok produk
UPDATE products
SET stock = 100
WHERE id = 5;

-- Menonaktifkan produk
UPDATE products
SET is_active = 0
WHERE id = 5;

-- Menghapus produk
DELETE FROM products
WHERE id = 5;

-- ==========================================================
-- 11. ANALYTICS & REPORTING
-- ==========================================================

-- Produk paling laris
SELECT
p.name,
SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 10;

-- Total revenue toko
SELECT
SUM(total_amount) AS total_revenue
FROM orders
WHERE status = 'completed';

-- Total order
SELECT COUNT(*) AS total_orders
FROM orders;

-- Revenue per hari
SELECT
DATE(created_at) AS order_date,
SUM(total_amount) AS daily_revenue
FROM orders
GROUP BY DATE(created_at);

-- ==========================================================
-- 12. RECOMMENDATION
-- ==========================================================

-- Related product berdasarkan kategori
SELECT *
FROM products
WHERE category_id =
(
SELECT category_id
FROM products
WHERE id = 1
)
AND id != 1
LIMIT 5;

-- Produk paling populer
SELECT
p.id,
p.name,
SUM(oi.quantity) AS total_sold
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 5;
