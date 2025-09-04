import { Link } from "react-router-dom";
import Logo from "../assets/shreegraphics.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex flex-col items-start mb-4">
              <img
                src={Logo}
                alt="Shree Graphics Logo"
                className="h-16 w-auto object-contain mb-2"
              />
              <span className="text-2xl font-bold pattaya tracking-wide">
                Graphics Design
              </span>
            </div>

            <p className="text-gray-400 mb-4 text-sm leading-relaxed max-w-md">
              Your one-stop destination for custom logo designs, embroidery, and
              branding solutions. We bring your creative vision to life with
              professional quality and attention to detail.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297L3.323 17.49c.875.807 2.026 1.297 3.323 1.297h7.117c1.297 0 2.448-.49 3.323-1.297l-1.803-1.799c-.875.807-2.026 1.297-3.323 1.297H8.449z" />
                </svg>
              </a>

              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white">
                  Products
                </Link>
              </li>

              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide">
              Services
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/custom-logo-design" className="text-gray-400 hover:text-white">
                  Custom Logo
                </Link>
              </li>
              <li>
                <Link to="/embroidery" className="text-gray-400 hover:text-white">
                  Embroidery
                </Link>
              </li>
              <li>
                <Link to="/custom-design-order" className="text-gray-400 hover:text-white">
                  Custom Design
                </Link>
              </li>
              <li>
                <Link to="/custom-logo-request" className="text-gray-400 hover:text-white">
                  Custom Logo Request
                </Link>
              </li>
              <li>
                <Link to="/custom-embroidery-request" className="text-gray-400 hover:text-white">
                  Custom Embroidery Request
                </Link>
              </li>
              <li>
                <Link></Link>
                <Link></Link>
                <Link></Link></li>
              <li></li>
              <li></li>
              <li></li>
              {/* <li className="text-gray-400">Custom Logo Design</li>
              <li className="text-gray-400">Embroidery Services</li>
              <li className="text-gray-400">Brand Identity</li>
              <li className="text-gray-400">Print Design</li>
              <li className="text-gray-400">Digital Graphics</li> */}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Shree Graphics Design. All rights
            reserved.
          </p>
          <div className="flex space-x-4 mt-3 md:mt-0 text-xs">
            <Link to="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>
            <Link to="/refund" className="text-gray-400 hover:text-white">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
