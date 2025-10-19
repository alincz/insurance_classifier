1.Solution Explanation / Presentation

Objective:
I built a company classifier that assigns each company to one or more labels from the insurance taxonomy based on the company’s description and business tags.

Approach:

Data preprocessing:

For each company, I combined the description and business_tags fields into a single text string.
I converted all text to lowercase and removed special characters to make matching with the insurance taxonomy labels easier and consistent.

Classification algorithm:

For each company, I compared its combined text with every label in the insurance taxonomy.
I used a simple word-overlap similarity method, calculating how many words from a taxonomy label appeared in the company text.
I sorted the labels by similarity score and selected the top 1–3 matches for each company.

Reasoning behind the method:

I chose this approach for its simplicity, transparency, and efficiency.
More advanced methods like TF-IDF, embeddings, or AI models could improve accuracy, but this method is clear, easy to explain, and suitable for a beginner-friendly implementation.

Validation:

I manually inspected some of the results to verify that the labels assigned to companies made sense.
For example, agricultural companies were matched with labels like Agricultural Equipment Services, while construction companies were matched with Road and Highway Construction.

Strengths and limitations:

Strengths: Quick, easy to understand, does not require complex libraries or AI models.

Limitations: Does not capture synonyms or semantic meaning beyond exact word matches. The accuracy depends on how closely the text matches the taxonomy labels.
This approach can be extended later with embeddings or more sophisticated NLP methods to capture semantic similarity.

2.Annotated Input List

I created a new column, insurance_label, for each company. Here are a few examples from the results:
 
description	       business_tags	              sector	   category	                 niche	               insurance_label
Welchcivils        ['Construction Services',    Services   Civil Engineering   Other Heavy and Civil      Road and Highway Construction,
is a civil         'Multi-utilities', ...]                 Services            Engineering Construction   Road Maintenance Services
engineering                         
and construction 
company…


3.Results and Interpretation

I ran the classifier on the entire company list and generated one or more relevant labels for each company.
The results are saved in a CSV file classified_companies.csv for easy review.
Labels are assigned logically: agricultural companies are matched with agricultural service labels, construction companies with construction-related labels, and so on.
			
          		 