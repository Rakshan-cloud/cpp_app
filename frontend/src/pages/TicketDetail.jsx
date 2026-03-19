import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeft, QrCode, Calendar, CheckCircle, XCircle, AlertCircle, Copy, Shield, Hash, Clock } from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQrData, setShowQrData] = useState(false);

  useEffect(() => {
    ticketsAPI.get(id)
      .then((res) => setTicket(res.data.ticket))
      .catch((err) => setError(err.response?.data?.error || 'Ticket not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading ticket..." />;
  if (error || !ticket) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <QrCode className="w-12 h-12 text-border mx-auto mb-3" />
      <p className="text-text-muted">{error || 'Ticket not found'}</p>
    </div>
  );

  const statusConfig = {
    valid: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Valid', dotColor: 'bg-emerald-500' },
    used: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Used', dotColor: 'bg-amber-500' },
    revoked: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Revoked', dotColor: 'bg-red-500' },
  };
  const st = statusConfig[ticket.status] || statusConfig.valid;
  const StIcon = st.icon;

  const qrDataJson = ticket.qr_payload || JSON.stringify({
    ticket_id: ticket.ticket_id,
    payload: {
      ticket_id: ticket.ticket_id,
      event_id: ticket.event_id,
      registration_id: ticket.registration_id,
      user_id: ticket.user_id,
      event_name: ticket.event_name,
      created_at: ticket.created_at,
    },
    signature: ticket.signature || 'N/A',
  }, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(typeof qrDataJson === 'string' ? qrDataJson : JSON.stringify(qrDataJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate('/my-tickets')} className="flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 bg-transparent border-none cursor-pointer font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to my tickets
      </button>

      {/* Ticket Card */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">

        {/* Header with event name and status */}
        <div className="px-6 pt-6 pb-4 border-b border-border-light">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Event Ticket</p>
              <h2 className="text-xl font-bold text-text">{ticket.event_name || 'Event'}</h2>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor}`}></span>
              {st.label}
            </span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="p-6 flex flex-col items-center bg-gradient-to-b from-gray-50 to-white">
          {ticket.status === 'valid' ? (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <img
                src={ticketsAPI.getQrUrl(ticket.ticket_id)}
                alt="QR Code"
                className="w-56 h-56 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-56 h-56 flex flex-col items-center justify-center"><svg class="w-16 h-16 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg><p class="text-gray-400 text-xs">QR unavailable</p></div>';
                }}
              />
            </div>
          ) : (
            <div className="w-56 h-56 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100">
              <StIcon className={`w-16 h-16 ${st.color} mb-2`} />
              <p className="text-text-muted text-sm font-medium">Ticket {ticket.status}</p>
            </div>
          )}
          <p className="text-xs text-text-muted mt-3">
            {ticket.status === 'valid' ? 'Present this QR code at the venue entrance' : `This ticket has been ${ticket.status}`}
          </p>
        </div>

        {/* Dotted separator line (like a real ticket tear-off) */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-gray-50 rounded-full border border-border-light"></div>
          <div className="absolute right-0 top-0 w-4 h-4 translate-x-1/2 -translate-y-1/2 bg-gray-50 rounded-full border border-border-light"></div>
          <div className="border-t border-dashed border-gray-200 mx-6"></div>
        </div>

        {/* Ticket Details */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-0.5">Ticket ID</p>
              <p className="font-mono text-xs text-text">{ticket.ticket_id?.slice(0, 16)}...</p>
            </div>
            {ticket.event_id && (
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-0.5">Event ID</p>
                <p className="font-mono text-xs text-text">{ticket.event_id?.slice(0, 16)}...</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-0.5">Created</p>
              <p className="text-xs text-text flex items-center gap-1">
                <Calendar className="w-3 h-3 text-text-muted" />
                {new Date(ticket.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            {ticket.used_at && (
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-0.5">Checked In</p>
                <p className="text-xs text-text flex items-center gap-1">
                  <Clock className="w-3 h-3 text-text-muted" />
                  {new Date(ticket.used_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>

          {ticket.signature && (
            <div className="mt-4 pt-3 border-t border-border-light">
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-0.5 flex items-center gap-1">
                <Shield className="w-3 h-3" /> HMAC-SHA256 Signature
              </p>
              <p className="font-mono text-[10px] text-text-mid break-all leading-relaxed">{ticket.signature}</p>
            </div>
          )}
        </div>

        {/* QR Data Section */}
        <div className="px-6 pb-5">
          <button
            onClick={() => setShowQrData(!showQrData)}
            className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-border-light text-xs font-medium text-text-mid cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              {showQrData ? 'Hide' : 'Show'} QR Code Data (JSON)
            </span>
            <span className="text-text-muted">{showQrData ? '−' : '+'}</span>
          </button>

          {showQrData && (
            <div className="mt-3 relative">
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-[11px] font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
                {typeof qrDataJson === 'string' ? qrDataJson : JSON.stringify(qrDataJson, null, 2)}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white cursor-pointer border-none transition-colors"
                title="Copy QR data"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copied && (
                <span className="absolute top-2 right-10 text-[10px] text-emerald-400 font-medium">Copied!</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
