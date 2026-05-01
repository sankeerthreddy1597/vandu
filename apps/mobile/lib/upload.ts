export async function uploadToR2(uploadUrl: string, uri: string): Promise<void> {
  const res = await fetch(uri)
  const blob = await res.blob()

  const upload = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": blob.type || "image/jpeg" },
  })

  if (!upload.ok) throw new Error(`Upload failed: ${upload.status}`)
}
