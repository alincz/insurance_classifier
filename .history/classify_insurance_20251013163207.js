// Cod simplificat pentru browser (fără fs, doar FileReader)

function cleanText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

function simpleSimilarity(companyWords, labelWords) {
  const companySet = new Set(companyWords);
  let common = 0;
  for (const w of labelWords) if (companySet.has(w)) common++;
  return common / labelWords.length;
}

async function parseCSV(file) {
  const text = await file.text();
  const [headerLine, ...lines] = text.trim().split("\n");
  const headers = headerLine.split(",");
  return lines.map(line => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
    return obj;
  });
}

document.getElementById("classify").addEventListener("click", async () => {
  const companyFile = document.getElementById("companies").files[0];
  const taxonomyFile = document.getElementById("taxonomy").files[0];
  if (!companyFile || !taxonomyFile) return alert("Încarcă ambele fișiere CSV!");

  const companies = await parseCSV(companyFile);
  const taxonomy = await parseCSV(taxonomyFile);

  const results = [];
  for (const c of companies) {
    const text = `${c.description || ""} ${c.business_tags || ""}`;
    const words = cleanText(text);
    let bestMatches = [];

    for (const t of taxonomy) {
      const labelWords = cleanText(t.label || "");
      const score = simpleSimilarity(words, labelWords);
      if (score > 0) bestMatches.push({ label: t.label, score });
    }

    bestMatches.sort((a, b) => b.score - a.score);
    const top = bestMatches.slice(0, 3).map(x => x.label).join(", ");
    results.push({ name: c.name, label: top });
  }

  document.getElementById("output").textContent = JSON.stringify(results, null, 2);
});
