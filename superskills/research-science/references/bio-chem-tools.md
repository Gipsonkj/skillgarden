> Distilled from: biopython and rdkit (K-Dense-AI/scientific-agent-skills, MIT), pubmed-database (google-deepmind/science-skills, Apache-2.0)

# Computational biology and chemistry toolkits (vendor-specific)

Practical rules for Biopython and RDKit. Install only with the user's agreement; prefer the project's existing environment, and conda-forge for RDKit.

## Biopython (current release 1.88)

| Module | Use |
|---|---|
| `Bio.SeqIO` | Read/write FASTA, GenBank, FASTQ, EMBL, etc. `SeqIO.parse(path, "fasta")` iterates records; `SeqIO.read` for exactly one |
| `Bio.Seq` | Sequences: `reverse_complement()`, `transcribe()`, `translate(table=..., to_stop=True)` |
| `Bio.Align.PairwiseAligner` | Pairwise global/local alignment with scoring (replaces the old `pairwise2`) |
| `Bio.AlignIO`, `Bio.Align` | Multiple alignments (read outputs from MAFFT, Clustal, MUSCLE) |
| `Bio.Entrez` | NCBI E-utilities (search, fetch, link) |
| `Bio.Blast` | Run remote BLAST (slow, rate-limited) or parse BLAST XML; prefer local BLAST+ for volume |
| `Bio.PDB` | Parse PDB/mmCIF structures, iterate models/chains/residues/atoms, compute distances, superimpose |
| `Bio.Phylo` | Read/write/draw trees (Newick, Nexus, PhyloXML) |

Rules:
- Entrez: always set `Entrez.email` and `Entrez.tool`; read the API key from the environment (`os.environ["NCBI_API_KEY"]`), never hard-code it. Respect 3 req/s (10 with key); use `usehistory="y"` and batch fetches for large sets.
- Stream large files with `SeqIO.parse`; don't load everything into memory.
- Check the genetic code table and the reading frame before translating.
- Record versions (Biopython, databases, accession versions like `NM_000546.6`) for reproducibility.

## RDKit

```python
from rdkit import Chem
mol = Chem.MolFromSmiles(smi)
if mol is None:                      # parsing failed: report, don't continue silently
    problems = Chem.DetectChemistryProblems(Chem.MolFromSmiles(smi, sanitize=False))
```

- Always check for `None` after parsing SMILES/SDF/MOL.
- 3D: `molH = Chem.AddHs(mol)` before `AllChem.EmbedMolecule(molH, randomSeed=42)`; it returns -1 on failure; then optimise (`MMFFOptimizeMolecule` or UFF).
- Fingerprints: use `rdFingerprintGenerator` (e.g. `GetMorganGenerator(radius=2, fpSize=2048)`); state radius and size in results.
- Similarity: Tanimoto on Morgan fingerprints is standard; a score of 1.0 does not mean the molecules are identical (different stereo, salts, tautomers can collide).
- Canonical SMILES is not standardisation: use `rdMolStandardize` (cleanup, largest fragment, uncharge, tautomer canonicalisation) before comparing or deduplicating datasets.
- Descriptor rules (Lipinski, Veber, QED, PAINS) are heuristics for prioritisation, not verdicts on activity or safety.
- Keep stereo and chirality handling explicit (`useChirality`/`includeChirality` flags).

### Bundled scripts (`scripts/rdkit/`, need `rdkit`; pandas optional)

| Script | Use |
|---|---|
| `molecular_properties.py "CCO"` or `--file mols.smi -o props.csv` | MW, logP, TPSA, HBD/HBA, rotatable bonds, rule-of-five flags |
| `similarity_search.py "query_smiles" database.smi --threshold 0.7 --radius 2 --bits 2048 [--metric tanimoto] -o hits.csv` | Rank a library by fingerprint similarity to a query |
| `substructure_filter.py library.smi -p "c1ccccc1" [--filter-type ...] [--exclude-mode] [--match-all] -o kept.smi` | Keep or remove molecules matching SMARTS patterns; `--list-patterns` shows built-in filters |

## Other common tools (not bundled)

- Sequence search and alignment: BLAST+, MMseqs2, MAFFT, HMMER.
- Single-cell and omics: scanpy/anndata (Python), Seurat/Bioconductor (R).
- Structures: AlphaFold DB and the PDB via their APIs; visualise with PyMOL or py3Dmol.
- Chemistry data: PubChem PUG-REST, ChEMBL web services.
Link-outs from PubMed records to Gene, Protein, GEO, ClinVar etc.: `find_linked_biological_data` in `scripts/pubmed/pubmed_api.py` (database-apis.md).

## Reproducibility

Fixed random seeds, pinned package versions, recorded database versions and query dates, scripts kept with outputs, raw data never edited in place.
