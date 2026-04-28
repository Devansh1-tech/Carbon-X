import { createContext, useContext, useReducer } from "react";
import { mockProjects } from "../data/mockProjects";
import { mockMarketplace } from "../data/mockMarketplace";
import { mockTransactions } from "../data/mockTransactions";
import { mockUsers } from "../data/mockUsers";

const AppContext = createContext(null);

const initialState = {
  currentUser: null,
  wallet: {
    balance: 0,
    transactions: [],
  },
  projects: [...mockProjects],
  marketplace: [...mockMarketplace],
  transactions: [...mockTransactions],
  notifications: [],
};

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
        wallet: {
          balance: user.walletBalance || 0,
          transactions: state.transactions.filter(
            (t) => t.buyerId === user.id || t.sellerId === user.id
          ),
        },
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

    default:
      return state;
  }
}

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
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: `Project "${newProject.title}" submitted for verification.`,
    });

    // Mock verification after 2 seconds
    setTimeout(() => {
      const credits = newProject.creditsGenerated || Math.round(Math.random() * 100 + 20);
      dispatch({ type: "VERIFY_PROJECT", payload: { projectId: newProject.id, credits } });
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: `Project "${newProject.title}" verified! ${credits} credits earned.`,
      });
    }, 2000);
  };

  const buyCredits = (listingId, creditsToBuy, buyerId) => {
    dispatch({ type: "BUY_CREDITS", payload: { listingId, creditsToBuy, buyerId } });
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: `Successfully purchased ${creditsToBuy} carbon credits.`,
    });
  };

  const addNotification = (message) => {
    dispatch({ type: "ADD_NOTIFICATION", payload: message });
  };

  const clearNotifications = () => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  };

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
