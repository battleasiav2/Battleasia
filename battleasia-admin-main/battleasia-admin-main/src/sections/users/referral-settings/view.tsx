import { useCallback, useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    Stack,
    TextField,
    Typography,
    Button,
    InputAdornment,
    Alert,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import useApi from 'src/hooks/use-api';

export function UserReferralSettingsView() {
    const { getReferralSettingsApi, updateReferralSettingsApi } = useApi();
    const [commissionRate, setCommissionRate] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);

    const getReferralSettings = useCallback(async () => {
        try {
            const response = await getReferralSettingsApi();
            setCommissionRate(response?.data?.referralSettings?.commissionRate ?? 10);
        } catch (error) {
            console.error('Failed to fetch referral settings:', error);
        }
    }, [getReferralSettingsApi]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        if (value >= 0 && value <= 100) {
            setCommissionRate(value);
        }
    }, []);

    const updateReferralSettings = useCallback(async () => {
        if (commissionRate < 0 || commissionRate > 100) {
            toast.error('Commission rate must be between 0 and 100');
            return;
        }
        setLoading(true);
        try {
            const response = await updateReferralSettingsApi(commissionRate);
            if (response?.status === 200) {
                toast.success('Referral settings updated successfully');
                getReferralSettings();
            } else {
                toast.error(response?.data?.message || 'Failed to update referral settings');
            }
        } catch (error) {
            toast.error('Failed to update referral settings');
        } finally {
            setLoading(false);
        }
    }, [updateReferralSettingsApi, commissionRate, getReferralSettings]);

    useEffect(() => {
        getReferralSettings();
    }, [getReferralSettings]);

    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Card>
                <CardHeader title="Referral Commission Settings" subheader="Manage referral commission rate for deposit rewards" />

                <CardContent>
                    <Stack spacing={3}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            When a referred user (B) makes a deposit, the referrer (A) will receive a commission based on this rate.
                            For example, if the rate is 10% and B deposits $100, A receives $10 as a referral bonus.
                            B&apos;s deposit amount remains unchanged at $100.
                        </Alert>

                        <Grid container spacing={1} flexDirection="column">
                            <Typography variant="body1" color="text.secondary">
                                Commission rate is the percentage of each deposit that the referrer earns as a bonus.
                                The default rate is 10%.
                            </Typography>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    sx={{ maxWidth: '250px' }}
                                    label="Commission Rate"
                                    name="commissionRate"
                                    type="number"
                                    value={commissionRate}
                                    onChange={handleInputChange}
                                    required
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                        inputProps: { min: 0, max: 100, step: 0.1 }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Divider />

                        <Stack direction="row" spacing={2} justifyContent="flex-start" alignItems="center">
                            <Typography variant="body1" color="text.secondary">
                                Current rate: <strong>{commissionRate}%</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                (For a $100 deposit, the referrer earns ${(100 * commissionRate / 100).toFixed(2)})
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={2} justifyContent="flex-start">
                            <Button variant="outlined" onClick={updateReferralSettings} disabled={loading}>
                                {loading ? 'Updating...' : 'Update Referral Settings'}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}
