"use client";

import { useEffect, useState, useRef } from "react";

interface GoogleAuthButtonProps {
  label?: string;
  redirectUrl?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleAuthButton({
  redirectUrl = "/studio",
}: GoogleAuthButtonProps) {
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string>("");
  const [inputClientId, setInputClientId] = useState<string>("");
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    const savedClientId = typeof window !== "undefined" ? localStorage.getItem("weekie_google_client_id") || "" : "";
    const activeClientId = envClientId || savedClientId;
    setClientId(activeClientId);

    // Load Google Identity Services SDK
    if (typeof window !== "undefined" && !window.google?.accounts) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsSdkLoaded(true);
      };
      document.head.appendChild(script);
    } else if (typeof window !== "undefined" && window.google?.accounts) {
      setIsSdkLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isSdkLoaded && clientId && googleBtnRef.current && window.google?.accounts?.id) {
      try {
        setAuthError(null);
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear previous button content
        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = "";
        }

        // Render official Google Sign-In SDK button
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: "360",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      } catch (err: any) {
        console.error("Google GIS Initialization Error:", err);
        setAuthError(err.message || "Failed to initialize Google OAuth");
      }
    }
  }, [isSdkLoaded, clientId]);

  // Decode Google ID Token JWT
  const parseGoogleJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Failed to parse Google JWT credential:", err);
      return null;
    }
  };

  const handleCredentialResponse = (response: any) => {
    if (response?.credential) {
      const payload = parseGoogleJwt(response.credential);
      if (payload) {
        const googleUser = {
          name: payload.name || payload.given_name || "Google User",
          email: payload.email,
          avatar: payload.picture || "https://lh3.googleusercontent.com/a/default-user=s96-c",
          googleId: payload.sub,
          emailVerified: payload.email_verified,
          provider: "google",
          authenticatedAt: new Date().toISOString(),
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("weekie_user", JSON.stringify(googleUser));
          document.cookie = "weekie_session=active; path=/; max-age=86400";
          window.location.href = redirectUrl;
        }
      }
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputClientId.trim()) return;
    const cleanId = inputClientId.trim();
    localStorage.setItem("weekie_google_client_id", cleanId);
    setClientId(cleanId);
  };

  return (
    <div className="w-full space-y-3">
      {clientId ? (
        <div className="flex flex-col items-center justify-center w-full">
          {/* Official Google Sign-In SDK Render Container */}
          <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]"></div>
          {authError && (
            <p className="text-xs text-[#EF4444] mt-2 font-semibold text-center">{authError}</p>
          )}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("weekie_google_client_id");
              setClientId("");
            }}
            className="text-[10px] text-[#94A3B8] hover:text-[#F97316] mt-2 underline"
          >
            Change Google Client ID
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] text-left space-y-3">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <h4 className="text-xs font-bold text-[#9A3412]">Configure Google OAuth Client ID</h4>
          </div>
          <p className="text-[11px] text-[#C2410C] leading-relaxed">
            Enter your Google Cloud OAuth Web Client ID (from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="underline font-bold">Google Cloud Console</a>) to enable real Google Sign-In popups:
          </p>
          <form onSubmit={handleSaveClientId} className="space-y-2">
            <input
              type="text"
              required
              value={inputClientId}
              onChange={(e) => setInputClientId(e.target.value)}
              placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
              className="w-full rounded-lg border border-[#FDBA74] bg-white px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#F97316]"
            />
            <button
              type="submit"
              className="w-full btn-orange py-2 text-xs font-bold"
            >
              Enable Real Google Sign-In
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
