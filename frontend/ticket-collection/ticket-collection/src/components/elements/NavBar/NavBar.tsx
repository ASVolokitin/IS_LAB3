import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

export const NavBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Main" },
    { path: "/sql", label: "SQL Queries" },
    { path: "/tickets/create", label: "Create new ticket" },
    { path: "/connected_entities", label: "Dashboard" }
  ];

  useEffect(() => {
    setIsVisible(true);

    const currentItem = navItems.find(
      (item) => item.path === location.pathname
    );
    if (currentItem) {
      setActiveTab(currentItem.path);
    }
  }, [location.pathname]);

  return (
    <nav className={`navigation ${isVisible ? "navigation--visible" : ""}`}>
      <div className="navigation__container">
        <div className="navigation__logo">
          <Link to={"/"}>
            <span className="logo-text">Ticket Collection</span>
          </Link>
        </div>

        <ul className="navigation__list">
          {navItems.map((item, index) => (
            <li
              key={item.path}
              className="navigation__item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link
                to={item.path}
                className={`navigation__link ${
                  activeTab === item.path ? "navigation__link--active" : ""
                }`}
                onClick={() => setActiveTab(item.path)}
              >
                <span className="navigation__text">{item.label}</span>
                <div className="navigation__underline"></div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
