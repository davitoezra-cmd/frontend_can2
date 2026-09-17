import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavbarSupervisor from './NavbarSupervisor';
import SidebarSupervisor from './SidebarSupervisor';

const SupervisorLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="d-flex overflow-x-hidden" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>

            {/* Sidebar */}
            <SidebarSupervisor
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div
                className="flex-grow-1 d-flex flex-column min-vh-100 style-main-content"
            >

                <NavbarSupervisor
                    onToggleSidebar={() =>
                        setSidebarOpen(!sidebarOpen)
                    }
                />

                <main className="p-3 p-md-4 flex-grow-1">
                    <Outlet />
                </main>

            </div>

            <style>{`
                .style-main-content{
                    margin-left:0;
                    width:100%;
                    min-width:0;
                    box-sizing:border-box;
                }

                @media(min-width:768px){
                    .style-main-content{
                        margin-left:250px;
                        width:calc(100% - 250px);
                    }
                }
            `}</style>

        </div>
    );
};
export default SupervisorLayout;