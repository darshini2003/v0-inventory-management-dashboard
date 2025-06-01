import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { AnimatedBackground } from "@/components/ui/animated-background"

const benefits = [
  "Reduce inventory costs by up to 30%",
  "Eliminate stockouts and overstock situations",
  "Automate reordering and supplier management",
  "Get real-time visibility across all locations",
  "Improve accuracy with barcode scanning",
  "Generate detailed reports in seconds",
]

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-24 relative overflow-hidden bg-black">
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Transform your inventory management today
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of businesses that have revolutionized their operations with StockSync Cloud. Experience
              the difference that modern inventory management can make.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href="/auth/register">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl shadow-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Inventory Overview</h3>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">1,247</div>
                    <div className="text-sm text-gray-400">Total Items</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-emerald-400">$284K</div>
                    <div className="text-sm text-gray-400">Total Value</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Electronics</span>
                    <span className="text-sm font-medium text-white">342 items</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Clothing</span>
                    <span className="text-sm font-medium text-white">189 items</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
