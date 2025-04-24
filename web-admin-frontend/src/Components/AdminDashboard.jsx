import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Chart } from "chart.js/auto";
import logo from "../Assets/LankaLottoLogo.png";

const AdminDashboard = () => {
  const [logoError, setLogoError] = useState(false);
  const [stats, setStats] = useState({
    agentsCount: 0,
    approvedAgentsCount: 0,
    pendingAgentsCount: 0,
    totalSalesCount: 0,
    nlbSalesCount: 0,
    dlbSalesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);

  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const navigate = useNavigate();

  const handleLogoError = () => setLogoError(true);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  useEffect(() => {
    const fetchAgentStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate("/");
          return;
        }
        const response = await fetch("http://192.168.8.152:5000/users/agent-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setStats((prev) => ({
            ...prev,
            agentsCount: data.agentsCount || 0,
            approvedAgentsCount: data.approvedAgentsCount || 0,
            pendingAgentsCount: data.pendingAgentsCount || 0,
          }));
        } else {
          setError(data.message || "Failed to fetch agent stats");
        }
      } catch (err) {
        setError("Error fetching agent stats: " + err.message);
      }
    };

    const fetchSalesData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch("http://192.168.8.152:5000/sales/by-date", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setSalesData(data);
          const totalSales = data.reduce((sum, item) => sum + item.total_sale, 0);
          const dlbSales = data.reduce((sum, item) => sum + item.dlb_sale, 0);
          const nlbSales = data.reduce((sum, item) => sum + item.nlb_sale, 0);
          setStats((prev) => ({
            ...prev,
            totalSalesCount: totalSales,
            dlbSalesCount: dlbSales,
            nlbSalesCount: nlbSales,
          }));
        } else {
          setError(data.message || "Failed to fetch sales data");
        }
      } catch (err) {
        setError("Error fetching sales data: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentStats();
    fetchSalesData();
  }, [navigate]);

  useEffect(() => {
    if (salesData.length > 0) {
      const labels = salesData.map((item) => item._id);
      const lineData = salesData.map((item) => item.total_sale);
      const dlbData = salesData.map((item) => item.dlb_sale);
      const nlbData = salesData.map((item) => item.nlb_sale);

      const lineChart = new Chart(lineChartRef.current, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Total Sales",
              data: lineData,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: "white" },
              grid: { color: "rgba(255, 255, 255, 0.1)" },
            },
            x: {
              ticks: { color: "white" },
              grid: { color: "rgba(255, 255, 255, 0.1)" },
            },
          },
          plugins: {
            legend: { labels: { color: "white" } },
          },
        },
      });

      const barChart = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "DLB Sales",
              data: dlbData,
              backgroundColor: "rgba(153, 102, 255, 0.6)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
            {
              label: "NLB Sales",
              data: nlbData,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
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
              ticks: { color: "white" },
              grid: { color: "rgba(255, 255, 255, 0.1)" },
            },
            x: {
              ticks: { color: "white" },
              grid: { color: "rgba(255, 255, 255, 0.1)" },
            },
          },
          plugins: {
            legend: { labels: { color: "white" } },
          },
        },
      });

      return () => {
        lineChart.destroy();
        barChart.destroy();
      };
    }
  }, [salesData]);

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
                <div className="absolute w-10 h-10 border-2 border-blue-900 rounded-full flex items-center justify-center">
                  X
                </div>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900">Lanka Lotto</h1>
            <p className="text-blue-900 text-xs">Check Your Tickets Instantly</p>
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
                  className="text-black font-bold hover:text-blue-700"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/agent-approve"
                  className="text-black hover:text-blue-700"
                >
                  Agent Approve
                </Link>
              </li>
              <li>
                <Link
                  to="/agent-details"
                  className="text-black hover:text-blue-700"
                >
                  Agent Details
                </Link>
              </li>
              <li>
                <Link
                  to="/agent-sales-details"
                  className="text-black hover:text-blue-700"
                >
                  Agent Sales Details
                </Link>
              </li>
              <li>
                <Link
                  to="/sales-predictions"
                  className="text-black hover:text-blue-700"
                >
                  Sales Predictions
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-8">
          {isLoading ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="ml-2 text-blue-500">Loading stats...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg font-medium mb-2">Total Agents</h3>
                  <p className="text-2xl font-bold">{stats.agentsCount}</p>
                </div>
                <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg font-medium mb-2">Approved Agents</h3>
                  <p className="text-2xl font-bold">{stats.approvedAgentsCount}</p>
                </div>
                <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg font-medium mb-2">Pending Agents</h3>
                  <p className="text-2xl font-bold">{stats.pendingAgentsCount}</p>
                </div>
                <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg font-medium mb-2">Total Sales Count</h3>
                  <p className="text-2xl font-bold">{stats.totalSalesCount}</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-6 text-black">Sales Analytics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-xl p-6 shadow-md">
                  <h3 className="text-white uppercase text-sm font-bold mb-4">
                    Total Sales in Srilanka
                  </h3>
                  <div className="h-64">
                    <canvas id="lineChart" ref={lineChartRef}></canvas>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 shadow-md">
                  <h3 className="text-white uppercase text-sm font-bold mb-4">
                    NLB DLB Sales in Srilanka
                  </h3>
                  <div className="h-64">
                    <canvas id="barChart" ref={barChartRef}></canvas>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;