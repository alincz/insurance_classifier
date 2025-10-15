// classify_insurance.js
// Simplu și clar — doar Node.js standard

import fs from "fs";
import csv from "csv-parser";

// -------------------------------
// Funcție pentru curățare text
function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // păstrăm doar litere și spații
    .split(/\s+/)
    .filter(Boolean);
}

// -------------------------------
// Calculăm similaritatea bazată pe câte cuvinte comune există
function simpleSimilarity(companyWords, labelWords) {
  const companySet = new Set(companyWords);
  let common = 0;
  for (const w of labelWords) {
    if (companySet.has(w)) common++;
  }
  return common / labelWords.length; // scor între 0 și 1
}

// -------------------------------
// Citim CSV-uri
function readCSV(path) {
  return new Promise((resolve) => {
    const rows = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows));
  });
}

// -------------------------------
// Program principal
async function main() {
  console.log("🔍 Se încarcă datele...");

  const companies = await readCSV("./ml_insurance_challenge.csv");
  const taxonomy = await readCSV("./insurance_taxonomy.csv");

  console.log(`✅ ${companies.length} companii încărcate.`);
  console.log(`✅ ${taxonomy.length} etichete în taxonomie.`);

  const results = [];

  for (const company of companies) {
    const text = `${company.description} ${company.business_tags}`;
    const words = cleanText(text);

    let bestMatches = [];

    for (const t of taxonomy) {
      const label = t.label;
      const labelWords = cleanText(label);

      const score = simpleSimilarity(words, labelWords);
      if (score > 0) {
        bestMatches.push({ label, score });
      }
    }

    // sortăm descrescător după scor
    bestMatches.sort((a, b) => b.score - a.score);

    // luăm top 3 potriviri
    const topLabels = bestMatches.slice(0, 3).map((x) => x.label);

    results.push({
      description: company.description.substring(0, 80) + "...",
      insurance_label: topLabels.join(", "),
    });
  }

  console.log("\n📊 Rezultate:");
  console.table(results.slice(0, 10)); // afișăm primele 10

  // salvăm rezultatul într-un fișier nou
  const csvOut =
    "description,insurance_label\n" +
    results
      .map(
        (r) =>
          `"${r.description.replace(/\"/g, "'")}","${r.insurance_label.replace(
            /\"/g,
            "'"
          )}"`
      )
      .join("\n");

  fs.writeFileSync("classified_companies.csv", csvOut);
  console.log("\n💾 Rezultatele au fost salvate în classified_companies.csv");
}

main();
