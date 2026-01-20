import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { Plus, ArrowUpRight, ChevronDown, ChevronUp, LayoutDashboard, Activity, Users, Layers } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useExpenses } from "@/context/ExpenseContext"
import { CreateGroupModal } from "@/components/CreateGroupModal"
import { AddExpenseModal } from "@/components/AddExpenseModal"
import CurrencyRupeeIcon from "@/components/ui/icons/currency-rupee-icon"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CanvasCursor from "@/components/ui/CanvasCursor"

import { User } from "firebase/auth";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    forceExpanded?: boolean
    user?: User | null
}

export function AppSidebar({ forceExpanded, user, ...props }: AppSidebarProps) {
    const { getFriendBalance, expenses, groups, friends } = useExpenses()
    const { open } = useSidebar()
    const isCollapsed = forceExpanded ? false : !open
    const [showAllGroups, setShowAllGroups] = useState(false)
    const [showAllFriends, setShowAllFriends] = useState(false)

    const currentUser = user || auth.currentUser
    const [firestorePhotoURL, setFirestorePhotoURL] = useState<string | null>(null)
    const userName = currentUser?.displayName || "User"
    const userEmail = currentUser?.email?.toLowerCase()

    useEffect(() => {
        if (currentUser?.uid) {
            import("@/services/userService").then(({ getUserProfile }) => {
                getUserProfile(currentUser.uid).then(profile => {
                    if (profile?.photoURL) {
                        setFirestorePhotoURL(profile.photoURL)
                    }
                })
            })
        }
    }, [currentUser?.uid])

    // Deduplicate friends by name (case-insensitive)
    const friendsFromContext = friends.map(f => ({
        title: f.displayName || "Friend",
        url: `/friend/${(f.displayName || "friend").toLowerCase().replace(/\s+/g, '-')}`
    }))

    const namesInExpenses = Array.from(new Set(
        expenses.flatMap(e => e.participants).map(name => name.trim())
    ))

    const customFriends = namesInExpenses
        .filter(name => {
            const lowerName = name.toLowerCase()
            return !friendsFromContext.find(f => f.title.toLowerCase() === lowerName)
        })
        .map(name => ({
            title: name,
            url: `/friend/${name.toLowerCase().replace(/\s+/g, '-')}`
        }))

    const normalize = (str: string) => {
        return str
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "") // Remove all non-alphanumeric characters including spaces
    }

    const normUserName = normalize(userName)

    // Also normalize parts of the name for fallback checks
    const userNameParts = userName.toLowerCase().trim().split(/\s+/)
    const userFirstName = normalize(userNameParts[0])

    const seenNames = new Set<string>()
    const allFriends = [...friendsFromContext, ...customFriends].filter(friend => {
        const lowerName = friend.title.toLowerCase().trim()
        const normFriendName = normalize(friend.title)

        // Robust filtering of current user
        if (normFriendName === "you") return false
        if (normFriendName === normUserName) return false

        // Check if the friend name is just the first name of the user (e.g. "Rahul" vs "Rahul Kumar")
        if (normFriendName === userFirstName && userNameParts.length > 1) return false

        // Check if the friend name contains the user name or vice versa (be careful with short names)
        // If user is "Rahul Kumar" and friend is "Rahul Kumar Singh", maybe same person? 
        // For now, let's stick to the containment if names are long enough to avoid false positives (like "Al" vs "Alex")
        if (normFriendName.length > 3 && normUserName.length > 3) {
            if (normFriendName.includes(normUserName) || normUserName.includes(normFriendName)) {
                // Double check: if explicit email mismatch, don't filter. But here we don't have friend email easily for custom friends.
                // Let's assume name collision + containment = same person in the context of "my friends list"
                return false
            }
        }

        // Exact email match check if friend title looks like an email
        if (userEmail && lowerName === userEmail) return false

        if (seenNames.has(lowerName)) {
            return false
        }
        seenNames.add(lowerName)
        return true
    })

    const sidebarGroups = groups.map(g => ({
        title: g.name,
        url: `/group/${g.id}`
    }))

    // Count recent expenses (last 7 days)
    const recentCount = expenses.filter(e => {
        const expenseDate = e.date instanceof Date ? e.date : new Date(e.date)
        const daysDiff = (Date.now() - expenseDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 7
    }).length

    return (
        <Sidebar
            id="sidebar-container"
            collapsible={forceExpanded ? "none" : "icon"}
            {...props}
            className="relative bg-white border-r border-gray-100"
        >
            <CanvasCursor containerId="sidebar-container" />
            <div className="h-full flex flex-col p-6 group-data-[collapsible=icon]:p-2">
                {!isCollapsed ? (
                    <AddExpenseModal userName={userName}>
                        <button className="w-full mb-8 group outline-none">
                            <div className="relative flex items-center justify-between w-full p-1.5 bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 active:translate-y-0">
                                <div className="flex flex-col items-start pl-3.5 py-2.5">
                                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-0.5 group-hover:text-gray-600 transition-colors">Quick Add</span>
                                    <span className="text-sm font-black text-gray-900 tracking-wide">Expense</span>
                                </div>
                                <div className="flex items-center justify-center w-10 h-10 bg-white border border-gray-100 rounded-xl text-gray-900 transition-all duration-300 group-hover:scale-105 group-hover:rotate-90 shadow-sm">
                                    <Plus className="w-5 h-5" strokeWidth={3} />
                                </div>
                            </div>
                        </button>
                    </AddExpenseModal>
                ) : (
                    <AddExpenseModal userName={userName}>
                        <button className="w-full mb-4 p-2.5 bg-gray-900 hover:bg-gray-800 rounded-xl transition-all hover:scale-105">
                            <Plus className="w-4 h-4 text-white mx-auto" />
                        </button>
                    </AddExpenseModal>
                )}

                {/* Recent Activity Badge */}
                {recentCount > 0 && !isCollapsed && (
                    <div className="flex items-center gap-2 mb-6 px-1">
                        <div className="flex items-center gap-1">
                            <div className="flex gap-0.5">
                                <div className="h-5 w-0.5 bg-[#32dd9e]/60" />
                                <div className="h-5 w-0.5 bg-[#32dd9e]/80" />
                                <div className="h-5 w-0.5 bg-[#32dd9e]" />
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                            <span className="font-bold text-gray-900">{recentCount}</span> expenses this week
                        </span>
                    </div>
                )}

                <SidebarContent className="flex-1 bg-transparent space-y-1 custom-scrollbar">
                    {/* Main Navigation - Minimal Style */}
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild className="group/menu-btn hover:bg-transparent transition-colors px-0 py-1">
                                        <NavLink to="/" className="w-full">
                                            {({ isActive }) => (
                                                <div className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group-hover/menu-btn:bg-gray-50",
                                                    isActive ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"
                                                )}>
                                                    <div className={cn(
                                                        "p-1.5 rounded-lg transition-colors",
                                                        isActive ? "bg-white text-[#32dd9e] shadow-sm" : "bg-gray-100 text-gray-500 group-hover/menu-btn:bg-white group-hover/menu-btn:text-gray-700"
                                                    )}>
                                                        <LayoutDashboard className="w-4 h-4" />
                                                    </div>
                                                    {!isCollapsed && (
                                                        <span className={cn(
                                                            "text-sm font-medium transition-colors",
                                                            isActive ? "text-gray-900" : "text-gray-600 group-hover/menu-btn:text-gray-900"
                                                        )}>
                                                            Dashboard
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild className="group/menu-btn hover:bg-transparent transition-colors px-0 py-1">
                                        <NavLink to="/activity" className="w-full">
                                            {({ isActive }) => (
                                                <div className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group-hover/menu-btn:bg-gray-50",
                                                    isActive ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"
                                                )}>
                                                    <div className={cn(
                                                        "p-1.5 rounded-lg transition-colors",
                                                        isActive ? "bg-white text-[#32dd9e] shadow-sm" : "bg-gray-100 text-gray-500 group-hover/menu-btn:bg-white group-hover/menu-btn:text-gray-700"
                                                    )}>
                                                        <Activity className="w-4 h-4" />
                                                    </div>
                                                    {!isCollapsed && (
                                                        <span className={cn(
                                                            "text-sm font-medium transition-colors",
                                                            isActive ? "text-gray-900" : "text-gray-600 group-hover/menu-btn:text-gray-900"
                                                        )}>
                                                            Activity
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Groups Section - Minimal */}
                    <div className="pt-6">
                        {!isCollapsed && (
                            <div className="flex items-center justify-between px-3 mb-2">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Layers className="w-3.5 h-3.5" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider">Groups</h3>
                                </div>
                                <CreateGroupModal>
                                    <button className="p-1 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-[#32dd9e]">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </CreateGroupModal>
                            </div>
                        )}
                        {isCollapsed && (
                            <CreateGroupModal>
                                <button className="w-full p-2 hover:bg-gray-100 rounded-lg transition-all mb-2">
                                    <Plus className="w-4 h-4 text-gray-900 mx-auto" />
                                </button>
                            </CreateGroupModal>
                        )}
                        <SidebarMenu className="space-y-0.5">
                            {sidebarGroups.length > 0 ? (
                                <>
                                    {(showAllGroups ? sidebarGroups : sidebarGroups.slice(0, 3)).map((group) => (
                                        <SidebarMenuItem key={group.url}>
                                            <SidebarMenuButton asChild className="group/item hover:bg-transparent transition-colors px-0 py-0.5">
                                                <NavLink to={group.url} className="w-full">
                                                    {({ isActive }) => (
                                                        <div className={cn(
                                                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                                                            isActive ? "bg-gray-50 text-gray-900" : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-700"
                                                        )}>
                                                            <div className={cn(
                                                                "w-1.5 h-1.5 rounded-full transition-colors",
                                                                isActive ? "bg-[#32dd9e]" : "bg-gray-300 group-hover/item:bg-gray-400"
                                                            )} />
                                                            {!isCollapsed && (
                                                                <span className={cn(
                                                                    "text-sm font-medium truncate",
                                                                    isActive && "font-semibold"
                                                                )}>
                                                                    {group.title}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </NavLink>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                    {!isCollapsed && sidebarGroups.length > 3 && (
                                        <button
                                            onClick={() => setShowAllGroups(!showAllGroups)}
                                            className="w-full flex items-center gap-2 px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors"
                                        >
                                            {showAllGroups ? (
                                                <>
                                                    <ChevronUp className="w-3 h-3" />
                                                    Show Less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-3 h-3" />
                                                    Show {sidebarGroups.length - 3} More
                                                </>
                                            )}
                                        </button>
                                    )}
                                </>
                            ) : !isCollapsed ? (
                                <div className="mx-2 px-3 py-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <p className="text-[10px] text-gray-400 font-medium">No groups yet</p>
                                </div>
                            ) : null}
                        </SidebarMenu>
                    </div>

                    {/* Friends Section - Minimal */}
                    <div className="pt-6">
                        {!isCollapsed && (
                            <div className="flex items-center justify-between px-3 mb-2">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Users className="w-3.5 h-3.5" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider">Friends</h3>
                                </div>
                            </div>
                        )}
                        <SidebarMenu className="space-y-0.5">
                            {(showAllFriends ? allFriends : allFriends.slice(0, 4)).map((friend) => {
                                const balance = getFriendBalance(friend.title)
                                return (
                                    <SidebarMenuItem key={friend.url}>
                                        <SidebarMenuButton asChild className="group/item hover:bg-transparent transition-colors px-0 py-0.5">
                                            <NavLink to={friend.url} className="w-full">
                                                {({ isActive }) => (
                                                    <div className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                                                        isActive ? "bg-gray-50 text-gray-900" : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-700"
                                                    )}>
                                                        <div className={cn(
                                                            "flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 group-hover/item:bg-white group-hover/item:shadow-sm transition-all",
                                                            isActive && "bg-[#32dd9e]/10 text-[#32dd9e]"
                                                        )}>
                                                            {friend.title.charAt(0).toUpperCase()}
                                                        </div>
                                                        {!isCollapsed && (
                                                            <div className="flex flex-1 items-center justify-between min-w-0">
                                                                <span className={cn(
                                                                    "text-sm font-medium truncate pr-2",
                                                                    isActive && "font-semibold"
                                                                )}>
                                                                    {friend.title}
                                                                </span>
                                                                {balance !== 0 && (
                                                                    <span className={cn(
                                                                        "text-xs font-bold flex items-center shrink-0",
                                                                        balance > 0 ? 'text-[#32dd9e]' : 'text-red-400'
                                                                    )}>
                                                                        <CurrencyRupeeIcon size={10} className="mr-px" />
                                                                        {Math.abs(balance).toFixed(0)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                            {!isCollapsed && allFriends.length > 4 && (
                                <button
                                    onClick={() => setShowAllFriends(!showAllFriends)}
                                    className="w-full flex items-center gap-2 px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    {showAllFriends ? (
                                        <>
                                            <ChevronUp className="w-3 h-3" />
                                            Show Less
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-3 h-3" />
                                            Show {allFriends.length - 4} More
                                        </>
                                    )}
                                </button>
                            )}
                            {allFriends.length === 0 && !isCollapsed && (
                                <div className="mx-2 px-3 py-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <p className="text-[10px] text-gray-400 font-medium">No friends yet</p>
                                </div>
                            )}
                        </SidebarMenu>
                    </div>
                </SidebarContent>

                {/* Bottom Info Section */}
                <SidebarFooter className="mt-auto pt-6 border-t border-gray-100">
                    {/* User Profile - Minimal */}
                    <NavLink to="/account" className="group">
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all">
                            <Avatar className="w-9 h-9">
                                <AvatarImage
                                    src={firestorePhotoURL || currentUser?.photoURL || undefined}
                                    alt={currentUser?.displayName || "User"}
                                />
                                <AvatarFallback className="bg-gray-900 text-white text-xs font-bold">
                                    {currentUser?.displayName?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                {!isCollapsed && (
                                    <>
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {currentUser?.displayName || "User"}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {currentUser?.email}
                                        </p>
                                    </>
                                )}
                            </div>
                            {!isCollapsed && <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </div>
                    </NavLink>

                    {/* App Info */}
                    {!isCollapsed && (
                        <div className="mt-4 px-2">
                            <p className="text-[10px] text-gray-400 mb-1">© 2025 SplitWayy</p>
                            <p className="text-[10px] text-gray-400">Split expenses, stay organized</p>
                        </div>
                    )}
                </SidebarFooter>
            </div>
        </Sidebar>
    )
}
