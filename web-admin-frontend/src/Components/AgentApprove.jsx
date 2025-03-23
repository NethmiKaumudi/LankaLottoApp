import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Assets/LankaLottoLogo.png";

const AgentApprove = () => {
  const [logoError, setLogoError] = useState(false);
  const [pendingAgents, setPendingAgents] = useState([
    { id: 1, name: "David Johnson", location: "Colombo", contact: "0771112233", status: "Pending" },
    { id: 2, name: "Sarah Williams", location: "Kandy", contact: "0772223344", status: "Pending" },
    { id: 3, name: "Mark Taylor", location: "Galle", contact: "0773334455", status: "Pending" },
  ]);

  const handleLogoError = () => setLogoError(true);
  const navigate = useNavigate();
  const handleLogout = () => navigate("/");

  const approveAgent = (id) => {
    setPendingAgents(pendingAgents.filter(agent => agent.id !== id));
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
        </button>      </header>

      <div className="flex">
        <div className="w-64 flex flex-col py-8 px-6 min-h-[calc(100vh-80px)] border-r border-blue-400">
          <div className="text-black font-bold mb-10 flex flex-col">
            <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true })}</span>
          </div>
          <nav>
            <ul className="space-y-6">
              <li><Link to="/admin-dashboard" className="text-black hover:text-blue-700">Dashboard</Link></li>
              <li><Link to="/agent-approve" className="text-black font-bold hover:text-blue-700">Agent Approve</Link></li>
              <li><Link to="/agent-details" className="text-black hover:text-blue-700">Agent Details</Link></li>
              <li><Link to="/agent-sales-details" className="text-black hover:text-blue-700">Agent Sales Details</Link></li>
              <li><Link to="/sales-predictions" className="text-black hover:text-blue-700">Sales Predictions</Link></li>
            </ul>
          </nav>
        </div>

        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-6">Agent Approval</h2>
          <div className="overflow-x-auto">
            <table className="w-full rounded-lg overflow-hidden">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="py-4 px-6 text-center">ID</th>
                  <th className="py-4 px-6 text-center">Name</th>
                  <th className="py-4 px-6 text-center">Location</th>
                  <th className="py-4 px-6 text-center">Contact</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingAgents.map(agent => (
                  <tr key={agent.id} className="bg-gray-900 text-white border-t border-gray-800">
                    <td className="py-4 px-6 text-center">{agent.id}</td>
                    <td className="py-4 px-6 text-center">{agent.name}</td>
                    <td className="py-4 px-6 text-center">{agent.location}</td>
                    <td className="py-4 px-6 text-center">{agent.contact}</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => approveAgent(agent.id)} className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-700">Approve</button>
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

export default AgentApprove;
