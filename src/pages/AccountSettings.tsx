import { useState, useEffect, useRef } from "react";
import { User, updateProfile, sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Check, X, Loader2, Shield, Globe, User as UserIcon, Smartphone, Lock, LogOut, History, ChevronRight, Camera, Save as SaveIcon, LayoutGrid, FileText } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getUserProfile, updateUserProfile, UserProfile, revokeAllSessions } from "@/services/userService";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { WaterRipple } from "@/components/WaterRipple";

interface AccountSettingsProps {
    user: User | null;
}

export function AccountSettings({ user }: AccountSettingsProps) {
    // --- State Management ---
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showVisits, setShowVisits] = useState(false);

    // Inline editing states
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Generate seeds only once when component mounts or modal opens
        const seeds = [
            "Felix", "Aneka", "Jack", "Luna", "Oliver", "Leo",
            "Zoe", "Max", "Mia", "Noah", "Ava", "Lucas"
        ];
        // Add a few random ones
        for (let i = 0; i < 4; i++) seeds.push(Math.random().toString(36).substring(7));

        setAvatarOptions(seeds);
    }, []);

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
            toast.success('Password reset email sent! Check your inbox.');
        } catch (error: any) {
            console.error("Reset error:", error);
            toast.error('Failed to send reset email.');
        } finally {
            setSaving(false);
        }
    };

    /**
     * Directly updates user password (requires recent login)
     */
    const handlePasswordUpdate = async () => {
        if (!editValue || !currentPassword || !user || !user.email) return;
        setSaving(true);
        try {
            // 1. Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // 2. Update password
            await updatePassword(user, editValue);
            toast.success('Password updated successfully!');
            setEditingField(null);
            setEditValue("");
            setCurrentPassword("");
        } catch (error: any) {
            console.error("Update error:", error);
            if (error.code === 'auth/wrong-password') {
                toast.error('Incorrect current password.');
            } else if (error.code === 'auth/requires-recent-login') {
                toast.error('For security, please log in again before changing password.');
            } else if (error.code === 'auth/weak-password') {
                toast.error('New password is too weak.');
            } else {
                toast.error(error.message || 'Failed to update password.');
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
        try {
            await updateUserProfile(user.uid, {
                currency: profile.currency,
                timezone: profile.timezone,
                language: profile.language,
            });
            toast.success('Preferences saved successfully!');
        } catch (error) {
            toast.error('Failed to save preferences.');
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
            toast.success('Logged out of all other devices!');
            // Delayed sign out to allow flag propagation
            setTimeout(() => {
                auth.signOut();
            }, 2000);
        } catch (error) {
            toast.error('Failed to revoke sessions.');
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
            setProfile({ ...profile, ...updates });
            setEditingField(null);
            toast.success(`${editingField} updated!`);
        } catch (error) {
            toast.error(`Failed to update ${editingField}.`);
        } finally {
            setSaving(false);
        }
    };

    /**
     * Handles selecting an avatar from the Notionist grid
     */
    const handleSelectAvatar = async (seed: string) => {
        const newAvatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

        // Optimistic update
        setProfile(p => p ? ({ ...p, photoURL: newAvatarUrl } as UserProfile) : null);

        // Persist
        if (user) {
            await updateUserProfile(user.uid, { photoURL: newAvatarUrl });
            toast.success('Avatar updated!');
        }
        setShowAvatarModal(false);
    };

    /**
     * Handles avatar selection and conversion to Base64 (max 1MB)
     */
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !profile) return;

        if (file.size > 1024 * 1024) {
            toast.error('File is too large! Max 1MB allowed.');
            return;
        }

        setUploading(true);
        try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const base64String = await base64Promise;
            await updateUserProfile(user.uid, { photoURL: base64String });
            setProfile(p => p ? ({ ...p, photoURL: base64String } as UserProfile) : null);
            toast.success('Avatar updated!');
        } catch (error: any) {
            console.error("Avatar upload error:", error);
            toast.error('Failed to save photo.');
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
        <div className="relative w-full font-sans min-h-screen bg-gray-50/30 pb-20">
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-4 space-y-6">

                {/* --- HEADER MAT: Profile Section --- */}
                <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden ring-1 ring-white/50">
                    {/* ... (keep existing decorative elements) ... */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 mix-blend-multiply" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 mix-blend-multiply" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12">
                        {/* Avatar Column */}
                        <div className="flex-shrink-0">
                            <div className="relative group">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden relative ring-8 ring-white/50 shadow-2xl transition-all duration-500">
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                                        </div>
                                    )}
                                    <WaterRipple
                                        image={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName || user?.displayName || 'User'}&background=0f172a&color=32dd9e&size=512`}
                                        width={512}
                                        height={512}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex gap-2 absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-50">
                                    <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
                                        <DialogTrigger asChild>
                                            <button className="p-2.5 bg-white hover:bg-gray-50 text-gray-900 rounded-full shadow-lg border border-gray-100 transition-all active:scale-95 hover:scale-105" title="Choose Notionist Avatar">
                                                <LayoutGrid className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md bg-white">
                                            <DialogHeader>
                                                <DialogTitle>Choose Avatar</DialogTitle>
                                                <DialogDescription>Select a style that matches your vibe.</DialogDescription>
                                            </DialogHeader>
                                            <ScrollArea className="h-[300px] w-full p-1">
                                                <div className="grid grid-cols-4 gap-4 p-2">
                                                    {avatarOptions.map((seed) => (
                                                        <button key={seed} onClick={() => handleSelectAvatar(seed)} className="relative aspect-square rounded-xl overflow-hidden hover:ring-2 hover:ring-[#32dd9e] transition-all hover:scale-105 bg-gray-50 border border-gray-100">
                                                            <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`} alt={seed} className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                            <DialogFooter className="sm:justify-start">
                                                <DialogClose asChild>
                                                    <Button type="button" variant="secondary">Cancel</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-gray-900 hover:bg-black text-white rounded-full shadow-lg border border-white transition-all active:scale-95 hover:scale-105" title="Upload Custom Photo">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                            </div>
                        </div>

                        {/* Info Column */}
                        <div className="flex-1 text-center md:text-left space-y-4 pt-2 md:pl-8">
                            <div>
                                <h1 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Account Settings</h1>
                                {editingField === 'displayName' ? (
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="h-10 text-3xl font-black bg-white/50 border-transparent focus:bg-white focus:border-gray-200"
                                            autoFocus
                                        />
                                        <button onClick={handleEditSave} className="p-2 bg-black text-white rounded-lg hover:bg-gray-800"><Check className="w-5 h-5" /></button>
                                        <button onClick={() => setEditingField(null)} className="p-2 bg-white text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500"><X className="w-5 h-5" /></button>
                                    </div>
                                ) : (
                                    <div className="group flex items-center gap-3 justify-center md:justify-start">
                                        <h2 className="text-5xl font-black text-gray-900 tracking-tight">{profile?.displayName || "User"}</h2>
                                        <button onClick={() => handleEditStart('displayName', profile?.displayName || "")} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-900 transition-all bg-white/50 rounded-full hover:bg-white"><Pencil className="w-5 h-5" /></button>
                                    </div>
                                )}
                                <p className="text-gray-500 font-medium text-lg mt-1 ml-1">{profile?.email}</p>
                            </div>

                            <div className="flex items-center gap-3 justify-center md:justify-start ml-1">
                                <span className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-md text-gray-700 text-xs font-bold uppercase tracking-wider border border-white/60 shadow-sm">Active Account</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Content Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* --- Personal Details --- */}
                    <div className="relative bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden ring-1 ring-white/50 space-y-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 -z-10 mix-blend-multiply" />

                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-white/50 rounded-xl text-gray-900 border border-white/50 shadow-sm">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Personal Details</h3>
                                <p className="text-xs text-gray-500">Manage your private information</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Phone */}
                            <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl hover:bg-white/60 transition-colors group border border-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                                        <Smartphone className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Phone</p>
                                        {editingField === 'phoneNumber' ? (
                                            <div className="flex items-center gap-2">
                                                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-7 text-sm max-w-[140px] bg-white" />
                                                <button onClick={handleEditSave} className="text-[#32dd9e]"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingField(null)} className="text-red-400"><X className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-semibold text-gray-900">{profile?.phoneNumber || "Not set"}</p>
                                        )}
                                    </div>
                                </div>
                                {editingField !== 'phoneNumber' && (
                                    <button onClick={() => handleEditStart('phoneNumber', profile?.phoneNumber || "")} className="text-xs font-bold text-gray-400 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-white transition-all">Edit</button>
                                )}
                            </div>

                            {/* Password */}
                            <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl hover:bg-white/60 transition-colors group border border-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Password</p>
                                        {editingField === 'password' ? (
                                            <div className="flex flex-col gap-2">
                                                <Input
                                                    type="password"
                                                    placeholder="Current Password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="h-7 text-sm max-w-[150px] bg-white border-green-100 focus:border-green-300"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="password"
                                                        placeholder="New Password"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="h-7 text-sm max-w-[150px] bg-white"
                                                    />
                                                    <button onClick={handlePasswordUpdate} title="Save" className="bg-green-500 text-white p-1 rounded hover:bg-green-600"><Check className="w-3 h-3" /></button>
                                                    <button onClick={() => { setEditingField(null); setCurrentPassword(""); }} title="Cancel" className="bg-gray-100 text-gray-500 p-1 rounded hover:bg-red-50 hover:text-red-500"><X className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-semibold text-gray-900 tracking-widest">••••••••</p>
                                        )}
                                    </div>
                                </div>
                                {editingField !== 'password' && (
                                    <button onClick={() => handleEditStart('password', "")} className="text-xs font-bold text-gray-400 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-white transition-all">Change</button>
                                )}
                            </div>

                            {/* Reset Password Link */}
                            <button onClick={handleResetPassword} className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors py-2">
                                Send Password Reset Email
                            </button>
                        </div>
                    </div>

                    {/* --- Preferences --- */}
                    <div className="relative bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden ring-1 ring-white/50 flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 -z-10 mix-blend-multiply" />

                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-white/50 rounded-xl text-gray-900 border border-white/50 shadow-sm">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Preferences</h3>
                                <p className="text-xs text-gray-500">Customize your experience</p>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Default Currency</Label>
                                <Select value={profile?.currency || "INR"} onValueChange={(val) => setProfile(p => p ? ({ ...p, currency: val } as UserProfile) : null)}>
                                    <SelectTrigger className="w-full h-11 rounded-xl border-white/50 bg-white/40 hover:bg-white/60 focus:ring-0 focus:border-gray-300 font-medium transition-colors">
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">INR (₹) Indian Rupee</SelectItem>
                                        <SelectItem value="USD">USD ($) US Dollar</SelectItem>
                                        <SelectItem value="EUR">EUR (€) Euro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Time Zone</Label>
                                <Select value={profile?.timezone || "GMT+05:30"} onValueChange={(val) => setProfile(p => p ? ({ ...p, timezone: val } as UserProfile) : null)}>
                                    <SelectTrigger className="w-full h-11 rounded-xl border-white/50 bg-white/40 hover:bg-white/60 focus:ring-0 focus:border-gray-300 font-medium transition-colors">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent className="h-[200px]">
                                        <SelectItem value="GMT-12:00">(GMT-12:00) International Date Line West</SelectItem>
                                        <SelectItem value="GMT-08:00">(GMT-08:00) Pacific Time (US & Canada)</SelectItem>
                                        <SelectItem value="GMT-07:00">(GMT-07:00) Mountain Time (US & Canada)</SelectItem>
                                        <SelectItem value="GMT-06:00">(GMT-06:00) Central Time (US & Canada)</SelectItem>
                                        <SelectItem value="GMT-05:00">(GMT-05:00) Eastern Time (US & Canada)</SelectItem>
                                        <SelectItem value="GMT+00:00">(GMT+00:00) London, Lisbon, Casablanca</SelectItem>
                                        <SelectItem value="GMT+01:00">(GMT+01:00) Paris, Berlin, Rome</SelectItem>
                                        <SelectItem value="GMT+02:00">(GMT+02:00) Athens, Cairo, Johannesburg</SelectItem>
                                        <SelectItem value="GMT+03:00">(GMT+03:00) Moscow, Riyadh, Istanbul</SelectItem>
                                        <SelectItem value="GMT+04:00">(GMT+04:00) Dubai, Baku</SelectItem>
                                        <SelectItem value="GMT+05:30">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</SelectItem>
                                        <SelectItem value="GMT+07:00">(GMT+07:00) Bangkok, Hanoi, Jakarta</SelectItem>
                                        <SelectItem value="GMT+08:00">(GMT+08:00) Beijing, Singapore, Hong Kong</SelectItem>
                                        <SelectItem value="GMT+09:00">(GMT+09:00) Tokyo, Seoul</SelectItem>
                                        <SelectItem value="GMT+10:00">(GMT+10:00) Sydney, Melbourne</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-6 mt-auto">
                            <Button onClick={handleSaveGeneral} disabled={saving} className="w-full bg-gray-900 hover:bg-black text-white font-bold h-11 rounded-xl shadow-lg shadow-gray-200 hover:shadow-xl transition-all active:scale-[0.98]">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <SaveIcon className="w-4 h-4 mr-2" />}
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                </div>

                {/* --- Security & Data --- */}
                <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-[#32dd9e] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" />

                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="p-2.5 bg-gray-50 rounded-xl text-[#32dd9e]">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Privacy & Logins</h3>
                            <p className="text-xs text-gray-500">Manage your active sessions and visibility</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-4">
                            <Link to="/terms" className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-100 transition-colors group border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 group-hover:text-gray-900 shadow-sm transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Terms & Conditions</p>
                                        <p className="text-[10px] text-gray-500">Read our usage policies</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                            </Link>

                            <Link to="/privacy" className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-100 transition-colors group border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 group-hover:text-gray-900 shadow-sm transition-colors">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Privacy Policy</p>
                                        <p className="text-[10px] text-gray-500">How we handle your data</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                                <DialogTrigger asChild>
                                    <Button
                                        disabled={saving}
                                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 h-auto py-4 flex flex-col gap-1 items-center justify-center transition-all group"
                                    >
                                        <div className="flex items-center gap-2 font-bold">
                                            <LogOut className="w-4 h-4" />
                                            Sign out all devices
                                        </div>
                                        <span className="text-[10px] opacity-70 group-hover:opacity-100 text-red-500">You will be logged out everywhere</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md bg-white">
                                    <DialogHeader>
                                        <DialogTitle className="text-red-900 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-red-500" />
                                            Confirm Global Logout
                                        </DialogTitle>
                                        <DialogDescription className="pt-2">
                                            Are you sure you want to sign out of all devices?
                                            <br /><br />
                                            <span className="font-bold text-gray-900">This will terminate all active sessions immediately.</span> You will need to log in again on this device and any others.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="gap-2 sm:justify-end">
                                        <DialogClose asChild>
                                            <Button variant="ghost">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            onClick={() => { setShowLogoutConfirm(false); handleLogOutAllDevices(); }}
                                            className="bg-red-600 hover:bg-red-700 text-white border-none shadow-md shadow-red-200"
                                        >
                                            Yes, Sign Out Everywhere
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button variant="ghost" onClick={() => setShowVisits(!showVisits)} className="w-full text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                                {showVisits ? 'Hide Login History' : 'View Login History'}
                            </Button>
                        </div>
                    </div>

                    {showVisits && (
                        <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2">
                            <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                                <History className="w-3 h-3" /> Recent Activity
                            </h4>
                            <div className="space-y-1">
                                {profile?.recentVisits?.slice(0, 3).map((visit, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs py-3 px-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{new Date(visit.timestamp).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{visit.userAgent}</span>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider",
                                            i === 0 ? "bg-[#32dd9e]/10 text-[#32dd9e]" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {i === 0 ? 'Active Now' : 'Past Session'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Danger Zone --- */}
                <div className="flex justify-center pt-8">
                    <Link to="/deactivate" className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50">
                        Close Account / Deactivate
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>

            </div>
        </div>
    );
}
