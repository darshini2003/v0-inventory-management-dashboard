import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { AnimatedBackground } from "@/components/ui/animated-background"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Operations Manager",
    company: "TechFlow Solutions",
    content:
      "StockSync Cloud has transformed our inventory management. We've reduced stockouts by 90% and cut our carrying costs significantly. The real-time tracking is a game-changer.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Michael Chen",
    role: "CEO",
    company: "RetailMax",
    content:
      "The analytics and forecasting features have helped us optimize our purchasing decisions. We're now able to predict demand patterns and adjust our inventory accordingly.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Emily Rodriguez",
    role: "Warehouse Manager",
    company: "Global Logistics",
    content:
      "Implementation was seamless, and the team support was exceptional. The mobile app allows me to manage inventory on the go, which has improved our operational efficiency.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "David Thompson",
    role: "Supply Chain Director",
    company: "Manufacturing Plus",
    content:
      "The multi-location support and real-time synchronization have been crucial for our expanding business. We can now manage inventory across 15 locations from a single dashboard.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Lisa Wang",
    role: "Inventory Specialist",
    company: "E-commerce Hub",
    content:
      "The automated reordering feature has saved us countless hours. The system learns our patterns and suggests optimal reorder points. It's like having an AI assistant for inventory.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Robert Martinez",
    role: "COO",
    company: "Distribution Network",
    content:
      "ROI was evident within the first month. The reduction in manual processes and improved accuracy has more than paid for the investment. Highly recommend StockSync Cloud.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-black">
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by businesses worldwide</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our customers have to say about their experience with StockSync
            Cloud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-0 bg-black/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-black/60 border border-gray-800/50"
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>

                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
