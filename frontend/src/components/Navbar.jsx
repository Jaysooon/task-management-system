import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaDoorOpen } from "react-icons/fa6";
const Navbar = ({ isHidden, loggedIn }) => {
  const { logout } = useAuth();
  const appName = "Task Manager";
  const linkClass =
    "relative text-black dark:text-white text-sm font-bold px-2 hover:text-amber-600 rounded-xl border border-zinc-200 px-3 py-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 group";
  return (
    <>
      <nav className="border-b-2 border-zinc-300">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="flex h-15 items-center justify-between">
            <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
              <a className="flex flex-shrink-0 items-center mr-4" to="/">
                {/* <img className="h-10 w-auto" src={logo} alt="React Jobs" /> */}
                <span className="text-amber-600 opacity-85 text-xl font-bold ml-2">
                  {appName}
                </span>
              </a>
              <div className={!isHidden && loggedIn ? "md:ml-auto" : "hidden"}>
                <div className="relative flex items-center space-x-0 ">
                  <Link
                    onClick={logout}
                    className={linkClass}
                    style={{ animation: "fadeIn 1s" }}
                  >
                    Log out
                  </Link>
                </div>
              </div>
              <div className={!isHidden && !loggedIn ? "md:ml-auto" : "hidden"}>
                <div className="relative flex items-center space-x-0 ">
                  <Link
                    to="/login"
                    className={`${linkClass} mr-2`}
                    style={{ animation: "fadeIn 1s" }}
                  >
                    Log in
                  </Link>
                  {/* <span className="mx-2 h-6 w-1 rounded bg-amber-600 inline-block" /> */}
                  <Link
                    to="/register"
                    className={`${linkClass} bg-amber-600`}
                    style={{ animation: "fadeIn 1s" }}
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
