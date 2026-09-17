import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {apiFetch} from "../api/apiFetch";
import LiveFaceScanner from "../components/face/LiveFaceScanner";

const ROLE_META = {
  user: {
    label: "Administrator",
    icon: "bi-shield-lock",
  },
  employee: {
    label: "Employee",
    icon: "bi-person-workspace",
  },
  supervisor: {
    label: "Supervisor",
    icon: "bi-people",
  },
  finance: {
    label: "Finance",
    icon: "bi-wallet2",
  },
};

const LoginPage = () => {
  const [mode, setMode] = useState("face");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [accountSelection, setAccountSelection] = useState(null);
  const [accountSelectionLoading, setAccountSelectionLoading] = useState("");
  const [accountSelectionError, setAccountSelectionError] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const faceRequestInFlightRef = useRef(false);

  const [faceStatus, setFaceStatus] = useState({
    type: "idle",
    message: "",
  });

  const navigate = useNavigate();

  /* =========================
     REDIRECT BY ROLE
     ========================= */

  const redirectByGuard = useCallback(
    (user) => {
      if (user.guard === "user") {
        navigate("/admin/dashboard", {
          replace: true,
        });
      } else if (user.guard === "supervisor") {
        navigate("/supervisor/dashboard", {
          replace: true,
        });
      } else if (user.guard === "finance") {
        navigate("/finance/payroll", {
          replace: true,
        });
      } else {
        navigate("/employee/dashboard", {
          replace: true,
        });
      }
    },
    [navigate],
  );

  /* =========================
     SAVE AUTH
     ========================= */

  const saveAuth = useCallback(
    (response) => {
      const token = response.data?.token;
      const user = response.data?.user;

      if (!token || !user) {
        throw new Error("Token atau user tidak ditemukan pada response login.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      redirectByGuard(user);
    },
    [redirectByGuard],
  );

  /* =========================
     PASSWORD LOGIN
     ========================= */

  const handlePasswordLogin = async (event) => {
    event.preventDefault();

    setPasswordLoading(true);
    setErrorMessage("");

    try {
      const response = await apiFetch.post("/login", {
        email,
        password,
      });

      saveAuth(response);
    } catch (error) {
      console.error("Login Error:", error);

      setErrorMessage(
        error.response?.data?.message || "Email atau password tidak valid.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  /* =========================
     FACE LOGIN
     ========================= */

  const handleLiveFaceScan = useCallback(
    async (imageBlob) => {
      if (
        faceRequestInFlightRef.current ||
        mode !== "face" ||
        accountSelection
      ) {
        return {
          retryAfterMs: 3000,
        };
      }

      faceRequestInFlightRef.current = true;

      setErrorMessage("");

      setFaceStatus({
        type: "checking",
        message: "",
      });

      try {
        const formData = new FormData();

        formData.append("image", imageBlob, "live-face.jpg");

        const response = await apiFetch.post("/face-login", formData);

        /* =========================
           MULTIPLE ACCOUNTS
           ========================= */

        if (response.data?.requires_account_selection) {
          const accounts = Array.isArray(response.data?.accounts)
            ? response.data.accounts
            : [];

          const verificationToken = response.data?.verification_token;

          if (!verificationToken || accounts.length < 2) {
            throw new Error("Response pemilihan akun Face Login tidak valid.");
          }

          setAccountSelection({
            verificationToken,
            accounts,
            expiresIn: Number(response.data?.expires_in) || 60,
          });

          setAccountSelectionError("");

          setFaceStatus({
            type: "success",
            message: "",
          });

          return {
            retryAfterMs: 10000,
          };
        }

        /* =========================
           SINGLE ACCOUNT
           ========================= */

        setFaceStatus({
          type: "success",
          message: "",
        });

        saveAuth(response);

        return {
          retryAfterMs: 10000,
        };
      } catch (error) {
        const status = error.response?.status;

        const apiMessage = error.response?.data?.message;

        /* =========================
           COOLDOWN
           ========================= */

        if (status === 429) {
          const retryAfterHeader = Number(
            error.response?.headers?.["retry-after"],
          );

          const retryAfterBody = Number(error.response?.data?.retry_after_ms);

          const retryAfterMs =
            Number.isFinite(retryAfterBody) && retryAfterBody > 0
              ? retryAfterBody
              : Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
                ? retryAfterHeader * 1000
                : 3000;

          setFaceStatus({
            type: "idle",
            message: "",
          });

          return {
            retryAfterMs,
          };
        }

        /* =========================
           INVALID FACE
           ========================= */

        if (status === 422) {
          setFaceStatus({
            type: "idle",
            message: "",
          });
        } else if (status === 401 || status === 404) {
          setFaceStatus({
            type: "error",
            message: "",
          });
        } else {
          setFaceStatus({
            type: "error",
            message: "",
          });

          console.error(
            "Face Login Error:",
            apiMessage || error.message || error,
          );
        }

        return {
          retryAfterMs: 3000,
        };
      } finally {
        faceRequestInFlightRef.current = false;
      }
    },
    [accountSelection, mode, saveAuth],
  );

  /* =========================
     SELECT ACCOUNT
     ========================= */

  const selectFaceAccount = async (account) => {
    if (!accountSelection?.verificationToken || accountSelectionLoading) {
      return;
    }

    const selectionKey = `${account.guard}:${account.account_id}`;

    setAccountSelectionLoading(selectionKey);
    setAccountSelectionError("");

    try {
      const response = await apiFetch.post("/face-login/select-account", {
        verification_token: accountSelection.verificationToken,

        guard: account.guard,

        account_id: account.account_id,
      });

      setFaceStatus({
        type: "success",
        message: "",
      });

      saveAuth(response);
    } catch (error) {
      const message =
        error.response?.data?.message || "Akun belum dapat dipilih.";

      setAccountSelectionError(message);

      if ([401, 403, 419].includes(error.response?.status)) {
        setAccountSelection(null);

        setFaceStatus({
          type: "idle",
          message: "",
        });
      }
    } finally {
      setAccountSelectionLoading("");
    }
  };

  /* =========================
     CANCEL ACCOUNT SELECTION
     ========================= */

  const cancelAccountSelection = () => {
    setAccountSelection(null);
    setAccountSelectionError("");
    setAccountSelectionLoading("");

    setFaceStatus({
      type: "idle",
      message: "",
    });
  };

  /* =========================
     SWITCH LOGIN MODE
     ========================= */

  const switchMode = (nextMode) => {
    setMode(nextMode);

    setErrorMessage("");

    setAccountSelection(null);
    setAccountSelectionError("");
    setAccountSelectionLoading("");

    setFaceStatus({
      type: "idle",
      message: "",
    });
  };

  return (
    <>
      <style>
        {`
		  /* ==========================================
   SIMPLE HR & PAYROLL LOGIN PAGE
   ========================================== */

.login-page-clean {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f5f8ff;
  overflow-x: hidden;
}

.login-page-clean .login-auth-panel-clean {
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  padding: 36px 32px 32px;
  background: #ffffff;
  border: 1px solid #e6ecf5;
  border-radius: 20px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

/* Single blue login icon */
.login-icon-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.login-icon {
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  background: #eaf2ff;
  border: 1px solid #d7e6ff;
  color: #0d6efd;
  font-size: 36px;
}

.login-icon i {
  display: block;
  line-height: 1;
}

/* Welcome copy */
.login-heading {
  text-align: center;
  margin-bottom: 24px;
}

.login-heading h1 {
  margin: 0 0 7px;
  color: #172033;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.25;
}

.login-heading p {
  margin: 0;
  color: #7b8495;
  font-size: 14px;
  line-height: 1.6;
}

/* Face/password selector */
.login-mode-switch {
  width: 100%;
  background: #f3f6fb;
  border: 1px solid #e8edf5;
  border-radius: 12px;
}

.login-mode-switch .btn {
  min-height: 44px;
  border-radius: 9px;
  color: #7a8495;
  background: transparent;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.login-mode-switch .btn:hover {
  color: #0d6efd;
}

.login-mode-switch .btn.active {
  background: #ffffff;
  color: #0d6efd;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.10);
}

/* Password inputs */
.login-input-wrap {
  position: relative;
  width: 100%;
}

.login-input-wrap > i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  color: #8b95a7;
  font-size: 17px;
  pointer-events: none;
}

.login-input-wrap .form-control-custom {
  width: 100%;
  min-height: 50px;
  padding: 12px 16px 12px 46px;
  border: 1px solid #dce3ee;
  border-radius: 12px;
  background: #ffffff;
  color: #172033;
  font-size: 14px;
  box-shadow: none;
}

.login-input-wrap .form-control-custom::placeholder {
  color: #a6afbd;
}

.login-input-wrap .form-control-custom:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.10);
  outline: none;
}

/* Blue login button */
.login-submit-btn {
  min-height: 50px;
  border: none;
  border-radius: 12px;
  background: #0d6efd;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(13, 110, 253, 0.20);
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.login-submit-btn:hover {
  background: #0b5ed7;
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(13, 110, 253, 0.24);
}

.login-submit-btn:active {
  transform: scale(0.99);
}

.login-submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
}

.login-error {
  padding: 10px 12px;
  margin-bottom: 16px;
  border-radius: 10px;
  font-size: 13px;
}

/* Face login */
.login-face-area {
  width: 100%;
  margin: 0;
  padding: 0;
}

.login-face-area video,
.login-face-area canvas,
.login-face-area img {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Account selection after face match */
.face-account-selector {
  width: 100%;
}

.face-account-selector__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.face-account-option {
  width: 100%;
  min-height: 68px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border: 1px solid #e3e9f2;
  border-radius: 12px;
  background: #ffffff;
  color: #172033;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.face-account-option:hover {
  background: #f7faff;
  border-color: #b9d3ff;
  transform: translateY(-1px);
}

.face-account-option:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.face-account-option__icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #eaf2ff;
  color: #0d6efd;
  font-size: 18px;
}

.face-account-option__copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.face-account-option__copy strong {
  color: #172033;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.face-account-option__copy small {
  color: #8b95a7;
  font-size: 12px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.face-account-option__action {
  flex-shrink: 0;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0d6efd;
}

.login-rescan-btn {
  color: #0d6efd;
  font-size: 13px;
}

.login-rescan-btn:hover {
  color: #0b5ed7;
}

@media (max-width: 576px) {
  .login-page-clean {
    padding: 16px;
  }

  .login-page-clean .login-auth-panel-clean {
    max-width: 100%;
    padding: 26px 20px 24px;
    border-radius: 16px;
  }

  .login-icon-wrapper {
    margin-bottom: 16px;
  }

  .login-icon {
    width: 66px;
    height: 66px;
    border-radius: 18px;
    font-size: 31px;
  }

  .login-heading {
    margin-bottom: 20px;
  }

  .login-heading h1 {
    font-size: 23px;
  }

  .login-mode-switch .btn {
    min-height: 42px;
    padding-left: 8px !important;
    padding-right: 8px !important;
    font-size: 13px;
  }

  .login-input-wrap .form-control-custom,
  .login-submit-btn {
    min-height: 48px;
  }
}
		  `}
      </style>
      <main className="login-page login-page-clean min-vh-100 d-flex align-items-center justify-content-center">
        <section className="login-auth-panel login-auth-panel-clean">
          {/* =========================
            LOGIN ICON
            ========================= */}

          <div className="login-icon-wrapper">
            <div className="login-icon">
              <i className="bi bi-person-circle" />
            </div>
          </div>

          <div className="login-heading">
            <h1>Selamat Datang</h1>
            <p>
              Masuk ke sistem <strong>HR dan Payroll</strong>
            </p>
          </div>

          {/* =========================
            LOGIN MODE
            ========================= */}

          <div className="login-mode-switch d-flex gap-1 p-1 mb-4">
            <button
              type="button"
              className={`btn flex-fill border-0 fw-semibold py-2 ${
                mode === "face" ? "active" : ""
              }`}
              onClick={() => switchMode("face")}
              disabled={passwordLoading}
            >
              <i className="bi bi-person-bounding-box me-2" />
              Face Login
            </button>

            <button
              type="button"
              className={`btn flex-fill border-0 fw-semibold py-2 ${
                mode === "password" ? "active" : ""
              }`}
              onClick={() => switchMode("password")}
              disabled={passwordLoading}
            >
              <i className="bi bi-key me-2" />
              Password
            </button>
          </div>

          {/* =========================
            GENERAL ERROR
            ========================= */}

          {errorMessage && (
            <div className="alert alert-danger login-error" role="alert">
              <i className="bi bi-exclamation-circle me-2" />

              {errorMessage}
            </div>
          )}

          {/* =========================
            PASSWORD LOGIN
            ========================= */}

          {mode === "password" ? (
            <form
              onSubmit={handlePasswordLogin}
              className="login-password-form"
            >
              {/* EMAIL */}

              <div className="login-input-wrap mb-3">
                <i className="bi bi-envelope" />

                <input
                  type="email"
                  className="form-control form-control-custom"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={passwordLoading}
                  autoComplete="username"
                />
              </div>

              {/* PASSWORD */}

              <div className="login-input-wrap mb-4">
                <i className="bi bi-lock" />

                <input
                  type="password"
                  className="form-control form-control-custom"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={passwordLoading}
                  autoComplete="current-password"
                />
              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="btn btn-custom-primary login-submit-btn w-100 d-flex align-items-center justify-content-center gap-2"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />

                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>

                    <i className="bi bi-arrow-right" />
                  </>
                )}
              </button>
            </form>
          ) : accountSelection ? (
            /* =========================
             ACCOUNT SELECTION
             ========================= */

            <div className="face-account-selector">
              {accountSelectionError && (
                <div className="alert alert-danger login-error mb-3">
                  {accountSelectionError}
                </div>
              )}

              <div className="face-account-selector__list">
                {accountSelection.accounts.map((account) => {
                  const meta = ROLE_META[account.guard] || {
                    label: account.role_label || "Akun",

                    icon: "bi-person",
                  };

                  const selectionKey = `${account.guard}:${account.account_id}`;

                  const loading = accountSelectionLoading === selectionKey;

                  return (
                    <button
                      type="button"
                      className="face-account-option"
                      key={selectionKey}
                      onClick={() => selectFaceAccount(account)}
                      disabled={Boolean(accountSelectionLoading)}
                    >
                      <span className="face-account-option__icon">
                        <i className={`bi ${meta.icon}`} />
                      </span>

                      <span className="face-account-option__copy">
                        <strong>{account.role_label || meta.label}</strong>

                        {account.name && <small>{account.name}</small>}
                      </span>

                      <span className="face-account-option__action">
                        {loading ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          />
                        ) : (
                          <i className="bi bi-chevron-right" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none login-rescan-btn w-100 mt-3"
                onClick={cancelAccountSelection}
                disabled={Boolean(accountSelectionLoading)}
              >
                <i className="bi bi-arrow-counterclockwise me-1" />
                Scan ulang
              </button>
            </div>
          ) : (
            /* =========================
             FACE SCANNER
             ========================= */

            <div className="login-face-area">
              <LiveFaceScanner
                onScan={handleLiveFaceScan}
                paused={Boolean(accountSelection)}
                status=""
                statusType={faceStatus.type}
              />
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default LoginPage;
