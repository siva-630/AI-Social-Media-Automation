import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MailIcon, LockIcon, ArrowRightIcon, User2Icon } from "lucide-react";
import { toast } from "react-toastify";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function Login() {
    const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (authMode === "forgot" && password !== confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const endpoint = authMode === "login" ? "/api/auth/login" : authMode === "register" ? "/api/auth/register" : "/api/auth/reset-password";
            const payload = authMode === "register" ? { name, email, password } : { email, password };

            const API_URL = import.meta.env.DEV ? "http://localhost:3000" : "https://ai-social-media-automation.onrender.com";
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                if (authMode === "forgot") {
                    toast.success("Password updated successfully");
                    setAuthMode("login");
                    setPassword("");
                    setConfirmPassword("");
                    return;
                }
                // Save user data securely (e.g., in localStorage or context)
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data._id);
                localStorage.setItem("userName", data.name);
                localStorage.setItem("userEmail", data.email);

                toast.success(authMode === "login" ? "Logged in successfully!" : "Account created successfully!");
                navigate("/dashboard");
            } else {
                toast.error(data.message || "Authentication failed");
            }
        } catch (error) {
            console.error("Auth error:", error);
            toast.error("An error occurred during authentication. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const API_URL = import.meta.env.DEV ? "http://localhost:3000" : "https://ai-social-media-automation.onrender.com";

            // Send user details to our custom backend
            const response = await fetch(`${API_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: user.displayName,
                    email: user.email,
                    firebaseUid: user.uid,
                    photoUrl: user.photoURL
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data._id);
                localStorage.setItem("userName", data.name);
                localStorage.setItem("userEmail", data.email);

                toast.success("Logged in with Google successfully!");
                navigate("/dashboard");
            } else {
                toast.error(data.message || "Google Authentication failed on server");
            }
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            if (error.code !== "auth/popup-closed-by-user") {
                toast.error("Failed to sign in with Google.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <div className="flex flex-col items-center mb-8">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" className="size-6.5" />
                            <h1 className="text-2xl">Scheduler</h1>
                        </Link>
                        <p className="text-slate-500 text-sm mt-1">{authMode === 'login' ? 'Sign in to your Dashboard' : authMode === 'register' ? 'Create a new account' : 'Reset your password'}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                        {authMode === "register" && (
                            <div>
                                <label className="block mb-1.5">Name</label>
                                <div className="relative">
                                    <User2Icon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" required placeholder="Enter your name" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-full" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block mb-1.5">Email</label>
                            <div className="relative">
                                <MailIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="email" required placeholder="you@company.com" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-full" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block">{authMode === 'forgot' ? 'New Password' : 'Password'}</label>
                                {authMode === "login" && (
                                    <button type="button" onClick={() => setAuthMode("forgot")} className="text-xs text-violet-600 hover:text-violet-700">
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <LockIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="password" required placeholder="********" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-full" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>
                        {authMode === "forgot" && (
                            <div>
                                <label className="block mb-1.5">Confirm New Password</label>
                                <div className="relative">
                                    <LockIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="password" required placeholder="********" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-full" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-linear-to-r from-violet-600 to-violet-500 text-white rounded-full text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading ? (
                                authMode === "login" ? "Signing in..." : authMode === "register" ? "Signing up..." : "Resetting..."
                            ) : (
                                <>
                                    {authMode === "login" ? "Sign In" : authMode === "register" ? "Sign Up" : "Reset Password"} <ArrowRightIcon className="size-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-between">
                        <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
                        <span className="text-xs text-center text-slate-500 uppercase">or continue with</span>
                        <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        type="button"
                        className="mt-4 w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Sign in with Google
                    </button>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        {authMode === "login" ? (
                            <>
                                Don't have an account?{" "}
                                <button onClick={() => setAuthMode("register")} className="text-violet-600 hover:text-violet-700">
                                    Create one free
                                </button>
                            </>
                        ) : authMode === "register" ? (
                            <>
                                Already have an account?{" "}
                                <button onClick={() => setAuthMode("login")} className="text-violet-600 hover:text-violet-700">
                                    Sign In
                                </button>
                            </>
                        ) : (
                            <>
                                Remember your password?{" "}
                                <button onClick={() => setAuthMode("login")} className="text-violet-600 hover:text-violet-700">
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
// login