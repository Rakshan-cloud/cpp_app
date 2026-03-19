import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QrCode, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

function HeroIllustration() {
  return (
    <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Person holding phone with QR code */}
      <rect x="180" y="60" width="140" height="240" rx="16" fill="#1a1a2e" />
      <rect x="188" y="80" width="124" height="200" rx="4" fill="#f8f8f8" />
      {/* QR Code on phone screen */}
      <rect x="210" y="110" width="80" height="80" rx="4" fill="white" stroke="#1a1a2e" strokeWidth="2" />
      {/* QR pattern */}
      <rect x="218" y="118" width="12" height="12" fill="#1a1a2e" />
      <rect x="234" y="118" width="6" height="6" fill="#1a1a2e" />
      <rect x="244" y="118" width="6" height="6" fill="#1a1a2e" />
      <rect x="258" y="118" width="12" height="12" fill="#1a1a2e" />
      <rect x="218" y="134" width="6" height="6" fill="#1a1a2e" />
      <rect x="234" y="134" width="12" height="6" fill="#1a1a2e" />
      <rect x="252" y="134" width="6" height="6" fill="#1a1a2e" />
      <rect x="218" y="144" width="12" height="6" fill="#1a1a2e" />
      <rect x="238" y="144" width="6" height="6" fill="#1a1a2e" />
      <rect x="250" y="144" width="6" height="6" fill="#1a1a2e" />
      <rect x="262" y="144" width="6" height="6" fill="#1a1a2e" />
      <rect x="218" y="156" width="12" height="12" fill="#1a1a2e" />
      <rect x="238" y="156" width="6" height="6" fill="#1a1a2e" />
      <rect x="258" y="156" width="12" height="12" fill="#1a1a2e" />
      <rect x="234" y="164" width="6" height="6" fill="#1a1a2e" />
      <rect x="246" y="164" width="6" height="6" fill="#1a1a2e" />
      {/* Ticket text */}
      <rect x="208" y="200" width="84" height="8" rx="2" fill="#e0e0e0" />
      <rect x="220" y="214" width="60" height="6" rx="2" fill="#e8e8e8" />
      {/* Check mark badge */}
      <circle cx="290" y="100" r="20" fill="#c75a25" />
      <path d="M280 100 L287 107 L300 93" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Decorative elements */}
      <circle cx="120" cy="120" r="40" fill="#c75a25" opacity="0.08" />
      <circle cx="380" cy="280" r="50" fill="#1a1a2e" opacity="0.05" />
      <circle cx="100" cy="300" r="6" fill="#c75a25" opacity="0.3" />
      <circle cx="400" cy="100" r="4" fill="#c75a25" opacity="0.4" />
      <circle cx="420" cy="180" r="8" fill="#1a1a2e" opacity="0.08" />
      {/* Scan lines */}
      <line x1="195" y1="250" x2="305" y2="250" stroke="#c75a25" strokeWidth="2" opacity="0.6" />
      <line x1="195" y1="250" x2="195" y2="242" stroke="#c75a25" strokeWidth="2" opacity="0.6" />
      <line x1="305" y1="250" x2="305" y2="242" stroke="#c75a25" strokeWidth="2" opacity="0.6" />
      {/* Event ticket floating */}
      <g transform="rotate(-8, 380, 160)">
        <rect x="340" y="130" width="90" height="55" rx="6" fill="white" stroke="#e0e0e0" strokeWidth="1" />
        <rect x="348" y="140" width="40" height="6" rx="2" fill="#1a1a2e" />
        <rect x="348" y="152" width="60" height="4" rx="2" fill="#e0e0e0" />
        <rect x="348" y="162" width="30" height="4" rx="2" fill="#e0e0e0" />
        <line x1="400" y1="130" x2="400" y2="185" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4 3" />
        <rect x="406" y="145" width="16" height="16" rx="2" fill="#c75a25" opacity="0.15" />
      </g>
      {/* Another floating ticket */}
      <g transform="rotate(5, 100, 200)">
        <rect x="60" y="175" width="80" height="50" rx="6" fill="white" stroke="#e0e0e0" strokeWidth="1" />
        <rect x="68" y="185" width="35" height="5" rx="2" fill="#1a1a2e" />
        <rect x="68" y="195" width="50" height="4" rx="2" fill="#e0e0e0" />
        <rect x="68" y="205" width="25" height="4" rx="2" fill="#e0e0e0" />
      </g>
      {/* Shield icon */}
      <g transform="translate(350, 250)">
        <path d="M0 -15 C0 -15, 15 -20, 15 -10 L15 5 C15 15, 0 25, 0 25 C0 25, -15 15, -15 5 L-15 -10 C-15 -20, 0 -15, 0 -15Z" fill="#c75a25" opacity="0.12" stroke="#c75a25" strokeWidth="1" opacity="0.3" />
      </g>
    </svg>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex-1">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-4">Secure Event Ticketing</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-text leading-[1.1] mb-5 tracking-tight">
              QR tickets that<br />can't be forged.
            </h1>
            <p className="text-lg text-text-mid leading-relaxed mb-8 max-w-lg">
              Rakshan uses cryptographic signing to make every ticket tamper-proof. Register for events, get your QR code, scan at the door.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/events" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2.5 rounded-md text-sm no-underline transition-colors">
                Browse events <ArrowRight className="w-4 h-4" />
              </Link>
              {!user && (
                <Link to="/register" className="inline-flex items-center gap-2 bg-white hover:bg-surface-alt text-text font-medium px-5 py-2.5 rounded-md text-sm no-underline border border-border transition-colors">
                  Create account
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <HeroIllustration />
          </div>
        </div>
      </section>

      <section className="border-t border-border-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-8">How it works</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Calendar, num: '01', title: 'Find & register', desc: 'Browse upcoming events and register with one click. No paperwork, no waiting.' },
              { icon: QrCode, num: '02', title: 'Get your QR ticket', desc: 'Receive a cryptographically signed QR code. Each ticket is unique and verifiable.' },
              { icon: CheckCircle, num: '03', title: 'Scan & enter', desc: 'Show your code at the venue. Instant validation, no duplicates, no fakes.' },
            ].map(({ icon: Icon, num, title, desc }) => (
              <div key={num} className="group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-text-muted">{num}</span>
                  <div className="w-9 h-9 rounded-md bg-surface-alt border border-border-light flex items-center justify-center group-hover:border-accent/40 transition-colors">
                    <Icon className="w-4.5 h-4.5 text-text-mid" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-text mb-1.5">{title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
