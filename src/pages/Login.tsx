import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser } from "../store/slices/authSlice";
import { isAuthenticated } from "../lib/cookies";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);

  // Function to determine the appropriate dashboard route based on user role
  const getDashboardRoute = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return '/'; // Main Admin Dashboard
      case 'medical_admin':
        return '/dialysis-center'; // Dialysis Center Dashboard
      case 'accountant_medical':
        return '/dialysis-center'; // Dialysis Center Dashboard (accountant view)
      case 'office_admin':
        return '/office-management'; // Office Management Dashboard
      default:
        return '/'; // Default to main dashboard
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated() && user) {
      const dashboardRoute = getDashboardRoute(user.role);
      console.log(user);
      console.log(user.role);
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      // Navigate to appropriate dashboard based on user role
      if (result.payload && result.payload.user) {
        const dashboardRoute = getDashboardRoute(result.payload.user.role);
        navigate(dashboardRoute);
      } else {
        // Fallback to main dashboard if user data is not available
        navigate("/");
      }
    }
  };

  return (
    <div className="flex justify-center items-center py-8 calc(100dvh - 32px)">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <img src="/logo.png" alt="GRQ Welfare" className="object-fill w-full h-full rounded-sm pb-4" />
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to GRQ Welfare
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
