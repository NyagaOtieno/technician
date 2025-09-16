import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

interface LoginProps {
  onLogin?: (role: "admin" | "technician") => void;
}

const API_BASE = "https://jendietech-production.up.railway.app/api";

const Login = ({ onLogin }: LoginProps) => {
  const [role, setRole] = useState<"admin" | "technician">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "technician") requestLocation();
  }, [role]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      toast({
        title: "Location Not Supported",
        description: "Your device does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: LocationData = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: Date.now(),
          accuracy: pos.coords.accuracy,
        };
        setLocation(loc);
        setLocationStatus("granted");
      },
      (err) => {
        setLocationStatus("denied");
        let msg = "Unable to access location.";
        if (err.code === 1) msg = "Location permission denied.";
        if (err.code === 2) msg = "Location unavailable.";
        if (err.code === 3) msg = "Location request timed out.";

        toast({
          title: "Location Error",
          description: msg,
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === "admin") {
        // Admin login
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email,
          password,
        });
        const token = res.data.token;
        localStorage.setItem("token", token);

        toast({ title: "Login successful!", description: "Welcome Admin" });
        onLogin?.("admin");
        navigate("/dashboard");
      } else {
        // Technician login
        if (!location || locationStatus !== "granted") {
          toast({
            title: "Location Required",
            description: "GPS is mandatory for login.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const authRes = await axios.post(`${API_BASE}/auth/login`, {
          email,
          password,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp,
          accuracy: location.accuracy || 0,
        });

        const token = authRes.data.token;
        const userId = authRes.data.user?.id;

        if (!userId || !token)
          throw new Error("Invalid login response from server");

        localStorage.setItem("token", token);

        await axios.post(
          `${API_BASE}/sessions/login`,
          { userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast({
          title: "Login Successful",
          description: "Welcome Technician!",
        });
        onLogin?.("technician");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description:
          err.response?.data?.message ||
          err.message ||
          "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLocationStatusBadge = () => {
    if (role !== "technician") return null;
    switch (locationStatus) {
      case "requesting":
        return (
          <Badge variant="secondary" className="gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Requesting Location...
          </Badge>
        );
      case "granted":
        return (
          <Badge
            variant="default"
            className="gap-2 bg-success text-success-foreground"
          >
            <MapPin className="h-3 w-3" />
            Location Captured
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="destructive" className="gap-2">
            <MapPin className="h-3 w-3" />
            Location Denied
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border">
          <CardHeader className="text-center">
            <img
              src="/src/assets/jendie-logo.png"
              alt="JENDIE Tech"
              className="h-16 mx-auto mb-4"
            />
            <CardTitle className="text-2xl font-bold text-foreground">
              {role === "admin" ? "Admin Login" : "Technician Login"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {role === "admin"
                ? "Sign in to access the JENDIE Admin Dashboard"
                : "Technician login requires GPS location tracking"}
            </CardDescription>
            <div className="flex justify-center mt-4">
              {getLocationStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4 gap-2">
              <Button
                type="button"
                variant={role === "admin" ? "default" : "outline"}
                onClick={() => setRole("admin")}
              >
                Admin
              </Button>
              <Button
                type="button"
                variant={role === "technician" ? "default" : "outline"}
                onClick={() => setRole("technician")}
              >
                Technician
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                disabled={
                  loading ||
                  (role === "technician" &&
                    (!location || locationStatus !== "granted"))
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {role === "technician" && locationStatus === "denied" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={requestLocation}
                  className="w-full"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Retry Location Access
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
