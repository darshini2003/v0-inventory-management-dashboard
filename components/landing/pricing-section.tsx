import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Star } from "lucide-react"
import Link from "next/link"
import { AnimatedBackground } from "@/components/ui/animated-background"

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "per month",
    description: "Perfect for small businesses just getting started",
    features: [
      "Up to 1,000 products",
      "1 location",
      "Basic reporting",
      "Email support",
      "Mobile app access",
      "Barcode scanning",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$79",
    period: "per month",
    description: "Ideal for growing businesses with multiple locations",
    features: [
      "Up to 10,000 products",
      "5 locations",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Custom integrations",
      "Automated reordering",
      "Multi-user access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large organizations with complex needs",
    features: [
      "Unlimited products",
      "Unlimited locations",
      "Custom reporting",
      "24/7 phone support",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced security",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-black">
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the plan that's right for your business. All plans include a 14-day free trial with no setup fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-0 bg-black/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-black/60 ${
                plan.popular
                  ? "ring-2 ring-emerald-500 scale-105 border border-emerald-500/50"
                  : "border border-gray-800/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
                <CardDescription className="mt-4 text-gray-300">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full ${
                    plan.popular
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                  }`}
                  size="lg"
                >
                  <Link href={plan.name === "Enterprise" ? "/contact" : "/auth/register"}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400">
            All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
