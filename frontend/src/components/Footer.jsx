const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 border-t border-zinc-200 text-zinc-400 text-center p-4 flex justify-center items-center z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p>
          &copy; {new Date().getFullYear()}
          <span className="text-amber-600"> Task Manager</span>. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
