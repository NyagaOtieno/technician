import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { loginTechnician, logoutTechnician, getOnlineUsers } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email?: string;
};

const Sessions = () => {
  const [userId, setUserId] = useState<string>("");

  // Fetch online technicians
  const {
    data: onlineTechs,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["sessions", "online"],
    queryFn: getOnlineUsers,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID is required");
      return await loginTechnician(Number(userId));
    },
    onSuccess: () => {
      refetch();
    },
    onError: (err: any) => {
      console.error("Login error:", err);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID is required");
      return await logoutTechnician(Number(userId));
    },
    onSuccess: () => {
      refetch();
    },
    onError: (err: any) => {
      console.error("Logout error:", err);
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Technician Sessions</h1>

      <div className="mb-4 flex flex-col gap-2">
        <input
          type="number"
          placeholder="Technician User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <div className="flex gap-3 mb-6">
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
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </button>
      </div>

      <h2 className="font-medium mb-2">Online Technicians:</h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="list-disc pl-6">
          {(onlineTechs as User[])?.map((tech) => (
            <li key={tech.id}>
              {tech.name} {tech.email ? `(${tech.email})` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sessions;