import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import logo from "../Assets/LankaLottoLogo.png";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaBell } from "react-icons/fa";

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesPrediction = () => {
  const [logoError, setLogoError] = useState(false);
  const [period, setPeriod] = useState(""); 
  const [predictions, setPredictions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleLogoError = () => setLogoError(true);
  const handleLogout = () => navigate("/");

  const fetchPredictions = async (selectedPeriod) => {
    if (!selectedPeriod) return;

    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/sales/predict/${selectedPeriod}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("API Response:", data); // Log the response to debug
      setPredictions(data.predictions || []);
      setSummary(data.summary || {});
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setPredictions([]);
      setSummary({});
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (e) => {
    e.preventDefault();
    // Clear all previous data
    setPredictions([]);
    setSummary({});
    setSuggestions([]);
    setLoading(false);
    // Set the new period
    setPeriod(e.target.value);
  };

  useEffect(() => {
    if (period) {
      fetchPredictions(period);
    } else {
      setPredictions([]);
      setSummary({});
      setSuggestions([]);
      setLoading(false);
    }
  }, [period]);

  const formatDate = (rawDate) => {
    const date = new Date(rawDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format the revenue in LKR currency format (assuming 1 ticket = LKR 100 for demo purposes)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount * 100); // Assuming 1 ticket = LKR 100
  };

  // Chart data with updated theme-based colors and background
  const chartData = {
    labels: predictions.map((pred) => formatDate(pred.Date)),
    datasets: [
      {
        label: "NLB Predicted Tickets",
        data: predictions.map((pred) => pred["NLB Predicted Tickets"]),
        borderColor: "rgba(0, 0, 0, 1)", // Black
        backgroundColor: "rgba(0, 0, 0, 0.2)", // Light black fill
        fill: true,
        tension: 0.4, // Smooth the line
      },
      {
        label: "DLB Predicted Tickets",
        data: predictions.map((pred) => pred["DLB Predicted Tickets"]),
        borderColor: "rgba(0, 0, 255, 1)", // Blue
        backgroundColor: "rgba(0, 0, 255, 0.2)", // Light blue fill
        fill: true,
        tension: 0.4, // Smooth the line
      },
    ],
  };

  // Chart options for better styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to adjust its height
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#000",
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Predicted Ticket Sales Over Time",
        color: "#000",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#000",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#000",
          maxRotation: 45, // Rotate labels to prevent overlap
          minRotation: 45,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "#000",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    backgroundColor: "#fff",
  };

  return (
    <div className="bg-gradient-to-r from-blue-200 to-blue-500 min-h-screen">
      <header className="bg-transparent p-4 flex justify-between items-center border-b border-blue-400">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-300 rounded-full p- discord nitro 2 w-12 h-12 flex items-center justify-center">
            {!logoError ? (
              <img
                src={logo}
                alt="Lanka Lotto Logo"
                className="w-full h-full object-contain"
                onError={handleLogoError}
              />
            ) : (
              <div className="w-10 h-10 border-2 border-blue-900 rounded-full flex items-center justify-center">
                X
              </div>
            )}
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

      <div className="flex">
        <div className="w-64 flex flex-col py-8 px-6 min-h-[calc(100vh-80px)] border-r border-blue-400">
          <div className="text-black font-bold mb-10">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <nav>
            <ul className="space-y-6">
              <li><Link to="/admin-dashboard" className="text-black hover:text-blue-700">Dashboard</Link></li>
              <li><Link to="/agent-approve" className="text-black hover:text-blue-700">Agent Approve</Link></li>
              <li><Link to="/agent-details" className="text-black hover:text-blue-700">Agent Details</Link></li>
              <li><Link to="/agent-sales-details" className="text-black hover:text-blue-700">Agent Sales Details</Link></li>
              <li><Link to="/sales-predictions" className="text-black font-bold hover:text-blue-700">Sales Predictions</Link></li>
            </ul>
          </nav>
        </div>

        <div className="flex-1 p-8">
          <h2 className="text-3xl font-bold mb-6 text-black">Sales Predictions</h2>

          {/* Dropdown for Period Selection */}
          <div className="mb-6">
            <label htmlFor="periodSelect" className="text-black font-medium mr-2">Select Period:</label>
            <select
              id="periodSelect"
              value={period}
              onChange={handlePeriodChange}
              className="p-2 rounded border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>

          {/* Predictions Table, Chart, and Summary */}
          {period && (
            <div className="mb-8">
              {/* Table */}
              <div className="mb-6 overflow-x-auto bg-white rounded-lg shadow-md max-h-[400px] overflow-y-auto">
                <table className="w-full rounded-lg overflow-hidden">
                  <thead className="bg-gray-900 text-white sticky top-0 z-10">
                    <tr>
                      <th className="py-4 px-6 text-center">Date</th>
                      <th className="py-4 px-6 text-center">NLB Tickets</th>
                      <th className="py-4 px-6 text-center">DLB Tickets</th>
                      <th className="py-4 px-6 text-center">Total Tickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="py-4 px-6 text-center text-black">Loading...</td>
                      </tr>
                    ) : predictions.length > 0 ? (
                      predictions.map((pred, index) => (
                        <tr key={index} className="bg-gray-100 text-black border-t border-gray-300 hover:bg-gray-200">
                          <td className="py-3 px-6 text-center">{formatDate(pred.Date)}</td>
                          <td className="py-3 px-6 text-center text-blue-600 font-medium">
                            {Math.round(pred["NLB Predicted Tickets"]).toLocaleString()}
                          </td>
                          <td className="py-3 px-6 text-center text-blue-600 font-medium">
                            {Math.round(pred["DLB Predicted Tickets"]).toLocaleString()}
                          </td>
                          <td className="py-3 px-6 text-center text-blue-600 font-medium">
                            {Math.round(pred["Total Predicted Tickets"]).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 px-6 text-center text-gray-500">No predictions available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Chart and Summary (Side by Side) */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Chart */}
                <div className="flex-1 bg-white rounded-lg shadow-md p-4" style={{ height: "400px", minWidth: "400px", maxWidth: "600px" }}>
                  <Line data={chartData} options={chartOptions} />
                </div>

                {/* Summary */}
                {summary.period_label && (
                  <div className="flex-1 p-6 bg-gray-800 text-white rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Summary</h3>
                    <p className="mb-2"><span className="font-medium">Period:</span> {summary.period_label}</p>
                    <p className="mb-2"><span className="font-medium">Total Sales:</span> {Math.round(summary.total_sales).toLocaleString()} tickets</p>
                    <p><span className="font-medium">Total Revenue:</span> {formatCurrency(summary.total_sales)}</p>
                  </div>
                )}
              </div>

              {/* Suggestions (Full Width Below) */}
              {suggestions.length > 0 && (
                <div className="p-6 bg-teal-700 text-white rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4">Sales Suggestions</h3>
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-teal-600 rounded-lg shadow-sm hover:bg-teal-500 transition-colors"
                      >
                        <FaBell className="text-yellow-300 text-lg mt-1" />
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesPrediction;