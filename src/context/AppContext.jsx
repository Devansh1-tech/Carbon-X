import { createContext, useContext, useReducer, useCallback } from "react";
import { mockProjects } from "../data/mockProjects";
import { mockMarketplace } from "../data/mockMarketplace";
import { mockTransactions } from "../data/mockTransactions";
import { mockUsers } from "../data/mockUsers";
import { checkAchievements, getAchievement } from "../utils/achievements";

const AppContext = createContext(null);

/* ── Notification type configs ── */
export const NOTIF_TYPES = {
  credit_earned: { icon: "💰", label: "Credits Earned" },
  project_verified: { icon: "✅", label: "Project Verified" },
  purchase_complete: { icon: "🛒", label: "Purchase Complete" },
  price_alert: { icon: "📊", label: "Price Alert" },
  ai_recommendation: { icon: "🤖", label: "AI Recommendation" },
  system: { icon: "ℹ️", label: "System" },
};

/* ── Mock activity messages for the live feed ── */
const MOCK_ACTIVITIES = [
  { icon: "🌾", text: "Ramesh from MP just earned 45 credits" },
  { icon: "🏢", text: "Tata Steel purchased 200 credits" },
  { icon: "✅", text: "New project verified in Maharashtra" },
  { icon: "🌳", text: "Sunita planted 2,000 neem trees in Rajasthan" },
  { icon: "💰", text: "Green Earth Foundation sold 80 credits" },
  { icon: "⚡", text: "New solar project submitted from Gujarat" },
  { icon: "🏢", text: "Reliance Industries offset 500 tons CO₂" },
  { icon: "🌱", text: "Organic farm in Sehore earned 32 credits" },
  { icon: "✅", text: "Biochar project in Indore verified" },
  { icon: "🏢", text: "Adani Green purchased 150 credits" },
  { icon: "🌾", text: "No-till farming project approved in Satara" },
  { icon: "💰", text: "Marketplace volume crossed 1,500 credits today" },
  { icon: "⚡", text: "Wind energy project verified in Jodhpur" },
  { icon: "🌳", text: "5,000 bamboo saplings planted in Hoshangabad" },
  { icon: "🏢", text: "Mahindra Group bought 120 credits from NGO" },
  { icon: "✅", text: "AI verification passed for Narmada Valley project" },
  { icon: "🌱", text: "Cover crop initiative launched in Pune district" },
  { icon: "💰", text: "Carbon credit price hit ₹620 — 3-month high!" },
];

/* ── Initial state ── */
const initialState = {
  currentUser: null,
  wallet: {
    balance: 0,
    transactions: [],
  },
  projects: [...mockProjects],
  marketplace: [...mockMarketplace],
  transactions: [...mockTransactions],

  // Legacy notifications (for Toast.jsx backward compat)
  notifications: [],

  // Rich notification system
  richNotifications: [],
  showNotificationCenter: false,
  notificationCenterTab: 0,

  // Price alerts
  priceAlerts: [],
  priceAlertsEnabled: false,

  // Live activity feed
  activityFeed: [],

  // Onboarding
  isNewUser: false,
  onboardingProfile: {},

  // Gamification
  unlockedAchievements: [],
  achievementPopup: null,
};

/* ── Helper: create a rich notification ── */
function makeNotification(notifType, title, body) {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    notifType,
    title,
    body,
    icon: NOTIF_TYPES[notifType]?.icon || "ℹ️",
    read: false,
    timestamp: Date.now(),
  };
}

