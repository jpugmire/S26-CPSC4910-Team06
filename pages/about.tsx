// pages/about.js
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function About() {
  const { data, error } = useSWR("/api/about", fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>About Page</h1>
      <p>Version: {data.version}</p>
      <p>Created on: {data.created}</p>
    </div>
  );
}

