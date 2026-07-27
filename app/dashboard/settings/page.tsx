"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  User, Mail, Lock, Bell, Shield, Palette, Globe,
  CreditCard, LogOut, Camera, Check, ChevronRight, Loader2, Eye, EyeOff,
} from "lucide-react"

const settingsSections = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security",      label: "Security",      icon: Shield },
  { id: "appearance",    label: "Appearance",    icon: Palette },
  { id: "billing",       label: "Billing",       icon: CreditCard },
]

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState("profile")

  // ── Profile state ──
  const [profileData, setProfileData] = useState({
    firstName: "", lastName: "", email: "", phone: "", institute: "", role: "",
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // ── Password state ──
  const [pwData, setPwData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // ── Notifications state ──
  const [notifications, setNotifications] = useState({
    email: true, push: true, sms: false,
    weeklyReport: true, newCourses: true, batchUpdates: true,
  })

  // ── Theme state ──
  const [theme, setTheme] = useState("Light")

  // Populate profile from real user
  useEffect(() => {
    if (!user) return
    const [firstName, ...rest] = user.name.split(" ")
    setProfileData((prev) => ({
      ...prev,
      firstName,
      lastName: rest.join(" "),
      email: user.email,
      role: user.role,
      phone: (user as any).phone || "",
      institute: (user as any).institute || "",
    }))
  }, [user])

  async function handleSaveProfile() {
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      const name = `${profileData.firstName} ${profileData.lastName}`.trim()
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: profileData.phone, institute: profileData.institute }),
      })
      const data = await res.json()
      if (!res.ok) {
        setProfileMsg({ type: "error", text: data.error || "Failed to save." })
      } else {
        setProfileMsg({ type: "success", text: "Profile updated successfully!" })
      }
    } catch {
      setProfileMsg({ type: "error", text: "Network error. Please try again." })
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleChangePassword() {
    setPwMsg(null)
    if (!pwData.currentPassword || !pwData.newPassword || !pwData.confirmPassword) {
      setPwMsg({ type: "error", text: "All password fields are required." })
      return
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match." })
      return
    }
    if (pwData.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters." })
      return
    }
    setPwSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPwMsg({ type: "error", text: data.error || "Failed to change password." })
      } else {
        setPwMsg({ type: "success", text: "Password changed successfully!" })
        setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      }
    } catch {
      setPwMsg({ type: "error", text: "Network error. Please try again." })
    } finally {
      setPwSaving(false)
    }
  }

  const initials = user
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <section.icon className="h-5 w-5" />
                {section.label}
                <ChevronRight className="h-4 w-4 ml-auto" />
              </button>
            ))}
            <hr className="my-2 border-border" />
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">

          {/* ── PROFILE ── */}
          {activeSection === "profile" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{initials}</span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                  <div className="text-xs text-primary mt-0.5 font-medium">{user?.role}</div>
                </div>
              </div>

              {/* Form */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={profileData.email} disabled className="bg-muted pl-9" />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    placeholder="+91 98765 43210"
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="institute">Institute / Organisation</Label>
                  <Input
                    id="institute"
                    value={profileData.institute}
                    placeholder="e.g. CA Institute Mumbai"
                    onChange={(e) => setProfileData({ ...profileData, institute: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={profileData.role} disabled className="bg-muted" />
                </div>
              </div>

              {profileMsg && (
                <div className={`text-sm px-4 py-3 rounded-lg ${
                  profileMsg.type === "success"
                    ? "bg-accent/10 text-accent"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {profileMsg.text}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!user) return
                    const [firstName, ...rest] = user.name.split(" ")
                    setProfileData((prev) => ({
                      ...prev, firstName, lastName: rest.join(" "),
                      email: user.email, role: user.role,
                    }))
                    setProfileMsg(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                >
                  {profileSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === "notifications" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
                <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
              </div>

              {[
                { heading: "Channels", items: [
                  { key: "email",   label: "Email Notifications",  desc: "Receive updates via email" },
                  { key: "push",    label: "Push Notifications",   desc: "Browser push notifications" },
                  { key: "sms",     label: "SMS Notifications",    desc: "Text message alerts" },
                ]},
                { heading: "Updates", items: [
                  { key: "weeklyReport", label: "Weekly Progress Report", desc: "Summary of your weekly activity" },
                  { key: "newCourses",   label: "New Courses",            desc: "Get notified about new courses" },
                  { key: "batchUpdates", label: "Batch Updates",          desc: "Updates from your batch and trainer" },
                ]},
              ].map(({ heading, items }) => (
                <div key={heading} className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
                  {items.map((item) => {
                    const on = notifications[item.key as keyof typeof notifications]
                    return (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div>
                          <div className="text-sm font-medium text-foreground">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                        <button
                          onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                          className={`relative w-12 h-6 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all ${on ? "left-6" : "left-0.5"}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeSection === "security" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPw">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPw"
                      type={showCurrent ? "text" : "password"}
                      value={pwData.currentPassword}
                      placeholder="Enter current password"
                      onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPw">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPw"
                      type={showNew ? "text" : "password"}
                      value={pwData.newPassword}
                      placeholder="Min 6 characters"
                      onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPw">Confirm New Password</Label>
                  <Input
                    id="confirmPw"
                    type="password"
                    value={pwData.confirmPassword}
                    placeholder="Repeat new password"
                    onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
                  />
                </div>

                {pwMsg && (
                  <div className={`text-sm px-4 py-3 rounded-lg ${
                    pwMsg.type === "success" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                  }`}>
                    {pwMsg.text}
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleChangePassword}
                  disabled={pwSaving}
                >
                  {pwSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Changing...</> : <><Lock className="mr-2 h-4 w-4" />Change Password</>}
                </Button>
              </div>

              <hr className="border-border" />

              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Two-Factor Authentication</div>
                      <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="p-4 rounded-lg border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Active Sessions</div>
                      <div className="text-xs text-muted-foreground">Manage logged-in devices</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeSection === "appearance" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                <p className="text-sm text-muted-foreground">Customize how the app looks</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  {["Light", "Dark", "System"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        theme === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`w-full h-20 rounded-md mb-3 ${
                        t === "Light" ? "bg-white border border-border" :
                        t === "Dark" ? "bg-slate-900" : "bg-gradient-to-br from-white to-slate-900"
                      }`} />
                      <div className="flex items-center justify-center gap-2">
                        {theme === t && <Check className="h-4 w-4 text-primary" />}
                        <span className="text-sm font-medium text-foreground">{t}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BILLING ── */}
          {activeSection === "billing" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Billing & Subscription</h2>
                <p className="text-sm text-muted-foreground">Manage your subscription and payments</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Current Plan</div>
                    <div className="text-xl font-bold text-foreground">Professional</div>
                    <div className="text-sm text-muted-foreground">Billed annually</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                    <div className="text-xs text-muted-foreground">Renews Apr 15, 2025</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {["Upgrade Plan", "Payment Methods", "Billing History"].map((label) => (
                  <Button key={label} variant="outline" className="w-full justify-between">
                    {label} <ChevronRight className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  )
}
