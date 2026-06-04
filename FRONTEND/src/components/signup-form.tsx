import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Navigate, useNavigate } from "react-router-dom"
const PORT = import.meta.env.VITE_BACKEND_PORT 

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
console.log("clicked")
console.log(JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
          displayName: form.displayName,
        }),)
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    setLoading(true)

    try {
const res = await fetch(`http://localhost:${PORT}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
          displayName: form.displayName,
        }),
      })
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Registration failed")
        return
      }

      alert("Account created successfully 🎉")
        navigate("/Signin") // change if needed
    } catch (err) {
      alert("Server not reachable")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="displayName">Full Name</FieldLabel>
              <Input
                id="displayName"
                placeholder="John Doe"
                value={form.displayName}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              <FieldDescription className="px-6 text-center">
                Already have an account? <a href="/Signin">Sign in</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
