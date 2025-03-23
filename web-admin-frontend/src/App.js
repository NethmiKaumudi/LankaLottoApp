import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './Components/Login';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AdminDashboard from './Components/AdminDashboard';
import AgentSalesDetails from './Components/AgentSalesDetails';
import AgentDetails from './Components/AgentDetails';
import AgentApprove from './Components/AgentApprove';
import SalesPrediction from './Components/SalesPrediction';
function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/agent-sales-details" element={<AgentSalesDetails />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
         <Route path="/agent-approve" element={<AgentApprove/>} />
        <Route path="/agent-details" element={<AgentDetails/>} />
        <Route path="/sales-predictions" element={<SalesPrediction/>} />     
    </Routes>
  </Router>
  );
}

export default App;
