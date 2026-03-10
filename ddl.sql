CREATE TABLE peminjam (
    id_peminjam INT PRIMARY KEY,
    nama_peminjam VARCHAR(100) NOT NULL
);

CREATE TABLE buku (
    id_buku INT PRIMARY KEY,
    judul_buku VARCHAR(150) NOT NULL,
    kategori VARCHAR(50) NOT NULL
);

CREATE TABLE status_peminjam (
    id_status INT PRIMARY KEY,
    id_peminjam INT NOT NULL,
    total_pinjam INT NOT NULL,
    status_peminjam VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_peminjam) REFERENCES peminjam(id_peminjam)
);

CREATE TABLE status_peminjaman (
    id_status INT PRIMARY KEY,
    nama_status VARCHAR(20) NOT NULL
);

CREATE TABLE peminjaman (
    id_pinjam INT PRIMARY KEY,
    id_peminjam INT NOT NULL,
    id_buku INT NOT NULL,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE,
    id_status INT NOT NULL,
    FOREIGN KEY (id_peminjam) REFERENCES peminjam(id_peminjam),
    FOREIGN KEY (id_buku) REFERENCES buku(id_buku),
    FOREIGN KEY (id_status) REFERENCES status_peminjaman(id_status)
);

