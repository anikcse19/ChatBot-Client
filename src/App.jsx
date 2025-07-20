import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UserChat from "./pages/UserChat";
import AdminChat from "./pages/AdminChat";
import Login from "./component/Login";


function App() {
  return (
    <Router>
      <nav >
        {/* <Link to="/user" style={{ marginRight: "1rem" }}>
          User Chat
        </Link>
        <Link to="/admin">Admin Chat</Link> */}
        {/* <Login></Login> */}
      </nav>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/user/:id" element={<UserChat />} />
        <Route path="/admin" element={<AdminChat />} />
      </Routes>
    </Router>
  );
}

export default App;
