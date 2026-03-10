-- ================================================================
--  HALUME PERFUME E-COMMERCE
--  SQL Query Documentation — Berdasarkan Mock Data
--  Proyek WRPL · Universitas Gadjah Mada
-- ================================================================
-- Catatan parameter:
--   :param  = nilai dikirim dari backend (Node.js / NestJS)
-- ================================================================



-- ================================================================
-- 1. SEARCH & DISCOVERY
--    Fitur pencarian parfum oleh user
-- ================================================================

-- 1.1 Pencarian Parfum berdasarkan Nama
--     Contoh: user mencari parfum dengan kata "elixir"
--     Akan menemukan: "Halume Marco Élixir"

SELECT id, name, price, stock
FROM products
WHERE name LIKE CONCAT('%', :keyword, '%');


-- 1.2 Pencarian dengan Filter Kategori & Harga
--     Contoh: cari parfum kategori Limited Edition (id=1)
--     dengan harga antara 400rb – 700rb

SELECT
    p.id,
    p.name,
    p.price,
    c.name AS category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.category_id = :category_id
AND p.price BETWEEN :min_price AND :max_price
ORDER BY p.price ASC;


-- 1.3 Autocomplete / Suggest Nama Parfum
--     Digunakan untuk live search saat user mengetik
--     Contoh: user mengetik "Halume D"

SELECT id, name
FROM products
WHERE name LIKE CONCAT(:keyword, '%')
LIMIT 5;



-- ================================================================
-- 2. CART MANAGEMENT
--    Pengelolaan keranjang belanja
-- ================================================================

-- 2.1 Tambah Produk ke Keranjang
--     Contoh: user menambahkan parfum id=1 sebanyak 2 item

INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES (:cart_id, :product_id, :quantity);


-- 2.2 Melihat Isi Keranjang

SELECT
    ci.id,
    p.name,
    p.price,
    ci.quantity,
    (p.price * ci.quantity) AS subtotal
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.cart_id = :cart_id;


-- 2.3 Update Jumlah Produk di Keranjang

UPDATE cart_items
SET quantity = :quantity
WHERE id = :cart_item_id;


-- 2.4 Hapus Produk dari Keranjang

DELETE FROM cart_items
WHERE id = :cart_item_id;



-- ================================================================
-- 3. ORDER PROCESS
--    Proses checkout pesanan
-- ================================================================

-- 3.1 Buat Order Baru
--     Contoh alur: user_id=4 menekan tombol "Pesan Sekarang"

-- Step 1: Hitung total harga dari keranjang

SELECT SUM(p.price * ci.quantity) AS total_amount
FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
JOIN products p ON ci.product_id = p.id
WHERE c.user_id = :user_id;


-- Step 2: Insert order baru

INSERT INTO orders (user_id, total_amount, status, created_at)
VALUES (:user_id, :total_amount, 'pending', NOW());


-- Step 3: Ambil ID order yang baru dibuat

SELECT LAST_INSERT_ID() AS new_order_id;



-- ================================================================
-- 3.2 Pindahkan Cart Items → Order Items + Kurangi Stok
-- ================================================================

-- Salin item dari cart ke order_items

INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
SELECT
    :new_order_id,
    ci.product_id,
    ci.quantity,
    p.price
FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
JOIN products p ON ci.product_id = p.id
WHERE c.user_id = :user_id;


-- Kurangi stok produk sesuai jumlah yang dipesan

UPDATE products p
JOIN order_items oi ON p.id = oi.product_id
SET p.stock = p.stock - oi.quantity
WHERE oi.order_id = :new_order_id;


-- Kosongkan keranjang setelah checkout berhasil

DELETE ci
FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
WHERE c.user_id = :user_id;



-- ================================================================
-- 4. SHIPPING ADDRESS
--    Pengelolaan alamat pengiriman
-- ================================================================

-- 4.1 Ambil alamat pengiriman user
--     Contoh: user_id=6 memiliki beberapa alamat

SELECT
    id,
    user_id,
    address,
    city,
    postal_code,
    is_primary
FROM addresses
WHERE user_id = :user_id
ORDER BY is_primary DESC;


-- 4.2 Set alamat utama

UPDATE addresses
SET is_primary = 0
WHERE user_id = :user_id;

UPDATE addresses
SET is_primary = 1
WHERE id = :address_id;



-- ================================================================
-- 5. ORDER HISTORY
--    Riwayat pesanan user
-- ================================================================

-- 5.1 Melihat semua order milik user

SELECT
    id,
    total_amount,
    status,
    created_at
FROM orders
WHERE user_id = :user_id
ORDER BY created_at DESC;


-- 5.2 Detail produk dalam sebuah order

SELECT
    oi.product_id,
    p.name,
    oi.quantity,
    oi.price_at_purchase
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = :order_id;