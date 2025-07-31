import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import FinisherBackground from "./Components/Bg/FinisherBackground.jsx";
import Home from "./Components/Home/Index"
import Login from "./Components/Login/Index";
import Form from "./Components/Forms/Index";
import ProtectedRoute from "./Components/PrivateRoute/Index"
import History from "./Components/History/Index";
import HistoryForms from "./Components/HistoryForms/index";
import SelectPreferences from "./Components/SelectPreferences/Index";
import Admin from './Components/Admin/Index';
import { UserProvider } from "./Context/userContext";
import CrudEncargados from "./Components/Admin/CrudEncargados/Index";
import CrudComedores from "./Components/Admin/CrudComedores/Index";


const BlockBackNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handlePopState = () => {
            // evita back navigation
            navigate(location.pathname, { replace: true });
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [location.pathname, navigate]);

    return null;
};


const App = () => {
    return (
        <UserProvider>
            <Router>
                <BlockBackNavigation />
                <FinisherBackground />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/first-time" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/settings" element={<SelectPreferences />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/form/:id" element={<Form />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/form-history/:formIndex/:realizacionIndex/:encuestadoIndex" element={<HistoryForms />} />
                        <Route path="/crud-comedores" element={<CrudComedores />} />
                        <Route path="/crud-encargados" element={<CrudEncargados />} />
                    </Route>
                </Routes>
            </Router>
        </UserProvider>
    );
};

export default App;
