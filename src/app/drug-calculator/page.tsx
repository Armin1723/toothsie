'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToothMascot from '@/components/ToothMascot';

interface Drug {
  category: string;
  name: string;
  brand: string;
  indication: string;
  adultDose: string;
  pediatricDose: string;
  maxDose: string;
  note: string;
}

const DRUGS: Drug[] = [
  { category: 'Local Anesthetics', name: 'Lidocaine 2% + Epinephrine 1:100,000', brand: 'Xylocaine, Lignospan', indication: 'Local anesthesia for dental procedures', adultDose: '1-4 carpules (1.8 mL each)', pediatricDose: 'Max 4.4 mg/kg', maxDose: '7 mg/kg (500 mg absolute)', note: 'Most common dental LA. Epinephrine prolongs effect.' },
  { category: 'Local Anesthetics', name: 'Articaine 4% + Epinephrine 1:100,000', brand: 'Septocaine, Septanest, Ubistesin', indication: 'Local anesthesia, good for mandibular blocks', adultDose: '1-3 carpules (1.7 mL each)', pediatricDose: 'Max 7 mg/kg', maxDose: '7 mg/kg', note: 'Higher bone penetration. Can cause paresthesia.' },
  { category: 'Local Anesthetics', name: 'Mepivacaine 3% (plain)', brand: 'Carbocaine, Polocaine, Scandicaine', indication: 'Short procedures, when epinephrine is contraindicated', adultDose: '1-3 carpules (1.8 mL each)', pediatricDose: 'Max 4.4 mg/kg', maxDose: '6.6 mg/kg (400 mg absolute)', note: 'No epinephrine — safe for cardiac patients.' },
  { category: 'Local Anesthetics', name: 'Bupivacaine 0.5% + Epinephrine 1:200,000', brand: 'Marcaine, Vivacaine', indication: 'Long-duration anesthesia (6-8 hrs)', adultDose: '1-2 carpules', pediatricDose: 'Not recommended', maxDose: '3 mg/kg', note: 'For post-op pain control. 4× more potent than lidocaine.' },
  { category: 'Local Anesthetics', name: 'Prilocaine 4% + Epinephrine 1:200,000', brand: 'Citanest, Prilocaine', indication: 'Local anesthesia, alternative to lidocaine', adultDose: '1-3 carpules', pediatricDose: 'Max 6 mg/kg', maxDose: '6 mg/kg (400 mg absolute)', note: 'Can cause methemoglobinemia in large doses.' },
  { category: 'Antibiotics', name: 'Amoxicillin', brand: 'Amoxil, Moxatag, Trimox', indication: 'Odontogenic infections, periapical abscess', adultDose: '500 mg TID × 7 days', pediatricDose: '20-40 mg/kg/day divided TID', maxDose: '3 g/day', note: 'First-line for dental infections. Take with food.' },
  { category: 'Antibiotics', name: 'Amoxicillin + Clavulanic Acid', brand: 'Augmentin, Clavulin', indication: 'Severe/resistant odontogenic infections', adultDose: '875/125 mg BID × 7 days', pediatricDose: '45 mg/kg/day divided BID', maxDose: '1750 mg/day', note: 'Broader spectrum. More GI side effects.' },
  { category: 'Antibiotics', name: 'Clindamycin', brand: 'Cleocin, Dalacin', indication: 'Penicillin allergy, anaerobic infections', adultDose: '300-450 mg QID × 7 days', pediatricDose: '8-25 mg/kg/day divided TID-QID', maxDose: '1.8 g/day', note: 'Risk of C. diff colitis. Use only if needed.' },
  { category: 'Antibiotics', name: 'Metronidazole', brand: 'Flagyl, Metrogel', indication: 'Anaerobic infections, pericoronitis, periodontitis', adultDose: '250-500 mg TID × 7 days', pediatricDose: '15-30 mg/kg/day divided TID', maxDose: '1.5 g/day', note: 'No alcohol! Disulfiram-like reaction.' },
  { category: 'Antibiotics', name: 'Azithromycin', brand: 'Zithromax, Z-Pak', indication: 'Penicillin allergy, alternative for odontogenic infections', adultDose: '500 mg day 1, then 250 mg days 2-5', pediatricDose: '10 mg/kg day 1, then 5 mg/kg days 2-5', maxDose: '500 mg/day', note: 'Good compliance (once daily). GI upset common.' },
  { category: 'Antibiotics', name: 'Doxycycline', brand: 'Vibramycin, Doryx, Oracea', indication: 'Periodontal infections, pericoronitis', adultDose: '100 mg BID × 7 days', pediatricDose: '2.2 mg/kg BID (contraindicated < 8 yrs)', maxDose: '200 mg/day', note: 'Avoid in children < 8 & pregnancy. Photosensitivity.' },
  { category: 'Analgesics', name: 'Ibuprofen', brand: 'Advil, Motrin, Brufen', indication: 'Post-op dental pain, inflammation', adultDose: '400-600 mg Q6H PRN', pediatricDose: '5-10 mg/kg Q6-8H', maxDose: '3.2 g/day (adult)', note: 'Best for dental pain. Take with food.' },
  { category: 'Analgesics', name: 'Naproxen', brand: 'Aleve, Naprosyn, Anaprox', indication: 'Post-op dental pain, TMD pain', adultDose: '250-500 mg BID', pediatricDose: '5-7 mg/kg Q12H', maxDose: '1 g/day', note: 'Longer half-life than ibuprofen.' },
  { category: 'Analgesics', name: 'Acetaminophen (Paracetamol)', brand: 'Tylenol, Panadol, Calpol', indication: 'Mild-moderate dental pain, alternative to NSAIDs', adultDose: '500-1000 mg Q4-6H PRN', pediatricDose: '10-15 mg/kg Q4-6H', maxDose: '3 g/day (adult), 4 g max (short term)', note: 'No anti-inflammatory. Safe with anticoagulants.' },
  { category: 'Analgesics', name: 'Acetaminophen + Codeine (Tylenol #3)', brand: 'Tylenol #3, Co-codamol, Panadeine', indication: 'Moderate-severe dental pain', adultDose: '1-2 tabs Q4-6H (30 mg codeine)', pediatricDose: 'Based on weight; avoid < 12 yrs', maxDose: '12 tabs/day', note: 'Codeine is prodrug. Controversial in children.' },
  { category: 'Analgesics', name: 'Tramadol', brand: 'Ultram, Tramal, Zaldiar', indication: 'Moderate-severe pain when other options fail', adultDose: '50-100 mg Q4-6H PRN', pediatricDose: 'Not recommended < 16 yrs', maxDose: '400 mg/day', note: 'Seizure risk with SSRIs. Low abuse potential.' },
  { category: 'NSAIDs', name: 'Diclofenac', brand: 'Voltaren, Cataflam, Dicloflex', indication: 'TMD, post-op pain, inflammation', adultDose: '50 mg TID', pediatricDose: '1-3 mg/kg/day divided TID', maxDose: '150 mg/day', note: 'Potent anti-inflammatory. GI side effects.' },
  { category: 'NSAIDs', name: 'Ketorolac (Toradol)', brand: 'Toradol, Acular, Sprix', indication: 'Acute severe dental pain (short-term)', adultDose: '10-20 mg IM/IV, then 10 mg PO Q6H', pediatricDose: '0.5 mg/kg IM/IV', maxDose: '40 mg/day PO, 5 days max', note: 'Short-term use only. Risk of GI bleeding.' },
  { category: 'Other', name: 'Prednisolone', brand: 'Omnipred, Prelone, Orapred', indication: 'Severe inflammation, post-op swelling, TMD', adultDose: '40-60 mg day 1, taper over 5-7 days', pediatricDose: '1-2 mg/kg/day', maxDose: '60 mg/day', note: 'Short course only. Do not stop abruptly.' },
  { category: 'Other', name: 'Dexamethasone', brand: 'Decadron, DexPak, Maxidex', indication: 'Post-op edema, severe inflammation', adultDose: '4-8 mg IM/IV, then 4 mg PO BID taper', pediatricDose: '0.5-1 mg/kg/day', maxDose: '16 mg/day', note: '8 mg IM = potent anti-inflammatory effect.' },
  { category: 'Other', name: 'Chlorhexidine Gluconate 0.12%', brand: 'Peridex, PerioGard, Paroex', indication: 'Anti-plaque, gingivitis, post-op oral rinse', adultDose: '15 mL BID (swish 30 sec)', pediatricDose: '10 mL BID > 6 yrs', maxDose: 'N/A', note: 'Stains teeth. Use 30 min after brushing.' },
  { category: 'Other', name: 'Fluoride Varnish 5% NaF', brand: 'Duraflor, CavityShield, Vanish', indication: 'Caries prevention, desensitizing agent', adultDose: 'Apply thin layer to teeth Q6 months', pediatricDose: 'Same as adult', maxDose: 'One unit dose', note: 'Rapidly sets on contact with saliva.' },
  { category: 'Other', name: 'Benzocaine 20% Topical', brand: 'Hurricaine, Orajel, Anbesol', indication: 'Topical anesthesia before injection', adultDose: 'Apply to dry mucosa × 30-60 sec', pediatricDose: '< 2 yrs: do not use', maxDose: 'Small amount', note: 'Risk of methemoglobinemia in children < 2.' },
  { category: 'Other', name: 'Lidocaine 5% Ointment', brand: 'Xylocaine 5%, LMX-5', indication: 'Topical anesthesia for mucosal procedures', adultDose: 'Apply thin layer × 2-5 min', pediatricDose: 'Use sparingly', maxDose: 'One application', note: 'Absorbed systemically if used excessively.' },
];

