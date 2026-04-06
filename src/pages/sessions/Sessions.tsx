import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Tech {
  id: number;
  name: string;
  email: string;
}

const Sessions = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "technician">("technician");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const { toast } = useToast();

  // Fetch online techs
  const { data: onlineTechs, refetch } = useQuery<Tech[]>({
    queryKey: ["sessions", "online"],
    queryFn: async () => {
      const res = await api.get("/sessions/online");
      return res.data;
    },
  });

  // Request GPS location if technician
  useEffect(() => {
    if (role === "technician") {
      if (!navigator.geolocation) {
        toast({
          title: "Location Not Supported",
          description: "Your device does not support geolocation.",
          variant: "destructive",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.error("Location error:", err);
          toast({
            title: "Location Required",
            description: "Please allow access to location for technician login.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true }
      );
    }
  }, [role]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!email || !password) throw new Error("Email and password required");

      // Admin login
      if (role === "admin") {
        const res = await api.post("/auth/login", { email, password });
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id.toString());
        return { role, message: "Admin logged in" };
      }

      // Technician login
      if (!location) throw new Error("GPS location is required");

      // Step 1: Authenticate technician
      const authRes = await api.post("/auth/login", { email, password });
      const token = authRes.data.token;
      const userId = authRes.data.user?.id;
      if (!token || !userId) throw new Error("Invalid login response");

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId.toString());

      // Step 2: Create session with location
      await api.post(
        "/sessions/login",
        {
          userId,
          latitude: location.lat,
          longitude: location.lng,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { role, message: "Technician logged in" };
    },
    onSuccess: (data) => {
      refetch();
      toast({ title: "Login Successful", description: data.message });
    },
    onError: (err: any) => {
      toast({
        title: "Login Failed",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!userId || !token) throw new Error("Not logged in");

      await api.post(
        "/sessions/logout",
        { userId: Number(userId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      return true;
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Logout Successful" });
    },
    onError: (err: any) => {
      toast({
        title: "Logout Failed",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Technician Sessions</h1>

      <div className="mb-4 flex flex-col gap-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => loginMutation.mutate()}
          disabled={loginMutation.isPending}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <h2 className="font-medium mb-2">Online Technicians:</h2>
      <ul className="list-disc pl-6">
        {onlineTechs?.map((tech) => (
          <li key={tech.id}>
            {tech.name} ({tech.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sessions;