/* ── Reducer ── */
function appReducer(state, action) {
  switch (action.type) {
    case "LOGIN_USER": {
      const user = mockUsers.find(
        (u) => u.email === action.payload.email && u.password === action.payload.password
      );
      if (!user) return state;
      return {
        ...state,
        currentUser: user,
        isNewUser: user.isNewUser || false,
        wallet: {
          balance: user.walletBalance || 0,
          transactions: state.transactions.filter(
            (t) => t.buyerId === user.id || t.sellerId === user.id
          ),
        },
        notifications: [...state.notifications, { message: `👋 Welcome back, ${user.name}!`, type: "info" }],
        richNotifications: [
          ...state.richNotifications,
          makeNotification("system", "Welcome Back!", `Hello ${user.name}, you're now logged in.`),
        ],
      };
    }

    case "LOGOUT_USER":
      return {
        ...state,
        currentUser: null,
        wallet: { balance: 0, transactions: [] },
      };

    case "SUBMIT_PROJECT":
      return {
        ...state,
        projects: [...state.projects, { ...action.payload, status: "pending" }],
      };

    case "VERIFY_PROJECT": {
      const { projectId, credits } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, status: "verified", creditsGenerated: credits } : p
        ),
        wallet: {
          ...state.wallet,
          balance: state.wallet.balance + credits,
        },
      };
    }

    case "BUY_CREDITS": {
      const { listingId, creditsToBuy, buyerId } = action.payload;
      const listing = state.marketplace.find((l) => l.id === listingId);
      if (!listing || listing.creditsAvailable < creditsToBuy) return state;

      const totalCost = creditsToBuy * listing.pricePerCredit;
      const newTransaction = {
        id: `txn_${Date.now()}`,
        buyerId,
        sellerId: listing.sellerId,
        credits: creditsToBuy,
        pricePerCredit: listing.pricePerCredit,
        totalAmount: totalCost,
        timestamp: new Date().toISOString(),
        projectId: listing.id,
        status: "completed",
      };

      return {
        ...state,
        marketplace: state.marketplace.map((l) =>
          l.id === listingId
            ? { ...l, creditsAvailable: l.creditsAvailable - creditsToBuy }
            : l
        ),
        wallet: {
          balance: state.wallet.balance + creditsToBuy,
          transactions: [newTransaction, ...state.wallet.transactions],
        },
        transactions: [newTransaction, ...state.transactions],
      };
    }

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: [],
      };

    /* ── Rich notification actions ── */
    case "ADD_RICH_NOTIFICATION":
      return {
        ...state,
        richNotifications: [action.payload, ...state.richNotifications],
      };

    case "MARK_ALL_READ":
      return {
        ...state,
        richNotifications: state.richNotifications.map((n) => ({ ...n, read: true })),
      };

    case "DISMISS_NOTIFICATION":
      return {
        ...state,
        richNotifications: state.richNotifications.filter((n) => n.id !== action.payload),
      };

    /* ── Notification center UI ── */
    case "TOGGLE_NOTIFICATION_CENTER":
      return {
        ...state,
        showNotificationCenter: action.payload !== undefined ? action.payload : !state.showNotificationCenter,
      };

    case "SET_NOTIFICATION_CENTER_TAB":
      return {
        ...state,
        notificationCenterTab: action.payload,
      };

    /* ── Price alerts ── */
    case "SET_PRICE_ALERTS_ENABLED":
      return {
        ...state,
        priceAlertsEnabled: action.payload,
      };

    case "ADD_PRICE_ALERT":
      return {
        ...state,
        priceAlerts: [...state.priceAlerts, action.payload],
      };

    case "REMOVE_PRICE_ALERT":
      return {
        ...state,
        priceAlerts: state.priceAlerts.filter((a) => a.id !== action.payload),
      };

    /* ── Activity feed ── */
    case "ADD_ACTIVITY":
      return {
        ...state,
        activityFeed: [action.payload, ...state.activityFeed].slice(0, 50),
      };

    /* ── Onboarding ── */
    case "COMPLETE_ONBOARDING":
      return {
        ...state,
        isNewUser: false,
        onboardingProfile: action.payload || {},
      };

    /* ── Achievements ── */
    case "UNLOCK_ACHIEVEMENT":
      return {
        ...state,
        unlockedAchievements: [...state.unlockedAchievements, action.payload],
        achievementPopup: getAchievement(action.payload) || null,
      };

    case "DISMISS_ACHIEVEMENT_POPUP":
      return { ...state, achievementPopup: null };

    default:
      return state;
  }
}

