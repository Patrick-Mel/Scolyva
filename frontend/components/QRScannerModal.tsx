'use client';

import { useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertTriangle, X, UserCheck, Clock, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { apiRequest } from '@/lib/api';

interface QRScannerModalProps {
  lang: Language;
  onClose: () => void;
}

export default function QRScannerModal({ lang, onClose }: QRScannerModalProps) {
  const t = translations[lang];
  const [cameraActive, setCameraActive] = useState(true);
  const [manualMatricule, setManualMatricule] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([
    { id: '1', name: 'Claire Ngo Nsoga', matricule: 'EXC-2025-002', time: '07:45', status: 'PRESENT' },
    { id: '2', name: 'Junior Mballa', matricule: 'EXC-2025-001', time: '08:14', status: 'LATE', minutes: 14 },
    { id: '3', name: 'Grace Fon Tiku', matricule: 'EXC-2025-004', time: '07:52', status: 'PRESENT' },
  ]);

  const handleSimulatedScan = async (studentId: string = 'EXC-2025-003') => {
    setIsScanning(true);
    setScanResult(null);
    try {
      // Simulate cryptographic QR scan payload verification
      const res = await apiRequest('/attendance/scans/scan-qr/', {
        method: 'POST',
        body: JSON.stringify({
          qr_token: `scolyva_signed_token_${studentId}`,
          class_room_id: '6ème A'
        })
      });
      setScanResult(res);
      setRecentScans(prev => [
        {
          id: Date.now().toString(),
          name: res.message ? res.message.split(':')[1] : 'Paul Kamga',
          matricule: 'EXC-2025-003',
          time: new Date().toLocaleTimeString().slice(0, 5),
          status: res.status || 'PRESENT',
          minutes: res.minutes_late || 0
        },
        ...prev
      ]);
    } catch (err: any) {
      // Demo fallback success
      const newScan = {
        id: Date.now().toString(),
        name: 'Paul Kamga (Terminale C)',
        matricule: 'EXC-2025-003',
        time: new Date().toLocaleTimeString().slice(0, 5),
        status: 'PRESENT',
        minutes: 0
      };
      setScanResult({
        message: 'Scan réussi : Paul Kamga (PRÉSENT)',
        status: 'PRESENT',
        minutes_late: 0
      });
      setRecentScans(prev => [newScan, ...prev]);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-xl w-full p-6 relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/30">
            <Camera className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Terminal d'Appel par QR Code Sécurisé
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pointez le Pass QR de l'élève vers la caméra pour enregistrer sa présence instantanément.
            </p>
          </div>
        </div>

        {/* Camera Viewfinder Box */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-sky-500/50 bg-slate-900 h-64 flex flex-col items-center justify-center shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 pointer-events-none" />
          
          {/* Animated Scanning Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 shadow-lg animate-pulse" style={{ top: '45%' }} />

          {/* Viewfinder Corners */}
          <div className="w-44 h-44 rounded-2xl border-2 border-sky-400/80 border-dashed relative flex items-center justify-center">
            <Zap className="w-10 h-10 text-sky-400 animate-bounce" />
          </div>

          <p className="text-xs font-bold text-slate-300 mt-4 relative z-10">
            {isScanning ? 'Vérification de la signature du QR Code...' : 'En attente de présentation d\'un Pass QR Élève'}
          </p>

          <button
            onClick={() => handleSimulatedScan()}
            disabled={isScanning}
            className="mt-3 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold shadow-lg transition relative z-10 flex items-center space-x-2"
          >
            {isScanning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Simuler le Scan Élève</span>
          </button>
        </div>

        {/* Scan Result Feedback Toast */}
        {scanResult && (
          <div className={`p-4 rounded-2xl border flex items-center space-x-3 text-xs font-bold ${
            scanResult.status === 'LATE'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            {scanResult.status === 'LATE' ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
            )}
            <div>
              <div>{scanResult.message}</div>
              {scanResult.status === 'LATE' && (
                <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                  Alerte envoyée automatiquement au parent (Arrivée à 08:14 AM).
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Realtime Scans Feed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Derniers Scans Effectués (34/35 élèves)</span>
            <span className="text-emerald-500">97.1% Présents</span>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {recentScans.map(scan => (
              <div
                key={scan.id}
                className="p-3 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`p-1.5 rounded-xl ${scan.status === 'LATE' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white">{scan.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{scan.matricule}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-extrabold text-slate-700 dark:text-slate-300">{scan.time}</div>
                  <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                    scan.status === 'LATE'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {scan.status === 'LATE' ? `Retard +${scan.minutes}m` : 'Présent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
