export interface HistoSlide {
  id: number;
  category: string;
  description: string;
  options: string[];
  correctIndex: number;
  fact: string;
}

export const CATEGORIES = [
  'Oral Mucosa',
  'Tooth Development',
  'Salivary Glands',
  'Bone & Cartilage',
  'Muscle & Nerve',
  'Blood & Lymph',
  'Skin & Special',
] as const;

export const histoSlides: HistoSlide[] = [
  // ─── Oral Mucosa ───
  {
    id: 1,
    category: 'Oral Mucosa',
    description: 'Under 40x: stratified squamous epithelium overlying connective tissue with finger-like projections (papillae). Deep to this, dense irregular connective tissue with blood vessels and minor salivary glands visible.',
    options: ['Masticatory mucosa (gingiva/hard palate)', 'Lining mucosa (buccal/labial)', 'Specialized mucosa (tongue - filiform papillae)', 'Junctional epithelium'],
    correctIndex: 0,
    fact: 'Masticatory mucosa has a keratinized or parakeratinized surface to withstand chewing forces. It lacks the elastic fibers found in lining mucosa.',
  },
  {
    id: 2,
    category: 'Oral Mucosa',
    description: 'Thin, non-keratinized stratified squamous epithelium with short, blunt connective tissue papillae. Lamina propria contains elastic fibers and some minor salivary glands. Submucosa blends into underlying muscle.',
    options: ['Lining mucosa (buccal mucosa)', 'Masticatory mucosa', 'Specialized mucosa', 'Respiratory epithelium'],
    correctIndex: 0,
    fact: 'Buccal mucosa is a classic example of lining mucosa — it stretches with cheek movement and has elastic fibers in the lamina propria.',
  },
  {
    id: 3,
    category: 'Oral Mucosa',
    description: 'Dorsal surface shows numerous finger-like projections covered by keratinized stratified squamous epithelium. Some contain secondary papillae. Taste buds visible along the lateral walls of some projections.',
    options: ['Filiform papillae (tongue)', 'Fungiform papillae', 'Circumvallate papillae', 'Foliate papillae'],
    correctIndex: 0,
    fact: 'Filiform papillae are the most numerous — about 200–400 on the tongue. They have NO taste buds; their function is purely mechanical (gripping food).',
  },
  {
    id: 4,
    category: 'Oral Mucosa',
    description: 'Large dome-shaped structures surrounded by a deep trench (vallum) lined with stratified squamous epithelium. Von Ebner\'s glands (serous) empty into the base of the trench. Taste buds are abundant along the trench wall.',
    options: ['Circumvallate papillae', 'Fungiform papillae', 'Foliate papillae', 'Filiform papillae'],
    correctIndex: 0,
    fact: 'Circumvallate papillae are huge — 8–12 in number, arranged in a V-shape on the posterior tongue. Each contains up to 250 taste buds!',
  },
  {
    id: 5,
    category: 'Oral Mucosa',
    description: 'Non-keratinized stratified squamous epithelium with a thick lamina propria. Deep to it lies loose connective tissue with prominent elastic fibers. Scattered accessory salivary glands (mixed) visible in the submucosa.',
    options: ['Labial mucosa (lip)', 'Buccal mucosa', 'Ventral tongue', 'Floor of mouth'],
    correctIndex: 0,
    fact: 'The lip transitions from skin (keratinized, hair follicles) to oral mucosa (non-keratinized) at the vermillion border — a common site for actinic cheilitis.',
  },

  // ─── Tooth Development ───
  {
    id: 6,
    category: 'Tooth Development',
    description: 'Dental lamina visible as a band of epithelial cells growing from the oral epithelium into the underlying mesenchyme. Bud-like swellings at the terminal ends represent early tooth buds. Condensed mesenchyme surrounds each bud.',
    options: ['Bud stage of tooth development', 'Cap stage', 'Bell stage', 'Apposition stage'],
    correctIndex: 0,
    fact: 'The bud stage is the first sign of tooth development (week 8 in utero). The epithelial buds will eventually form enamel organs.',
  },
  {
    id: 7,
    category: 'Tooth Development',
    description: 'Epithelial structure resembling a cap sitting on a ball of condensed mesenchyme (dental papilla). Outer and inner enamel epithelium visible. Stellate reticulum filling the center. Dental follicle surrounding the cap.',
    options: ['Cap stage of tooth development', 'Bud stage', 'Bell stage', 'Crown stage'],
    correctIndex: 0,
    fact: 'In the cap stage, the enamel organ looks like a cap over the dental papilla. The dental papilla will form dentin and pulp.',
  },
  {
    id: 8,
    category: 'Tooth Development',
    description: 'Epithelial structure now resembles a bell with deep invagination. Four distinct layers visible: outer enamel epithelium, stellate reticulum, stratum intermedium, and inner enamel epithelium. Dental papilla below shows early odontoblast differentiation.',
    options: ['Bell stage of tooth development', 'Cap stage', 'Bud stage', 'Root formation stage'],
    correctIndex: 0,
    fact: 'The bell stage is when morphodifferentiation and histodifferentiation occur. Inner enamel epithelium cells become pre-ameloblasts, and adjacent papilla cells become odontoblasts.',
  },
  {
    id: 9,
    category: 'Tooth Development',
    description: 'Tall columnar cells (ameloblasts) adjacent to a thin layer of newly deposited enamel matrix. Beneath the enamel, a layer of dentin with odontoblast processes visible. Dentin shows characteristic tubules radiating outward.',
    options: ['Apposition stage (enamel & dentin deposition)', 'Bell stage', 'Crown stage', 'Maturation stage'],
    correctIndex: 0,
    fact: 'Ameloblasts deposit enamel in daily increments forming cross-striations. Unlike bone, enamel is acellular once mature — it cannot remodel or repair itself.',
  },
  {
    id: 10,
    category: 'Tooth Development',
    description: 'Hertwig\'s epithelial root sheath (HERS) visible as a thin band of epithelial cells extending from the cervical loop. Inner and outer enamel epithelium fused, with no stellate reticulum between them. Dental papilla cells below differentiating into odontoblasts.',
    options: ['Root formation stage', 'Crown formation stage', 'Apposition stage', 'Maturation stage'],
    correctIndex: 0,
    fact: 'HERS determines the shape, number, and length of roots. If HERS fails to degenerate, epithelial rests of Malassez remain — these can later form radicular cysts.',
  },

  // ─── Salivary Glands ───
  {
    id: 11,
    category: 'Salivary Glands',
    description: 'Pure serous acini consisting of pyramidal cells with round basal nuclei, basophilic cytoplasm at base and eosinophilic secretory granules at apex. Small intercalated ducts visible. Striated ducts with characteristic basal striations (mitochondria) prominent.',
    options: ['Parotid gland (pure serous)', 'Submandibular gland (mixed)', 'Sublingual gland (mixed, mostly mucous)', 'Minor salivary gland (mucous)'],
    correctIndex: 0,
    fact: 'The parotid is the largest salivary gland and produces purely serous (watery) secretion. It is enclosed in a tough capsule continuous with the deep cervical fascia.',
  },
  {
    id: 12,
    category: 'Salivary Glands',
    description: 'Mixed gland with both serous and mucous acini. Serous demilunes (crescents of serous cells capping mucous tubules) are a characteristic feature. Serous cells have dark granules, mucous cells appear pale and foamy. Intercalated and striated ducts present.',
    options: ['Submandibular gland (mixed, predominantly serous)', 'Parotid gland (pure serous)', 'Sublingual gland (mixed, predominantly mucous)', 'Palatal minor salivary gland'],
    correctIndex: 0,
    fact: 'Submandibular gland is about 60% serous and 40% mucous. The serous demilunes are a classic histological hallmark — named after Giannuzzi.',
  },
  {
    id: 13,
    category: 'Salivary Glands',
    description: 'Predominantly mucous acini with pale, vacuolated cytoplasm and flattened basal nuclei. Serous demilunes are rare. Main excretory duct is relatively large. Scattered plasma cells and lymphocytes in the connective tissue septa.',
    options: ['Sublingual gland (mixed, predominantly mucous)', 'Submandibular gland', 'Parotid gland', 'Von Ebner\'s gland (tongue)'],
    correctIndex: 0,
    fact: 'The sublingual gland is the smallest of the major salivary glands. It is not encapsulated like the parotid and has 8–20 excretory ducts (ducts of Rivinus).',
  },

  // ─── Bone & Cartilage ───
  {
    id: 14,
    category: 'Bone & Cartilage',
    description: 'Large, round cells (chondrocytes) sitting in lacunae surrounded by basophilic territorial matrix (pericellular). Interterritorial matrix between lacunae. The matrix appears glassy and homogeneous. No blood vessels visible within the matrix.',
    options: ['Hyaline cartilage', 'Elastic cartilage', 'Fibrocartilage', 'Compact bone'],
    correctIndex: 0,
    fact: 'Hyaline cartilage is the most common type, found in articular surfaces, costal cartilage, and the nasal septum. It has no blood supply — nutrients diffuse through the matrix, which is why cartilage heals slowly.',
  },
  {
    id: 15,
    category: 'Bone & Cartilage',
    description: 'Osteons (Haversian systems) visible as concentric rings of lamellae surrounding a central canal (Haversian canal) containing blood vessels. Lacunae with osteocytes are evenly spaced between lamellae. Canaliculi radiate from lacunae. Interstitial lamellae fill spaces between osteons.',
    options: ['Compact bone (ground/decalcified section)', 'Trabecular (cancellous) bone', 'Woven bone', 'Fibrocartilage'],
    correctIndex: 0,
    fact: 'Compact bone makes up ~80% of the skeleton. Each Haversian canal runs parallel to the long axis of the bone and contains a nerve, artery, vein, and lymphatic vessel.',
  },
  {
    id: 16,
    category: 'Bone & Cartilage',
    description: 'Irregular network of thin bone trabeculae forming a sponge-like pattern. Trabeculae contain lamellae with lacunae and osteocytes. Marrow spaces between trabeculae filled with hematopoietic cells and fat cells (adipocytes). Osteoblasts line some trabecular surfaces.',
    options: ['Trabecular (cancellous) bone', 'Compact bone', 'Woven bone', 'Osteoid (unmineralized bone)'],
    correctIndex: 0,
    fact: 'Cancellous bone has a much higher surface area than compact bone — about 10 times more. This makes it ideal for metabolic exchange and rapid bone remodeling.',
  },
  {
    id: 17,
    category: 'Bone & Cartilage',
    description: 'Chondrocytes in lacunae with visible elastic fibers in the matrix (staining dark with special stains like orcein/aldehyde fuchsin). Perichondrium visible at the surface. The elastic fibers form a dense, branching network throughout the matrix.',
    options: ['Elastic cartilage', 'Hyaline cartilage', 'Fibrocartilage', 'Elastin-rich bone'],
    correctIndex: 0,
    fact: 'Elastic cartilage is found in the external ear (auricle), epiglottis, and auditory tube. Its elastic fibers allow it to bend and return to original shape — like a living spring.',
  },

  // ─── Muscle & Nerve ───
  {
    id: 18,
    category: 'Muscle & Nerve',
    description: 'Long cylindrical cells (fibers) with multiple peripherally located nuclei. Cross-striations (alternating A and I bands) clearly visible. No branching. Endomysium surrounds individual fibers, perimysium surrounds bundles (fascicles).',
    options: ['Skeletal muscle (voluntary, striated)', 'Cardiac muscle', 'Smooth muscle', 'Nerve trunk'],
    correctIndex: 0,
    fact: 'Skeletal muscle fibers are the largest cells in the body — some can be up to 30 cm long! They are formed by fusion of myoblasts during development (hence multiple nuclei).',
  },
  {
    id: 19,
    category: 'Muscle & Nerve',
    description: 'Branched cells connected by intercalated discs (visible as dark transverse lines between cells). Central nucleus. Striations present but less distinct than skeletal muscle. Fibers arranged in a complex, spiraling pattern.',
    options: ['Cardiac muscle', 'Skeletal muscle', 'Smooth muscle', 'Purkinje fibers'],
    correctIndex: 0,
    fact: 'Intercalated discs contain gap junctions (electrical coupling) and desmosomes (mechanical adhesion). This allows the heart to contract as a functional syncytium — all-or-nothing contraction.',
  },
  {
    id: 20,
    category: 'Muscle & Nerve',
    description: 'Spindle-shaped cells with a single central nucleus. No striations visible. Cells packed closely together in bundles. Dense bodies visible in cytoplasm (equivalent to Z-discs). Arranged in sheets or layers in organ walls.',
    options: ['Smooth muscle (involuntary, non-striated)', 'Skeletal muscle', 'Cardiac muscle', 'Myofibroblast tissue'],
    correctIndex: 0,
    fact: 'Smooth muscle contracts slowly but can sustain contraction for long periods without fatigue. It lines the walls of blood vessels, GI tract, and airways — perfect for peristalsis.',
  },
  {
    id: 21,
    category: 'Muscle & Nerve',
    description: 'Bundle of axons surrounded by connective tissue sheaths. Epineurium surrounds the whole nerve. Perineurium surrounds each fascicle (bundle of axons). Endoneurium surrounds individual nerve fibers. Myelinated axons show clear myelin sheaths (clear space around axon).',
    options: ['Peripheral nerve trunk (cross section)', 'Spinal cord (gray matter)', 'Sympathetic ganglion', 'Dorsal root ganglion'],
    correctIndex: 0,
    fact: 'The perineurium is the most metabolically active layer — it acts as a blood-nerve barrier (similar to the blood-brain barrier). Damage to the perineurium can cause nerve fiber degeneration.',
  },

  // ─── Blood & Lymph ───
  {
    id: 22,
    category: 'Blood & Lymph',
    description: 'Thin-walled vessels lined by a single layer of flattened endothelial cells. Basement membrane and scattered pericytes outside. Lumen contains red blood cells. Smallest vessels with walls only one cell thick. Nucleus of endothelial cell bulges into lumen.',
    options: ['Capillary', 'Arteriole', 'Venule', 'Lymphatic vessel'],
    correctIndex: 0,
    fact: 'Capillaries are the site of gas and nutrient exchange. An average adult has ~40 billion capillaries with a total surface area of about 1,000 m² — roughly the size of a tennis court!',
  },
  {
    id: 23,
    category: 'Blood & Lymph',
    description: 'Thick-walled vessel with three distinct layers: tunica intima (endothelium + internal elastic lamina), tunica media (smooth muscle layers), and tunica adventitia (connective tissue). Wavy internal elastic lamina is a hallmark. Lumen appears round with little to no blood inside.',
    options: ['Artery (muscular type)', 'Arteriole', 'Vein', 'Lymphatic vessel'],
    correctIndex: 0,
    fact: 'Muscular (distributing) arteries control blood flow by constricting or relaxing their thick smooth muscle layer. The internal elastic lamina gives arteries their characteristic wavy appearance on cross-section due to elastic recoil.',
  },
  {
    id: 24,
    category: 'Blood & Lymph',
    description: 'Safer-like cells lining lymphatic sinuses. Lymphoid follicles (B-cell zones) with germinal centers (pale central area with large lymphocytes and macrophages). Paracortex (T-cell zone) around follicles. Medulla with medullary cords (plasma cells) and medullary sinuses.',
    options: ['Lymph node', 'Spleen', 'Thymus', 'Tonsil'],
    correctIndex: 0,
    fact: 'Lymph nodes are filtration stations — each node filters about 1 mL of lymph per minute. The germinal center is where B-cells proliferate and undergo affinity maturation after antigen exposure.',
  },
  {
    id: 25,
    category: 'Blood & Lymph',
    description: 'Crypts (deep invaginations) lined by non-keratinized stratified squamous epithelium. Lymphoid tissue with follicles and germinal centers densely packed beneath the epithelium. Crypts often contain bacteria, food debris, and desquamated epithelial cells.',
    options: ['Palatine tonsil', 'Lingual tonsil', 'Pharyngeal tonsil (adenoid)', 'Lymph node'],
    correctIndex: 0,
    fact: 'Palatine tonsils are the "tonsils" people usually refer to. They reach maximum size around age 7–8 and then gradually involute. Each tonsil has 10–20 crypts that can trap pathogens — and sometimes food!',
  },

  // ─── Skin & Special ───
  {
    id: 26,
    category: 'Skin & Special',
    description: 'Thick epidermis with five distinct layers: stratum corneum (keratin flakes), stratum lucidum (clear layer), stratum granulosum (dark keratohyalin granules), stratum spinosum (prickle cells), and stratum basale (cuboidal/columnar cells). Dermis below with papillae and sweat glands.',
    options: ['Thick skin (glabrous/palm/sole)', 'Thin skin', 'Scalp skin', 'Oral mucosa'],
    correctIndex: 0,
    fact: 'Thick skin is ONLY found on palms and soles. It has a stratum lucidum (absent in thin skin) and very thick stratum corneum — up to 500+ cell layers! Despite the name, thick skin is actually thinner (1.5 mm) than scalp skin (6 mm).',
  },
  {
    id: 27,
    category: 'Skin & Special',
    description: 'Bundles of collagen fibers in parallel wavy arrangement. Fibroblasts interspersed between collagen bundles. Special stains show elastic fibers (thin, dark, branching) between collagen bundles. No organized lamellae or osteons. Ground substance between fibers.',
    options: ['Dense regular connective tissue (tendon/ligament)', 'Dense irregular connective tissue', 'Loose (areolar) connective tissue', 'Reticular connective tissue'],
    correctIndex: 0,
    fact: 'Tendons are the classic example — the parallel collagen arrangement provides maximum tensile strength in one direction. Tendon fibroblasts (tenocytes) produce Type I collagen continuously throughout life.',
  },
  {
    id: 28,
    category: 'Bone & Cartilage',
    description: 'Lacunae with chondrocytes arranged in columns (like stacks of coins) within a basophilic matrix. Perichondrium absent in the deeper zone where endochondral ossification is occurring. Capillaries and osteoblasts invading from the ossification front. New bone trabeculae forming on cartilage remnants.',
    options: ['Epiphyseal growth plate (endochondral ossification)', 'Hyaline cartilage (articular)', 'Fibrocartilage (intervertebral disc)', 'Intramembranous ossification'],
    correctIndex: 0,
    fact: 'The growth plate has 5 zones: resting, proliferating, hypertrophic, calcified cartilage, and ossification. Growth occurs when chondrocytes proliferate in the proliferative zone — NOT when cells swell in the hypertrophic zone.',
  },
  {
    id: 29,
    category: 'Tooth Development',
    description: 'Mature tooth in situ showing: enamel (acellular, crystalline), dentin (tubular, cellular processes), pulp chamber (connective tissue, nerves, vessels), cementum (thin layer on root), periodontal ligament (collagen fibers between cementum and bone), and alveolar bone.',
    options: ['Mature tooth with supporting structures', 'Developing tooth (bell stage)', 'Erupting tooth', 'Root fragment with granuloma'],
    correctIndex: 0,
    fact: 'The periodontal ligament (PDL) is about 0.2 mm thick. It contains fibroblasts that produce collagen fibers that are constantly being remodeled. PDL has the fastest turnover rate of any connective tissue — about 1/2 replaced in 3–6 days!',
  },
  {
    id: 30,
    category: 'Skin & Special',
    description: 'Nerve cell bodies (pseudounipolar neurons) arranged in clusters around the periphery. Each cell body has a large round nucleus, prominent nucleolus, and Nissl substance (granular basophilic rough ER) in the cytoplasm. Satellite cells (small glial cells) surround each neuron. Nerve fibers exiting in bundles.',
    options: ['Dorsal root ganglion (spinal ganglion)', 'Sympathetic ganglion', 'Parasympathetic ganglion', 'Anterior horn of spinal cord'],
    correctIndex: 0,
    fact: 'Dorsal root ganglia contain the cell bodies of sensory neurons. These are pseudounipolar — they have a single process that splits into a peripheral process (to skin/muscle) and a central process (to spinal cord).',
  },
];

export function getSlideById(id: number): HistoSlide | undefined {
  return histoSlides.find(s => s.id === id);
}

export function getSlidesByCategory(category: string): HistoSlide[] {
  return histoSlides.filter(s => s.category === category);
}

export function getRandomSlides(count: number = 10): HistoSlide[] {
  const shuffled = [...histoSlides].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function shuffleSlides(slides: HistoSlide[]): HistoSlide[] {
  return [...slides].sort(() => Math.random() - 0.5);
}
