import React, { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import EmployeeDashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";

const LoginPage = lazy(() => import("../pages/LoginPage"));

// ============================================================
// ADMIN
// ============================================================

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const AttendanceQrPage = lazy(() => import("../pages/AttendanceQrPage"));
const EmployeePage = lazy(() => import("../pages/EmployeePage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const FinancePage = lazy(() => import("../pages/FinancePage"));
const SupervisorPage = lazy(() => import("../pages/SupervisorPage"));

// ============================================================
// ADMIN - ATTENDANCE LOCATION / GPS
// ============================================================

const AttendanceLocationPage = lazy(
  () => import("../pages/AttendanceLocationPage")
);

// ============================================================
// ADMIN - WHATSAPP GATEWAY
// ============================================================

const WhatsAppGatewayPage = lazy(
  () => import("../pages/WhatsAppGatewayPage")
);

// INVENTORY
const InventoryPage = lazy(() => import("../pages/InventoryPage"));

// ============================================================
// ADMIN APPROVAL
// ============================================================

const LeaveApprovalPage = lazy(
  () => import("../pages/LeaveApprovalPage")
);

const MedicalApprovalPage = lazy(
  () => import("../pages/MedicalApprovalPage")
);

// UANG MAKAN
const MealAllowanceApprovalPage = lazy(
  () => import("../pages/MealAllowanceApprovalPage")
);

const CashAdvanceApprovalPage = lazy(
  () => import("../pages/CashAdvanceApprovalPage")
);

const BusinessTripApprovalPage = lazy(
  () => import("../pages/BusinessTripApprovalPage")
);

// ============================================================
// ADMIN PERFORMANCE / TEAM / TASK
// ============================================================

const AdminEmployeePerformancePage = lazy(
  () => import("../pages/AdminEmployeePerformancePage")
);

const TeamManagementPage = lazy(
  () => import("../pages/TeamManagementPage")
);

const TaskAssignmentPage = lazy(
  () => import("../pages/TaskAssignmentPage")
);

// ============================================================
// ADMIN MEETING
// ============================================================

const MeetingAdminPage = lazy(
  () => import("../pages/MeetingAdminPage")
);

// ============================================================
// ADMIN SHIFT / LIFECYCLE / PAYROLL
// ============================================================

const AdminShiftSchedulesPage = lazy(
  () => import("../pages/AdminShiftSchedulesPage")
);

const AdminEmployeeLifecyclePage = lazy(
  () => import("../pages/AdminEmployeeLifecyclePage")
);

const PayrollExpensePage = lazy(
  () => import("../pages/PayrollExpensePage")
);

// ============================================================
// ADMIN COMPANY POST / DOCUMENT
// ============================================================

const CompanyPostPage = lazy(
  () => import("../pages/CompanyPostPage")
);

const DocumentPage = lazy(
  () => import("../pages/DocumentPage")
);

// ============================================================
// SUPERVISOR
// ============================================================

const SupervisorLayout = lazy(
  () => import("../layouts/SupervisorLayout")
);

const DashboardSupervisorPage = lazy(
  () => import("../pages/DashboardSupervisorPage")
);

const AttendanceReportPage = lazy(
  () => import("../pages/AttendanceReportPage")
);

const ProfileSupervisorPage = lazy(
  () => import("../pages/ProfileSupervisorPage")
);

const SupervisorRequestPage = lazy(
  () => import("../pages/SupervisorRequestPage")
);

const EmployeeTargetPage = lazy(
  () => import("../pages/EmployeeTargetPage")
);

const SupervisorTaskPage = lazy(
  () => import("../pages/SupervisorTaskPage")
);

// MEETING SUPERVISOR
const MeetingSupervisorPage = lazy(
  () => import("../pages/MeetingSupervisorPage")
);

// ============================================================
// FINANCE
// ============================================================

const PayrollSettingPage = lazy(
  () => import("../pages/PayrollSettingPage")
);

const PayrollPage = lazy(
  () => import("../pages/PayrollPage")
);

const PayrollHistoryPage = lazy(
  () => import("../pages/PayrollHistoryPage")
);

const CashAdvanceFinancePage = lazy(
  () => import("../pages/CashAdvanceFinancePage")
);

const FinanceProfilePage = lazy(
  () => import("../pages/FinanceProfilePage")
);

const BPJSPaymentPage = lazy(
  () => import("../pages/BPJSPaymentPage")
);

const BalanceWithdrawalFinancePage = lazy(
  () => import("../pages/BalanceWithdrawalFinancePage")
);

// ============================================================
// FINANCE - OPERATIONAL EXPENSE
// ============================================================

const OperationalExpensePage = lazy(
  () => import("../pages/OperationalExpensePage")
);

// MEETING FINANCE
const MeetingFinancePage = lazy(
  () => import("../pages/MeetingFinancePage")
);

// ============================================================
// EMPLOYEE
// ============================================================

const EmployeeAttendance = lazy(
  () => import("../pages/Attendance")
);

const ScanAttendance = lazy(
  () => import("../pages/ScanAttendance")
);

const PortalTargetPage = lazy(
  () => import("../pages/PortalTargetPage")
);

const EmployeePerformancePage = lazy(
  () => import("../pages/EmployeePerformancePage")
);

const EmployeecompanyPostPage = lazy(
  () => import("../pages/EmployeecompanyPostPage")
);

// ============================================================
// EMPLOYEE REQUEST
// ============================================================

const LeaveRequestPage = lazy(
  () => import("../pages/LeaveRequestPage")
);

const MedicalLeavePage = lazy(
  () => import("../pages/MedicalLeavePage")
);

const CashAdvancePage = lazy(
  () => import("../pages/CashAdvancePage")
);

const BusinessTripPage = lazy(
  () => import("../pages/BusinessTripPage")
);

const BusinessTripAttendancePage = lazy(
  () => import("../pages/BusinessTripAttendancePage")
);

const EmployeeBPJSPaymentProofPage = lazy(
  () => import("../pages/EmployeeBPJSPaymentProofPage")
);

const BalanceEmployeePage = lazy(
  () => import("../pages/BalanceEmployeePage")
);

const EmployeeTaskPage = lazy(
  () => import("../pages/EmployeeTaskPage")
);

// ============================================================
// EMPLOYEE - OPERATIONAL EXPENSE
// ============================================================

const PortalOperationalExpensePage = lazy(
  () => import("../pages/PortalOperationalExpensePage")
);

// MEETING EMPLOYEE
const MeetingEmployeePage = lazy(
  () => import("../pages/MeetingEmployeePage")
);

const EmployeeMyShiftPage = lazy(
  () => import("../pages/EmployeeMyShiftPage")
);

const EmployeeResignationPage = lazy(
  () => import("../pages/EmployeeResignationPage")
);

// ============================================================
// EMPLOYEE - MEAL ALLOWANCE / UANG MAKAN
// ============================================================

const MealAllowanceRequestPage = lazy(
  () => import("../pages/MealAllowanceRequestPage")
);

// ============================================================
// PROTECTED ROUTE
// ============================================================

const ProtectedRoute = ({ allowedGuard, children }) => {
  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // Belum login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Finance juga boleh diakses Superadmin
  const isFinanceAccess =
    allowedGuard === "finance" &&
    user.guard === "user";

  // Cek hak akses guard
  if (
    allowedGuard &&
    user.guard !== allowedGuard &&
    !isFinanceAccess
  ) {
    if (user.guard === "user") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.guard === "supervisor") {
      return <Navigate to="/supervisor/dashboard" replace />;
    }

    if (user.guard === "employee") {
      return <Navigate to="/employee/dashboard" replace />;
    }

    if (user.guard === "finance") {
      return <Navigate to="/finance/payroll" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
};

// ============================================================
// APP ROUTER
// ============================================================

const AppRouter = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // Mencegah blank saat reload
  if (!ready) {
    return null;
  }

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="d-flex justify-content-center align-items-center vh-100">
            Loading...
          </div>
        }
      >
        <Routes>

          {/* ==================================================
              LOGIN
          ================================================== */}

          <Route
            path="/login"
            element={
              token && user ? (
                <Navigate
                  to={
                    user.guard === "user"
                      ? "/admin/dashboard"
                      : user.guard === "supervisor"
                        ? "/supervisor/dashboard"
                        : user.guard === "finance"
                          ? "/finance/payroll"
                          : "/employee/dashboard"
                  }
                  replace
                />
              ) : (
                <LoginPage />
              )
            }
          />

          {/* ==================================================
              SUPER ADMIN
          ================================================== */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedGuard="user">
                <AdminLayout />
              </ProtectedRoute>
            }
          >

            {/* DASHBOARD */}

            <Route
              path="dashboard"
              element={<DashboardPage />}
            />

            {/* EMPLOYEE */}

            <Route
              path="employees"
              element={<EmployeePage />}
            />

            {/* EMPLOYEE LIFECYCLE */}

            <Route
              path="employee-lifecycle"
              element={<AdminEmployeeLifecyclePage />}
            />

            {/* SHIFT */}

            <Route
              path="shift-schedules"
              element={<AdminShiftSchedulesPage />}
            />

            {/* SUPERVISOR */}

            <Route
              path="supervisors"
              element={<SupervisorPage />}
            />

            {/* FINANCE */}

            <Route
              path="finance"
              element={<FinancePage />}
            />

            {/* PAYROLL EXPENSE */}

            <Route
              path="payroll-expense"
              element={<PayrollExpensePage />}
            />

            {/* ATTENDANCE QR */}

            <Route
              path="attendance-qr"
              element={<AttendanceQrPage />}
            />

            {/* ==================================================
                ATTENDANCE LOCATION / GPS
            ================================================== */}

            <Route
              path="attendance-locations"
              element={<AttendanceLocationPage />}
            />

            {/* ==================================================
                WHATSAPP GATEWAY
            ================================================== */}

            <Route
              path="whatsapp-gateway"
              element={<WhatsAppGatewayPage />}
            />

            {/* ==================================================
                INVENTORY
            ================================================== */}

            <Route
              path="inventory"
              element={<InventoryPage />}
            />

            {/* ==================================================
                ADMIN APPROVAL
            ================================================== */}

            {/* APPROVAL CUTI */}

            <Route
              path="approval/leave"
              element={<LeaveApprovalPage />}
            />

            {/* APPROVAL SAKIT */}

            <Route
              path="approval/medical"
              element={<MedicalApprovalPage />}
            />

            {/* APPROVAL UANG MAKAN */}

            <Route
              path="approval/meal-allowance"
              element={<MealAllowanceApprovalPage />}
            />

            {/* APPROVAL KASBON */}

            <Route
              path="approval/cash-advance"
              element={<CashAdvanceApprovalPage />}
            />

            {/* APPROVAL DINAS LUAR */}

            <Route
              path="approval/business-trip"
              element={<BusinessTripApprovalPage />}
            />

            {/* ==================================================
                PERFORMANCE
            ================================================== */}

            <Route
              path="performance"
              element={<AdminEmployeePerformancePage />}
            />

            {/* ==================================================
                TEAM
            ================================================== */}

            <Route
              path="teams"
              element={<TeamManagementPage />}
            />

            {/* ==================================================
                TASK
            ================================================== */}

            <Route
              path="task-assignments"
              element={<TaskAssignmentPage />}
            />

            {/* ==================================================
                MEETING
            ================================================== */}

            <Route
              path="meeting"
              element={<MeetingAdminPage />}
            />

            {/* ==================================================
                COMPANY POSTS
            ================================================== */}

            <Route
              path="company-posts"
              element={<CompanyPostPage />}
            />

            {/* ==================================================
                DOCUMENTS
            ================================================== */}

            <Route
              path="documents"
              element={<DocumentPage />}
            />

            {/* ==================================================
                PROFILE
            ================================================== */}

            <Route
              path="profile"
              element={<ProfilePage />}
            />

          </Route>

          {/* ==================================================
              SUPERVISOR
          ================================================== */}

          <Route
            path="/supervisor"
            element={
              <ProtectedRoute allowedGuard="supervisor">
                <SupervisorLayout />
              </ProtectedRoute>
            }
          >

            <Route
              path="dashboard"
              element={<DashboardSupervisorPage />}
            />

            <Route
              path="rekap-kehadiran"
              element={<AttendanceReportPage />}
            />

            <Route
              path="pengajuan"
              element={<SupervisorRequestPage />}
            />

            <Route
              path="employee-targets"
              element={<EmployeeTargetPage />}
            />

            <Route
              path="tasks"
              element={<SupervisorTaskPage />}
            />

            {/* MEETING */}

            <Route
              path="meeting"
              element={<MeetingSupervisorPage />}
            />

            {/* PROFILE */}

            <Route
              path="profile"
              element={<ProfileSupervisorPage />}
            />

          </Route>

          {/* ==================================================
              FINANCE
          ================================================== */}

          <Route
            path="/finance/payroll-setting"
            element={
              <ProtectedRoute allowedGuard="finance">
                <PayrollSettingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/finance/payroll"
            element={
              <ProtectedRoute allowedGuard="finance">
                <PayrollPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/finance/payroll-history"
            element={
              <ProtectedRoute allowedGuard="finance">
                <PayrollHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/finance/cash-advance"
            element={
              <ProtectedRoute allowedGuard="finance">
                <CashAdvanceFinancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/finance/bpjs-payment"
            element={
              <ProtectedRoute allowedGuard="finance">
                <BPJSPaymentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/finance/profile"
            element={
              <ProtectedRoute allowedGuard="finance">
                <FinanceProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              FINANCE BALANCE
          ================================================== */}

          <Route
            path="/finance/balance-withdrawal"
            element={
              <ProtectedRoute allowedGuard="finance">
                <BalanceWithdrawalFinancePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              FINANCE - OPERATIONAL EXPENSE
          ================================================== */}

          <Route
            path="/finance/operational-expense"
            element={
              <ProtectedRoute allowedGuard="finance">
                <OperationalExpensePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              FINANCE CRUD
          ================================================== */}

          <Route
            path="/finance/payroll-setting/create"
            element={
              <ProtectedRoute allowedGuard="finance">
                <PayrollSettingPage mode="create" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/finance/payroll-setting/edit/:id"
            element={
              <ProtectedRoute allowedGuard="finance">
                <PayrollSettingPage mode="edit" />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              MEETING FINANCE
          ================================================== */}

          <Route
            path="/finance/meeting"
            element={
              <ProtectedRoute allowedGuard="finance">
                <MeetingFinancePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              EMPLOYEE
          ================================================== */}

          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedGuard="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/my-shift"
            element={
              <ProtectedRoute allowedGuard="employee">
                <EmployeeMyShiftPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/attendance"
            element={
              <ProtectedRoute allowedGuard="employee">
                <EmployeeAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/scan-attendance"
            element={
              <ProtectedRoute allowedGuard="employee">
                <ScanAttendance />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              LEAVE
          ================================================== */}

          <Route
            path="/employee/leave"
            element={
              <ProtectedRoute allowedGuard="employee">
                <LeaveRequestPage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              MEDICAL
          ================================================== */}

          <Route
            path="/employee/medical"
            element={
              <ProtectedRoute allowedGuard="employee">
                <MedicalLeavePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              CASH ADVANCE
          ================================================== */}

          <Route
            path="/employee/cash-advance"
            element={
              <ProtectedRoute allowedGuard="employee">
                <CashAdvancePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              BUSINESS TRIP
          ================================================== */}

          <Route
            path="/employee/business-trip"
            element={
              <ProtectedRoute allowedGuard="employee">
                <BusinessTripPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/business-trip/attendance"
            element={
              <ProtectedRoute allowedGuard="employee">
                <BusinessTripAttendancePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              BPJS
          ================================================== */}

          <Route
            path="/employee/bpjs-payment"
            element={
              <ProtectedRoute allowedGuard="employee">
                <EmployeeBPJSPaymentProofPage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              TARGET
          ================================================== */}

          <Route
            path="/employee/targets"
            element={
              <ProtectedRoute allowedGuard="employee">
                <PortalTargetPage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              PERFORMANCE
          ================================================== */}

          <Route
            path="/employee/employee-performance"
            element={
              <ProtectedRoute allowedGuard="employee">
                <EmployeePerformancePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              BALANCE
          ================================================== */}

          <Route
            path="/employee/balance"
            element={
              <ProtectedRoute allowedGuard="employee">
                <BalanceEmployeePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              TASK
          ================================================== */}

          <Route
            path="/employee/tasks"
            element={
              <ProtectedRoute allowedGuard="employee">
                <EmployeeTaskPage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              OPERATIONAL EXPENSE PORTAL
          ================================================== */}

          <Route
            path="/employee/operational-expenses"
            element={
              <ProtectedRoute allowedGuard="employee">
                <PortalOperationalExpensePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              MEETING EMPLOYEE
          ================================================== */}

          <Route
            path="/employee/meeting"
            element={
              <ProtectedRoute allowedGuard="employee">
                <MeetingEmployeePage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              MEAL ALLOWANCE / UANG MAKAN
          ================================================== */}

          <Route
            path="/employee/meal-allowance"
            element={
              <ProtectedRoute allowedGuard="employee">
                <MealAllowanceRequestPage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              EMPLOYEE LIFECYCLE / RESIGNATION
          ================================================== */}

          <Route
            path="/employee/resignation"
            element={
              <ProtectedRoute allowedGuard="employee">
                <EmployeeResignationPage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              COMPANY POSTS
          ================================================== */}

          <Route
            path="/employee/company-posts"
            element={
              <ProtectedRoute allowedGuard="employee">
                <EmployeecompanyPostPage />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              PROFILE
          ================================================== */}

          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedGuard="employee">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              ROOT
          ================================================== */}

          <Route
            path="/"
            element={
              !token || !user ? (
                <Navigate to="/login" replace />
              ) : user.guard === "user" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user.guard === "supervisor" ? (
                <Navigate to="/supervisor/dashboard" replace />
              ) : user.guard === "finance" ? (
                <Navigate to="/finance/payroll" replace />
              ) : (
                <Navigate to="/employee/dashboard" replace />
              )
            }
          />

          {/* ==================================================
              404
          ================================================== */}

          <Route
            path="*"
            element={
              !token || !user ? (
                <Navigate to="/login" replace />
              ) : user.guard === "user" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user.guard === "supervisor" ? (
                <Navigate to="/supervisor/dashboard" replace />
              ) : user.guard === "finance" ? (
                <Navigate to="/finance/payroll" replace />
              ) : (
                <Navigate to="/employee/dashboard" replace />
              )
            }
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;

