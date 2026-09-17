import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const SupervisorCharts = ({ chartData }) => {
  return (
    <div className="row g-3 g-md-4 mt-1">

      {/* DONUT CHART */}
      <div className="col-12 col-lg-6">
        <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 h-100">

          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold text-dark m-0">
              Proporsi Kehadiran
            </h5>

            <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill small fw-semibold">
              Donut Chart
            </span>
          </div>

          <p className="text-muted small mb-2">
            Persentase pembagian status kehadiran karyawan hari ini.
          </p>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <PieChart>

                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [
                    `${value} Karyawan`,
                    "Jumlah",
                  ]}
                />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />

              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

      {/* BAR CHART */}
      <div className="col-12 col-lg-6">
        <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 h-100">

          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold text-dark m-0">
              Jumlah Karyawan per Status
            </h5>

            <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill small fw-semibold">
              Bar Chart
            </span>
          </div>

          <p className="text-muted small mb-2">
            Perbandingan total karyawan berdasarkan statusnya.
          </p>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: -20,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value} Orang`,
                    "Jumlah",
                  ]}
                />

                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Bar>

              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

    </div>
  );
};

export default SupervisorCharts;