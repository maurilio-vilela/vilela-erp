import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { FaBars, FaUser, FaSignOutAlt, FaSun, FaMoon, FaUsers, FaTachometerAlt, FaShoppingCart } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearUser } from '../redux/authSlice';
import './PageLayout.css';

const PageLayout = ({ children, pageTitle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    dispatch(clearUser());
    navigate('/login');
  };

  return (
    <div className="page-layout">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h4 className={isSidebarOpen ? '' : 'd-none'}>Vilela ERP</h4>
        </div>
        <Nav className="flex-column">
          <Nav.Link href="/admin/dashboard" className="sidebar-link">
            <FaTachometerAlt /> {isSidebarOpen && 'Dashboard'}
          </Nav.Link>
          <Nav.Link href="/admin/persons" className="sidebar-link">
            <FaUsers /> {isSidebarOpen && 'Pessoas'}
          </Nav.Link>
          <Nav.Link href="/admin/reminders" className="sidebar-link">
            <FaShoppingCart /> {isSidebarOpen && 'Lembretes'}
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Header */}
        <Navbar className="header" expand="lg">
          <Button variant="link" onClick={toggleSidebar} className="me-2">
            <FaBars />
          </Button>
          <Navbar.Brand>{pageTitle}</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav" className="justify-content-end">
            <Nav>
              <Nav.Item className="d-flex align-items-center">
                <FaUser className="me-1" />
                <span>{user?.name || 'Usuário'}</span>
              </Nav.Item>
              <Nav.Link onClick={toggleDarkMode} className="ms-3">
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </Nav.Link>
              <Nav.Link onClick={handleLogout} className="ms-3">
                <FaSignOutAlt /> Sair
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        {/* Content */}
        <Container fluid className="content">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default PageLayout;