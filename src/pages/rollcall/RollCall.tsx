import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

const RollCall = () => {
  const queryClient = useQueryClient();
  const [technicianId, setTechnicianId] = useState("");

  const { data: rollcalls } = useQuery({
    queryKey: ["rollcall"],
    queryFn: async () => {
      const res = await api.get("/rollcall");
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/rollcall", { technicianId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rollcall"] });
      setTechnicianId("");
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Roll Call</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex gap-2 mb-4"
      >
        <input
          type="text"
          placeholder="Technician ID"
          value={technicianId}
          onChange={(e) => setTechnicianId(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>

      <h2 className="font-medium mb-2">Roll Call History:</h2>
      <ul className="list-disc pl-6">
        {rollcalls?.map((entry: any) => (
          <li key={entry.id}>
            Technician {entry.technicianId} - {entry.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RollCall;
