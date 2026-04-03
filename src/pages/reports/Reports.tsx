import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const Reports = () => {
  const [region, setRegion] = useState("Nairobi");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["reports", region],
    queryFn: async () => {
      const res = await api.get(`/reports/weekly?region=${region}`);
      return res.data;
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Weekly Reports</h1>
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="border p-2 rounded mb-4"
      >
        <option value="Nairobi">Nairobi</option>
        <option value="Mombasa">Mombasa</option>
      </select>
      <button
        onClick={() => refetch()}
        className="bg-blue-500 text-white px-3 py-1 rounded ml-2"
      >
        Fetch Report
      </button>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error fetching report</p>}

      <pre className="bg-gray-100 p-3 mt-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default Reports;