const CATEGORIES = ['Local Anesthetics', 'Antibiotics', 'Analgesics', 'NSAIDs', 'Other'];

function getDoseColor(name: string): string {
  if (name.includes('Lidocaine') || name.includes('Articaine') || name.includes('Bupivacaine') || name.includes('Mepivacaine') || name.includes('Prilocaine')) return 'from-pink-100 to-rose-50 border-pink-200';
  if (CATEGORIES.slice(0, 1).includes('Local Anesthetics') && !name.includes('Lidocaine')) return 'from-pink-100 to-rose-50 border-pink-200';
  if (CATEGORIES.slice(1, 2).includes('Antibiotics')) return 'from-blue-100 to-cyan-50 border-blue-200';
  if (CATEGORIES.slice(2, 3).includes('Analgesics')) return 'from-amber-100 to-yellow-50 border-amber-200';
  if (CATEGORIES.slice(3, 4).includes('NSAIDs')) return 'from-orange-100 to-red-50 border-orange-200';
  return 'from-purple-100 to-violet-50 border-purple-200';
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'Local Anesthetics': return 'bg-pink-100 text-pink-600 border-pink-200';
    case 'Antibiotics': return 'bg-blue-100 text-blue-600 border-blue-200';
    case 'Analgesics': return 'bg-amber-100 text-amber-600 border-amber-200';
    case 'NSAIDs': return 'bg-orange-100 text-orange-600 border-orange-200';
    default: return 'bg-purple-100 text-purple-600 border-purple-200';
  }
}

