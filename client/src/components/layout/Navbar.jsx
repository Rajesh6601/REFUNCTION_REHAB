import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Home',     to: '/' },
  { label: 'About',    to: '/about' },
  {
    label: 'Services', to: '/services',
    children: [
      { label: 'Physiotherapy for Seniors', to: '/services/seniors' },
      { label: "Women's Health",            to: '/services/womens-health' },
      { label: 'Back, Neck & Shoulder',     to: '/services/pain-management' },
      { label: 'Sports Injury Rehab',       to: '/services/sports-rehab' },
      { label: 'Kids Exercise',             to: '/services/kids' },
    ],
  },
  { label: 'Testimonials', to: '/testimonials' },
  { label: 'Enroll',      to: '/enroll' },
  { label: 'Contact',     to: '/contact' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 select-none">
      {/* SVG movement icon */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="6" r="4" fill="#1A7F8E"/>
        <path d="M14 14c2-3 5-5 8-4l4 2-3 6-4-2-5 8 6 4-2 4-8-5 4-13z" fill="#1B2F5E"/>
        <path d="M10 18l-4 10h4l3-7 3 3 2-4-4-4-4 2z" fill="#1A7F8E"/>
      </svg>
      <span className="font-display font-bold text-xl leading-tight">
        <span className="logo-re">Re</span><span className="logo-rest">Function Rehab</span>
      </span>
    </Link>
  )
}

function DropdownMenu({ items, isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}
          className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
        >
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm font-body transition-colors duration-150 ${
                  isActive ? 'bg-light text-teal font-semibold' : 'text-text hover:bg-light hover:text-teal'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdown, setDropdown]     = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur py-3'
      }`}
    >
      {/* Top bar */}
      <div className="bg-navy text-white text-sm py-1.5 px-4 flex items-center justify-between">
        <span className="font-accent tracking-wide">Move Better. Feel Better. Live Better.</span>
        <a
          href="tel:+919900911795"
          className="flex items-center gap-1.5 hover:text-gold transition-colors font-accent font-medium"
        >
          <Phone size={14} /> 99009 11795
        </a>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Logo />

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.to} className="relative"
              onMouseEnter={() => link.children && setDropdown(link.to)}
              onMouseLeave={() => setDropdown(null)}
            >
              {link.children ? (
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-lg font-body font-medium text-text hover:text-teal hover:bg-light transition-colors text-sm"
                  onClick={() => navigate(link.to)}
                >
                  {link.label} <ChevronDown size={14} />
                </button>
              ) : (
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-body font-medium text-sm transition-colors ${
                      isActive ? 'text-teal bg-light' : 'text-text hover:text-teal hover:bg-light'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )}
              {link.children && (
                <DropdownMenu items={link.children} isOpen={dropdown === link.to} />
              )}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/book" className="btn-primary text-sm py-2.5 px-5">
            Book Appointment
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-lg text-navy hover:bg-light transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <div key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl font-medium text-base transition-colors ${
                        isActive ? 'bg-light text-teal' : 'text-text hover:bg-light hover:text-teal'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                  {link.children && (
                    <div className="ml-4 mt-1 flex flex-col gap-0.5">
                      {link.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2.5 rounded-lg text-sm text-muted hover:text-teal hover:bg-light transition-colors"
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                to="/book"
                onClick={() => setMobileOpen(false)}
                className="btn-primary justify-center mt-3 text-base"
              >
                Book Appointment
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
