import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const Sessions = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // Get GPS location once when component mounts
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Location error:", err);
        alert("⚠️ Location is required for technicians. Please allow access.");
      }
    );
  }, []);

  // Fetch online techs
  const { data: onlineTechs, refetch } = useQuery({
    queryKey: ["sessions", "online"],
    queryFn: async () => {
      const res = await api.get("/sessions/online");
      return res.data;
    },
  });

  // Login
  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      if (!location) {
        throw new Error("GPS location is required");
      }

      const res = await api.post("/sessions/login", {
        email,
        password,
        location, // send {lat, lng}
      });
      return res.data;
    },
    onSuccess: () => {
      refetch();
      alert("✅ Technician logged in successfully!");
    },
    onError: (err: any) => {
      alert("❌ Login failed: " + err.message);
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/sessions/logout", { email });
      return res.data;
    },
    onSuccess: () => refetch(),
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Technician Sessions</h1>

      <div className="mb-4 flex flex-col gap-2">
        <input
          type="email"
          placeholder="Technician Email"
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
        {onlineTechs?.map((tech: any) => (
          <li key={tech.id}>
            {tech.name} ({tech.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sessions;
