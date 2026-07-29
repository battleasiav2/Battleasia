import { Box, Alert, Button, AlertTitle } from '@mui/material';
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function EmailVerificationBanner() {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);

  // Don't show banner if email is already verified
  if (!user || user.emailVerified) {
    return null;
  }

  const handleVerifyClick = () => {
    router.push(`${paths.auth.emailVerification}?email=${encodeURIComponent(user.email || '')}`);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Alert 
        severity="warning" 
        action={
          <Button 
            color="inherit" 
            size="small" 
            variant="outlined"
            onClick={handleVerifyClick}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Verify Now
          </Button>
        }
      >
        <AlertTitle>Email Verification Required</AlertTitle>
        Please verify your email address to access all features. Check your inbox for the verification code.
      </Alert>
    </Box>
  );
}
