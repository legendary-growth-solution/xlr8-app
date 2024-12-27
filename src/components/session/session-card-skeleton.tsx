import { Card, CardContent, CardActions, Skeleton, Stack } from '@mui/material';

const SessionCardSkeleton = () => (
    <Card sx={{ maxWidth: 345, margin: '20px', boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
            {/* Session Name */}
            <Skeleton variant="text" width={250} height={40} />

            {/* Session Start Time */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ marginBottom: 1, marginTop: 2 }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={150} height={20} />
            </Stack>

            {/* Number of Participants */}
            <Stack direction="row" alignItems="center" spacing={1}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={120} height={20} />
            </Stack>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', padding: '16px' }}>
            {/* View Details and End Session Buttons */}
            <Skeleton variant="rounded" width={100} height={36} />
            <Skeleton variant="rounded" width={120} height={36} />
        </CardActions>
    </Card>
);

export default SessionCardSkeleton;
