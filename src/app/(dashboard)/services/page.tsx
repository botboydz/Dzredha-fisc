"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Calculator,
  Receipt,
  Landmark,
  Briefcase,
  CalendarDays,
  MessageSquare,
  Send,
  CreditCard,
  Bell,
  HelpCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDZD(amount: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " DZD";
}

/* ------------------------------------------------------------------ */
/*  Tax Calculator                                                     */
/* ------------------------------------------------------------------ */

function TaxCalculator() {
  const [revenue, setRevenue] = useState(14500000);
  const [expenses, setExpenses] = useState(8200000);
  const [salaryMass, setSalaryMass] = useState(575000);
  const [selectedTax, setSelectedTax] = useState("TAP");

  const calculations = useMemo(() => {
    const profit = revenue - expenses;
    const tap = revenue * 0.01;
    const tva = revenue * 0.19;
    const ibs = profit > 0 ? profit * 0.19 : 0;

    let irg = 0;
    let remaining = salaryMass;
    const brackets = [
      { limit: 240000, rate: 0 },
      { limit: 360000, rate: 0.2 },
      { limit: 480000, rate: 0.3 },
      { limit: Infinity, rate: 0.35 },
    ];
    let prev = 0;
    for (const b of brackets) {
      const taxable = Math.min(remaining, b.limit - prev);
      if (taxable <= 0) break;
      irg += taxable * b.rate;
      remaining -= taxable;
      prev = b.limit;
    }

    return {
      TAP: { amount: tap, rate: "1%", base: revenue, label: "Taxe sur l'Activité Professionnelle", labelAr: "ضريبة النشاط المهني" },
      TVA: { amount: tva, rate: "19%", base: revenue, label: "Taxe sur la Valeur Ajoutée", labelAr: "الرسم على القيمة المضافة" },
      IBS: { amount: ibs, rate: "19%", base: profit, label: "Impôt sur les Bénéfices des Sociétés", labelAr: "ضريبة أرباح الشركات" },
      IRG: { amount: irg, rate: "Progressif", base: salaryMass, label: "Impôt sur le Revenu Global", labelAr: "ضريبة الدخل الإجمالي" },
    };
  }, [revenue, expenses, salaryMass]);

  const taxTypes = [
    { key: "TAP", icon: Receipt, color: "from-emerald-500 to-teal-600" },
    { key: "TVA", icon: Calculator, color: "from-blue-500 to-indigo-600" },
    { key: "IBS", icon: Landmark, color: "from-violet-500 to-purple-600" },
    { key: "IRG", icon: Briefcase, color: "from-orange-500 to-red-500" },
  ];

  const current = calculations[selectedTax as keyof typeof calculations];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-[#0C4A2E]" />
        <div>
          <h2 className="gov-section-title">Calculatrice Fiscale / آلة حاسبة ضريبية</h2>
          <p className="gov-section-subtitle">Estimez vos impôts en temps réel</p>
        </div>
      </div>

      {/* Tax type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {taxTypes.map((t) => (
          <button
            key={t.key}
            onClick={() => setSelectedTax(t.key)}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all cursor-pointer ${
              selectedTax === t.key
                ? "bg-white border-emerald-200 shadow-md scale-[1.02]"
                : "bg-white/60 border-gray-200/60 hover:bg-white hover:border-gray-300"
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} shadow-md`}>
              <t.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">{t.key}</span>
            <span className="text-[10px] text-gray-400">{calculations[t.key as keyof typeof calculations].rate}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="gov-card p-6 space-y-5">
          <h3 className="gov-section-title">Paramètres / المعاملات</h3>
          <div>
            <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">Chiffre d&apos;affaires (HT) / رقم الأعمال</Label>
            <div className="relative">
              <Input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="h-10 rounded-xl pr-12 dzd-badge"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">Charges / المصاريف</Label>
            <div className="relative">
              <Input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value))}
                className="h-10 rounded-xl pr-12 dzd-badge"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">Masse salariale / الكتلة الأجرية</Label>
            <div className="relative">
              <Input
                type="number"
                value={salaryMass}
                onChange={(e) => setSalaryMass(Number(e.target.value))}
                className="h-10 rounded-xl pr-12 dzd-badge"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-xl p-6 text-white shadow-xl">
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">{current.label}</p>
            <p className="text-emerald-200/60 text-[10px] mb-4">{current.labelAr}</p>
            <p className="text-4xl font-extrabold dzd-badge animate-count">{formatDZD(current.amount)}</p>
            <div className="flex items-center gap-4 mt-4 text-emerald-100 text-xs">
              <span>Taux: {current.rate}</span>
              <span>Base: {formatDZD(current.base)}</span>
            </div>
          </div>

          <div className="gov-card p-5">
            <h3 className="gov-section-title mb-3">Résumé / ملخص</h3>
            <div className="space-y-3">
              {Object.entries(calculations).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">{key}</span>
                    <span className="text-[10px] text-gray-400">{val.rate}</span>
                  </div>
                  <span className={`text-sm font-bold dzd-badge ${selectedTax === key ? "text-emerald-700" : "text-gray-600"}`}>
                    {formatDZD(val.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">Total / المجموع</span>
                <span className="text-base font-extrabold text-emerald-700 dzd-badge">
                  {formatDZD(Object.values(calculations).reduce((s, v) => s + v.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Appointment Booking                                                */
/* ------------------------------------------------------------------ */

function AppointmentBooking() {
  const [selectedWilaya, setSelectedWilaya] = useState("Alger");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMotif, setSelectedMotif] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "booking" | "success">("idle");

  const timeSlots = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-[#0C4A2E]" />
        <div>
          <h2 className="gov-section-title">Prise de Rendez-vous / حجز موعد</h2>
          <p className="gov-section-subtitle">Réservez un créneau au bureau des impôts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gov-card p-6 space-y-4">
          <div>
            <Label className="text-xs font-semibold text-gray-500">Wilaya / الولاية</Label>
            <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
              <SelectTrigger className="mt-1 h-10 rounded-xl cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Alger", "Oran", "Constantine", "Annaba", "Sétif", "Blida"].map((w) => (
                  <SelectItem key={w} value={w} className="cursor-pointer">{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">Date souhaitée / التاريخ المطلوب</Label>
            <Input type="date" className="mt-1 h-10 rounded-xl" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">Motif / السبب</Label>
            <Select value={selectedMotif} onValueChange={setSelectedMotif}>
              <SelectTrigger className="mt-1 h-10 rounded-xl cursor-pointer">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="declaration" className="cursor-pointer">Déclaration fiscale</SelectItem>
                <SelectItem value="payment" className="cursor-pointer">Paiement d'impôt</SelectItem>
                <SelectItem value="attestation" className="cursor-pointer">Attestation</SelectItem>
                <SelectItem value="other" className="cursor-pointer">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="gov-card p-6 space-y-4">
          <h3 className="gov-section-title">Créneaux Disponibles / الأوقات المتاحة</h3>
          <div className="grid grid-cols-5 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedSlot === slot
                    ? "bg-[#0C4A2E] text-white shadow-md"
                    : "bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          <Button className="w-full bg-[#0C4A2E] hover:bg-[#166534] text-white text-xs gap-1 cursor-pointer" disabled={!selectedSlot || !selectedDate || bookingStatus === "booking"} onClick={async () => {
            if (!selectedSlot || !selectedDate) return;
            setBookingStatus("booking");
            await new Promise((r) => setTimeout(r, 1500));
            setBookingStatus("success");
            setTimeout(() => {
              setBookingStatus("idle");
              setSelectedSlot(null);
              setSelectedDate("");
              setSelectedMotif("");
            }, 3000);
          }}>
            {bookingStatus === "booking" ? (
              <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Réservation...</>
            ) : bookingStatus === "success" ? (
              <><CheckCircle2 className="h-4 w-4" /> Rendez-vous confirmé!</>
            ) : (
              "Confirmer le Rendez-vous / تأكيد الموعد"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ / Help Center                                                  */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS = [
  {
    question: "Quelle est la date limite pour la déclaration TAP ?",
    answer: "La déclaration TAP doit être soumise au plus tard le 20 du mois suivant la période concernée. En cas de retard, une pénalité de 10% à 25% est appliquée sur le montant dû.",
  },
  {
    question: "Comment calculer l'IRG sur les salaires ?",
    answer: "L'IRG est calculé selon un barème progressif : 0% jusqu'à 20 000 DZD/mois, 20% de 20 001 à 30 000 DZD/mois, 30% de 30 001 à 40 000 DZD/mois, et 35% au-delà de 40 000 DZD/mois.",
  },
  {
    question: "Quel est le taux de TVA en Algérie ?",
    answer: "Le taux normal de TVA en Algérie est de 19%. Il existe un taux réduit de 9% applicable à certains biens et services de première nécessité.",
  },
  {
    question: "Quelles sont les cotisations CNAS pour l'employeur ?",
    answer: "La part patronale CNAS est de 26% de la masse salariale brute. La part salariale est de 9%. Le CASNOS pour les travailleurs indépendants est de 15%.",
  },
  {
    question: "Comment obtenir une attestation de conformité fiscale ?",
    answer: "L'attestation de conformité fiscale peut être demandée via la plateforme DZ-Fisc ou directement au bureau des impôts de votre wilaya. Le délai de traitement est de 5 à 10 jours ouvrables.",
  },
  {
    question: "Quelles sont les sanctions en cas de fausse déclaration ?",
    answer: "Conformément à l'article 115 du CIDTA, une amende fiscale de 10% à 25% du montant éludé est appliquée, sans préjudice des poursuites pénales prévues par la législation en vigueur.",
  },
];

function HelpCenter() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-[#0C4A2E]" />
        <div>
          <h2 className="gov-section-title">Centre d&apos;Aide / مركز المساعدة</h2>
          <p className="gov-section-subtitle">Questions fréquentes sur la fiscalité algérienne</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="gov-card px-4 border-0">
            <AccordionTrigger className="text-sm font-semibold text-left text-gray-700 hover:text-[#0C4A2E] cursor-pointer py-3">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-xs text-gray-600 leading-relaxed pb-3">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chatbot                                                            */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

const BOT_RESPONSES: Record<string, string> = {
  "tap": "La Taxe sur l'Activité Professionnelle (TAP) est un impôt de 1% sur le chiffre d'affaires HT. Elle est due par toute personne exerçant une activité professionnelle en Algérie. La déclaration doit être soumise avant le 20 du mois suivant.",
  "tva": "La TVA (Taxe sur la Valeur Ajoutée) en Algérie est de 19% (taux normal) ou 9% (taux réduit). Elle s'applique sur les ventes de biens et services. La déclaration mensuelle est due avant le 20 du mois suivant.",
  "ibs": "L'IBS (Impôt sur les Bénéfices des Sociétés) est de 19% pour les sociétés de production et 26% pour les autres. Il est calculé sur le bénéfice imposable (CA - charges déductibles). Les acomptes provisionnels sont versés trimestriellement.",
  "irg": "L'IRG (Impôt sur le Revenu Global) est calculé selon un barème progressif sur les salaires : 0% jusqu'à 20K DZD/mois, 20% de 20K à 30K, 30% de 30K à 40K, et 35% au-delà de 40K DZD/mois.",
  "cnas": "Les cotisations CNAS : part patronale 26% + part salariale 9% de la masse salariale brute. Le CASNOS pour les indépendants est de 15%. Le versement doit être effectué avant la fin du mois suivant.",
  "default": "Je suis l'assistant DZ-Fisc. Je peux vous aider avec les questions sur : TAP, TVA, IBS, IRG, CNAS, CASNOS, échéances et démarches fiscales. Posez votre question !",
};

function getBotResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, response] of Object.entries(BOT_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) return response;
  }
  return BOT_RESPONSES.default;
}

function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, text: "Bienvenue sur l'assistant DZ-Fisc ! Posez vos questions sur la fiscalité algérienne. / مرحباً بك في مساعد ض.ج-فيسك", sender: "bot", timestamp: "08:00" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const userMsg: ChatMessage = { id: Date.now(), text: input, sender: "user", timestamp: timeStr };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        text: getBotResponse(input),
        sender: "bot",
        timestamp: timeStr,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#0C4A2E]" />
        <div>
          <h2 className="gov-section-title">Assistant DZ-Fisc / المساعد</h2>
          <p className="gov-section-subtitle">Posez vos questions fiscales</p>
        </div>
      </div>

      <div className="gov-card p-0 overflow-hidden">
        <div className="h-64 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 text-xs ${
                msg.sender === "user" ? "chat-bubble-user" : "chat-bubble-bot"
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[8px] mt-1 ${msg.sender === "user" ? "text-emerald-200" : "text-gray-400"}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="border-t border-gray-200 p-3 flex gap-2">
          <Input
            placeholder="Tapez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="h-9 rounded-xl text-xs"
          />
          <Button
            onClick={sendMessage}
            className="bg-[#0C4A2E] hover:bg-[#166534] text-white h-9 w-9 p-0 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Payment Simulator                                                  */
/* ------------------------------------------------------------------ */

function PaymentSimulator() {
  const [amount, setAmount] = useState(145000);
  const [taxType, setTaxType] = useState("TAP");

  const breakdown = useMemo(() => {
    const base = amount;
    const penalty = amount * 0.1; // 10% penalty for late
    const stamp = 1; // Droit de timbre
    return { base, penalty, stamp, total: base + penalty + stamp };
  }, [amount]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-[#0C4A2E]" />
        <div>
          <h2 className="gov-section-title">Simulateur de Paiement / محاكي الدفع</h2>
          <p className="gov-section-subtitle">Estimez le montant total à payer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gov-card p-6 space-y-4">
          <div>
            <Label className="text-xs font-semibold text-gray-500">Type d&apos;impôt / نوع الضريبة</Label>
            <Select value={taxType} onValueChange={setTaxType}>
              <SelectTrigger className="mt-1 h-10 rounded-xl cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TAP" className="cursor-pointer">TAP (1%)</SelectItem>
                <SelectItem value="TVA" className="cursor-pointer">TVA (19%)</SelectItem>
                <SelectItem value="IBS" className="cursor-pointer">IBS (19%)</SelectItem>
                <SelectItem value="IRG" className="cursor-pointer">IRG (Progressif)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-500">Montant de l&apos;impôt / مبلغ الضريبة</Label>
            <div className="relative mt-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="h-10 rounded-xl pr-12 dzd-badge"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
            </div>
          </div>
        </div>

        <div className="gov-card p-6 space-y-3">
          <h3 className="gov-section-title mb-2">Décomposition / تفصيل الدفع</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Montant principal</span>
              <span className="font-medium dzd-badge">{formatDZD(breakdown.base)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pénalité (10%)</span>
              <span className="font-medium dzd-badge text-red-600">{formatDZD(breakdown.penalty)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Droit de timbre</span>
              <span className="font-medium dzd-badge">{formatDZD(breakdown.stamp)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-bold text-[#0C4A2E]">Total à payer / المبلغ الإجمالي</span>
              <span className="font-extrabold text-lg text-[#0C4A2E] dzd-badge">{formatDZD(breakdown.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Notification Settings                                              */
/* ------------------------------------------------------------------ */

function NotificationSettings() {
  const [smsDeadline, setSmsDeadline] = useState(true);
  const [emailDeadline, setEmailDeadline] = useState(true);
  const [smsPayment, setSmsPayment] = useState(false);
  const [emailPayment, setEmailPayment] = useState(true);
  const [smsAudit, setSmsAudit] = useState(false);
  const [emailAudit, setEmailAudit] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-[#0C4A2E]" />
        <div>
          <h2 className="gov-section-title">Paramètres de Notification / إعدادات الإشعارات</h2>
          <p className="gov-section-subtitle">Gérez vos alertes SMS et Email</p>
        </div>
      </div>

      <div className="gov-card p-6 space-y-4">
        {/* Deadline alerts */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Alertes Échéances / تنبيهات الآجال</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">SMS — Rappel 3 jours avant</span>
              <Switch checked={smsDeadline} onCheckedChange={setSmsDeadline} className="cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Email — Résumé hebdomadaire</span>
              <Switch checked={emailDeadline} onCheckedChange={setEmailDeadline} className="cursor-pointer" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment alerts */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Alertes Paiement / تنبيهات الدفع</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">SMS — Confirmation de paiement</span>
              <Switch checked={smsPayment} onCheckedChange={setSmsPayment} className="cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Email — Reçu de paiement</span>
              <Switch checked={emailPayment} onCheckedChange={setEmailPayment} className="cursor-pointer" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Audit alerts */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Alertes Audit / تنبيهات التدقيق</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">SMS — Notification d&apos;audit</span>
              <Switch checked={smsAudit} onCheckedChange={setSmsAudit} className="cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Email — Rapport d&apos;audit</span>
              <Switch checked={emailAudit} onCheckedChange={setEmailAudit} className="cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Services Page                                                      */
/* ------------------------------------------------------------------ */

export default function ServicesPage() {
  return (
    <div className="space-y-10 view-enter">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <Calculator className="h-5 w-5 text-[#0C4A2E]" />
          Services Gouvernementaux / الخدمات الحكومية
        </h1>
        <p className="text-xs text-gray-500 mt-1">Outils et services pour les contribuables algériens</p>
      </div>

      <TaxCalculator />
      <Separator className="my-2" />
      <AppointmentBooking />
      <Separator className="my-2" />
      <PaymentSimulator />
      <Separator className="my-2" />
      <HelpCenter />
      <Separator className="my-2" />
      <Chatbot />
      <Separator className="my-2" />
      <NotificationSettings />
    </div>
  );
}
