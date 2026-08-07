import { PageMeta } from 'src/perf';
import { List, ListItem, Typography, ListItemText } from '@mui/material';

import { LegalPageShell, LegalSection } from 'src/sections/legal/legal-page-shell';

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageMeta
        title="Privacy Policy"
        description="How BattleAsia collects, uses, and protects your personal data."
        path="/privacy-policy"
      />
      <main>
        <LegalPageShell title="Privacy Policy" updatedAt="1/2/2026" artIndex={4}>
          <LegalSection title="1) Who we are">
            <Typography>
              BattleAsia (“we,” “us,” “our”) provides a platform where PUBG teams can deposit funds,
              participate in wagers on match outcomes, and receive payouts based on verified results.
              We are an independent, third-party service and are not affiliated with or endorsed by PUBG or its publisher.
            </Typography>
          </LegalSection>

          <LegalSection title="2) Information we collect">
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Account & Identity: Username, email, password (hashed), country/region, and optional contact details." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Player/Game Data: PUBG player ID or team identifiers necessary to track matches and results." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Transactions: Deposit and withdrawal records, payout destination details (e.g., wallet/provider IDs), amounts, currency, timestamps, and related metadata." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Usage & Device: Log data (IP address, device/browser type, OS, timestamps, pages/actions), coarse geolocation inferred from IP, and security signals (failed logins, anomaly flags)." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Support Content: Messages, tickets, and any attachments you submit to support." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Optional KYC (if/when required): Identity documents and verification data, only if we are legally required or to prevent fraud." />
              </ListItem>
            </List>
          </LegalSection>

          <LegalSection title="3) How we use information">
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Operate the service: account creation, authentication, deposits, wagers, and payouts." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Determine match outcomes and allocate winnings based on verified results." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Prevent fraud, abuse, money laundering, and cheating (including duplicate accounts and suspicious transaction patterns)." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Meet legal, regulatory, and accounting obligations." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Provide support and communicate service updates." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Improve reliability, security, and user experience (analytics in aggregate or de-identified form)." />
              </ListItem>
            </List>
          </LegalSection>

          <LegalSection title="4) Legal bases (where applicable, e.g., GDPR)">
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Contract: To provide the service you request (accounts, wagers, payouts)." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Legitimate interests: Security, fraud prevention, service improvement, and defending our rights." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Legal obligations: Compliance with financial, anti-fraud, and record-keeping requirements." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Consent: Where required for specific optional uses." />
              </ListItem>
            </List>
          </LegalSection>

          <LegalSection title="5) Sharing and disclosure">
            <Typography sx={{ mb: 1 }}>We do not sell personal data. We may share:</Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Payment and payout processors: To handle deposits, withdrawals, and KYC (if required)." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Security and fraud partners: To detect and prevent abuse or illegal activity." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Infrastructure and analytics providers: Cloud hosting, logging, monitoring, and aggregated analytics." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Law enforcement or regulators: When legally required or to protect rights, safety, or comply with valid requests." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Business transfers: In a merger, acquisition, or asset transfer, data may be transferred subject to this Policy." />
              </ListItem>
            </List>
          </LegalSection>

          <LegalSection title="6) Data retention">
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Account and transaction records: Retained as long as you maintain an account and as required by law/regulation (e.g., financial recordkeeping, anti-fraud)." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Security logs: Retained for a limited period necessary for security and auditing." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="KYC data (if collected): Retained per legal/regulatory obligations, then deleted or irreversibly anonymized." />
              </ListItem>
            </List>
          </LegalSection>

          <LegalSection title="7) Security">
            <Typography>
              We employ industry-standard measures (encryption in transit, hashed passwords, access controls, monitoring).
              No system is 100% secure; you are responsible for safeguarding your credentials.
            </Typography>
          </LegalSection>

          <LegalSection title="8) Your choices and rights (subject to your jurisdiction)">
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Access, correct, or delete certain personal data (within legal limits, especially for financial records)." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Object to or restrict certain processing where applicable." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Portability of data you provided, where applicable." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Withdraw consent where processing relies on consent." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Close your account (we may retain data where required by law or for legitimate interests like fraud prevention)." />
              </ListItem>
            </List>
          </LegalSection>

          <LegalSection title="9) Third-party services">
            <Typography>
              Links or integrations (e.g., payment providers) have their own policies. Review their privacy terms; we are not
              responsible for their practices.
            </Typography>
          </LegalSection>

          <LegalSection title="10) Contact">
            <Typography>
              If you have questions, concerns, or requests about privacy, contact us at: support@battleasia.net
            </Typography>
          </LegalSection>
        </LegalPageShell>
      </main>
    </>
  );
}
