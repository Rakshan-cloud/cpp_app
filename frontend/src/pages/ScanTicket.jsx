import { useState } from 'react';
import { ticketsAPI } from '../services/api';
import { ScanLine, CheckCircle, XCircle, AlertCircle, Shield, Calendar, Hash } from 'lucide-react';
import CryptoJS from 'crypto-js';

const TICKET_SECRET_KEY = 'ticket-hmac-secret-key-2026';

function verifyHmacSignature(payload, signature) {
  // Must match Python's json.dumps(payload, sort_keys=True, default=str)
  // Python uses ", " separators (space after comma and colon)
  const sortedKeys = Object.keys(payload).sort();
  const parts = sortedKeys.map(k => {
    let val = payload[k];
    if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
    else val = JSON.stringify(val);
    return JSON.stringify(k) + ': ' + val;
  });
  const payloadStr = '{' + parts.join(', ') + '}';
  const computed = CryptoJS.HmacSHA256(payloadStr, TICKET_SECRET_KEY).toString(CryptoJS.enc.Hex);
  return computed === signature;
}

export default function ScanTicket() {
  const [qrData, setQrData] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!qrData.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');

    let parsedQr;
    try {
      parsedQr = JSON.parse(qrData.trim());
    } catch {
      setError('Invalid JSON format in QR data');
      setLoading(false);
      return;
    }

    if (!parsedQr.ticket_id || !parsedQr.payload || !parsedQr.signature) {
      setError('Invalid QR data: missing ticket_id, payload, or signature');
      setLoading(false);
      return;
    }

    // Try server-side validation first
    try {
      const res = await ticketsAPI.validate(qrData.trim());
      const data = res.data;
      if (data && (data.valid !== undefined || data.error_code)) {
        setResult(data);
        setLoading(false);
        return;
      }
    } catch (err) {
      const data = err.response?.data;
      if (data && data.error_code) {
        setResult(data);
        setLoading(false);
        return;
      }
    }

    // Fallback: HMAC-SHA256 signature verification locally
    const isSignatureValid = verifyHmacSignature(parsedQr.payload, parsedQr.signature);

    if (isSignatureValid) {
      setResult({
        valid: true,
        message: 'HMAC-SHA256 signature verified successfully. Ticket is authentic.',
        ticket: {
          ticket_id: parsedQr.ticket_id,
          event_name: parsedQr.payload?.event_name || 'Event',
          status: 'valid',
        },
      });
    } else {
      setResult({
        valid: false,
        error_code: 'INVALID_SIGNATURE',
        message: 'HMAC-SHA256 signature verification FAILED. This ticket may be forged or tampered with.',
        ticket: {
          ticket_id: parsedQr.ticket_id,
          event_name: parsedQr.payload?.event_name || 'Unknown',
          status: 'invalid',
        },
      });
    }
    setLoading(false);
  };

  const handleClear = () => {
    setQrData('');
    setResult(null);
    setError('');
  };

  const isValid = result?.valid === true;
  const isUsed = result?.error_code === 'TICKET_ALREADY_USED';

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <ScanLine className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">Validate Ticket</h1>
        </div>
        <p className="text-text-muted text-sm ml-10">Paste the scanned QR code JSON data to verify ticket authenticity.</p>
      </div>

      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden mb-4">
        <form onSubmit={handleValidate}>
          <div className="p-5">
            <label className="block text-xs font-semibold text-text-mid uppercase tracking-wider mb-2">QR Code Data</label>
            <textarea
              value={qrData} onChange={(e) => setQrData(e.target.value)}
              rows={5}
              className="w-full bg-gray-50 border border-border rounded-lg py-3 px-3.5 text-text text-xs placeholder-text-muted/50 focus:outline-none focus:border-primary focus:bg-white font-mono resize-none transition-colors"
              placeholder={'{\n  "ticket_id": "abc-123-...",\n  "payload": { ... },\n  "signature": "hmac-sha256-hash"\n}'}
            />
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button
              type="submit" disabled={loading || !qrData.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer border-none text-sm"
            >
              <Shield className="w-4 h-4" />
              {loading ? 'Verifying...' : 'Verify Ticket'}
            </button>
            {qrData && (
              <button
                type="button" onClick={handleClear}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-text-mid rounded-lg cursor-pointer border-none text-sm font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {result && (
        <div className={`rounded-xl border-2 overflow-hidden shadow-sm ${isValid ? 'border-emerald-300' : isUsed ? 'border-amber-300' : 'border-red-300'}`}>
          <div className={`px-5 py-4 flex items-center gap-3 ${isValid ? 'bg-emerald-50' : isUsed ? 'bg-amber-50' : 'bg-red-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isValid ? 'bg-emerald-100' : isUsed ? 'bg-amber-100' : 'bg-red-100'}`}>
              {isValid ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : isUsed ? (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className={`text-base font-bold ${isValid ? 'text-emerald-700' : isUsed ? 'text-amber-700' : 'text-red-700'}`}>
                {isValid ? 'VALID - Allow Entry' : isUsed ? 'Already Used' : 'INVALID - Deny Entry'}
              </h3>
              <p className={`text-xs ${isValid ? 'text-emerald-600' : isUsed ? 'text-amber-600' : 'text-red-600'}`}>
                {result.message || ''}
              </p>
            </div>
          </div>

          {result.ticket && (
            <div className="bg-white px-5 py-4">
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-3">Ticket Details</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Hash className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-xs text-text-muted">Ticket ID</span>
                    <span className="font-mono text-xs text-text">{result.ticket.ticket_id?.slice(0, 20)}...</span>
                  </div>
                </div>
                {result.ticket.event_name && (
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-xs text-text-muted">Event</span>
                      <span className="text-xs text-text font-medium">{result.ticket.event_name}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <Shield className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-xs text-text-muted">Status</span>
                    <span className={`text-xs font-semibold ${isValid ? 'text-emerald-600' : isUsed ? 'text-amber-600' : 'text-red-600'}`}>
                      {result.ticket.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <XCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
