import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Autocomplete,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Paper,
    Button,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { LoadingButton } from '@mui/lab';
import useApi from 'src/hooks/use-api';

type NotificationFormState = {
    title: string;
    message: string;
    category: string;
    type: string;
    avatarUrl: string;
    target: 'all' | 'selected';
    userIds: string[];
};

export function UserPremiumView() {
    const { getPremiumDetailsApi, updatePremiumDetailsApi } = useApi();
    const [premiumDuration, setPremiumDuration] = useState<number>(0);
    const [premiumPrice, setPremiumPrice] = useState<number>(0);

    const getPremiumDetails = useCallback(async () => {
        const response = await getPremiumDetailsApi();
        setPremiumDuration(response?.data?.premium?.premiumDuration);
        setPremiumPrice(response?.data?.premium?.premiumPrice);
    }, [getPremiumDetailsApi]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name === 'duration') {
            setPremiumDuration(Number(value));
        } else if (name === 'price') {
            setPremiumPrice(Number(value));
        }
    }, []);

    const updatePremiumDetails = useCallback(async () => {
        const response = await updatePremiumDetailsApi(premiumDuration, premiumPrice);
        if (response?.status === 200) {
            toast.success('Premium details updated');
            getPremiumDetails();
        } else {
            toast.error(response?.data?.message);
        }
    }, [updatePremiumDetailsApi, premiumDuration, premiumPrice, getPremiumDetails]);

    useEffect(() => {
        getPremiumDetails();
    }, [getPremiumDetails]);
    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Card>
                <CardHeader title="Premium Variables" subheader="Manage premium variables" />
                {/* text explain */}

                <CardContent>
                    <Stack spacing={3}>
                        <Grid container spacing={1} flexDirection="column">
                            <Typography variant="body1" color="text.secondary">Premium duration is the number of days the premium will be active for. </Typography>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    sx={{ maxWidth: '250px' }}
                                    label="Duration"
                                    name="duration"
                                    value={premiumDuration}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={1} flexDirection="column">
                            <Typography variant="body1" color="text.secondary">Premium price is the price of the premium. Currnecy is BAC</Typography>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    sx={{ maxWidth: '250px' }}
                                    label="Price"
                                    name="price"
                                    value={premiumPrice}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                        </Grid>


                        <Divider />
                        <Stack direction="row" spacing={2} justifyContent="flex-start">
                            <Typography variant="body1" color="text.secondary">Duration: {premiumDuration} days</Typography>
                            <Typography variant="body1" color="text.secondary">Price: {premiumPrice} BAC</Typography>
                        </Stack>

                        <Stack direction="row" spacing={2} justifyContent="flex-start">
                            <Button variant="outlined" onClick={updatePremiumDetails}>
                                Update Premium Details
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}


