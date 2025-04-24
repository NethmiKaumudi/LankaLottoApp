import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Assets/LankaLottoLogo.png";

const AgentDetails = () => {
  const [search, setSearch] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [agentsData, setAgentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchApprovedAgents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('http://192.168.8.152:5000/users/approved-agents', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          console.log('API Response:', data);
          setAgentsData(data
            .filter(agent => agent && agent.id && agent.agent_name && agent.address && agent.contact_no)
            .map(agent => ({
              id: agent.id,
              name: agent.agent_name || 'Unknown',  // Match backend field
              location: agent.address || 'Unknown',
              contact: agent.contact_no || 'Unknown',
              status: agent.status || 'Active'  // Use backend-provided status
            }))
          );
        } else {
          setError(data.message || 'Failed to fetch agents');
        }
      } catch (error) {
        setError('Error fetching approved agents: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchApprovedAgents();
  }, []);

  const filteredAgents = agentsData.filter(agent =>
    agent?.name?.toLowerCase?.().includes(search.toLowerCase()) ?? false
  );

  const handleLogoError = () => setLogoError(true);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate("/");
  };

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
            <p className="text-blue-900 text-xs">Agent Management</p>
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
          <div className="text-black font-bold mb-10 flex flex-col">
            <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true })}</span>
          </div>
          <nav>
            <ul className="space-y-6">
              <li><Link to="/admin-dashboard" className="text-black hover:text-blue-700">Dashboard</Link></li>
              <li><Link to="/agent-approve" className="text-black hover:text-blue-700">Agent Approve</Link></li>
              <li><Link to="/agent-details" className="text-black font-bold hover:text-blue-700">Agent Details</Link></li>
              <li><Link to="/agent-sales-details" className="text-black hover:text-blue-700">Agent Sales Details</Link></li>
              <li><Link to="/sales-predictions" className="text-black hover:text-blue-700">Sales Predictions</Link></li>
            </ul>
          </nav>
        </div>

        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-6">Agent Details</h2>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search Agent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xs px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-blue-500">Loading agents...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-gray-500 text-center">No agents found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full rounded-lg overflow-hidden">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="py-4 px-6 text-center">ID</th>
                    <th className="py-4 px-6 text-center">Name</th>
                    <th className="py-4 px-6 text-center">Location</th>
                    <th className="py-4 px-6 text-center">Contact</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map(agent => (
                    <tr key={agent.id} className="bg-gray-900 text-white border-t border-gray-800">
                      <td className="py-4 px-6 text-center">{agent.id}</td>
                      <td className="py-4 px-6 text-center">{agent.name}</td>
                      <td className="py-4 px-6 text-center">{agent.location}</td>
                      <td className="py-4 px-6 text-center">{agent.contact}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full ${agent.status === "Active" ? "bg-green-500" : "bg-red-500"}`}>
                          {agent.status}
                        </span>
                      </td>
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

export default AgentDetails;