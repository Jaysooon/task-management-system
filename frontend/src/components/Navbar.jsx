import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./Modals/LoginModal";
import RegisterModal from "./Modals/RegisterModal";
const Navbar = ({ isHidden, loggedIn }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
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
                <span className="text-amber-600 text-xl font-bold ml-2">
                  {appName}
                </span>
              </a>
              <div className={!isHidden && loggedIn ? "md:ml-auto" : "hidden"}>
                <div className="relative flex items-center space-x-0 ">
                  <button
                    onClick={logout}
                    className={linkClass}
                    style={{ animation: "fadeIn 1s" }}
                  >
                    Log out
                  </button>
                </div>
              </div>
              <div className={!isHidden && !loggedIn ? "md:ml-auto" : "hidden"}>
                <div className="relative flex items-center space-x-0 ">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className={`${linkClass} mr-2`}
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className={`${linkClass} bg-amber-600`}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </>
  );
};

export default Navbar;
