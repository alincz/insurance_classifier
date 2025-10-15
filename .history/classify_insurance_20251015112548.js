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

  // eliminăm BOM + spații inutile
  const clean = text.trim().replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/);

  // detectăm separatorul automat
  const firstLine = lines[0];
  const separator = firstLine.includes(";") ? ";" : ",";

  const headers = firstLine.split(separator).map(h => h.trim().replace(/['"]+/g, ""));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim().replace(/['"]+/g, ""));
    const obj = {};
    headers.forEach((h, j) => {
      obj[h] = values[j] || "";
    });
    rows.push(obj);
  }

  return rows;
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
