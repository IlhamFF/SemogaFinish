# Panduan Setup Penyimpanan Lokal

Aplikasi ini menggunakan sistem file lokal untuk menyimpan file yang diunggah (seperti foto profil, materi ajar, dll.) selama pengembangan. Agar fitur ini berfungsi, Anda perlu membuat beberapa direktori secara manual setelah meng-clone proyek.

## Langkah-langkah

1.  **Navigasi ke Direktori `public`**:
    Buka terminal Anda dan navigasi ke direktori `public` yang ada di dalam root proyek Anda.
    ```bash
    cd public
    ```

2.  **Buat Direktori `uploads`**:
    Di dalam direktori `public`, buat folder baru bernama `uploads`.
    ```bash
    mkdir uploads
    ```

Struktur direktori akhir Anda akan terlihat seperti ini:
```
project-root/
├── public/
│   ├── uploads/   <-- Folder yang Anda buat
│   └── ... file publik lainnya
├── src/
└── ... file proyek lainnya
```

**Penting:** Direktori `public/uploads` ini sengaja dimasukkan ke dalam file `.gitignore`. Ini berarti file apa pun yang Anda unggah selama pengembangan **tidak akan** dan **tidak seharusnya** di-commit ke repositori Git. Ini adalah praktik terbaik untuk menjaga repositori tetap bersih dan berukuran kecil.

Setelah Anda membuat folder ini, fungsionalitas unggah file di dalam aplikasi akan berjalan dengan baik di lingkungan lokal Anda.
