import { Shield, Award, Truck, Lock, HeartHandshake, Zap } from "lucide-react";

export function TrustBadges() {
  const badges = [
    { icon: Shield, text: "100% Secure Payment", color: "text-green-600", bg: "bg-green-50" },
    { icon: Award, text: "Premium Quality Guaranteed", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Truck, text: "Fast & Reliable Delivery", color: "text-orange-600", bg: "bg-orange-50" },
    { icon: Lock, text: "Privacy Protected", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: HeartHandshake, text: "24/7 Customer Support", color: "text-pink-600", bg: "bg-pink-50" },
    { icon: Zap, text: "Quick Turnaround", color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-7">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {badges.map((badge) => (
          <div
            key={badge.text}
            className="flex flex-col items-center gap-2 rounded-xl border border-[#e6eaf2] bg-white p-3 text-center transition hover:shadow-md sm:p-4"
          >
            <div className={`grid h-12 w-12 place-items-center rounded-full ${badge.bg} ${badge.color}`}>
              <badge.icon size={20} />
            </div>
            <p className="text-xs font-semibold leading-tight text-[#34445e]">{badge.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
