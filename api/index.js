const backendDomain = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const SummaryApi = {
  Ask: {
    url: `${backendDomain}/ask`,
    method: "POST",
  }
};

export default SummaryApi;