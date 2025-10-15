// Functie care curata textul
// Transforma in litere mici, elimina caracterele speciale si imparte in cuvinte
function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // pastreaza doar litere si cifre
    .split(/\s+/) // imparte textul dupa spatii
    .filter(Boolean); // elimina elementele goale
}

// Functie care calculeaza o similaritate foarte simpla
// Verifica cate cuvinte din eticheta se regasesc in textul companiei
function simpleSimilarity(companyWords, labelWords) {
  const companySet = new Set(companyWords); // elimina dublurile
  let common = 0;
  for (const w of labelWords) if (companySet.has(w)) common++;
  return common / labelWords.length; // procent de potrivire
}

// Functie care citeste fisiere CSV incarcate din browser
async function parseCSV(file) {
  const text = await file.text(); // citeste tot continutul fisierului

  // Curata fisierul (elimina spatiile inutile)
  const clean = text.trim().replace(/^\uFEFF/, "");

  // Imparte pe linii
  const lines = clean.split(/\r?\n/);

  // Detectez separatorul (poate fi "," sau ";")
  const firstLine = lines[0];
  const separator = firstLine.includes(";") ? ";" : ",";

  // Extrag anteturile (coloanele)
  const headers = firstLine.split(separator).map(h => h.trim().replace(/['"]+/g, ""));

  const rows = [];

  // Trec prin fiecare linie (incepand cu a doua)
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim().replace(/['"]+/g, ""));
    const obj = {};

    // Creez un obiect cu perechi "coloana: valoare"
    headers.forEach((h, j) => {
      obj[h.toLowerCase()] = values[j] || "";
    });

    rows.push(obj);
  }

  return rows; // returnez lista de obiecte
}

// Cand apas pe butonul "Classify", executa codul
document.getElementById("classify").addEventListener("click", async () => {
  // Luam fisierele incarcate
  const companyFile = document.getElementById("companies").files[0];
  const taxonomyFile = document.getElementById("taxonomy").files[0];

  // Verifica daca ambele fisiere au fost incarcate
  if (!companyFile || !taxonomyFile) return alert("Incarca ambele fisiere CSV!");

  // Citeste si parseaza fisierele CSV
  const companies = await parseCSV(companyFile);
  const taxonomy = await parseCSV(taxonomyFile);

  console.log("✅ Parsed taxonomy:", taxonomy.slice(0, 5)); // Afiseaza primele 5 pentru test

  const results = [];

  // Parcurg fiecare companie
  for (const c of companies) {
    // Combinam descrierea si tag-urile pentru textul de comparat
    const text = `${c.description || ""} ${c.business_tags || ""}`;
    const words = cleanText(text);

    let bestMatches = [];

    // Comparam compania cu fiecare eticheta din taxonomie
    for (const t of taxonomy) {
      const labelWords = cleanText(t.label || t.name || "");
      if (!labelWords.length) continue; // sarim peste etichetele goale

      // Calculam scorul de similaritate
      const score = simpleSimilarity(words, labelWords);
      if (score > 0) bestMatches.push({ label: t.label || t.name, score });
    }

    // Sortam rezultatele dupa scor (descrescator)
    bestMatches.sort((a, b) => b.score - a.score);

    // Pastram cele mai bune 3 potriviri
    const top = bestMatches.slice(0, 3).map(x => x.label).join(", ");

    // Salvam rezultatul pentru aceasta companie
    results.push({
      company: c.name || c.company_name || "(no name)",
      description: c.description?.substring(0, 60) + "...",
      insurance_label: top
    });
  }

  // Afisam rezultatele finale in format JSON in <pre> din pagina HTML
  document.getElementById("output").textContent = JSON.stringify(results, null, 2);
});