/* ── Provider ── */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = (email, password) => {
    dispatch({ type: "LOGIN_USER", payload: { email, password } });
  };

  const logout = () => {
    dispatch({ type: "LOGOUT_USER" });
  };

  const submitProject = (project) => {
    const newProject = {
      ...project,
      id: `prj_${Date.now()}`,
      submittedAt: new Date().toISOString().split("T")[0],
      creditsGenerated: 0,
    };
    dispatch({ type: "SUBMIT_PROJECT", payload: newProject });

    // Legacy toast
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { message: `🌱 Project "${newProject.title}" submitted! Verification in progress...`, type: "success" },
    });

    // Rich notification — immediate
    dispatch({
      type: "ADD_RICH_NOTIFICATION",
      payload: makeNotification("system", "Project Submitted", `🌱 Your project "${newProject.title}" is under AI verification`),
    });

    // Mock verification after 3 seconds
    setTimeout(() => {
      const credits = newProject.creditsGenerated || Math.round(Math.random() * 100 + 20);
      dispatch({ type: "VERIFY_PROJECT", payload: { projectId: newProject.id, credits } });

      // Legacy toast
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: { message: `💰 ${credits} Carbon Credits added to your wallet!`, type: "success" },
      });

      // Rich notification — verified
      dispatch({
        type: "ADD_RICH_NOTIFICATION",
        payload: makeNotification("project_verified", "Project Verified!", `✅ Project verified! ${credits} credits added to wallet`),
      });

      // Credit earned notification
      dispatch({
        type: "ADD_RICH_NOTIFICATION",
        payload: makeNotification("credit_earned", "Credits Earned", `💰 ${credits} carbon credits have been added to your wallet`),
      });
    }, 3000);

    // Check achievements after submit
    setTimeout(() => {
      const newAchs = checkAchievements({ ...state, projects: [...state.projects, newProject] });
      newAchs.forEach(id => dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: id }));
    }, 100);
  };

  const buyCredits = (listingId, creditsToBuy, buyerId) => {
    dispatch({ type: "BUY_CREDITS", payload: { listingId, creditsToBuy, buyerId } });

    // Legacy toast
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { message: `✅ Purchase successful! ${creditsToBuy} credits transferred.`, type: "success" },
    });

    // Rich notification
    dispatch({
      type: "ADD_RICH_NOTIFICATION",
      payload: makeNotification("purchase_complete", "Purchase Complete", `🛒 Purchase complete. ${creditsToBuy} credits transferred to your wallet.`),
    });

    // Check achievements after buy
    setTimeout(() => {
      const newAchs = checkAchievements(state);
      newAchs.forEach(id => dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: id }));
    }, 100);
  };

  const addNotification = (message) => {
    dispatch({ type: "ADD_NOTIFICATION", payload: message });
  };

  const clearNotifications = () => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  };

  /* ── Rich notification helpers ── */
  const addRichNotification = useCallback((notifType, title, body) => {
    dispatch({ type: "ADD_RICH_NOTIFICATION", payload: makeNotification(notifType, title, body) });
  }, []);

  const markAllRead = useCallback(() => {
    dispatch({ type: "MARK_ALL_READ" });
  }, []);

  const dismissNotification = useCallback((id) => {
    dispatch({ type: "DISMISS_NOTIFICATION", payload: id });
  }, []);

  const toggleNotificationCenter = useCallback((value) => {
    dispatch({ type: "TOGGLE_NOTIFICATION_CENTER", payload: value });
  }, []);

  const setNotificationCenterTab = useCallback((tab) => {
    dispatch({ type: "SET_NOTIFICATION_CENTER_TAB", payload: tab });
  }, []);

  /* ── Price alert helpers ── */
  const setPriceAlertsEnabled = useCallback((enabled) => {
    dispatch({ type: "SET_PRICE_ALERTS_ENABLED", payload: enabled });
  }, []);

  const addPriceAlert = useCallback((direction, threshold) => {
    dispatch({
      type: "ADD_PRICE_ALERT",
      payload: {
        id: `pa_${Date.now()}`,
        direction,
        threshold: parseFloat(threshold),
        enabled: true,
        triggered: false,
      },
    });
  }, []);

  const removePriceAlert = useCallback((id) => {
    dispatch({ type: "REMOVE_PRICE_ALERT", payload: id });
  }, []);

  /* ── Activity feed helper ── */
  const addActivity = useCallback((icon, text) => {
    dispatch({
      type: "ADD_ACTIVITY",
      payload: {
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        icon,
        text,
        timestamp: Date.now(),
      },
    });
  }, []);

  /* ── Trigger price alert notification ── */
  const triggerPriceAlert = useCallback((alert, currentPrice) => {
    const dir = alert.direction === "above" ? "above" : "below";
    const body = `📊 Carbon credit price is now ₹${currentPrice.toFixed(2)} — ${dir} your ₹${alert.threshold} threshold!`;

    dispatch({
      type: "ADD_RICH_NOTIFICATION",
      payload: makeNotification("price_alert", "Price Alert Triggered!", body),
    });

    // Also add as toast
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { message: body, type: "warning" },
    });
  }, []);

  /* ── Onboarding helper ── */
  const completeOnboarding = useCallback((profileData) => {
    dispatch({ type: "COMPLETE_ONBOARDING", payload: profileData });
  }, []);

  /* ── Achievement helpers ── */
  const dismissAchievementPopup = useCallback(() => {
    dispatch({ type: "DISMISS_ACHIEVEMENT_POPUP" });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        submitProject,
        buyCredits,
        addNotification,
        clearNotifications,
        addRichNotification,
        markAllRead,
        dismissNotification,
        toggleNotificationCenter,
        setNotificationCenterTab,
        setPriceAlertsEnabled,
        addPriceAlert,
        removePriceAlert,
        addActivity,
        triggerPriceAlert,
        completeOnboarding,
        dismissAchievementPopup,
        MOCK_ACTIVITIES,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
