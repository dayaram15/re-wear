// src/components/HowItWorks.jsx
const steps = [
  { title: "1. List an Item", desc: "Upload your unused clothing with details." },
  { title: "2. Earn Points", desc: "Earn points based on item condition and demand." },
  { title: "3. Redeem or Swap", desc: "Use points to redeem items or swap directly." },
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto px-4">
        {steps.map((step, i) => (
          <div key={i} className="bg-white shadow-sm p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
