"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  const [email, setEmail] = useState("")

  return (
    <AnimatedBackground className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Badge variant="outline" className="mb-8 bg-black/40 border-emerald-500/30 text-emerald-400 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Real-time Inventory Management
          </Badge>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Manage your inventory with{" "}
            <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Automation
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Track inventory levels, manage orders, analyze trends, and optimize your supply chain with real-time
            insights and powerful analytics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4"
          >
            <Input
              type="email"
              placeholder="Your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-sm bg-black/40 border-gray-700 text-white placeholder-gray-400 backdrop-blur-sm"
            />
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8">
              Start Managing Inventory
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm text-gray-500 mb-12"
          >
            Free 14 day trial • No credit card required
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-4"
          >
            <p className="text-xs uppercase text-gray-500 tracking-wider font-medium">INTEGRATES WITH</p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
              <span className="text-sm">Supabase</span>
              <span className="text-sm">PostgreSQL</span>
              <span className="text-sm">Stripe</span>
              <span className="text-sm">Webhooks</span>
              <span className="text-sm">REST API</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}
