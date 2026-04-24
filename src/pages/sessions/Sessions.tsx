import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  loginTechnician,
  logoutTechnician,
  getOnlineUsers,
} from "@/lib/api";

type User = {
  id: number;
  name: string;
  email?: string;
};

const Sessions = () => {
  const [userId, setUserId] = useState("");

  const { data: onlineTechs = [], refetch, isLoading } = useQuery<User[]>({
    queryKey: ["sessions", "online"],
    queryFn: getOnlineUsers,
  });

  const loginMutation = useMutation({
    mutationFn: () => loginTechnician(Number(userId)),
    onSuccess: () => refetch(),
  });

  const logoutMutation = useMutation({
    mutationFn: () => logoutTechnician(Number(userId)),
    onSuccess: () => refetch(),
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Technician Sessions</h1>

      <input
        type="number"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="border px-3 py-2 rounded"
      />

      <div className="flex gap-3 my-4">
        <button onClick={() => loginMutation.mutate()}>
          Login
        </button>

        <button onClick={() => logoutMutation.mutate()}>
          Logout
        </button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {onlineTechs.map((u) => (
            <li key={u.id}>
              {u.name} {u.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sessions;