import { Button } from "@/components/ui/button"
import { LoginForm } from "./components/login-form"
import ThemeToggle from "./ThemeToggle"

function Test() {
  return (
<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
     <div className="p-4 flex justify-end">
        <ThemeToggle/>
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}

export default Test