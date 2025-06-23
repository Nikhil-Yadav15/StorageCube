"use client";

import { useEffect, useState } from "react";
import { Star, CreditCard, Crown, Check } from "lucide-react";
import { Button } from "./ui/button";

interface Plan {
  id: string;
  name: string;
  price: number;
  storage: string;
  features: string[];
  icon: JSX.Element;
  buttonText: string;
  disabled: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    storage: "1 GB",
    features: ["Basic file storage", "Web access"],
    icon: <Star className="w-6 h-6 text-blue-500" />,
    buttonText: "Current Plan",
    disabled: true,
  },
  {
    id: "standard",
    name: "Standard",
    price: 299,
    storage: "50 GB",
    features: ["Enhanced storage", "Priority support"],
    icon: <CreditCard className="w-6 h-6 text-green-500" />,
    buttonText: "Upgrade Now",
    disabled: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 599,
    storage: "200 GB",
    features: ["Maximum storage", "Priority support"],
    icon: <Crown className="w-6 h-6 text-purple-500" />,
    buttonText: "Go Pro",
    disabled: false,
  },
];

const handleUpgrade = async (plan: Plan) => {
  try {
    if (plan.name.toLowerCase() === "standard") {
      window.location.href = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_URL_STD!;
    } else if (plan.name.toLowerCase() === "pro") {
      window.location.href = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_URL_PRO!;
    }

  } catch (error) {
    console.error("Upgrade failed", error);
  }
};

export default function PlanPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showPopup]);

  return (
    <>
      <div className="text-center ">
        <Button
          onClick={() => setShowPopup(true)}
          className="bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-md  text-white px-8 py-6 rounded-full font-medium hover:shadow-lg
  hover:translate-y-[-2px]
  hover:brightness-110
  hover:scale-105
  transition-all duration-200 ease-in-out
  "
        >
          Upgrade
        </Button>
      </div>

      {showPopup && (
        <div className="glass-card fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
          <div className=" relative w-full h-full overflow-y-auto flex items-center justify-center px-4 py-12">
            <div className="glass-card bg-white max-w-6xl w-full rounded-lg shadow-lg p-8 relative animate-in zoom-in-95">
              <h2 className="text-3xl font-bold text-center mb-10">Choose a Plan</h2>

              <div className=" grid md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`hover:scale-105  border rounded-xl p-6 transition-all duration-500 ease-in-out ${
                      plan.disabled
                        ? "bg-gray-400"
                        : "hover:cursor-pointer hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500  bg-gradient-to-l from-teal-400 to-cyan-600"
                    } `}
                  >
                    <div className=" flex text-cyan-400 justify-center mb-4">
                      {plan.icon}
                    </div>
                    <h3 className="text-xl text-black font-semibold text-center mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-center text-gray-700 mb-1 text-2xl font-bold">
                      ₹{plan.price}
                      {plan.price > 0 && (
                        <span className="text-sm font-normal"></span>
                      )}
                    </p>
                    <p className="text-center text-sm text-blue-600 mb-4">
                      {plan.storage} Storage
                    </p>
                    <ul className="text-sm text-gray-800 space-y-2 mb-6">
                      {plan.features.map((f, i) => (
                        <li
                          key={i}
                          className={` ${
                            plan.disabled ? "text-white" : "text-black"
                          } flex items-center`}
                        >
                          <Check
                            className={`w-4 h-4 ${
                              plan.disabled ? "text-emerald-200" : "text-emerald-400"
                            }  mr-2`}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={plan.disabled}
                      className={`w-full py-2 hover:brightness-110 rounded-md font-medium transition ${
                        plan.disabled
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : " text-gray-800 bg-gradient-to-r from-yellow-300 to-yellow-500"
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-center w-full">
                <Button
                  onClick={() => setShowPopup(false)}
                  className="bg-gradient-to-r from-gray-300 to-bray-500 shadow-md  text-white px-8 py-6 rounded-full font-medium hover:shadow-lg
                  hover:translate-y-[5px]
                  hover:brightness-110
                  hover:scale-105
                  transition-all duration-200 ease-in-out"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
