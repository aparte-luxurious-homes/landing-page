import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import UserDropDown from './UserDropDown';

const Header: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [userDropDownOpen, setUserDropDownOpen] = useState(false);

  const openUserDropDown = useCallback(() => {
    setUserDropDownOpen(true);
  }, []);

  const closeUserDropDown = useCallback(() => {
    setUserDropDownOpen(false);
  }, []);

  return (
    <>
    <div className="flex justify-start items-center text-black py-16 px-8 md:px-32 bg-whitesmoke-200 relative">
  {/* Logo */}
  <a href="#" className="flex-shrink-0 mr-8">
    <img
      className="h-10 w-auto"
      alt="Logo"
      src="/group-56.svg"
    />
  </a>

  {/* Navigation Links */}
  <div className="hidden xl:flex items-center gap-8 font-semibold text-base text-black ml-12 pl-12">
    <Link to="/" className="no-underline p-2 text-teal hover:bg-black hover:text-white rounded-md transition-all cursor-pointer">Home</Link>
    <Link to="/agents" className="no-underline p-2 text-black hover:bg-teal hover:text-white rounded-md transition-all cursor-pointer">Agents</Link>
    <Link to="/apartments" className="no-underline p-2 text-black hover:bg-teal hover:text-white rounded-md transition-all cursor-pointer">Apartments</Link>
    <Link to="/services" className="no-underline p-2 text-black hover:bg-teal hover:text-white rounded-md transition-all cursor-pointer">Services</Link>
    <Link to="/pricing" className="no-underline p-2 text-black hover:bg-teal hover:text-white rounded-md transition-all cursor-pointer">Pricing</Link>
  </div>
</div>

    </>
  );
};

export default Header;
