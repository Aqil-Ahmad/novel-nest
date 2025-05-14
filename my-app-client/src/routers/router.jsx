import {
  createBrowserRouter
} from "react-router-dom";
import App from '../App';
import Home from "../home/Home";
import Shop from "../shop/Shop";
import About from "../Components/About";
import ChapterReader from "../Components/ChapterReader";
import SingleBook from "../shop/SingleBook";
import DashboradLayout from "../dashboard/DashboradLayout";
import Dashboard from "../dashboard/Dashboard";
import UploadBook from "../dashboard/UploadBook";
import ManageBooks from "../dashboard/ManageBooks";
import EditBooks from "../dashboard/EditBooks";
import Signup from "../Components/Signup";
import Login from "../Components/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Logout from "../Components/Logout";
import Profile from "../dashboard/Profile";
import Details from "../dashboard/Details";
import ChapterManagement from "../dashboard/ChapterManagement";
import ReadNovel from "../Components/ReadNovel";
import PDFViewer from "../Components/PDFViewer";
import UserDashboard from '../dashboard/UserDashboard';
import AdminProfile from "../dashboard/AdminProfile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children : [
      {
        path: '/',
        element: <Home />
      },
      {
        path: "/shop",
        element: <Shop />
      },
      {
        path: "/about",
        element: <About />
      },
      // Updated routes for reading novels
      {
        path: "/ChapterReader",
        element: <ReadNovel />
      },
      {
        path: "/ChapterReader/:bookId",
        element: <ChapterReader />
      },
      {
        path: "/ChapterReader/:bookId/:chapterNumber",
        element: <ChapterReader />
      },
      {
        path: "/book/:id",
        element: <SingleBook />,
        loader: ({params}) => fetch(`http://localhost:3000/api/books/${params.id}`)
      },
      {
        path: "/book/:id/pdf",
        element: <PDFViewer />,
        loader: ({params}) => fetch(`http://localhost:3000/api/books/${params.id}`)
      }
    ]
  },
  {
    path: '/admin/dashboard',
    element: <DashboradLayout />,
    children: [
      {
        path: "/admin/dashboard",
        element: <PrivateRoute><Dashboard /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/upload",
        element: <PrivateRoute role="admin"><UploadBook /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/manage",
        element: <PrivateRoute role="admin"><ManageBooks /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/edit-books/:id",
        element: <EditBooks />,
        loader: ({params}) => fetch(`http://localhost:3000/book/${params.id}`)
      },
      {
        path: "/admin/dashboard/profile",
        element: <PrivateRoute><Profile /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/profile-admin",
        element: <PrivateRoute role="admin"><AdminProfile /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/details",
        element: <Details />
      },
      {
        path: "/admin/dashboard/chapters",
        element: <PrivateRoute><ChapterManagement /></PrivateRoute>
      }
    ]
  },
  {
    path: '/user/dashboard',
    element: <PrivateRoute role="user"><UserDashboard /></PrivateRoute>
  },
  {
    path: '/user/dashboard/history',
    element: <PrivateRoute role="user"><UserDashboard /></PrivateRoute>
  },
  {
    path: '/user/dashboard/bookmarks',
    element: <PrivateRoute role="user"><div className="p-8 text-[#5DD62C] text-2xl">Bookmarked Novels (Coming Soon)</div></PrivateRoute>
  },
  {
    path: "sign-up",
    element: <Signup />
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "logout",
    element: <Logout />
  }
]);

export default router;