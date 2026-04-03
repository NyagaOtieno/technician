import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

type Job = {
  id: number;
  title: string;
  description: string;
  status: string;
};

const JobsList = () => {
  const { data, isLoading, error } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs");
      return res.data;
    },
  });

  if (isLoading) return <p>Loading jobs...</p>;
  if (error) return <p>Error loading jobs</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Jobs</h1>
      <ul className="space-y-2">
        {data?.map((job) => (
          <li key={job.id} className="border p-2 rounded">
            <p className="font-medium">{job.title}</p>
            <p className="text-sm text-gray-600">{job.description}</p>
            <p className="text-xs">Status: {job.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobsList;
