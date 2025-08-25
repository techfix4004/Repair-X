import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-text-dark">RepairX</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/services" className="text-text-secondary hover:text-primary transition-colors">
              Services
            </Link>
            <Link href="/how-it-works" className="text-text-secondary hover:text-primary transition-colors">
              How it works
            </Link>
            <Link href="/become-technician" className="text-text-secondary hover:text-primary transition-colors">
              Become a technician
            </Link>
            <Link href="/help" className="text-text-secondary hover:text-primary transition-colors">
              Help
            </Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-text-secondary hover:text-primary transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/register" 
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}