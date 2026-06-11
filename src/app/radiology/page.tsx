'use client';

import { motion } from 'framer-motion';
import ToothMascot from '@/components/ToothMascot';

const views = [
  { name: 'Intraoral Periapical (IOPA)', icon: '🦷', desc: 'Full tooth & surrounding bone — caries, periapical pathology', color: 'from-pink-100 to-pink-50' },
  { name: 'Bitewing', icon: '🫦', desc: 'Interproximal caries, alveolar bone levels — recall exams', color: 'from-mint-100 to-mint-50' },
  { name: 'Occlusal', icon: '👄', desc: 'Palatal/floor of mouth, salivary stones, fx', color: 'from-purple-100 to-purple-50' },
  { name: 'Panoramic (OPG)', icon: '🦷', desc: 'Full jaw overview — impactions, cysts, TMJ', color: 'from-orange-100 to-orange-50' },
  { name: 'CBCT', icon: '🖥️', desc: '3D — implant planning, root fractures, airway', color: 'from-blue-100 to-blue-50' },
  { name: 'Cephalometric', icon: '📐', desc: 'Orthodontic — skeletal analysis, growth', color: 'from-yellow-100 to-yellow-50' },
  { name: 'Sialography', icon: '💧', desc: 'Salivary duct — sialoliths, sialadenitis', color: 'from-red-100 to-red-50' },
  { name: 'CBCT Angio', icon: '🫀', desc: 'Vascular — facial hemangiomas, AVM', color: 'from-teal-100 to-teal-50' },
];

const radiationDoses = [
  { view: 'IOPA', dose: '~5 µSv' },
  { view: 'Bitewing', dose: '~5 µSv' },
  { view: 'OPG', dose: '~10 µSv' },
  { view: 'CBCT (small)', dose: '~50 µSv' },
  { view: 'CBCT (full)', dose: '~180 µSv' },
  { view: 'Chest X-ray', dose: '~100 µSv' },
];

const landmarks = [
  'Incisive foramen / Nasopalatine canal',
  'Mental foramen',
  'Mandibular canal / Inferior alveolar nerve',
  'Maxillary sinus floor',
  'Zygomatic process',
  'Nasal septum & floor',
  'Lingula & mandibular foramen',
  'Genial tubercles',
];

export default function RadiologyPage() {
  return (
    <div className="px-4 py-6 space-y-5 min-h-[100dvh]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <ToothMascot mood="happy" size="md" message="Let's read some X-rays! 🩻" />
        <h1 className="mt-2 text-xl font-bold text-gray-800">Dental Radiology 🩻</h1>
        <p className="text-gray-500 text-xs mt-1">Common radiographic views & interpretation</p>
      </motion.div>

      {/* Views grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3">
        {views.map((v, i) => (
          <motion.div
            key={v.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`p-3.5 rounded-2xl bg-gradient-to-br ${v.color} border border-gray-100`}
          >
            <span className="text-xl block mb-1.5">{v.icon}</span>
            <h3 className="text-[11px] font-bold text-gray-800 leading-tight">{v.name}</h3>
            <p className="text-[10px] text-gray-500 mt-1 leading-snug">{v.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Radiation doses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 glass rounded-2xl"
      >
        <h2 className="text-sm font-bold text-gray-700 mb-3">☢️&nbsp; Radiation Dose Reference</h2>
        <div className="space-y-2">
          {radiationDoses.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-gray-700 font-medium">{r.view}</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 bg-pink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-orange-400 rounded-full"
                    style={{ width: `${Math.min((parseInt(r.dose.replace(/[^0-9]/g, '')) / 180) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-gray-500 w-14 text-right">{r.dose}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-gray-400 mt-3 text-center">ALARA principle — always minimize exposure</p>
      </motion.div>

      {/* Anatomical Landmarks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 glass rounded-2xl"
      >
        <h2 className="text-sm font-bold text-gray-700 mb-3">📍&nbsp; Key Radiographic Landmarks</h2>
        <div className="grid grid-cols-2 gap-1.5">
          {landmarks.map((l, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/50">
              <span className="text-[9px] text-pink-400 font-bold">{i + 1}.</span>
              <span className="text-[11px] text-gray-600">{l}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mnemonic */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 glass rounded-2xl border border-yellow-100"
      >
        <p className="text-xs text-gray-400 font-medium mb-1">🧠&nbsp; How to read a radiograph</p>
        <p className="text-sm text-gray-600 font-medium">
          <span className="text-pink-500">S</span>tructures &nbsp;
          <span className="text-pink-500">L</span>ocation &nbsp;
          <span className="text-pink-500">O</span>utline &nbsp;
          <span className="text-pink-500">P</span>eriphery &nbsp;
          <span className="text-pink-500">S</span>hape &nbsp;
          <span className="text-pink-500">S</span>ize
        </p>
        <p className="text-[10px] text-gray-400 mt-1">SLOPSS — systematic interpretation framework</p>
      </motion.div>

      <div className="text-center pb-4">
        <p className="text-[10px] text-pink-300">🩻 Practice with your class slides & OPGs</p>
      </div>
    </div>
  );
}