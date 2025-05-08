import React, { useContext } from 'react';
import {
  HiArrowSmRight,
  HiChartPie,
  HiInbox,
  HiOutlineCloudUpload,
  HiSupport,
  HiTable,
  HiUser,
  HiViewBoards
} from "react-icons/hi";
import userImg from "../assets/profile.jpg";
import { AuthContext } from '../contects/AuthProider';

// Custom sidebar item component
const SidebarItem = ({ href, icon: Icon, children, className }) => {
  return (
    <a 
      href={href} 
      className={`flex items-center p-2 rounded-lg mt-3 hover:bg-gray-900 text-[#5DD62C] ${className}`}
    >
      <Icon className="w-6 h-6" />
      {children}
    </a>
  );
};

const SideMenu = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="h-screen bg-black text-[#5DD62C] flex">
      <div className="flex flex-col h-full w-64 bg-black">
        {/* Logo/User */}
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

        {/* Navigation Items */}
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

            
            

            <SidebarItem href="/logout" icon={HiTable}>
              <p className="ml-3">Log Out</p>
            </SidebarItem>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-800">
            <SidebarItem href="/login" icon={HiArrowSmRight}>
              <p className="ml-3">Sign In</p>
            </SidebarItem>

            <SidebarItem href="#" icon={HiChartPie}>
              <p className="ml-3">Upgrade to Pro</p>
            </SidebarItem>


            <SidebarItem href="/" icon={HiSupport}>
              <p className="ml-3">Home</p>
            </SidebarItem>
          </div>
        </div>
      </div>
      <div className="w-px bg-[#5DD62C] h-full opacity-50"></div>
    </div>
  );
};

export default SideMenu;