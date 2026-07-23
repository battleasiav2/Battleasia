import { Helmet } from 'react-helmet-async';
import { Box, List, Stack, Divider, ListItem, Container, Typography, ListItemText } from '@mui/material';

import { CONFIG } from 'src/global-config';

const metadata = { title: `${CONFIG.appName} | Terms & Conditions` };

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Stack spacing={1.5}>
    <Typography variant="h5" fontWeight={700}>
      {title}
    </Typography>
    {children}
  </Stack>
);

export default function TermsAndConditionsPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box sx={{ backgroundColor: 'background.default', py: { xs: 10, md: 16 } }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                Terms & Conditions — BattleAsia
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: 1/2/2026
              </Typography>
            </Box>

            <Divider />

            <Section title="1) About BattleAsia">
              <Typography variant="body1" color="">
                BattleAsia (“we,” “us,” “our”) is an independent platform that facilitates wagers on PUBG match outcomes
                between participating teams/players. We are not affiliated with or endorsed by PUBG or its publisher.
              </Typography>
            </Section>

            <Section title="2) Eligibility">
              <List dense sx={{ pl: 1 }}>
                <ListItem disableGutters>
                  <ListItemText primary="You must be at least the legal age for wagering in your jurisdiction (e.g., [18/21+]) and legally permitted to participate." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="You must comply with local laws; you are responsible for confirming that using BattleAsia is lawful where you are." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="No use in banned or embargoed territories, or by persons on sanctions lists." />
                </ListItem>
              </List>
            </Section>

            <Section title="3) Accounts">
              <List dense sx={{ pl: 1 }}>
                <ListItem disableGutters>
                  <ListItemText primary="Provide accurate, current information and keep credentials secure." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="One account per person unless explicitly authorized." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="We may require identity/age verification (KYC) where needed." />
                </ListItem>
              </List>
            </Section>

            <Section title="4) Deposits, Wagers, and Payouts">
              <List dense sx={{ pl: 1 }}>
                <ListItem disableGutters>
                  <ListItemText primary="Funds deposited are used solely for wagers and related platform fees." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Wagers are final once placed." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Payouts are based on verified match results as determined by BattleAsia." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="You authorize us and our payment partners to process deposits and payouts to the wallet/payment details you provide." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Currency conversion, network fees, or payment-provider fees may apply." />
                </ListItem>
              </List>
            </Section>

            <Section title="5) Match Rules and Results">
              <List dense sx={{ pl: 1 }}>
                <ListItem disableGutters>
                  <ListItemText primary="Results are determined from verified match data and/or official sources. Our determination is final." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="If a match is voided, materially disrupted, or unverifiable, we may cancel wagers and return stakes or settle per posted rules." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Cheating, collusion, use of exploits, or match-fixing is strictly prohibited and may lead to forfeiture and account action." />
                </ListItem>
              </List>
            </Section>

            <Section title="6) Prohibited Conduct">
              <List dense sx={{ pl: 1 }}>
                <ListItem disableGutters>
                  <ListItemText primary="Fraud, money laundering, chargebacks without cause, multiple account abuse." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Using VPN/proxies to bypass geo/eligibility rules." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Harassment, abuse, or attempts to manipulate outcomes or the platform." />
                </ListItem>
              </List>
            </Section>

            <Section title="7) Suspensions and Forfeiture">
              <Typography variant="body1" color="">
                We may suspend, limit, or terminate accounts and withhold or seize funds if we suspect fraud, cheating, AML/KYC
                violations, or legal noncompliance.
              </Typography>
            </Section>

            <Section title="8) Fees">
              <Typography variant="body1" color="">
                We may charge transaction or service fees; any applicable fees will be disclosed at the point of use.
              </Typography>
            </Section>

            <Section title="9) Risk Notice">
              <Typography variant="body1" color="">
                Battle wagering involves financial risk; you may lose some or all of your stake. You are solely responsible for
                your decisions and for complying with local laws.
              </Typography>
            </Section>

            <Section title="10) Disclaimers">
              <List dense sx={{ pl: 1 }}>
                <ListItem disableGutters>
                  <ListItemText primary="Service is provided “as is” and “as available.” We disclaim warranties to the fullest extent permitted by law." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="We do not guarantee uninterrupted access, accuracy of data, or error-free operation." />
                </ListItem>
              </List>
            </Section>

            <Section title="11) Limitation of Liability">
              <List dense sx={{ pl: 1 }}>
                <ListItem disableGutters>
                  <ListItemText primary="To the fullest extent permitted by law, our aggregate liability is limited to the greater of: (a) the total fees you paid us in the past 6 months, or (b) [USD/EUR/local currency amount, e.g., $100]." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="We are not liable for indirect, incidental, special, or consequential damages, lost profits, or loss of data." />
                </ListItem>
              </List>
            </Section>

            <Section title="12) AML/KYC and Compliance">
              <List dense sx={{ pl: 1 }}>
                <ListItem disableGutters>
                  <ListItemText primary="You agree to provide information or documents we reasonably request for identity, age, source of funds, or sanctions screening." />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="We may block or delay transactions to comply with law or regulatory requests." />
                </ListItem>
              </List>
            </Section>

            <Section title="13) Intellectual Property">
              <Typography variant="body1" color="">
                All BattleAsia content, branding, and platform materials are owned by us or our licensors. You receive a
                limited, revocable, non-transferable right to use the service per these Terms.
              </Typography>
            </Section>

            <Section title="14) Third-Party Services">
              <Typography variant="body1" color="">
                Payments and some features rely on third parties. Their terms and privacy policies apply. We are not responsible
                for their acts or omissions.
              </Typography>
            </Section>

            <Section title="15) Termination">
              <Typography variant="body1" color="">
                You may close your account at any time (subject to compliance checks). We may retain records as required by law
                or for legitimate interests (e.g., fraud prevention). We may terminate or suspend access for any breach of these
                Terms or suspected illegal activity.
              </Typography>
            </Section>

            <Section title="16) Contact">
              <Typography variant="body1" color="">
                Questions about these Terms: support@battleasia.net
              </Typography>
            </Section>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

