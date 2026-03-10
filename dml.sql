INSERT INTO peminjam VALUES
(1, 'Lina Saputra'),
(2, 'Fajar Kusuma'),
(3, 'Hana Sari'),
(4, 'Oscar Sari'),
(5, 'Siti Nugroho');

INSERT INTO buku VALUES
(1, 'Introduction to Algorithms', 'Teknologi'),
(2, 'Atomic Habits', 'Self Improvement'),
(3, 'Harry Potter', 'Fantasi'),
(4, 'Rich Dad Poor Dad', 'Keuangan'),
(5, 'Bumi Manusia', 'Fiksi Sejarah');

INSERT INTO status_peminjaman VALUES
(1, 'Dipinjam'),
(2, 'Kembali'),
(3, 'Terlambat');

INSERT INTO peminjaman VALUES
(1, 1, 1, '2025-03-05', NULL, 1),
(2, 1, 4, '2025-09-15', NULL, 1),
(3, 2, 2, '2025-06-16', '2025-06-26', 2),
(4, 3, 3, '2025-06-05', '2025-06-15', 2),
(5, 5, 5, '2025-10-20', NULL, 3);

INSERT INTO status_peminjam VALUES
(1, 1, 6, 'AKTIF'),
(2, 2, 3, 'REGULER'),
(3, 3, 2, 'REGULER'),
(4, 4, 4, 'AKTIF'),
(5, 5, 7, 'PRIORITAS');