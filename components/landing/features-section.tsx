import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, BarChart3, Bell, Users, Smartphone, Shield, Zap, Globe, TrendingUp } from "lucide-react"
import { AnimatedBackground } from "@/components/ui/animated-background"

const features = [
  {
    icon: Package,
    title: "Real-Time Inventory Tracking",
    description:
      "Monitor stock levels, track product movements, and get instant updates across all your locations with our advanced tracking system.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics & Reports",
    description:
      "Gain deep insights with comprehensive analytics, custom reports, and predictive forecasting to optimize your inventory decisions.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Never run out of stock again with intelligent alerts for low inventory, reorder points, and critical business events.",
  },
  {
    icon: Users,
    title: "Multi-User Collaboration",
    description:
      "Enable your team to work together seamlessly with role-based access controls and collaborative inventory management.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description:
      "Access your inventory data anywhere, anytime with our responsive design that works perfectly on all devices.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Keep your data safe with bank-level encryption, secure authentication, and comprehensive audit trails.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Performance",
    description: "Experience blazing-fast load times and real-time updates powered by modern cloud infrastructure.",
  },
  {
    icon: Globe,
    title: "Global Scalability",
    description:
      "Scale your operations worldwide with multi-location support, currency handling, and international compliance.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Insights",
    description: "Leverage AI-powered forecasting to predict demand, optimize stock levels, and reduce carrying costs.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-black">
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to manage inventory</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Powerful features designed to streamline your operations, reduce costs, and drive growth for businesses of
            all sizes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 bg-black/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-black/60 border border-gray-800/50"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
