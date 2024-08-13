import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignUpForm from "./SignupForm";
import ForgotPasswordForm from "./ForgotpasswordForm";
import EmailVerificationForm from "./EmailVerificationForm";
import ResetPasswordForm from './ResetpasswordForm';
import CategoriesPage from './SellingPage';
import UserProfile from './UserProfile';
import BottomNav from './BottomNav'; // Assume you have a BottomNav component
import UpperNav from './UpperNav';
import HomePage from './Homepage'
import ProductDetail from './Product';
import MessagingPage from './MessagingPage'
import ConversationPage from './ConversationPage'
import LostIDsPage from './IDpage'

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/forgotpassword" element={<ForgotPasswordForm />} />
          <Route path="/verify" element={<EmailVerificationForm />} />
          <Route path="/resetpassword" element={<ResetPasswordForm />} />
          
          {/* Routes that include the Bottom Navigation Bar */}
          <Route path="/uploadproduct" element={<><CategoriesPage /><BottomNav /></>} />
          <Route path="/homepage" element={<><HomePage /><BottomNav /></>} />
          <Route path="/productdetail/:id/:pk" element={<><ProductDetail /><BottomNav /></>} />
          <Route path="/userprofile" element={<><UserProfile /><BottomNav /></>} />
          <Route path="/userprofile/:sub" element={<><UserProfile /><BottomNav /></>} />
          <Route path="/messages" element={<><MessagingPage /><BottomNav /></>} />
          <Route path="/conversations" element={<><ConversationPage /><BottomNav /><UpperNav/></>} />
          <Route path="/lostid" element={<><LostIDsPage /><UpperNav/><BottomNav/></>} />
          {/* Redirect base URL to either login or another part of the app based on condition */}
          <Route path="/" element={<Navigate replace to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
