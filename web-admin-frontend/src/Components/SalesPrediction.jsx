import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Assets/LankaLottoLogo.png";

const SalesPrediction = () => {
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();

  const handleLogoError = () => setLogoError(true);
  const handleLogout = () => navigate("/");

  const predictionsData = [
    { month: "November", sales: 25000, confidence: 80 },
    { month: "December", sales: 30000, confidence: 81 },
    { month: "January", sales: 35000, confidence: 82 },
    { month: "February", sales: 40000, confidence: 83 },
    { month: "March", sales: 45000, confidence: 84 },
  ];

  const suggestionsData = [
    { title: "Focus on holiday promotions", description: "Targeted campaigns for December." },
    { title: "Expand into new markets", description: "Focus on regions with high demand potential." },
    { title: "Upsell to existing customers", description: "Use personalized email campaigns." },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-200 to-blue-500 min-h-screen">
      <header className="bg-transparent p-4 flex justify-between items-center border-b border-blue-400">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-300 rounded-full p-2 w-12 h-12 flex items-center justify-center">
            {!logoError ? (
              <img src={logo} alt="Lanka Lotto Logo" className="w-full h-full object-contain" onError={handleLogoError} />
            ) : (
              <div className="w-10 h-10 border-2 border-blue-900 rounded-full flex items-center justify-center">X</div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900">Lanka Lotto</h1>
            <p className="text-blue-900 text-xs">Sales Predictions</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-black font-bold flex items-center gap-1 hover:text-blue-700 focus:outline-none"
        >
          Logout
          <i className="fas fa-sign-out-alt"></i>
        </button>      </header>

      <div className="flex">
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
              <li><Link to="/admin-dashboard" className="text-black hover:text-blue-700">Dashboard</Link></li>
              <li><Link to="/agent-approve" className="text-black hover:text-blue-700">Agent Approve</Link></li>
              <li><Link to="/agent-details" className="text-black hover:text-blue-700">Agent Details</Link></li>
              <li><Link to="/agent-sales-details" className="text-black hover:text-blue-700">Agent Sales Details</Link></li>
              <li><Link to="/sales-predictions" className="text-black font-bold hover:text-blue-700">Sales Predictions</Link></li>
            </ul>
          </nav>
        </div>

        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-6">Sales Predictions</h2>
          
          {/* Predictions Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full rounded-lg overflow-hidden">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="py-4 px-6 text-center">Month</th>
                  <th className="py-4 px-6 text-center">Predicted Sales</th>
                  <th className="py-4 px-6 text-center">Confidence Level</th>
                </tr>
              </thead>
              <tbody>
                {predictionsData.map((prediction, index) => (
                  <tr key={index} className="bg-gray-900 text-white border-t border-gray-800">
                    <td className="py-4 px-6 text-center">{prediction.month}</td>
                    <td className="py-4 px-6 text-center text-yellow-300">${prediction.sales.toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${prediction.confidence}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{prediction.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Suggestions Section */}
          <h2 className="text-2xl font-bold mb-6">Sales Suggestions</h2>
          <div className="bg-gray-900 rounded-lg text-white">
            {suggestionsData.map((suggestion, index) => (
              <div 
                key={index} 
                className={`p-4 flex justify-between items-start ${index !== suggestionsData.length - 1 ? 'border-b border-gray-800' : ''}`}
              >
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 mr-3">∞</div>
                  <div>
                    <h3 className="font-medium">{suggestion.title}</h3>
                    <p className="text-gray-400 text-sm">{suggestion.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPrediction;