# Full Employee Lifecycle Frontend Integration

Frontend ini diselaraskan dengan Employee Lifecycle API pada backend Laravel final.

## Coverage UI

### Admin / HR — `/admin/employee-lifecycle`

Halaman Employee Lifecycle memiliki 5 tab:

1. **Onboarding**
   - Menampilkan employee yang belum memiliki employment dan employment berstatus `ONBOARDING`.
   - Start onboarding (`start_date`, optional `end_date`).
   - Checklist onboarding.
   - Complete onboarding -> backend mengubah employment ke `ACTIVE` dan mengaktifkan account employee.
   - Detail employment dari endpoint show.

2. **Resignation**
   - Menampilkan pengajuan resignation dari employee.
   - Approve / reject hanya untuk status `SUBMITTED`.
   - Setelah approved dapat memulai offboarding.
   - Detail separation dari endpoint show.

3. **Termination**
   - Form Admin/HR untuk membuat termination.
   - Kandidat UI dibatasi ke employee aktif dengan employment `ACTIVE` / `SUSPENDED` dan tanpa separation `SUBMITTED` / `APPROVED`.
   - Input `effective_date`, optional `last_working_date`, `reason`, dan `notes`.
   - Termination dibuat `SUBMITTED`, kemudian dapat approve/reject.
   - Setelah approved dapat memulai offboarding.

4. **Offboarding**
   - Menggabungkan separation `RESIGNATION` dan `TERMINATION` yang sudah approved / sedang / selesai offboarding.
   - Start offboarding.
   - Checklist offboarding.
   - Complete offboarding.
   - Complete akan mengikuti rule backend: effective date harus tercapai, task selesai/skip, employee dinonaktifkan, token dicabut, final status `RESIGNED` atau `TERMINATED`.

5. **Status History**
   - Menampilkan audit perubahan status employment.
   - Status, effective from/to, reason, dan detail history.

### Employee — `/employee/resignation`

- Employee dapat membuat resignation.
- Input `last_working_date`, `effective_date`, `reason`, dan optional `notes`.
- Melihat pengajuan resignation terakhir dan timeline approval/offboarding.
- Pengajuan ulang ditampilkan hanya setelah status `REJECTED` / `CANCELLED`.
- Tanggal frontend mengikuti timezone backend `Asia/Jakarta`.

## Endpoint Backend yang Digunakan

| Method | Endpoint | UI |
|---|---|---|
| GET | `/api/admin/employees` | Daftar employee / kandidat lifecycle |
| GET | `/api/admin/employee-employments` | Daftar employment |
| GET | `/api/admin/employee-employments/{id}` | Detail employment |
| POST | `/api/admin/employees/{employee}/onboarding` | Start onboarding |
| POST | `/api/admin/employee-employments/{id}/onboarding/complete` | Complete onboarding |
| GET | `/api/admin/employee-separations` | Resignation / termination / offboarding list |
| GET | `/api/admin/employee-separations/{id}` | Detail separation |
| POST | `/api/admin/employees/{employee}/termination` | Buat termination |
| POST | `/api/admin/employee-separations/{id}/approve` | Approve resignation / termination |
| POST | `/api/admin/employee-separations/{id}/reject` | Reject resignation / termination |
| POST | `/api/admin/employee-separations/{id}/offboarding/start` | Start offboarding |
| POST | `/api/admin/employee-separations/{id}/offboarding/complete` | Complete offboarding |
| GET | `/api/admin/employee-lifecycle-tasks` | Checklist lifecycle |
| POST | `/api/admin/employee-lifecycle-tasks` | Tambah checklist |
| PATCH | `/api/admin/employee-lifecycle-tasks/{id}` | Update status checklist |
| GET | `/api/admin/employee-status-histories` | Status history list |
| GET | `/api/admin/employee-status-histories/{id}` | Status history detail |
| GET | `/api/employee/resignation` | Resignation milik employee |
| POST | `/api/employee/resignation` | Employee mengajukan resignation |

## File Source Baru (dibanding `fr.zip` original)

- `src/pages/AdminEmployeeLifecyclePage.jsx`
- `src/pages/EmployeeResignationPage.jsx`
- `src/asset/lifecycle.css`

## File Source Existing yang Diubah

- `src/router/AppRouter.jsx`
  - route `/admin/employee-lifecycle`
  - route `/employee/resignation`

- `src/layouts/Sidebar.jsx`
  - menu Admin `Employee Lifecycle`

- `src/components/SidebarEmployee.jsx`
  - menu Employee `Pengajuan Resign`

- `src/pages/EmployeePage.jsx`
  - employee baru tidak lagi diarahkan untuk aktif manual
  - status aktif lifecycle ditampilkan sebagai read-only
  - onboarding menjadi sumber aktivasi employee

## Catatan Build

Source sudah divalidasi parsing untuk semua file JS/JSX. Build Vite belum dapat dijalankan di sandbox karena dependency `node_modules` tidak tersedia lengkap dan registry npm tidak dapat diakses dari environment ini.

`dist/` bawaan ZIP dipertahankan agar tidak merusak file existing, tetapi belum merepresentasikan source lifecycle terbaru. Jalankan:

```bash
npm install
npm run build
```

sebelum deployment static menggunakan `dist/`.
