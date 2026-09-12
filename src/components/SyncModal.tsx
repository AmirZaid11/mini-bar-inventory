import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Cloud, 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileJson,
  Key
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const db = useStore((state) => state.db);
  const setFirebaseConfig = useStore((state) => state.setFirebaseConfig);
  const refreshDb = useStore((state) => state.refreshDb);
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'backup' | 'cloud'>('backup');
  const [isSyncingToCloud, setIsSyncingToCloud] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Custom Firebase Config form
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [pastedConfig, setPastedConfig] = useState('');
  const [isConnectingCloud, setIsConnectingCloud] = useState(false);

  if (!isOpen) return null;

  const isCloud = !db.isDemo;
  const localStats = db.getLocalStats();

  // 1. Download Backup JSON
  const handleExportBackup = () => {
    try {
      const json = db.exportBackupData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `amir_inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Backup downloaded! Contains ${localStats.itemCount} items (${localStats.totalUnits} stock units).`);
    } catch (err: any) {
      toast.error('Failed to export backup: ' + (err.message || 'Unknown error'));
    }
  };

  // 2. Restore Backup from JSON File
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    try {
      const text = await file.text();
      const result = await db.importBackupData(text);
      
      // Invalidate queries to refresh dashboard and inventory
      await queryClient.invalidateQueries({ queryKey: ['items'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions-all'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions-full'] });

      toast.success(`Successfully restored ${result.itemsCount} items (${result.totalUnits} total stock units)!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore backup file.');
    } finally {
      setIsRestoring(false);
    }
  };

  // 3. Push Local Stock to Firebase Cloud
  const handlePushToCloud = async () => {
    if (!isCloud) {
      toast.error('Firebase is not connected yet. Please connect Firebase first.');
      return;
    }

    setIsSyncingToCloud(true);
    try {
      const result = await db.uploadLocalToFirestore();
      await queryClient.invalidateQueries({ queryKey: ['items'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions-all'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions-full'] });

      toast.success(`Cloud sync complete! Pushed ${result.itemsMigrated} items (${result.totalUnits} units) to Firestore.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload stock to Firestore.');
    } finally {
      setIsSyncingToCloud(false);
    }
  };

  // 4. Save Custom Firebase Config
  const handleConnectFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedConfig.trim()) {
      toast.error('Please paste your Firebase configuration JSON or object.');
      return;
    }

    setIsConnectingCloud(true);
    try {
      let configObj: any;
      try {
        configObj = JSON.parse(pastedConfig);
      } catch {
        // Try loose JS object parser if user pasted const firebaseConfig = {...}
        const cleaned = pastedConfig
          .replace(/const\s+\w+\s*=\s*/, '')
          .replace(/;\s*$/, '')
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          .replace(/'/g, '"');
        configObj = JSON.parse(cleaned);
      }

      if (!configObj.projectId || !configObj.apiKey) {
        throw new Error('Config is missing projectId or apiKey.');
      }

      setFirebaseConfig(configObj);
      refreshDb();
      queryClient.invalidateQueries();

      toast.success('Successfully connected to Firebase Firestore!');
      setShowConfigForm(false);
      setPastedConfig('');
    } catch (err: any) {
      toast.error('Invalid Firebase configuration: ' + (err.message || 'Check JSON format'));
    } finally {
      setIsConnectingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141210] border border-[#2e2a26] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-[#282421] flex items-center justify-between bg-[#191715]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c06c3c]/10 border border-[#c06c3c]/30 flex items-center justify-center text-[#c06c3c]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#faf8f5]">Database & Cross-Device Sync</h2>
              <p className="text-xs text-zinc-400 font-mono">Transfer stock between devices or sync to cloud</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATUS BANNER */}
        <div className="px-6 py-4 bg-[#181614] border-b border-[#24201d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono uppercase text-zinc-500">Current Mode:</span>
            {isCloud ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Cloud className="w-3.5 h-3.5" />
                <span>Cloud Connected (Firestore)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Local Device Memory (Offline)</span>
              </span>
            )}
          </div>
          <div className="text-xs font-mono text-zinc-400">
            Detected: <span className="text-[#faf8f5] font-bold">{localStats.totalUnits} stock units</span> ({localStats.itemCount} items)
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#282421] px-6 bg-[#161412]">
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'backup' 
                ? 'border-[#c06c3c] text-[#c06c3c]' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>Instant File Transfer (No Setup)</span>
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cloud' 
                ? 'border-[#c06c3c] text-[#c06c3c]' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cloud Database (Firebase)</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* TAB 1: FILE BACKUP / TRANSFER */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#1e1a17] border border-[#332c26] space-y-2">
                <h3 className="font-bold text-[#faf8f5] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>How to transfer your {localStats.totalUnits} units right now:</span>
                </h3>
                <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside leading-relaxed font-sans">
                  <li>Click <strong className="text-zinc-200">Download Complete Backup</strong> on this device (downloads your {localStats.totalUnits} units).</li>
                  <li>Open the website on your other device, phone, or incognito window.</li>
                  <li>Open this same window and click <strong className="text-zinc-200">Restore from File</strong> to instantly import all {localStats.totalUnits} units!</li>
                </ol>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* EXPORT */}
                <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b2724] space-y-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#c06c3c] font-bold">
                      <Download className="w-4 h-4" />
                      <span>Export Current Stock</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Exports all {localStats.itemCount} items, active stock counts ({localStats.totalUnits} units), and transaction history.
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Backup (.json)</span>
                  </button>
                </div>

                {/* IMPORT */}
                <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b2724] space-y-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Upload className="w-4 h-4" />
                      <span>Restore from Backup</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Select a downloaded backup file to load all items, stock levels, and logs onto this device.
                    </p>
                  </div>
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept=".json" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isRestoring}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-zinc-700 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isRestoring ? 'Restoring Data...' : 'Restore from File (.json)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLOUD DATABASE (FIREBASE) */}
          {activeTab === 'cloud' && (
            <div className="space-y-6">
              {isCloud ? (
                /* CLOUD IS CONNECTED */
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-4">
                  <div className="flex items-start gap-3">
                    <Cloud className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-emerald-300">Firebase Firestore is Active & Connected!</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Your app is connected to the cloud. You can push your existing local {localStats.totalUnits} stock units directly to Firestore so all other devices see them instantly.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handlePushToCloud}
                    disabled={isSyncingToCloud}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncingToCloud ? 'animate-spin' : ''}`} />
                    <span>{isSyncingToCloud ? 'Uploading to Cloud...' : `Push Local Stock (${localStats.totalUnits} units) to Cloud`}</span>
                  </button>
                </div>
              ) : (
                /* CLOUD NOT CONNECTED */
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide font-mono">Cloud Database Not Active in Netlify</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        To enable real-time cloud sync across all phones and laptops automatically without transferring files, add your Firebase keys to Netlify, or connect them directly below.
                      </p>
                    </div>
                  </div>

                  {/* NETLIFY GUIDE */}
                  <div className="p-4 rounded-2xl bg-[#191715] border border-[#2b2724] space-y-2">
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-wide font-mono">Option A: Netlify Environment Variables</p>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      Add <code className="text-[#c06c3c] bg-black/40 px-1 py-0.5 rounded">FIREBASE_PROJECT_ID</code>, <code className="text-[#c06c3c] bg-black/40 px-1 py-0.5 rounded">FIREBASE_API_KEY</code>, etc. into your Netlify Site Configuration → Environment Variables, then redeploy.
                    </p>
                  </div>

                  {/* DIRECT IN-APP CONFIG */}
                  <div className="p-4 rounded-2xl bg-[#191715] border border-[#2b2724] space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-300 uppercase tracking-wide font-mono">Option B: Connect Firebase Directly Here</p>
                      <button
                        onClick={() => setShowConfigForm(!showConfigForm)}
                        className="text-xs text-[#c06c3c] hover:underline font-bold cursor-pointer"
                      >
                        {showConfigForm ? 'Hide Form' : 'Paste Config'}
                      </button>
                    </div>

                    {showConfigForm && (
                      <form onSubmit={handleConnectFirebase} className="space-y-3 pt-2">
                        <textarea
                          rows={4}
                          value={pastedConfig}
                          onChange={(e) => setPastedConfig(e.target.value)}
                          placeholder={`Paste Firebase config JSON, e.g.:\n{\n  "apiKey": "AIzaSy...",\n  "projectId": "your-project-id",\n  "authDomain": "your-project.firebaseapp.com"\n}`}
                          className="w-full bg-[#111] border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c06c3c]"
                        />
                        <button
                          type="submit"
                          disabled={isConnectingCloud}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#c06c3c] hover:bg-[#a6562a] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
                        >
                          <Key className="w-4 h-4" />
                          <span>{isConnectingCloud ? 'Connecting...' : 'Connect Cloud Database'}</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-[#181614] border-t border-[#24201d] flex items-center justify-between">
          <p className="text-[11px] text-zinc-500 font-mono">
            {localStats.itemCount} items • {localStats.totalUnits} stock units in local storage
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
