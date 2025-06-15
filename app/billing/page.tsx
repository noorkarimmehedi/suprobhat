'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

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
    price: '$29',
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

export default function BillingPage() {
  return (
    <div className="container max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your needs. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'flex flex-col',
              plan.popular && 'border-primary shadow-lg'
            )}
          >
            <CardHeader>
              {plan.popular && (
                <div className="px-3 py-1 text-sm text-primary bg-primary/10 rounded-full w-fit">
                  Most Popular
                </div>
              )}
              <CardTitle className="text-2xl mt-4">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4 text-left">
          <div>
            <h3 className="font-medium mb-2">Can I change plans later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, PayPal, and bank transfers for enterprise customers.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Is there a refund policy?</h3>
            <p className="text-muted-foreground">
              Yes, we offer a 14-day money-back guarantee for all paid plans. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 