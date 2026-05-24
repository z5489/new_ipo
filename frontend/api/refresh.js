export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Use secure server-side environment variables instead of exposing to the client
  const pat = process.env.GH_PAT;
  const owner = process.env.REPO_OWNER || "z5489";
  const repo = process.env.REPO_NAME || "new_ipo";

  if (!pat) {
    return res.status(500).json({ error: "GH_PAT is not configured in Vercel Environment Variables." });
  }

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/fetch.yml/dispatches`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    });

    if (response.status === 204) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
