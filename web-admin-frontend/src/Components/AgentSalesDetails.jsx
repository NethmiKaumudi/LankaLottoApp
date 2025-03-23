import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import logo from "../Assets/LankaLottoLogo.png";

const AgentSalesDetails = () => {
  const [search, setSearch] = useState("");
  const [logoError, setLogoError] = useState(false);

  const salesData = [
    {
      month: "January",
      totalSales: 500,
      newCustomers: 120,
      repeatCustomers: 380,
      revenue: 10000,
      satisfactory: 23.3,
    },
    {
      month: "February",
      totalSales: 450,
      newCustomers: 100,
      repeatCustomers: 350,
      revenue: 9000,
      satisfactory: 56.3,
    },
    {
      month: "March",
      totalSales: 550,
      newCustomers: 130,
      repeatCustomers: 420,
      revenue: 11000,
      satisfactory: 89.3,
    },
    {
      month: "April",
      totalSales: 600,
      newCustomers: 150,
      repeatCustomers: 450,
      revenue: 12000,
      satisfactory: 45.3,
    },
    {
      month: "May",
      totalSales: 700,
      newCustomers: 170,
      repeatCustomers: 530,
      revenue: 14000,
      satisfactory: 36.3,
    },
    {
      month: "June",
      totalSales: 650,
      newCustomers: 160,
      repeatCustomers: 490,
      revenue: 13000,
      satisfactory: 78.3,
    },
  ];

  const filteredSalesData = salesData.filter((data) =>
    data.month.toLowerCase().includes(search.toLowerCase())
  );

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
                  className="text-black hover:text-blue-700 flex items-center gap-2"
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
                  className="text-black font-bold hover:text-blue-700 flex items-center gap-2"
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
          <h2 className="text-2xl font-bold mb-6">Agent Sales Details</h2>
          <div className="mb-6">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full rounded-lg overflow-hidden">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="py-4 px-6 text-center">MONTH</th>
                  <th className="py-4 px-6 text-center">TOTAL SALES</th>
                  <th className="py-4 px-6 text-center">NEW CUSTOMER</th>
                  <th className="py-4 px-6 text-center">REPEAT CUSTOMER</th>
                  <th className="py-4 px-6 text-center">REVENUE ($)</th>
                  <th className="py-4 px-6 text-center">SATISFACTORY (%)</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalesData.map((data, index) => (
                  <tr
                    key={index}
                    className="bg-gray-900 text-white border-t border-gray-800"
                  >
                    <td className="py-4 px-6 text-center">{data.month}</td>
                    <td className="py-4 px-6 text-center">{data.totalSales}</td>
                    <td className="py-4 px-6 text-center">
                      {data.newCustomers}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {data.repeatCustomers}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="bg-gray-300 text-black text-center rounded-full px-3 py-1 w-24 mx-auto">
                        {data.revenue}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="bg-gray-300 text-black text-center rounded-full px-3 py-1 w-24 mx-auto">
                        {data.satisfactory}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSalesDetails;