export default function DrugCalculator() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [weight, setWeight] = useState('70');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  const filtered = DRUGS.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.brand.toLowerCase().includes(search.toLowerCase()) || d.indication.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || d.category === category;
    return matchSearch && matchCat;
  });

  const weightInKg = weightUnit === 'kg' ? parseFloat(weight) || 0 : (parseFloat(weight) || 0) * 0.453592;

  const showDoseCalc = selectedDrug && weightInKg > 0;
  let doseResult = '';
  if (showDoseCalc) {
    if (selectedDrug!.name.includes('Amoxicillin') && !selectedDrug!.name.includes('Clavulanate') && !selectedDrug!.name.includes('Clavulanic')) {
      doseResult = `${(weightInKg * 20).toFixed(0)}-${(weightInKg * 40).toFixed(0)} mg/day divided TID (${((weightInKg * 20) / 3).toFixed(0)}-${((weightInKg * 40) / 3).toFixed(0)} mg per dose)`;
    } else if (selectedDrug!.name.includes('Clindamycin')) {
      doseResult = `${(weightInKg * 8).toFixed(0)}-${(weightInKg * 25).toFixed(0)} mg/kg/day divided TID-QID`;
    } else if (selectedDrug!.name.includes('Ibuprofen')) {
      doseResult = `${(weightInKg * 5).toFixed(0)}-${(weightInKg * 10).toFixed(0)} mg Q6-8H`;
    } else if (selectedDrug!.name.includes('Lidocaine 2%')) {
      doseResult = `Max ${(weightInKg * 4.4).toFixed(0)} mg = ${((weightInKg * 4.4) / 36).toFixed(1)} carpules (1.8 mL @ 36 mg/carpule)`;
    } else if (selectedDrug!.name.includes('Articaine')) {
      doseResult = `Max ${(weightInKg * 7).toFixed(0)} mg = ${((weightInKg * 7) / 68).toFixed(1)} carpules (1.7 mL @ 68 mg/carpule)`;
    } else if (selectedDrug!.name.includes('Mepivacaine')) {
      doseResult = `Max ${(weightInKg * 4.4).toFixed(0)} mg`;
    } else {
      doseResult = `Based on weight: ${weightInKg.toFixed(0)} kg — refer to adult dose above`;
    }
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <ToothMascot mood="happy" size="md" message="Dental Drug Reference" />
        <h1 className="mt-2 text-xl font-bold text-gray-800">Drug Calculator 💊</h1>
        <p className="text-gray-500 text-xs mt-1">Dental drug dosages & weight-based calculator</p>
      </motion.div>

      {/* Search + filter */}
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search drug, brand, or indication..."
          className="flex-1 px-4 py-3 bg-white rounded-2xl border border-pink-100 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none text-sm transition-all"
        />
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
        <button onClick={() => setCategory('')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${!category ? 'bg-pink-500 text-white border-pink-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${category === c ? 'bg-pink-500 text-white border-pink-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>{c}</button>
        ))}
      </div>

      {/* Drug list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No drugs found 🦷</p>
        )}
        {filtered.map((drug, i) => (
          <motion.div
            key={drug.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <button
              onClick={() => setSelectedDrug(selectedDrug?.name === drug.name ? null : drug)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedDrug?.name === drug.name
                  ? 'glass-strong ring-2 ring-pink-400 border-pink-300'
                  : 'glass border-gray-100 hover:border-pink-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{drug.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{drug.brand}</p>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${getCategoryColor(drug.category)}`}>
                    {drug.category}
                  </span>
                </div>
                <span className="text-lg shrink-0 mt-1">{selectedDrug?.name === drug.name ? '▾' : '▸'}</span>
              </div>

              {selectedDrug?.name === drug.name && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-pink-100 space-y-2 text-xs">
                  <p><span className="font-bold text-gray-600">Indication:</span> {drug.indication}</p>
                  <p><span className="font-bold text-gray-600">Adult Dose:</span> {drug.adultDose}</p>
                  <p><span className="font-bold text-gray-600">Pediatric:</span> {drug.pediatricDose}</p>
                  <p><span className="font-bold text-gray-600">Max Dose:</span> {drug.maxDose}</p>
                  <p className="text-pink-500 italic">{drug.note}</p>

                  {/* Weight-based dose calculator */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-700 mb-2">⚖️ Weight-Based Dose</p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        className="w-20 px-3 py-1.5 bg-white rounded-xl border border-gray-200 text-xs text-center outline-none focus:border-pink-300"
                        min="0"
                        max="300"
                        placeholder="Weight"
                      />
                      <div className="flex gap-1">
                        <button onClick={() => setWeightUnit('kg')} className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${weightUnit === 'kg' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>kg</button>
                        <button onClick={() => setWeightUnit('lbs')} className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${weightUnit === 'lbs' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>lbs</button>
                      </div>
                    </div>
                    {doseResult && (
                      <p className="mt-2 text-xs text-mint-600 font-medium">{doseResult}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}