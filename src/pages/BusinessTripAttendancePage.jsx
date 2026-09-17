import React, { useEffect, useState } from 'react';
import { FaBriefcase, FaCamera, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import {apiFetch} from '../api/apiFetch'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import SidebarEmployee from '../components/SidebarEmployee'; 
import NavbarEmployee from '../layouts/NavbarEmployee';
import BusinessTripAttendanceTable from '../BusinessTripAttendance/BusinessTripAttendanceTable';
import BusinessTripAttendanceFilter from '../BusinessTripAttendance/BusinessTripAttendanceFilter';
import CheckInModal from '../BusinessTripAttendance/CheckInModal';
import CheckOutModal from '../BusinessTripAttendance/CheckoutModal';

const BusinessTripAttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // State User Profile
  const [user, setUser] = useState(null);

  // Modal States
  const [activeItem, setActiveItem] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // State Toggle Sidebar (Default terbuka di Desktop, tertutup di Mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-close sidebar jika layar berukuran mobile saat pertama kali load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const storageBaseUrl = "http://localhost:8000/storage/";

  const fetchBusinessTrips = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get('/employee/business-trip');
      const allData = response.data?.data || response.data || [];

      // Filter hanya status approved atau completed
      const filtered = allData.filter(
        (item) => item.status === 'approved' || item.status === 'completed'
      );
      setDataList(filtered);
    } catch (error) {
      console.error('Error fetching business trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await apiFetch.get('/employee/profile');
      if (response.data?.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      // Silent error or handle toast if necessary without breaking flow
    }
  };

  useEffect(() => {
    fetchBusinessTrips();
    fetchProfile();
  }, []);

  // Ambil detail lengkap jika icon detail diklik
  const handleOpenDetail = async (item) => {
    setActiveItem(item);
    setShowDetailModal(true);
    try {
      const response = await apiFetch.get(`/employee/business-trip/${item.id}`);
      setDetailData(response.data?.data || response.data);
    } catch (err) {
      setDetailData(item); // Fallback ke data row jika endpoint detail bermasalah
    }
  };

  // Perhitungan Summary Cards secara otomatis dari API Data
  const totalDinas = dataList.length;
  const belumCheckIn = dataList.filter((item) => item.status === 'approved' && !item.check_in).length;
  const sedangDinas = dataList.filter((item) => item.status === 'approved' && item.check_in && !item.check_out).length;
  const selesaiDinas = dataList.filter((item) => item.status === 'completed' || (item.check_in && item.check_out)).length;

  // Filter Data untuk Table berdasarkan Search & Select Dropdown
  const filteredData = dataList.filter((item) => {
    const matchStatus = filterStatus === 'ALL' ? true : item.status === filterStatus;
    const matchSearch =
      (item.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.purpose || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-vh-100 position-relative" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Styles Fix Sidebar Full Height, Smooth Slide Animation & Responsive Table Wrapper */}
      <style>{`
        /* Dynamic Overlay Backdrop (Mobile Only) */
        .sidebar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(3px);
          z-index: 1040;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .sidebar-backdrop.show {
          opacity: 1;
          visibility: visible;
        }

        /* Sidebar Wrapper Fix Full Height */
        .sidebar-container {
          width: 260px;
          height: 100vh !important;
          max-height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          bottom: 0 !important;
          left: 0 !important;
          z-index: 1050;
          background-color: #0f172a;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          overflow-y: auto;
        }

        /* State ketika Sidebar Tertutup (Mobile Only) */
        @media (max-width: 991.98px) {
          .sidebar-container.closed {
            transform: translateX(-100%);
          }
          .sidebar-container.open {
            transform: translateX(0);
          }
          .main-content-wrapper {
            margin-left: 0 !important;
          }
        }

        /* Main Content Transition Shift & Permanent Sidebar on Desktop */
        @media (min-width: 992px) {
          .sidebar-container {
            transform: translateX(0) !important;
          }
          .main-content-wrapper {
            margin-left: 260px !important;
          }
        }

        .main-content-wrapper {
          min-height: 100vh;
          transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Tabel Responsif agar tidak merusak layout mobile */
        .responsive-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .responsive-table-wrapper table th,
        .responsive-table-wrapper table td {
          white-space: nowrap;
          vertical-align: middle;
        }
      `}</style>

      {/* Backdrop Gelap saat Sidebar Terbuka di Mobile */}
      <div 
        className={`sidebar-backdrop d-lg-none ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Employee Container (Fixed & Full Height) */}
      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
        
        {/* Tombol Silang (X) - Hanya Muncul di Mobile (d-lg-none) */}
        <button 
          className="btn btn-sm text-white rounded-circle position-absolute top-0 end-0 m-3 d-flex d-lg-none align-items-center justify-content-center"
          style={{ 
            width: '32px', 
            height: '32px', 
            zIndex: 1060, 
            backgroundColor: 'rgba(255, 255, 255, 0.12)', 
            border: 'none' 
          }}
          onClick={() => setIsSidebarOpen(false)}
          title="Tutup Sidebar"
        >
          <i className="bi bi-x-lg fs-6"></i>
        </button>

        {/* Komponen Utama Sidebar */}
        <SidebarEmployee
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          showBackdrop={false}
          showMobileClose={false}
        />
      </aside>

      {/* Area Konten Utama Halaman Business Trip Attendance */}
      <div className="main-content-wrapper d-flex flex-column min-w-0">
        
        {/* Navbar Layout Atas */}
        <div className="sticky-top" style={{ zIndex: 1020 }}>
          <NavbarEmployee
            user={user}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          />
        </div>

        {/* Main Content Area */}
        <main className="container-fluid p-3 p-md-4 flex-grow-1 overflow-auto" style={{ maxWidth: '1600px' }}>
          
          {/* HEADER */}
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1 fs-4 fs-md-3">Business Trip Attendance</h3>
            <p className="text-muted mb-0 small">Lakukan Check In dan Check Out selama menjalankan dinas luar.</p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
                    <FaBriefcase size={24} />
                  </div>
                  <div>
                    <small className="text-muted d-block">Total Dinas</small>
                    <h4 className="fw-bold mb-0">{totalDinas}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3">
                    <FaCamera size={24} />
                  </div>
                  <div>
                    <small className="text-muted d-block">Belum Check In</small>
                    <h4 className="fw-bold mb-0">{belumCheckIn}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="p-3 bg-info bg-opacity-10 text-info rounded-3">
                    <FaMapMarkerAlt size={24} />
                  </div>
                  <div>
                    <small className="text-muted d-block">Sedang Dinas</small>
                    <h4 className="fw-bold mb-0">{sedangDinas}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="p-3 bg-success bg-opacity-10 text-success rounded-3">
                    <FaCheckCircle size={24} />
                  </div>
                  <div>
                    <small className="text-muted d-block">Selesai</small>
                    <h4 className="fw-bold mb-0">{selesaiDinas}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FILTER SECTION */}
          <BusinessTripAttendanceFilter
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* CONTENT AREA */}
          {loading ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 bg-white text-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="responsive-table-wrapper">
                <BusinessTripAttendanceTable
                  data={filteredData}
                  onOpenCheckIn={(item) => {
                    setActiveItem(item);
                    setShowCheckInModal(true);
                  }}
                  onOpenCheckOut={(item) => {
                    setActiveItem(item);
                    setShowCheckOutModal(true);
                  }}
                  onOpenDetail={handleOpenDetail}
                />
              </div>
            </div>
          )}

          {/* CHECK IN MODAL */}
          {showCheckInModal && activeItem && (
            <CheckInModal
              show={showCheckInModal}
              onClose={() => setShowCheckInModal(false)}
              item={activeItem}
              onSuccess={fetchBusinessTrips}
            />
          )}

          {/* CHECK OUT MODAL */}
          {showCheckOutModal && activeItem && (
            <CheckOutModal
              show={showCheckOutModal}
              onClose={() => setShowCheckOutModal(false)}
              item={activeItem}
              onSuccess={fetchBusinessTrips}
            />
          )}

          {/* DETAIL MODAL */}
          {showDetailModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)' }}>
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
                  <div className="modal-header border-bottom px-4 py-3">
                    <h5 className="modal-title fw-bold text-dark">Detail Pengajuan Dinas</h5>
                    <button type="button" className="btn-close shadow-none" onClick={() => setShowDetailModal(false)}></button>
                  </div>
                  <div className="modal-body p-4">
                    {detailData ? (
                      <div>
                        <div className="row g-3 mb-4">
                          <div className="col-md-6">
                            <small className="text-muted d-block">Tanggal Dinas</small>
                            <span className="fw-semibold text-dark">
                              {detailData.trip_date
                                ? new Date(detailData.trip_date).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })
                                : '-'}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted d-block">Status</small>
                            <span className={`badge px-3 py-2 rounded-pill ${detailData.status === 'completed' ? 'bg-success' : 'bg-primary'}`}>
                              {detailData.status}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted d-block">Tujuan</small>
                            <span className="text-dark">{detailData.destination || '-'}</span>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted d-block">Keperluan</small>
                            <span className="text-dark">{detailData.purpose || '-'}</span>
                          </div>
                          <div className="col-12">
                            <small className="text-muted d-block">Catatan Persetujuan (Approval Note)</small>
                            <span className="text-dark">{detailData.approval_note || '-'}</span>
                          </div>
                        </div>

                        <hr className="text-muted opacity-25" />

                        {/* SECTION CHECK IN */}
                        <div className="mb-4">
                          <h6 className="fw-bold text-success mb-3">CHECK IN</h6>
                          {!detailData.check_in ? (
                            <div className="alert alert-light border text-muted rounded-3 mb-0">Belum melakukan Check In</div>
                          ) : (
                            <div className="p-3 bg-light rounded-3 border">
                              <p className="mb-1"><strong>Waktu:</strong> {detailData.check_in}</p>
                              <p className="mb-1"><strong>Latitude:</strong> {detailData.check_in_latitude || '-'}</p>
                              <p className="mb-2"><strong>Longitude:</strong> {detailData.check_in_longitude || '-'}</p>
                              {detailData.check_in_photo && (
                                <img
                                  src={`${storageBaseUrl}${detailData.check_in_photo}`}
                                  alt="Foto Check In"
                                  className="img-thumbnail rounded shadow-sm"
                                  style={{ maxHeight: '180px' }}
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* SECTION CHECK OUT */}
                        <div>
                          <h6 className="fw-bold text-primary mb-3">CHECK OUT</h6>
                          {!detailData.check_out ? (
                            <div className="alert alert-light border text-muted rounded-3 mb-0">Belum melakukan Check Out</div>
                          ) : (
                            <div className="p-3 bg-light rounded-3 border">
                              <p className="mb-1"><strong>Waktu:</strong> {detailData.check_out}</p>
                              <p className="mb-1"><strong>Latitude:</strong> {detailData.check_out_latitude || '-'}</p>
                              <p className="mb-2"><strong>Longitude:</strong> {detailData.check_out_longitude || '-'}</p>
                              {detailData.check_out_photo && (
                                <img
                                  src={`${storageBaseUrl}${detailData.check_out_photo}`}
                                  alt="Foto Check Out"
                                  className="img-thumbnail rounded shadow-sm"
                                  style={{ maxHeight: '180px' }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-5 text-center">
                        <LoadingSpinner />
                      </div>
                    )}
                  </div>
                  <div className="modal-footer border-top px-4 py-3">
                    <button type="button" className="btn btn-secondary px-4 rounded-3" onClick={() => setShowDetailModal(false)}>
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BusinessTripAttendancePage;