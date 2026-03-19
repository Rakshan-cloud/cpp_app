import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationsAPI, ticketsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Ticket, Calendar, MapPin, XCircle, CheckCircle, AlertCircle, QrCode, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MyTickets() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchRegistrations = () => {
    setLoading(true);
    registrationsAPI.list()
      .then((res) => setRegistrations(res.data.registrations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const handleCancel = async (regId) => {
    if (!confirm('Cancel this registration? Your ticket will be revoked.')) return;
    setCancelling(regId);
    try {
      await registrationsAPI.cancel(regId);
      fetchRegistrations();
    } catch {
      alert('Failed to cancel registration');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your tickets..." />;

  const statusConfig = {
    confirmed: { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', dotColor: 'bg-emerald-500', label: 'Confirmed' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-50 border-red-200', dotColor: 'bg-red-500', label: 'Cancelled' },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">My Tickets</h1>
          <p className="text-sm text-text-muted mt-1">{registrations.length} registration{registrations.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-light no-underline font-medium">
          Browse events <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border-light">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-border" />
          </div>
          <h3 className="text-base font-semibold text-text mb-1">No tickets yet</h3>
          <p className="text-text-muted text-sm mb-4">Register for an event to get your first ticket</p>
          <Link to="/events" className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium no-underline transition-colors">
            Browse events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => {
            const st = statusConfig[reg.status] || statusConfig.confirmed;
            return (
              <div key={reg.registration_id} className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {/* QR Preview (left side) */}
                  {reg.status === 'confirmed' && reg.ticket && (
                    <Link to={`/tickets/${reg.ticket.ticket_id}`} className="sm:w-24 sm:min-h-full bg-gray-50 border-b sm:border-b-0 sm:border-r border-border-light flex items-center justify-center p-3 no-underline">
                      <QRCodeSVG
                        value={reg.ticket.ticket_id || 'ticket'}
                        size={56}
                        level="L"
                        bgColor="transparent"
                        fgColor="#374151"
                      />
                    </Link>
                  )}

                  {/* Ticket Info */}
                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-semibold text-text truncate">{reg.event_name || 'Event'}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.bg} ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor}`}></span>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                        {reg.event_date && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {reg.event_date}</span>
                        )}
                        {reg.event_location && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {reg.event_location}</span>
                        )}
                        {reg.checked_in && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium"><CheckCircle className="w-3 h-3" /> Checked in</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {reg.status === 'confirmed' && reg.ticket && (
                        <Link
                          to={`/tickets/${reg.ticket.ticket_id}`}
                          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3.5 py-2 rounded-lg text-xs font-medium no-underline transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" /> View Ticket
                        </Link>
                      )}
                      {reg.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(reg.registration_id)}
                          disabled={cancelling === reg.registration_id}
                          className="text-xs text-text-muted hover:text-danger bg-transparent border border-border-light hover:border-red-200 px-3 py-2 rounded-lg cursor-pointer font-medium transition-colors disabled:opacity-50"
                        >
                          {cancelling === reg.registration_id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
