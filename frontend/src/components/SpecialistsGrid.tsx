import React from "react";
import { 
  Stethoscope, 
  Heart, 
  Activity, 
  Brain, 
  Smile, 
  Apple, 
  Bone, 
  Baby,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export const SPECIALIST_LIST = [
  {
    name: "General Physician",
    icon: Stethoscope,
    desc: "Primary care, fevers, infections, seasonal colds, and general health evaluations.",
    color: "from-sky-500 to-blue-600",
  },
  {
    name: "Cardiologist",
    icon: Heart,
    desc: "Heart health, hypertension, chest pressure, palpitations, and vascular systems.",
    color: "from-rose-500 to-red-600",
  },
  {
    name: "Dermatologist",
    icon: Activity,
    desc: "Skin rashes, eczema, allergies, acne, lesions, and hair/scalp conditions.",
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Neurologist",
    icon: Brain,
    desc: "Migraines, neurological symptoms, nerve discomfort, dizziness, and cognitive care.",
    color: "from-purple-500 to-indigo-600",
  },
  {
    name: "Psychologist",
    icon: Smile,
    desc: "Mental wellness, stress management, anxiety, depression, and cognitive counseling.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Nutritionist",
    icon: Apple,
    desc: "Dietary optimization, metabolic health, digestive wellness, and weight management.",
    color: "from-lime-500 to-green-600",
  },
  {
    name: "Orthopedic",
    icon: Bone,
    desc: "Joint pain, fractures, spinal health, sports injuries, and musculoskeletal issues.",
    color: "from-cyan-500 to-blue-700",
  },
  {
    name: "Pediatrician",
    icon: Baby,
    desc: "Infant, child, and adolescent healthcare, developmental milestones, and pediatric fevers.",
    color: "from-pink-500 to-rose-600",
  },
];

export default function SpecialistsGrid() {
  return (
    <section id="specialists" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2">
          Clinical Network
        </h2>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          Specialized Care for Every Health Need
        </h3>
        <p className="mt-3 text-base text-[var(--muted-foreground)]">
          Connect directly with certified specialists or let our AI triage determine the ideal doctor for your symptoms.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SPECIALIST_LIST.map((spec, idx) => {
          const Icon = spec.icon;
          return (
            <div
              key={idx}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-xl hover:border-sky-500/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${spec.color} flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">
                  {spec.name}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {spec.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border)]">
                <Link
                  href="/#ai-triage"
                  className="text-xs font-bold text-sky-400 group-hover:text-sky-300 flex items-center gap-1 transition-colors"
                >
                  Find {spec.name} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
