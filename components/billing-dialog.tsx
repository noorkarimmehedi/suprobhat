'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for trying out our service',
    price: '$0',
    features: [
      'Basic chat functionality',
      'Limited message history',
      'Standard response time',
      'Community support'
    ],
    buttonText: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    description: 'Best for professionals and small teams',
    price: '$15',
    period: '/month',
    features: [
      'Everything in Free',
      'Unlimited message history',
      'Priority response time',
      'Advanced AI capabilities',
      'Email support',
      'Custom integrations'
    ],
    buttonText: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: 'Custom',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom AI model training',
      'SLA guarantees',
      '24/7 priority support',
      'Advanced security features',
      'Custom deployment options'
    ],
    buttonText: 'Contact Sales',
    popular: false
  }
]

interface BillingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BillingDialog({ open, onOpenChange }: BillingDialogProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [supabase.auth])

  const handlePlanClick = async () => {
    if (!isAuthenticated) {
      onOpenChange(false)
      router.push('/auth/login')
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setTimeout(() => {
            onOpenChange(false)
          }, 100)
        } else {
          onOpenChange(true)
        }
      }}
    >
      <DialogContent 
        className="max-w-4xl max-h-[85vh] overflow-y-auto p-4 sm:p-6"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            All plans include a 14-day free trial
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'flex flex-col',
                plan.popular && 'border-primary shadow-lg'
              )}
            >
              <CardHeader className="p-4 pb-2">
                {plan.popular && (
                  <div className="px-2 py-0.5 text-xs text-primary bg-primary/10 rounded-full w-fit mb-2">
                    Most Popular
                  </div>
                )}
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription className="text-xs">{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-4 w-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span className="text-muted-foreground text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-4 pt-2">
                <Button
                  className="w-full text-sm h-8"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={handlePlanClick}
                >
                  {isAuthenticated ? plan.buttonText : 'Sign in to Subscribe'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-lg font-semibold mb-3">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-3 text-left">
            <div>
              <h3 className="font-medium text-sm mb-1">Can I change plans later?</h3>
              <p className="text-muted-foreground text-xs">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-xs">
                We accept all major credit cards, PayPal, and bank transfers for enterprise customers.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Is there a refund policy?</h3>
              <p className="text-muted-foreground text-xs">
                Yes, we offer a 14-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 