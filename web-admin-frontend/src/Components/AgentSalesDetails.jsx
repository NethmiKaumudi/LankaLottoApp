import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Assets/LankaLottoLogo.png";

const AgentSalesDetails = () => {
  const [search, setSearch] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogoError = () => {
    setLogoError(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  useEffect(() => {
    const fetchAllSales = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate("/");
          return;
        }
        const response = await fetch("http://192.168.8.152:5000/sales/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setSalesData(data);
        } else {
          setError(data.message || "Failed to fetch sales data");
        }
      } catch (err) {
        setError("Error fetching sales data: " + err.message);
      }
    };

    fetchAllSales();
  }, [navigate]);

  // Calculate totals as integers
  const totalDLBSales = Math.floor(salesData.reduce((sum, data) => sum + data.dlb_sale, 0));
  const totalNLBSales = Math.floor(salesData.reduce((sum, data) => sum + data.nlb_sale, 0));
  const totalSales = Math.floor(salesData.reduce((sum, data) => sum + data.total_sale, 0));

  // Enhanced search functionality
  const filteredSalesData = salesData.filter((data) =>
    [
      data.date_of_sale || "",
      data.province || "",
      data.district || "",
      data.area || "",
      data.agent_no || "",
    ].some((field) => field.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-gradient-to-r from-blue-200 to-blue-500 min-h-screen">
      {/* Header */}
      <header className="bg-transparent p-4 flex justify-between items-center border-b border-blue-400">
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
                  className="text-black hover:text-blue-700"
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
                  className="text-black font-bold hover:text-blue-700"
                >
                  Agent Sales Details
                </Link>
              </li>
              <li>
                <Link
                  to="/sales-predictions"
                  className="text-black hover:text-blue-700"
                >
                  Sales Predictions and Suggestions
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-6 text-black">Agent Sales Details</h2>
          <div className="mb-6">
            <div className="relative w-full max-w-md mb-6">
              <input
                type="text"
                placeholder="Search by date, province, district, area, or agent no"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
                <h3 className="text-lg font-medium mb-2">Total DLB Sales</h3>
                <p className="text-2xl font-bold">{totalDLBSales}</p>
              </div>
              <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
                <h3 className="text-lg font-medium mb-2">Total NLB Sales</h3>
                <p className="text-2xl font-bold">{totalNLBSales}</p>
              </div>
              <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
                <h3 className="text-lg font-medium mb-2">Total Sales</h3>
                <p className="text-2xl font-bold">{totalSales}</p>
              </div>
              <div className="bg-blue-500 rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-white">
                <h3 className="text-lg font-medium mb-2">Total Records</h3>
                <p className="text-2xl font-bold">{filteredSalesData.length}</p>
              </div>
            </div>
          </div>
          {error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full rounded-lg overflow-hidden">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="py-4 px-6 text-center">DATE</th>
                    <th className="py-4 px-6 text-center">AGENT NO</th>
                    <th className="py-4 px-6 text-center">PROVINCE</th>
                    <th className="py-4 px-6 text-center">DISTRICT</th>
                    <th className="py-4 px-6 text-center">AREA</th>
                    <th className="py-4 px-6 text-center">DLB SALES</th>
                    <th className="py-4 px-6 text-center">NLB SALES</th>
                    <th className="py-4 px-6 text-center">TOTAL SALES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesData.map((data, index) => (
                    <tr
                      key={data._id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-100" : "bg-white"
                      } text-gray-800 hover:bg-blue-100`}
                    >
                      <td className="py-4 px-6 text-center">{data.date_of_sale}</td>
                      <td className="py-4 px-6 text-center">{data.agent_no}</td>
                      <td className="py-4 px-6 text-center">{data.province}</td>
                      <td className="py-4 px-6 text-center">{data.district}</td>
                      <td className="py-4 px-6 text-center">{data.area}</td>
                      <td className="py-4 px-6 text-center">{Math.floor(data.dlb_sale)}</td>
                      <td className="py-4 px-6 text-center">{Math.floor(data.nlb_sale)}</td>
                      <td className="py-4 px-6 text-center">{Math.floor(data.total_sale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentSalesDetails;