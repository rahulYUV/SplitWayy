import { NavLink } from "react-router-dom"
import { Plus, ArrowUpRight } from "lucide-react"
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    forceExpanded?: boolean
}

export function AppSidebar({ forceExpanded, ...props }: AppSidebarProps) {
    const { getFriendBalance, expenses, groups, friends } = useExpenses()
    const { open } = useSidebar()
    const isCollapsed = forceExpanded ? false : !open

    // Deduplicate friends by name (case-insensitive)
    const friendsFromContext = friends.map(f => ({
        title: f.displayName,
        url: `/friend/${f.displayName.toLowerCase().replace(/\s+/g, '-')}`
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

    const seenNames = new Set<string>()
    const allFriends = [...friendsFromContext, ...customFriends].filter(friend => {
        const lowerName = friend.title.toLowerCase()
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

    const userName = auth.currentUser?.displayName || "User"

    return (
        <Sidebar collapsible={forceExpanded ? "none" : "icon"} {...props} className="relative bg-white border-r border-gray-100">
            <div className="h-full flex flex-col p-6 group-data-[collapsible=icon]:p-2">
                {/* Featured Action Card */}
                {!isCollapsed ? (
                    <AddExpenseModal userName={userName}>
                        <button className="w-full mb-8 group">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-xs text-gray-400 mb-0.5">Quick Action</p>
                                        <p className="font-bold text-base">Add New Expense</p>
                                    </div>
                                    <div className="bg-[#32dd9e] rounded-full p-2 group-hover:rotate-12 transition-transform">
                                        <ArrowUpRight className="w-4 h-4 text-gray-900" />
                                    </div>
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

                <SidebarContent className="flex-1 bg-transparent space-y-1">
                    {/* Main Navigation - Minimal Style */}
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild className="hover:bg-gray-50 transition-colors px-1">
                                        <NavLink to="/">
                                            {({ isActive }) => (
                                                <>
                                                    <span className="text-sm text-gray-400">/</span>
                                                    {!isCollapsed && (
                                                        <span className={cn(
                                                            "text-lg transition-colors relative",
                                                            isActive ? "font-bold text-red-500" : "font-semibold text-gray-900"
                                                        )}>
                                                            Dashboard
                                                            {isActive && (
                                                                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-500 animate-in slide-in-from-left duration-300" />
                                                            )}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild className="hover:bg-gray-50 transition-colors px-1">
                                        <NavLink to="/activity">
                                            {({ isActive }) => (
                                                <>
                                                    <span className="text-sm text-gray-400">/</span>
                                                    {!isCollapsed && (
                                                        <span className={cn(
                                                            "text-lg transition-colors relative",
                                                            isActive ? "font-bold text-red-500" : "font-semibold text-gray-900"
                                                        )}>
                                                            Activity
                                                            {isActive && (
                                                                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-500 animate-in slide-in-from-left duration-300" />
                                                            )}
                                                        </span>
                                                    )}
                                                </>
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
                            <div className="flex items-center justify-between px-1 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">/</span>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-gray-900">Groups</h3>
                                </div>
                                <CreateGroupModal>
                                    <button className="p-1.5 hover:bg-[#32dd9e]/10 rounded-lg transition-all hover:scale-110">
                                        <Plus className="w-4 h-4 text-gray-900 hover:text-[#32dd9e]" />
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
                                sidebarGroups.map((group) => (
                                    <SidebarMenuItem key={group.url}>
                                        <SidebarMenuButton asChild className="hover:bg-gray-50 transition-colors px-1">
                                            <NavLink to={group.url}>
                                                {({ isActive }) => (
                                                    <>
                                                        <span className="text-sm text-gray-400">/</span>
                                                        {!isCollapsed && (
                                                            <span className={cn(
                                                                "text-base transition-colors relative",
                                                                isActive ? "font-bold text-red-500" : "font-medium text-gray-900"
                                                            )}>
                                                                {group.title}
                                                                {isActive && (
                                                                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-500 animate-in slide-in-from-left duration-300" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            ) : !isCollapsed ? (
                                <p className="text-xs text-gray-400 px-1 py-2">No groups yet</p>
                            ) : null}
                        </SidebarMenu>
                    </div>

                    {/* Friends Section - Minimal */}
                    <div className="pt-6">
                        {!isCollapsed && (
                            <div className="flex items-center gap-2 px-1 mb-3">
                                <span className="text-sm text-gray-400">/</span>
                                <h3 className="text-base font-bold uppercase tracking-wider text-gray-900">Friends</h3>
                            </div>
                        )}
                        <SidebarMenu className="space-y-0.5">
                            {allFriends.slice(0, 6).map((friend) => {
                                const balance = getFriendBalance(friend.title)
                                return (
                                    <SidebarMenuItem key={friend.url}>
                                        <SidebarMenuButton asChild className="hover:bg-gray-50 transition-colors px-1">
                                            <NavLink to={friend.url}>
                                                {({ isActive }) => (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-400">/</span>
                                                            {!isCollapsed && (
                                                                <span className={cn(
                                                                    "text-base transition-colors relative",
                                                                    isActive ? "font-bold text-red-500" : "font-medium text-gray-900"
                                                                )}>
                                                                    {friend.title}
                                                                    {isActive && (
                                                                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-500 animate-in slide-in-from-left duration-300" />
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {balance !== 0 && !isCollapsed && (
                                                            <span className={cn(
                                                                "text-sm font-bold flex items-center gap-0.5 ml-auto",
                                                                balance > 0 ? 'text-[#32dd9e]' : 'text-red-400'
                                                            )}>
                                                                <CurrencyRupeeIcon size={9} />
                                                                {Math.abs(balance).toFixed(0)}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                            {allFriends.length === 0 && !isCollapsed && (
                                <p className="text-xs text-gray-400 px-1 py-2">No friends yet</p>
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
                                    src={auth.currentUser?.photoURL || undefined}
                                    alt={auth.currentUser?.displayName || "User"}
                                />
                                <AvatarFallback className="bg-gray-900 text-white text-xs font-bold">
                                    {auth.currentUser?.displayName?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                {!isCollapsed && (
                                    <>
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {auth.currentUser?.displayName || "User"}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {auth.currentUser?.email}
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
