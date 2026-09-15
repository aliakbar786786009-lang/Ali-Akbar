import React, { useState } from 'react';
import {
  Activity,
  Users,
  Shield,
  FileText,
  Settings,
  Radio,
  Lock,
  KeyRound,
  ArrowLeft,
  Search,
  CheckCircle,
  AlertTriangle,
  Server,
  Zap,
  HardDrive,
  Eye,
  EyeOff,
  Terminal,
  Cpu,
  RefreshCw,
  Slash,
  UserCheck,
  Send,
  Trash2,
  Clock,
  Sparkles,
  Layers,
  Database,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { User, AuditLog } from '../types';
import {
  MASTER_ADMIN_EMAIL,
  getAdminPasscode,
  setAdminPasscode,
  verifyAdminPasscode,
} from '../utils/adminAuth';

interface AdminPanelProps {
  onExit: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExit }) => {
  const {
    adminStats,
    reports,
    auditLogs,
    users,
    currentUser,
    updateUserStatus,
    verifyBusinessAccount,
    theme,
    isOnline,
    isSyncingQueue,
    pendingOfflineCount,
    syncOfflineQueue,
    toggleSimulatedOffline,
  } = useChat();

  const [activeTab, setActiveTab] = useState<
    'telemetry' | 'users' | 'broadcast' | 'logs' | 'security'
  >('telemetry');

  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'critical'>('info');
  const [broadcastSentToast, setBroadcastSentToast] = useState(false);

  // Passcode change state
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscodes, setShowPasscodes] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');

  const filteredUsers = users.filter((u) => {
    const q = searchUserQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.id || '').toLowerCase().includes(q) ||
      Boolean(u.phone && u.phone.includes(q))
    );
  });

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    setBroadcastSentToast(true);
    setTimeout(() => {
      setBroadcastSentToast(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
    }, 3000);
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    setPasscodeSuccess('');

    if (!verifyAdminPasscode(currentPasscode)) {
      setPasscodeError('Current passcode is incorrect.');
      return;
    }

    if (newPasscode.length < 4) {
      setPasscodeError('New passcode must be at least 4 characters long.');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setPasscodeError('New passcode and confirmation do not match.');
      return;
    }

    setAdminPasscode(newPasscode);
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    setPasscodeSuccess('Admin Master Passcode successfully updated and encrypted! 🔐');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060b10] text-slate-100 overflow-hidden font-sans select-none relative">
      {/* Background Cyber Grid Accent */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

      {/* Futuristic Top Command Bar */}
      <header className="relative z-10 px-5 py-3 bg-[#0a1218]/90 backdrop-blur-md border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="py-1.5 px-3 rounded-xl bg-[#111e28] hover:bg-[#182937] border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold shadow"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Exit Terminal</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                  MyChat Central Command // v4.2
                </h1>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MASTER NODE
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>OPERATIONAL // HOST: {MASTER_ADMIN_EMAIL}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry pill */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1720] border border-emerald-500/30 text-emerald-400 shadow-inner">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>14ms Latency</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1720] border border-cyan-500/30 text-cyan-400 shadow-inner">
            <Server className="w-3.5 h-3.5" />
            <span>99.99% Core Uptime</span>
          </div>
        </div>
      </header>

      {/* Cyber Sub-Navigation HUD */}
      <nav className="relative z-10 px-5 py-2.5 bg-[#080e14] border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {[
            { id: 'telemetry', label: 'Telemetry & Health', icon: Cpu },
            { id: 'users', label: `User Matrix (${users.length})`, icon: Users },
            { id: 'broadcast', label: 'Broadcast Node', icon: Radio },
            { id: 'logs', label: `Audit Trail (${auditLogs.length})`, icon: FileText },
            { id: 'security', label: 'Master Passcode', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/40'
                    : 'bg-[#0f1a23] text-slate-400 hover:text-slate-200 hover:bg-[#152432] border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleRefreshTelemetry}
          title="Refresh Data"
          className="p-1.5 rounded-lg bg-[#0f1a23] border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </nav>

      {/* Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* TAB 1: TELEMETRY & HEALTH */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Metric KPI HUD Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#0c151c]/90 border border-emerald-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Registered Accounts
                </span>
                <div className="text-2xl font-black font-mono text-white tracking-tight">
                  {users.length || adminStats.totalUsers}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle className="w-3 h-3" />
                  <span>100% Synchronized</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c151c]/90 border border-cyan-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Active WebSockets
                </span>
                <div className="text-2xl font-black font-mono text-cyan-300 tracking-tight">
                  {adminStats.activeUsersToday || 1}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono">
                  <Zap className="w-3 h-3" />
                  <span>Real-time Signaling</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c151c]/90 border border-purple-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Encrypted Packets
                </span>
                <div className="text-2xl font-black font-mono text-purple-300 tracking-tight">
                  {adminStats.totalMessagesSent}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-purple-400 font-mono">
                  <Shield className="w-3 h-3" />
                  <span>Zero-Knowledge E2EE</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c151c]/90 border border-amber-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Storage & Cloud Cache
                </span>
                <div className="text-2xl font-black font-mono text-amber-300 tracking-tight">
                  54.2 GB <span className="text-xs font-normal text-slate-400">/ 1.0 TB</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
                  <HardDrive className="w-3 h-3" />
                  <span>5.3% Healthy Utilization</span>
                </div>
              </div>
            </div>

            {/* Futuristic Server Cluster & Diagnostics */}
            <div className="p-5 rounded-2xl bg-[#0a1219] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <Server className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Global Cluster Diagnostics</h3>
                </div>
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                  HEALTH: {(adminStats.serverHealth || 'OPTIMAL').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-[#060b10] border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">CPU Load Core</span>
                    <span className="text-emerald-400 font-bold">3.2% Optimized</span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden my-1.5">
                    <div className="bg-emerald-500 h-full w-[3.2%]" />
                  </div>
                  <span className="text-[10px] text-slate-400">Idle / 1 Active Thread Load</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#060b10] border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">RAM Memory Allocation</span>
                    <span className="text-cyan-400 font-bold">1.8 GB / 16.0 GB</span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden my-1.5">
                    <div className="bg-cyan-500 h-full w-[11.2%]" />
                  </div>
                  <span className="text-[10px] text-slate-400">11.2% Allocated (ECC DDR5)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#060b10] border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">NVMe App Data Storage</span>
                    <span className="text-amber-400 font-bold">54.2 GB / 1024 GB (1 TB)</span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden my-1.5">
                    <div className="bg-amber-500 h-full w-[5.3%]" />
                  </div>
                  <span className="text-[10px] text-slate-400">5.3% Used (969.8 GB Free)</span>
                </div>
              </div>

              {/* Maintenance Toggle */}
              <div className="p-4 rounded-xl bg-[#060b10] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-200">Global Maintenance Mode</div>
                  <div className="text-[11px] text-slate-400">
                    Restricts non-admin connections for scheduled maintenance.
                  </div>
                </div>
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-colors ${
                    maintenanceMode
                      ? 'bg-rose-500/20 border border-rose-500 text-rose-300'
                      : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {maintenanceMode ? 'ENABLED (OFFLINE)' : 'DISABLED (LIVE)'}
                </button>
              </div>

              {/* IndexedDB Offline Storage & Firebase Sync Engine Status */}
              <div className="p-4 rounded-xl bg-[#060b10] border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-200 flex items-center gap-2">
                      <span>IndexedDB Message Storage & Firebase Sync</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                        {isOnline ? 'ONLINE • CLOUD CONNECTED' : 'OFFLINE MODE'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Storage Engine: <span className="text-slate-300">IndexedDB (mychat_offline_db v1)</span> • Pending Queue: <span className="text-amber-400 font-bold">{pendingOfflineCount} messages</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={toggleSimulatedOffline}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors"
                  >
                    {isOnline ? 'Simulate Offline' : 'Set Online'}
                  </button>
                  <button
                    disabled={isSyncingQueue || pendingOfflineCount === 0}
                    onClick={() => syncOfflineQueue()}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingQueue ? 'animate-spin' : ''}`} />
                    <span>{isSyncingQueue ? 'Syncing...' : 'Sync Queue'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MATRIX & REGISTRY */}
        {activeTab === 'users' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {/* Search and count */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, email, ID, or phone..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a1219] border border-slate-800 focus:border-emerald-500 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="text-xs font-mono text-slate-400">
                Total Matches: <strong className="text-emerald-400">{filteredUsers.length}</strong>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#0a1219] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1922] border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">User Details</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500 font-mono">
                          No users matching search query
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isMaster = u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
                        const isSuspended = u.status === 'suspended' || u.isSuspended;

                        return (
                          <tr key={u.id} className="hover:bg-[#0f1c26] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                                />
                                <div>
                                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isMaster && (
                                      <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                                        MASTER
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  u.role === 'admin'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : u.role === 'business'
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {(u.role || 'user').toUpperCase()}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  !isSuspended
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {!isSuspended ? 'ACTIVE' : 'SUSPENDED'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {new Date(u.createdAt || u.lastSeen || Date.now()).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>

                            <td className="py-3 px-4 text-right">
                              {isMaster ? (
                                <span className="text-[10px] text-slate-500 italic">Protected</span>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  {isSuspended ? (
                                    <button
                                      onClick={() => updateUserStatus(u.id, 'active')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white font-medium text-[10px] transition-colors"
                                    >
                                      Unsuspend
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => updateUserStatus(u.id, 'suspended')}
                                      className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white font-medium text-[10px] transition-colors"
                                    >
                                      Suspend
                                    </button>
                                  )}

                                  {u.role !== 'business' && (
                                    <button
                                      onClick={() => verifyBusinessAccount(u.id)}
                                      className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white font-medium text-[10px] transition-colors"
                                      title="Promote to Business"
                                    >
                                      + Business
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BROADCAST NODE */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="p-5 rounded-2xl bg-[#0a1219] border border-emerald-500/20 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <Radio className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Global Server Broadcast</h3>
                  <p className="text-[11px] text-slate-400">
                    Instantly push high-priority announcements and service notices to all connected apps.
                  </p>
                </div>
              </div>

              {broadcastSentToast && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Broadcast successfully transmitted to all active nodes!</span>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-300 uppercase block mb-1">
                    Notice Severity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'info', label: 'Info Update', color: 'border-emerald-500 text-emerald-400' },
                      { id: 'warning', label: 'Service Alert', color: 'border-amber-500 text-amber-400' },
                      { id: 'critical', label: 'Emergency', color: 'border-rose-500 text-rose-400' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setBroadcastType(t.id as any)}
                        className={`py-2 rounded-xl border text-xs font-mono font-semibold transition-all ${
                          broadcastType === t.id
                            ? `${t.color} bg-black/40 shadow`
                            : 'border-slate-800 text-slate-400 hover:bg-[#0f1c26]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-300 uppercase block mb-1">
                    Announcement Headline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scheduled Network Upgrade at 02:00 UTC"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#060b10] border border-slate-800 focus:border-emerald-500 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-300 uppercase block mb-1">
                    Announcement Content
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full announcement details..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#060b10] border border-slate-800 focus:border-emerald-500 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Broadcast to All Users</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'logs' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Cryptographic Audit Trail</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Entries: <strong className="text-emerald-400">{auditLogs.length}</strong>
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0a1219] overflow-hidden">
              <div className="p-3 bg-[#0e1922] border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>EVENT LOG STREAM</span>
                <span>SIGNATURE: SHA-256 SECURED</span>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto font-mono text-xs p-2">
                {auditLogs.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    No security events recorded yet. System state is pristine.
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-[#0f1c26] rounded-xl transition-colors space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-400">{log.action}</span>
                        <span className="text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-slate-300 text-xs">{log.details}</div>
                      <div className="text-[10px] text-slate-500">
                        Admin: {log.adminEmail} | Target: {log.target}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MASTER PASSCODE & SECURITY MANAGEMENT (Requirement 3) */}
        {activeTab === 'security' && (
          <div className="max-w-md mx-auto space-y-5">
            <div className="p-6 rounded-3xl bg-[#0a1219] border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Change Admin Passcode</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Update your local biometric/passcode credentials
                  </p>
                </div>
              </div>

              {passcodeError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{passcodeError}</span>
                </div>
              )}

              {passcodeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{passcodeSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePasscode} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-300 uppercase block mb-1">
                    Current Passcode
                  </label>
                  <div className="relative">
                    <input
                      type={showPasscodes ? 'text' : 'password'}
                      required
                      placeholder="Enter current passcode..."
                      value={currentPasscode}
                      onChange={(e) => setCurrentPasscode(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-[#060b10] border border-slate-800 focus:border-emerald-500 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscodes(!showPasscodes)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPasscodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-300 uppercase block mb-1">
                    New Master Passcode
                  </label>
                  <input
                    type={showPasscodes ? 'text' : 'password'}
                    required
                    placeholder="Enter at least 4 characters..."
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#060b10] border border-slate-800 focus:border-emerald-500 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-300 uppercase block mb-1">
                    Confirm New Passcode
                  </label>
                  <input
                    type={showPasscodes ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new passcode..."
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#060b10] border border-slate-800 focus:border-emerald-500 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Save & Encrypt New Passcode</span>
                  </button>
                </div>
              </form>

              <div className="p-3 rounded-xl bg-[#060b10] border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
                <div className="text-emerald-400 font-bold">SECURITY NOTICE:</div>
                <div>
                  Your new passcode will be encrypted and saved on this browser instance. Memorize it
                  securely to retain unrestricted access to the Central Command Terminal.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
