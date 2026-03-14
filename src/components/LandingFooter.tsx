import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { label: 'Markets', href: '/markets' },
      { label: 'Platform', href: '/platform' },
      { label: 'Get Started', href: '/register' },
      { label: 'Sign In', href: '/sign-in' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Support', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Risk Disclosure', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
];

const LandingFooter = () => {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gold-gradient">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                ProTraderSim
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A professional-grade CFD simulation trading platform designed for
              education, practice, and trader development.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="border-t border-border/20">
        <div className="container py-6">
          <p className="text-xs leading-relaxed text-muted-foreground/70">
            <strong>Risk Disclaimer:</strong> ProTraderSim is a simulated
            trading environment designed for educational and practice purposes
            only. It does not provide live brokerage execution, real market
            access, or financial advice. All trading instruments, prices, and
            leverage ratios displayed on this platform are simulated. No real
            capital is at risk. CFD and leveraged products carry a high level of
            risk in live markets and are not suitable for all investors. Past
            performance of simulated trades does not guarantee future results in
            live trading.
          </p>
          <p className="mt-3 text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} ProTraderSim. All rights reserved.
            Simulation Platform — Not a Licensed Broker.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
