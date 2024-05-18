import {BrowserRouter as Router,Routes, Route} from "react-router-dom"
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Offers from "./pages/Offers";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import { Slide, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from "./components/PrivateRoute";
import CreateListing from "./pages/CreateListing";

function App() {
  return (
    <>
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/offers" element={<Offers/>} />
        <Route path="/profile" element={<PrivateRoute/>}>
        <Route path="/profile" element={<Profile/>} />
        </Route>
        <Route path="/sign-up" element={<SignUp/>} />
        <Route path="/sign-in" element={<SignIn/>} />
        <Route path="/create-listing" element={<PrivateRoute/>}>
        <Route path="/create-listing" element={<CreateListing/>} />
        </Route>
      </Routes>
    </Router>
    <ToastContainer
    position="bottom-center"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="dark"
    transition={Slide}
    />
    </>
  );
}

export default App;
