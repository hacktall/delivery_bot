import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import AuthForm from "./components/AuthForm";
import SuperAdminLayout from "./components/superadmin/SuperAdminLayout";
import Logs from "./components/superadmin/Logs";
import Tickets from "./components/superadmin/Tickets";
import Profile from "./components/superadmin/Profile";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import UserAccount from "./components/UserAccount";
import Ticketsadmin from "./components/admin/Tickets";
import BotSettings from "./components/admin/BotSettings";
import Contacts from "./components/admin/Contacts";
import Operators from "./components/admin/Operators";
import Bot from "./components/admin/Bot";
import UserLayout from "./components/user/UserLayout";
import Atendimento from "./components/user/Atendimento";
import Historico from "./components/user/Historico";
import Profileuser from "./components/user/Profile";
import AutoReplies from "./components/admin/AutoReplies";
import PlansPayment from "./components/admin/PlansPayment";

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthForm />} />

          <Route
            path="/superadmin/*"
            element={
              <PrivateRoute roles={["superadmin"]}>
                <SuperAdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="logs" element={<Logs />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route
            path="/admin/*"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tickets" element={<Ticketsadmin />} />
         <Route path="configuracoes-bot" element={<BotSettings />} />
         <Route path="contatos" element={<Contacts />} />
          <Route path="bot" element={<Bot/>}/>
           <Route path="operadores" element={<Operators/>}/>
          <Route path="respostas" element={<AutoReplies />} />
          <Route path="pagamento" element={<PlansPayment />} />
          </Route>
          <Route
            path="/conta"
            element={
              <PrivateRoute roles={["user", "admin", "superadmin"]}>
                <UserAccount />
              </PrivateRoute>
            }
          />

          <Route
            path="/user/*"
            element={
              <PrivateRoute roles={["user"]}>
                <UserLayout />
              </PrivateRoute>
            }
          >
            <Route path="atendimento" element={<Atendimento />} />
            <Route path="historico" element={<Historico />} />
            <Route path="profile" element={<Profileuser />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
