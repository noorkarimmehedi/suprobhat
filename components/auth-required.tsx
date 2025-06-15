import { getCurrentUser } from '@/lib/auth/get-current-user'
import { LoginForm } from './login-form'

interface AuthRequiredProps {
  children: React.ReactNode
}

export async function AuthRequired({ children }: AuthRequiredProps) {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to access this feature.</p>
          </div>
          <LoginForm />
        </div>
      </div>
    )
  }

  return <>{children}</>
} 