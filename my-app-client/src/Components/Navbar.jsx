import { useContext, useEffect, useState } from 'react'
import { FaBarsStaggered, FaBlog, FaXmark } from "react-icons/fa6";
import {Link} from 'react-router-dom';
import { AuthContext } from '../contects/AuthProider';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const {user} = useContext(AuthContext);
  console.log(user);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }
    useEffect(() => {
      const handleScroll = () => {
        if(window.scrollY > 100){
          setIsSticky(true);
        }
        else{
          setIsSticky(false);
        }
      }
      window.addEventListener("scroll",handleScroll);

      return () => {
        window.addEventListener("scroll", handleScroll);
      }
    }, []);
  
  // nav items
  const navItems = [
    {link: "Home",path: '/'},
    {link: "About",path: '/about'},
    {link: "Shop",path: '/shop'},
    {link: "Sell Your Book",path: '/admin/dashboard'},
    {link: "Read Novel",path: '/ChapterReader'}
  ]
  return (
    <header  className='w-full bg-transparent fixed top-0 left-0 right-0 transition-all ease-in duration-300'>
      <nav className={`py-4 lg:px-24 px-4 ${isSticky ? "sticky top-0 left-0 right-0 bg-gray-800" : ""}`}>
        {/* logo */}
        <div className='flex justify-between items-center text-base gap-8'>
          <Link to="/" className='text-2xl font-bold text-[#5DD62C] flex items-center gap-2'><FaBlog  className='inline-block'/></Link>

          {/*Nav items for large devices*/}

          <ul className='md:flex space-x-12 hidden'>
            {
              navItems.map(({link,path}) => <Link key={path} to={path} className='block text-base text-[#5DD62C] uppercase cursor-pointer hover:text-blue-700'>{link}</Link>)
            }
          </ul>
          <div className='space-x-12 hidden lg:flex items-center'>
            <button><FaBarsStaggered className='w-5 hover:text-blue-700'/></button>
          </div>

          {/* menu btn for the mobile devices */}

          <div className='md:hidden'>
            <button  onClick={toggleMenu} className='text-[#5DD62C] focus:outline-none'>
              {
                isMenuOpen ? <FaXmark className='h-5 w-5 text-[#5DD62C]'/> : <FaBarsStaggered className='h-5 w-5 text-[#5DD62C]'/>
              }
            </button>
          </div>
        </div> 
        {/*navItems for small devices*/}
        <div className={`space-y-4 px-4 mt-0 py-7 bg-black ${isMenuOpen ? "block fixed top-16 right-0 left-0 border-t border-[#5DD62C]" : "hidden"}`}>
          {
            navItems.map(({link,path}) => <Link key={path} to={path} className='block text-base text-[#5DD62C] uppercase cursor-pointer hover:bg-gray-800 p-2 rounded'>{link}</Link>)
          }
        </div>
      </nav>
    </header>
  )
}

export default Navbar