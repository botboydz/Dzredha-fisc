"use client";

import React, { useState } from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  CalendarDays,
  CreditCard,
  Check,
  Trash2,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ------------------------------------------------------------------ */
/*  Mock Notifications                                                 */
/* ------------------------------------------------------------------ */

interface Notification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  timestamp: string;
  type: "urgent" | "info" | "deadline" | "payment";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "N-001",
    title: "Échéance TAP — Mai 2026",
    titleAr: "آجال ض.م.م — ماي 2026",
    message: "La déclaration TAP pour Mai 2026 est due avant le 20 Mai. Montant estimé : 145 000 DZD.",
    timestamp: "2026-05-18 08:00",
    type: "urgent",
    read: false,
  },
  {
    id: "N-002",
    title: "Échéance TVA — Mai 2026",
    titleAr: "آجال ر.ق — ماي 2026",
    message: "La déclaration TVA pour Mai 2026 est due avant le 20 Mai. Montant estimé : 2 755 000 DZD.",
    timestamp: "2026-05-18 08:00",
    type: "deadline",
    read: false,
  },
  {
    id: "N-003",
    title: "Paiement IBS confirmé",
    titleAr: "تأكيد دفع ض.أ.ش",
    message: "Le paiement de l'IBS T1 2026 de 1 850 000 DZD a été confirmé par la DGI.",
    timestamp: "2026-05-15 14:30",
    type: "payment",
    read: true,
  },
  {
    id: "N-004",
    title: "Liasse fiscale en retard",
    titleAr: "الملف الجبائي متأخر",
    message: "La liasse fiscale annuelle 2025 n'a pas encore été soumise. Des pénalités pourraient s'appliquer.",
    timestamp: "2026-05-12 09:00",
    type: "urgent",
    read: false,
  },
  {
    id: "N-005",
    title: "Mise à jour du barème IRG",
    titleAr: "تحديث سلم ض.د.ع",
    message: "Le barème IRG a été mis à jour conformément à la loi de finances 2026. Consultez les nouveaux taux.",
    timestamp: "2026-05-10 10:00",
    type: "info",
    read: true,
  },
  {
    id: "N-006",
    title: "Cotisations CNAS — Mai 2026",
    titleAr: "اشتراكات ص.و.ت.ش — ماي 2026",
    message: "Les cotisations CNAS du mois de Mai 2026 s'élèvent à 201 250 DZD. Échéance : 31 Mai.",
    timestamp: "2026-05-08 16:00",
    type: "deadline",
    read: true,
  },
  {
    id: "N-007",
    title: "Déclaration TAP rejetée",
    titleAr: "تصريح ض.م.م مرفوض",
    message: "La déclaration TAP Mai 2026 a été rejetée. Veuillez vérifier les données et resoumettre.",
    timestamp: "2026-05-10 11:30",
    type: "urgent",
    read: false,
  },
  {
    id: "N-008",
    title: "Paiement TVA Avril confirmé",
    titleAr: "تأكيد دفع ر.ق أفريل",
    message: "Le paiement de la TVA Avril 2026 de 2 480 000 DZD a été enregistré avec succès.",
    timestamp: "2026-05-02 09:15",
    type: "payment",
    read: true,
  },
];

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  urgent: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50" },
  info: { icon: Info, color: "text-blue-600", bgColor: "bg-blue-50" },
  deadline: { icon: CalendarDays, color: "text-orange-600", bgColor: "bg-orange-50" },
  payment: { icon: CreditCard, color: "text-emerald-600", bgColor: "bg-emerald-50" },
};

/* ------------------------------------------------------------------ */
/*  Notifications Page                                                 */
/* ------------------------------------------------------------------ */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6 view-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#0C4A2E]" />
            Notifications / الإشعارات
            {unreadCount > 0 && (
              <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 mt-1">Centre de notifications DZ-Fisc</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          className="text-xs gap-1 cursor-pointer"
          disabled={unreadCount === 0}
        >
          <Check className="h-3 w-3" />
          Tout marquer lu / تعليم الكل كمقروء
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-gray-100 p-1 rounded-xl h-auto flex-wrap">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer">
            Toutes ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer">
            Non lues ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="urgent" className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer">
            Urgentes
          </TabsTrigger>
          <TabsTrigger value="info" className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer">
            Informations
          </TabsTrigger>
          <TabsTrigger value="deadline" className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer">
            Échéances
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer">
            Paiements
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notification Cards */}
      <div className="space-y-2">
        {filteredNotifications.map((notification) => {
          const config = TYPE_CONFIG[notification.type];
          const Icon = config.icon;

          return (
            <div
              key={notification.id}
              className={`gov-card p-4 flex items-start gap-4 transition-all ${
                !notification.read ? "border-l-4 border-l-[#0C4A2E] bg-white" : "bg-gray-50/50"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-semibold ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                      {notification.title}
                    </p>
                    <p className="text-[10px] text-gray-400">{notification.titleAr}</p>
                  </div>
                  {!notification.read && (
                    <span className="flex h-2 w-2 shrink-0 rounded-full bg-[#0C4A2E] mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notification.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{notification.timestamp}</p>
              </div>

              <div className="flex gap-1 shrink-0">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="h-7 w-7 p-0 cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    title="Marquer comme lu"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                  className="h-7 w-7 p-0 cursor-pointer text-red-400 hover:text-red-600 hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune notification / لا توجد إشعارات</p>
          </div>
        )}
      </div>
    </div>
  );
}
