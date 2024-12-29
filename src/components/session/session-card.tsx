import { AccessTime, Group } from '@mui/icons-material';
import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { useState } from 'react';
import { ConfirmDialog } from '../dialog/confirm-dialog';

interface Session {
    startTime: string;
    name: string;
    numParticipants: number;
    maxParticipants: number;
    onView: VoidFunction;
    onEnd: VoidFunction;
    endSessionLoading: boolean;
}

const SessionCard = ({ startTime, name, numParticipants, maxParticipants, onView, onEnd, endSessionLoading }: Session) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Card sx={{ margin: '20px', boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1, marginTop: 2 }}>
                    <AccessTime sx={{ verticalAlign: 'middle', marginRight: 1 }} />
                    {new Date(startTime).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    <Group sx={{ verticalAlign: 'middle', marginRight: 1 }} />
                    {numParticipants ?? '-'}/{maxParticipants ?? '-'} Participants
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', padding: '16px' }}>
                <Button size="large" variant="contained" color="primary" onClick={onView}>
                    View Details
                </Button>
                {/* <Button size="small" variant="outlined" color="error" onClick={()=>setOpen(true)}>
                    End Session
                </Button> */}
            </CardActions>

            <ConfirmDialog
                open={open}
                title="End Session"
                content={`Are you sure you want to end session "${name || ''}"? This action cannot be undone.`}
                confirmText="End Session"
                confirmColor="error"
                loading={endSessionLoading}
                onClose={() => setOpen(false)}
                onConfirm={onEnd}
            />
        </Card>
    );
};

export default SessionCard;
