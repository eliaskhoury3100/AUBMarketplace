
import { NavLink } from 'react-router-dom';
import './BottomNav.css'; // Ensure this CSS file is linked for styling
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const BottomNav = () => {
  return (
/* isActive is a parameter which is true if the link is active and false otherwise. 
If isActive is true, it sets the class to nav-item active; otherwise, it sets the class to nav-item.*/
 // The main container for the bottom navigation
    <nav className="bottom-nav">
      <NavLink to="/homepage" exact className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <i className="fas fa-home"></i>
      </NavLink>

      <NavLink to="/uploadproduct" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <i className="fas fa-plus-circle"></i>
      </NavLink>

      <NavLink to="/conversations" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <i className="fas fa-envelope"></i>
      </NavLink>

      <NavLink to="/userprofile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <i className="fas fa-user"></i>
      </NavLink>
    </nav>
  );
};
// Export the BottomNav component as the default export of this module
export default BottomNav;
