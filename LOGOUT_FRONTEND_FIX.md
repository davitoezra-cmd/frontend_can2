# Frontend Logout Fix

Perubahan ini hanya menyentuh frontend.

## Yang diperbaiki
- Logout selalu tersedia pada navbar Admin, Supervisor, Employee, dan Finance.
- Mobile menampilkan tombol logout ringkas berbentuk ikon; desktop menampilkan ikon + teks.
- Logout tetap tersedia pada sidebar/drawer.
- Employee Attendance mendapat logout pada custom header.
- Finance Cash Advance dan Payroll History mendapat logout pada custom header.
- Logout menghapus `token` dan `user`, membersihkan session storage, lalu melakukan full redirect ke `/login`.
- Full redirect digunakan agar state autentikasi lama pada AppRouter tidak menyebabkan redirect kembali ke dashboard.
- Admin navbar tetap memanggil endpoint logout existing `/admin/logout`, namun local logout tetap selesai jika request server gagal/token sudah expired.
- Footer logout Employee dan Finance dibuat sticky agar lebih mudah ditemukan pada sidebar panjang.

## Validasi
- Relative import check: 0 error.
- CSS PostCSS parse: OK.
- Full `npm run build` tidak dijalankan karena dependency `node_modules` tidak tersedia pada arsip frontend dan instalasi dependency tidak tersedia pada environment ini.
