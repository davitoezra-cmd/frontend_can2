# Frontend Employee Lifecycle Changes

## Frontend routes added

- `/admin/employee-lifecycle` — Admin UI for onboarding, resignation approval, lifecycle checklist, and offboarding.
- `/employee/resignation` — Employee UI for submitting and tracking resignation.

## API prefixes used

- Admin lifecycle: `/api/admin/...`
- Employee resignation: `/api/employee/resignation`

The existing `src/api/axiosInstance.js` already normalizes the configured backend URL so it ends with `/api`, therefore page code calls `/admin/...` and `/employee/...` without duplicating `/api`.

## New files

### `src/pages/AdminEmployeeLifecyclePage.jsx`
Adds an Admin Employee Lifecycle dashboard with:

- lifecycle summary cards;
- Onboarding tab;
- Resignation tab;
- Offboarding tab;
- employee search;
- start onboarding form;
- complete onboarding action;
- resignation approve/reject actions;
- start/complete offboarding actions;
- onboarding/offboarding checklist modal;
- create lifecycle task;
- update lifecycle task status;
- confirmation dialogs for state-changing actions.

### `src/pages/EmployeeResignationPage.jsx`
Adds Employee resignation UI with:

- resignation submission form;
- last working date and effective date validation;
- reason and optional notes;
- current resignation status;
- lifecycle timeline;
- offboarding progress;
- re-submit option after REJECTED/CANCELLED.

### `src/asset/lifecycle.css`
Shared responsive styling for the new lifecycle pages, tables, cards, status badges, timeline, task modal, and mobile presentation.

## Existing files changed

### `src/router/AppRouter.jsx`
Added lazy imports and routes for:

- `AdminEmployeeLifecyclePage`;
- `EmployeeResignationPage`.

### `src/layouts/Sidebar.jsx`
Added Admin menu:

- `Employee Lifecycle` -> `/admin/employee-lifecycle`.

### `src/components/SidebarEmployee.jsx`
Added Employee menu:

- `Pengajuan Resign` -> `/employee/resignation`.

### `src/pages/EmployeePage.jsx`
Adjusted employee create/edit UI to match lifecycle rules:

- new employees default to inactive;
- removed manual active/inactive control from the form;
- employee status activation is directed to Employee Lifecycle;
- edit requests no longer send `is_active`, preventing UI-side lifecycle bypass.

## Backend endpoints consumed

### Onboarding

- `GET /api/admin/employees`
- `GET /api/admin/employee-employments`
- `POST /api/admin/employees/{employee}/onboarding`
- `POST /api/admin/employee-employments/{employment}/onboarding/complete`

### Resignation

- `GET /api/employee/resignation`
- `POST /api/employee/resignation`
- `GET /api/admin/employee-separations`
- `POST /api/admin/employee-separations/{separation}/approve`
- `POST /api/admin/employee-separations/{separation}/reject`

### Offboarding

- `POST /api/admin/employee-separations/{separation}/offboarding/start`
- `POST /api/admin/employee-separations/{separation}/offboarding/complete`

### Lifecycle checklist

- `GET /api/admin/employee-lifecycle-tasks`
- `POST /api/admin/employee-lifecycle-tasks`
- `PATCH /api/admin/employee-lifecycle-tasks/{task}`

## Validation performed

- Parsed all 190 source `.js`/`.jsx` files using the TypeScript JSX parser: 0 syntax errors.
- Verified all lifecycle endpoint paths against the updated Laravel backend routes.
- Full Vite production build could not be run in the sandbox because the uploaded frontend ZIP does not contain `node_modules` and the sandbox cannot resolve `registry.npmjs.org` (`EAI_AGAIN`).
- The original `dist/` directory is therefore left unchanged; after installing dependencies in a network-enabled development environment, run `npm run build` to regenerate it.
