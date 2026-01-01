
export default function NavBar() {
    return (
<nav className="flex items-center justify-between px-8 py-6 flex-shrink-0">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-bold">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L4 28H28L16 2Z" fill="white" />
              </svg>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">VD CAPITAL</a>
              <a href="#" className="hover:text-white transition-colors">TRADING TERMINAL</a>
              <a href="#" className="hover:text-white transition-colors">COMPANY</a>
            </div>
          </div>

          <button className="hidden md:block border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-md text-sm transition-colors">
            <a href="/login">TRY VD CAPITAL</a>
          </button>
        </nav>
    )
}