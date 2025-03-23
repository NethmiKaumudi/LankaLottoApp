import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for logout
import { Chart } from "chart.js/auto";
import logo from "../Assets/LankaLottoLogo.png";

const AdminDashboard = () => {
  const [logoError, setLogoError] = useState(false);

  // Stats data (mocked for now)
  const stats = {
    agentsCount: 0,
    totalSalesCount: 0,
    nlbSalesCount: 0,
    dlbSalesCount: 0,
  };

  // Chart data
  const months = ["JAN", "FEB", "MARCH", "APRIL", "MAY", "JUNE"];
  const lineData = [6500, 3900, 6000, 4000, 7200, 5800];
  const barData = [5500, 4000, 4800, 4200, 6500, 5000];

  // Refs to store Chart.js instances
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);

  const handleLogoError = () => {
    setLogoError(true);
  };

  // Initialize useNavigate for logout
  const navigate = useNavigate();

  // Handle logout action
  const handleLogout = () => {
    console.log("Logged out");
    navigate("/"); // Navigate back to login page
  };

  useEffect(() => {
    // Get canvas contexts
    const lineCtx = document.getElementById("lineChart")?.getContext("2d");
    const barCtx = document.getElementById("barChart")?.getContext("2d");

    // Destroy existing charts if they exist
    if (lineChartRef.current) {
      lineChartRef.current.destroy();
      lineChartRef.current = null;
    }
    if (barChartRef.current) {
      barChartRef.current.destroy();
      barChartRef.current = null;
    }

    // Create Line Chart
    if (lineCtx) {
      lineChartRef.current = new Chart(lineCtx, {
        type: "line",
        data: {
          labels: months,
          datasets: [
            {
              label: "Revenue",
              data: lineData,
              borderColor: "white",
              backgroundColor: "transparent",
              tension: 0.1,
              borderWidth: 2,
              pointBackgroundColor: "transparent",
              pointBorderColor: "transparent",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              display: false,
              grid: { display: false },
            },
            x: {
              grid: { display: false },
              ticks: { color: "white" },
            },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    }

    // Create Bar Chart
    if (barCtx) {
      barChartRef.current = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            {
              label: "Revenue",
              data: barData,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              borderColor: "white",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              display: false,
              grid: { display: false },
            },
            x: {
              grid: { display: false },
              ticks: { color: "white" },
            },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    }

    // Cleanup function to destroy charts on unmount
    return () => {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
        lineChartRef.current = null;
      }
      if (barChartRef.current) {
        barChartRef.current.destroy();
        barChartRef.current = null;
      }
    };
  }, [lineData, barData, months]); // Re-run effect if chart data changes

  return (
    <div className="bg-gradient-to-r from-blue-200 to-blue-500 min-h-screen">
      {/* Header */}
      <header className="bg-transparent p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-300 rounded-full p-2 w-12 h-12 flex items-center justify-center relative">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={logo}
                alt="Lanka Lotto Logo"
                className="w-full h-full object-contain"
                onError={handleLogoError}
              />
              {logoError && (
                <div className="absolute w-10 h-10 flex items-center justify-center">
                  <div className="w-full h-full border-2 border-blue-900 rounded-full flex items-center justify-center">
                    <div className="w-3/4 h-3/4 border-2 border-blue-900 rounded-full"></div>
                  </div>
                  <div className="absolute w-full h-full">
                    <div className="absolute w-full h-0.5 bg-blue-900 top-1/2 left-0 transform -translate-y-1/2"></div>
                    <div className="absolute w-0.5 h-full bg-blue-900 top-0 left-1/2 transform -translate-x-1/2"></div>
                    <div className="absolute w-full h-0.5 bg-blue-900 top-1/2 left-0 transform -translate-y-1/2 rotate-45"></div>
                    <div className="absolute w-0.5 h-full bg-blue-900 top-0 left-1/2 transform -translate-x-1/2 rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900">Lanka Lotto</h1>
            <p className="text-blue-900 text-xs">
              Check Your Tickets Instantly
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-black font-bold flex items-center gap-1 hover:text-blue-700 focus:outline-none"
        >
          Logout
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 flex flex-col py-8 px-6 min-h-[calc(100vh-80px)] border-r border-blue-400">
          <div className="text-black font-bold mb-10 flex flex-col">
            <span>
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>
              {new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              })}
            </span>
          </div>

          <nav>
            <ul className="space-y-6">
              <li>
                <Link
                  to="/admin-dashboard"
                  className="text-black font-bold hover:text-blue-700 flex items-center gap-2"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/agent-approve"
                  className="text-black hover:text-blue-700 flex items-center gap-2"
                >
                  Agent Approve
                </Link>
              </li>
              <li>
                <Link
                  to="/agent-details"
                  className="text-black hover:text-blue-700 flex items-center gap-2"
                >
                  Agent Details
                </Link>
              </li>
              <li>
                <Link
                  to="/agent-sales-details"
                  className="text-black hover:text-blue-700 flex items-center gap-2"
                >
                  Agent Sales Details
                </Link>
              </li>
              <li>
                <Link
                  to="/sales-predictions"
                  className="text-black hover:text-blue-700 flex items-center gap-2"
                >
                  Sales Predictions and Suggestions
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
              <h3 className="text-lg font-medium mb-2">Agents Count</h3>
              <p className="text-2xl font-bold">{stats.agentsCount}</p>
            </div>
            <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
              <h3 className="text-lg font-medium mb-2">Total Sales Count</h3>
              <p className="text-2xl font-bold">{stats.totalSalesCount}</p>
            </div>
            <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
              <h3 className="text-lg font-medium mb-2">NLB Sales Count</h3>
              <p className="text-2xl font-bold">{stats.nlbSalesCount}</p>
            </div>
            <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
              <h3 className="text-lg font-medium mb-2">DLB Sales Count</h3>
              <p className="text-2xl font-bold">{stats.dlbSalesCount}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Sales Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 shadow-md">
              <h3 className="text-white uppercase text-sm font-bold mb-4">
                Line Chart Market Revenue
              </h3>
              <div className="h-64">
                <canvas id="lineChart"></canvas>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 shadow-md">
              <h3 className="text-white uppercase text-sm font-bold mb-4">
                Bar Chart Market Revenue
              </h3>
              <div className="h-64">
                <canvas id="barChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
