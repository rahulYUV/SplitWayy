import { useState, useEffect, useRef } from "react";
import { User, updateProfile, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { getUserProfile, updateUserProfile, UserProfile, revokeAllSessions } from "@/services/userService";
import { auth } from "@/lib/firebase";
import { GridPattern } from "@/components/ui/shadcn-io/grid-pattern";
import { cn } from "@/lib/utils";
import { WaterRipple } from "@/components/WaterRipple";

interface AccountSettingsProps {
    user: User | null;
}

/**
 * AccountSettings Component
 * Main page for user profile management.
 * Handles: Profile updates, avatar uploads, password resets, and session management.
 */
export function AccountSettings({ user }: AccountSettingsProps) {
    // --- State Management ---
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showVisits, setShowVisits] = useState(false);

    // Inline editing states
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Lifecycle ---
    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    /**
     * Fetches the full user profile from Firestore
     */
    const fetchProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserProfile(user.uid);
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Triggers a Firebase Authentication password reset email
     */
    const handleResetPassword = async () => {
        if (!user || !user.email) return;
        setSaving(true);
        try {
            await sendPasswordResetEmail(auth, user.email);
            setMessage({ type: 'success', text: 'Password reset email sent! Check your inbox.' });
        } catch (error: any) {
            console.error("Reset error:", error);
            setMessage({ type: 'error', text: 'Failed to send reset email.' });
        } finally {
            setSaving(false);
        }
    };

    /**
     * Directly updates user password (requires recent login)
     */
    const handlePasswordUpdate = async () => {
        if (!editValue || !user) return;
        setSaving(true);
        try {
            await updatePassword(user, editValue);
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setEditingField(null);
            setEditValue("");
        } catch (error: any) {
            console.error("Update error:", error);
            if (error.code === 'auth/requires-recent-login') {
                setMessage({ type: 'error', text: 'Please log out and back in to change your password for security.' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to update password.' });
            }
        } finally {
            setSaving(false);
        }
    };

    /**
     * Saves general preferences (currency, timezone, language)
     */
    const handleSaveGeneral = async () => {
        if (!user || !profile) return;
        setSaving(true);
        setMessage(null);
        try {
            await updateUserProfile(user.uid, {
                currency: profile.currency,
                timezone: profile.timezone,
                language: profile.language,
            });
            setMessage({ type: 'success', text: 'Preferences saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save preferences.' });
        } finally {
            setSaving(false);
        }
    };

    /**
     * Saves privacy-specific settings
     */
    const handleSavePrivacy = async () => {
        if (!user || !profile) return;
        setSaving(true);
        setMessage(null);
        try {
            await updateUserProfile(user.uid, {
                allowRecommendations: profile.allowRecommendations,
            });
            setMessage({ type: 'success', text: 'Privacy settings updated!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update privacy settings.' });
        } finally {
            setSaving(false);
        }
    };

    /**
     * Globally revokes all sessions and logs current device out
     */
    const handleLogOutAllDevices = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await revokeAllSessions(user.uid);
            setMessage({ type: 'success', text: 'Logged out of all other devices!' });
            // Delayed sign out to allow flag propagation
            setTimeout(() => {
                auth.signOut();
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to revoke sessions.' });
        } finally {
            setSaving(false);
        }
    };

    /**
     * Handles switching a field into edit mode
     */
    const handleEditStart = (field: string, value: string) => {
        setEditingField(field);
        setEditValue(value);
    };

    /**
     * Saves an inline-edited field to Firestore and Firebase Auth if needed
     */
    const handleEditSave = async () => {
        if (!user || !profile || !editingField) return;
        setSaving(true);
        try {
            const updates: Partial<UserProfile> = { [editingField]: editValue };
            await updateUserProfile(user.uid, updates);

            // Sync with Firebase Auth for primary fields
            if (editingField === 'displayName') {
                await updateProfile(user, { displayName: editValue });
            }

            setProfile({ ...profile, ...updates });
            setEditingField(null);
            setMessage({ type: 'success', text: `${editingField} updated!` });
        } catch (error) {
            setMessage({ type: 'error', text: `Failed to update ${editingField}.` });
        } finally {
            setSaving(false);
        }
    };

    /**
     * Handles avatar selection and conversion to Base64 (max 1MB)
     */
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !profile) return;

        // Size check for direct Firestore storage (Base64)
        if (file.size > 1024 * 1024) {
            setMessage({ type: 'error', text: 'File is too large! Max 1MB allowed.' });
            return;
        }

        setUploading(true);
        setMessage(null);
        try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const base64String = await base64Promise;

            // Direct Firestore save to avoid external storage dependencies
            await updateUserProfile(user.uid, { photoURL: base64String });

            setProfile(p => p ? ({ ...p, photoURL: base64String } as UserProfile) : null);
            setMessage({ type: 'success', text: 'Avatar updated!' });
        } catch (error: any) {
            console.error("Avatar upload error:", error);
            setMessage({ type: 'error', text: 'Failed to save photo.' });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#ff6b35]" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen bg-white font-sans overflow-hidden">
            {/* Background Canvas Logic Decorator */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.6]">
                <GridPattern
                    width={50}
                    height={50}
                    x={-1}
                    y={-1}
                    strokeDasharray={"4 2"}
                    className={cn(
                        "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
                        "animate-grid-stroke"
                    )}
                />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 space-y-12 bg-transparent">

                {/* --- Action Messages --- */}
                {message && (
                    <div className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-xl shadow-2xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                        } flex items-center gap-2 animate-in fade-in slide-in-from-top-4`}>
                        {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span className="font-bold text-sm">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70"><X className="w-3 h-3" /></button>
                    </div>
                )}

                <h1 className="text-3xl font-black text-center text-gray-900 border-none">Your account</h1>

                {/* --- Main Configuration Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-4">

                    {/* Section 1: Visual Identity */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="gradient-border-wrapper shadow-2xl">
                            <div className="w-64 h-64 rounded-xl overflow-hidden relative group cursor-pointer bg-transparent">
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50 text-center flex-col p-4">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35] mb-2" />
                                        <span className="text-[10px] font-black text-gray-600 uppercase">Uploading...</span>
                                    </div>
                                )}

                                <WaterRipple
                                    image={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName || user?.displayName || 'User'}&background=008cc9&color=fff&size=512`}
                                    width={512}
                                    height={512}
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                            <Button
                                variant="link"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-[#008cc9] hover:text-[#0073a5] text-[11px] font-black uppercase tracking-widest p-0 h-auto no-underline flex items-center gap-1.5"
                            >
                                <Pencil className="w-3 h-3" />
                                Change avatar
                            </Button>
                        </div>
                    </div>

                    {/* Section 2: Personal Identity Details */}
                    <div className="flex-1 space-y-10 flex flex-col items-center">
                        <div className="text-center w-full">
                            <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Your name</Label>
                            {editingField === 'displayName' ? (
                                <div className="flex items-center gap-2 justify-center">
                                    <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 text-sm text-center max-w-[200px]" />
                                    <button onClick={handleEditSave} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingField(null)} className="text-red-500 hover:text-red-600"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 justify-center group">
                                    <span className="text-xl font-bold text-gray-900">{profile?.displayName || "User"}</span>
                                    <button onClick={() => handleEditStart('displayName', profile?.displayName || "")} className="text-[#008cc9] hover:text-[#0073a5] transition-opacity flex items-center gap-1 text-[11px] font-bold"><Pencil className="w-3 h-3" /> Edit</button>
                                </div>
                            )}
                        </div>

                        <div className="text-center w-full">
                            <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Your email address</Label>
                            <span className="text-lg font-bold text-gray-900">{profile?.email}</span>
                        </div>

                        <div className="text-center w-full">
                            <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Your phone number</Label>
                            {editingField === 'phoneNumber' ? (
                                <div className="flex items-center gap-2 justify-center">
                                    <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 text-sm text-center max-w-[200px]" />
                                    <button onClick={handleEditSave} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingField(null)} className="text-red-500 hover:text-red-600"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 justify-center group">
                                    <span className="text-xl font-bold text-gray-900">{profile?.phoneNumber || "None"}</span>
                                    <button onClick={() => handleEditStart('phoneNumber', profile?.phoneNumber || "")} className="text-[#008cc9] hover:text-[#0073a5] transition-opacity flex items-center gap-1 text-[11px] font-bold"><Pencil className="w-3 h-3" /> Edit</button>
                                </div>
                            )}
                        </div>

                        <div className="text-center w-full">
                            <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Your password</Label>
                            {editingField === 'password' ? (
                                <div className="flex items-center gap-2 justify-center">
                                    <Input type="password" value={editValue} placeholder="New password" onChange={(e) => setEditValue(e.target.value)} className="h-8 text-sm text-center max-w-[200px]" />
                                    <button onClick={handlePasswordUpdate} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingField(null)} className="text-red-500 hover:text-red-600"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 justify-center group relative translate-x-3">
                                        <span className="text-xl font-bold text-gray-900 tracking-widest translate-y-1">•••••••••</span>
                                        <button onClick={() => handleEditStart('password', "")} className="text-[#008cc9] hover:text-[#0073a5] transition-opacity flex items-center gap-1 text-[11px] font-bold"><Pencil className="w-3 h-3" /><span>Change</span></button>
                                    </div>
                                    <button onClick={handleResetPassword} className="text-[10px] font-black uppercase tracking-tighter text-gray-400 hover:text-[#ff6b35] transition-colors">Forgot password?</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Localization & Preferences */}
                    <div className="w-full space-y-8">
                        <div className="text-center">
                            <Label className="text-sm text-gray-800 font-extrabold block">Your default currency</Label>
                            <span className="text-[10px] text-gray-400 font-normal block mb-2">(for new expenses)</span>
                            <Select value={profile?.currency || "INR"} onValueChange={(val) => setProfile(p => p ? ({ ...p, currency: val } as UserProfile) : null)}>
                                <SelectTrigger className="w-full h-9 rounded-md border-gray-300 text-sm focus:ring-[#ff6b35]/20"><SelectValue placeholder="Select currency" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INR">INR (₹)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-center">
                            <Label className="text-sm text-gray-800 font-extrabold block mb-2">Your time zone</Label>
                            <Select value={profile?.timezone || "GMT+05:30"} onValueChange={(val) => setProfile(p => p ? ({ ...p, timezone: val } as UserProfile) : null)}>
                                <SelectTrigger className="w-full h-9 rounded-md border-gray-300 text-xs focus:ring-[#ff6b35]/20"><SelectValue placeholder="Select timezone" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GMT+05:30">(GMT+05:30) Chennai, Kolkata</SelectItem>
                                    <SelectItem value="GMT+00:00">(GMT+00:00) London</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4">
                            <Button onClick={handleSaveGeneral} disabled={saving} className="w-full bg-[#ff6b35] hover:bg-[#ff5a1f] text-white font-black text-lg py-5 shadow-lg rounded-xl transition-all active:scale-95 disabled:opacity-50">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Settings"}
                            </Button>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-200" />

                {/* --- Privacy & Security Controls --- */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-black text-center text-gray-900 tracking-tight">Privacy & Security</h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-start gap-4">
                            <Button variant="outline" onClick={() => setShowVisits(!showVisits)} className={`h-8 text-xs font-bold px-5 bg-white transition-colors ${showVisits ? 'border-[#32dd9e] text-[#32dd9e]' : 'border-gray-200 text-gray-500'}`}>
                                {showVisits ? 'Hide recent visits' : 'Recent visits'}
                            </Button>
                            <Button variant="outline" onClick={handleLogOutAllDevices} disabled={saving} className="h-8 text-xs font-bold text-gray-500 border-gray-200 px-5 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
                                {saving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null} Log out on all devices
                            </Button>
                        </div>

                        {showVisits && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 animate-in slide-in-from-top-2 duration-300">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Last 5 Sessions</h3>
                                <div className="space-y-3">
                                    {profile?.recentVisits?.map((visit, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-gray-200 last:border-0">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">{new Date(visit.timestamp).toLocaleString()}</span>
                                                <span className="text-[10px] text-gray-400 truncate max-w-[250px]">{visit.userAgent}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${i === 0 ? 'bg-[#32dd9e] text-white' : 'bg-gray-200 text-gray-500'}`}>{i === 0 ? 'CURRENT' : 'LOGGED IN'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-start gap-4">
                        <Checkbox id="recommend" className="mt-1 border-black data-[state=checked]:bg-[#32dd9e] data-[state=checked]:border-[#32dd9e]" checked={profile?.allowRecommendations || false} onCheckedChange={(checked) => setProfile(p => p ? ({ ...p, allowRecommendations: !!checked } as UserProfile) : null)} />
                        <div className="space-y-1">
                            <label htmlFor="recommend" className="text-sm font-bold text-gray-800 leading-none cursor-pointer">Allow SplitWayy to suggest me as a friend</label>
                            <p className="text-[11px] text-gray-400 italic">Only visible to users who already have your contact info.</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSavePrivacy} disabled={saving} className="bg-[#ff6b35] hover:bg-[#ff5a1f] text-white font-bold text-xs h-7 px-6 rounded shadow-sm transition-all transform hover:scale-105">Save Privacy</Button>
                    </div>
                </div>

                <hr className="border-gray-200" />

                {/* --- Danger Zone / Advanced --- */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-black text-center text-gray-900 tracking-tight">Advanced features</h2>
                    <div className="flex flex-col items-start gap-4">
                        <Link to="/deactivate">
                            <Button className="bg-[#cc4b5b] hover:bg-[#b0404e] text-white text-xs font-bold px-4 h-8 rounded shadow-sm transition-all hover:scale-105">Close your account</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
