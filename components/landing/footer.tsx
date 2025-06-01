import { Box, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "API", href: "/api-docs" },
    { name: "Integrations", href: "/integrations" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Documentation", href: "/docs" },
    { name: "Status", href: "/status" },
    { name: "Community", href: "/community" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Security", href: "/security" },
    { name: "Cookies", href: "/cookies" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Box className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold text-white">StockSync Cloud</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-sm">
              Modern inventory management solution that helps businesses streamline operations, reduce costs, and drive
              growth.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors">
                <Mail className="h-4 w-4" />
                <span>hello@stocksync.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© 2024 StockSync Cloud. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 hover:underline"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
