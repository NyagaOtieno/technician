import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

const JobCreate = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/jobs", { title, description });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setTitle("");
      setDescription("");
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Create Job</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-3"
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {mutation.isPending ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
};

export default JobCreate;
