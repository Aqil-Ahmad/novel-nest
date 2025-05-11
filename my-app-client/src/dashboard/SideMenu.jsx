import { useContext, useState } from 'react';
import {
  HiArrowSmRight,
  HiChartPie,
  HiInbox,
  HiOutlineCloudUpload,
  HiSupport,
  HiTable,
  HiUser,
  HiBookOpen,
} from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import userImg from "../assets/profile.jpg";
import { AuthContext } from '../contects/AuthProider';
import Logout from '../Components/Logout';  

const SidebarItem = ({ href, icon: Icon, children, className, onClick }) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center p-2 rounded-lg mt-3 hover:bg-gray-900 text-[#5DD62C] ${className}`}
    >
      <Icon className="w-6 h-6" />
      {children}
    </a>
  );
};
SidebarItem.propTypes = {
  href: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
};


const SideMenu = () => {
  const { user, logout } = useContext(AuthContext);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutPopup(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutPopup(false);
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutPopup(false);
  };

  const handleUploadChapter = (e) => {
    e.preventDefault();
    navigate('/admin/dashboard/chapters');
  };

  return (
    <div className="h-screen bg-black text-[#5DD62C] flex relative">
      <div className="flex flex-col h-full w-64 bg-black">
        <div className="p-4 flex flex-col items-center">
          <img
            src={user?.photoURL || userImg}
            alt="User profile"
            className="w-16 h-16 rounded-full mb-2"
          />
          <a href="/" className="text-[#5DD62C] font-medium text-center">
            {user?.displayName || "Demo User"}
          </a>
        </div>

        <div className="flex-1 px-3">
          <div className="space-y-1 pt-2">
            <SidebarItem href="/admin/dashboard" icon={HiChartPie} className="mt-4">
              <p className="ml-3">Dashboard</p>
            </SidebarItem>

            <SidebarItem href="/admin/dashboard/upload" icon={HiOutlineCloudUpload}>
              <p className="ml-3">Upload Book</p>
            </SidebarItem>

            <SidebarItem href="/admin/dashboard/manage" icon={HiInbox}>
              <p className="ml-3">Manage Books</p>
            </SidebarItem>

            <SidebarItem href="/admin/dashboard/profile" icon={HiUser}>
              <p className="ml-3">User</p>
            </SidebarItem>

            <SidebarItem href="/logout" icon={HiTable} onClick={handleLogoutClick}>
              <p className="ml-3">Log Out</p>
            </SidebarItem>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-800">
            <SidebarItem href="/login" icon={HiArrowSmRight}>
              <p className="ml-3">Sign In</p>
            </SidebarItem>

            <SidebarItem href="#" icon={HiBookOpen} onClick={handleUploadChapter}>
              <p className="ml-3">Upload Chapter</p>
            </SidebarItem>

            <SidebarItem href="/" icon={HiSupport}>
              <p className="ml-3">Home</p>
            </SidebarItem>
          </div>
        </div>
      </div>
      <div className="w-px bg-[#5DD62C] h-full opacity-50"></div>

      {showLogoutPopup && (
        <Logout
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}
    </div>
  );
};

export default SideMenu;
