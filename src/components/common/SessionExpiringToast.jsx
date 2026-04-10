import React from "react";
import toast from "react-hot-toast";

export default function SessionExpiringToast({ onStayLoggedIn, onLogout, toastId }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
      <p className="text-yellow-800 font-medium">Session expiring soon</p>
      <p className="text-yellow-700 text-sm mt-1">Your session will expire in 5 minutes due to inactivity.</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (toastId != null) toast.dismiss(toastId);
            onStayLoggedIn?.();
          }}
          className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
        >
          Stay Logged In
        </button>
        <button
          type="button"
          onClick={() => {
            if (toastId != null) toast.dismiss(toastId);
            onLogout?.();
          }}
          className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
