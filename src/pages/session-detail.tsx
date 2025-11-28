import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { GroupCard } from 'src/components/session/group-card';
import { SessionDetailSkeleton } from 'src/components/skeleton/SessionDetailSkeleton';
import Toast from 'src/components/toast';
import { Session, Cart, User } from 'src/types/session';
import { api } from 'src/api/api';
import LiveLeaderboard from './live-leaderboard';


export default function SessionDetailPage() {
  const { id } = useParams();
  const [reviewConfirmation, setReviewConfirmation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [session, setSession] = useState<Session>();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  const getSession = useCallback(() => {
    if (id) {
      setLoading(true)
      api.session.get(id)
        .then((res) => {
          setSession(res)
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [id]);

  const getCarts = useCallback(() => {
    api.cart.getCarts()
      .then((res) => {
        setCarts(res.carts);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const extractAllUsers = useCallback(
    (session1: Session): User[] => session1?.groups?.flatMap((group) => group?.users || []) || [],
    []
  );

  const handleReviewLink = () => {
    if (id) {
      api.review.sendReviewLink(id)
        .then((res) => {
          console.log(res)
        })
      .catch((err) => {
        console.log(err)
        })
    }
  };

  useLayoutEffect(() => { getSession() }, [getSession]);
  useLayoutEffect(() => { getCarts() }, [getCarts]);
  useLayoutEffect(() => {
    if (session) setUsers(extractAllUsers(session));
  }, [session, extractAllUsers]);

  if (loading) return <SessionDetailSkeleton />;

  return (
    <>
      <Helmet>
        <title>{`${session?.name}`}</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          mb={5}
        >
          <Stack direction="column" spacing={2}>
            <Typography variant="h4">
              {session?.name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" marginTop="-2px !important">
              SID #{session?.session_id}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              // color="error"
              onClick={() => navigate('lap-data')}
            >
              Lap Data
            </Button>
            <Button
              variant="contained"
              onClick={() => setReviewConfirmation(true)}
            >
              Send Review Link
            </Button>
          </Stack>
        </Stack>

        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {session?.start_time && <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Start Time
                </Typography>
                <Typography variant="body1">
                  {new Date(session?.start_time).toLocaleString()}
                </Typography>
              </Stack>}
              </Grid>

              <Grid item xs={12} md={6}>
              {session?.end_time && <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  End Time
                </Typography>
                <Typography variant="body1">
                  {new Date(session?.end_time).toLocaleString()}
                </Typography>
              </Stack>}
            </Grid>
          </Grid>
        </Card>

        {!session?.active && !!session?.session_id && <LiveLeaderboard session_id={session?.session_id} isSessionActive={session?.active} />}

        {!session?.active && session?.groups && session.groups.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 3, mt: 5 }}>
              Groups & Billing
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {session.groups.map((group) => (
                <Grid key={group.group_id} item xs={12} md={6} lg={4}>
                  <GroupCard
                    group={group}
                    carts={carts}
                    getCarts={getCarts}
                    plans={[]}
                    handleAssignCart={() => {}}
                    handleRemoveUser={() => {}}
                    handleDeleteGroup={() => {}}
                    handleAddUsers={() => Promise.resolve()}
                    handleUpdateUser={() => {}}
                    handleManageUserRace={() => Promise.resolve()}
                    sessionId={session.session_id}
                    users={users}
                    isSessionActive={false}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
      <ConfirmDialog
        open={reviewConfirmation}
        title="Send Review Link"
        content="Are you sure you want to send google review link over whatsap to all the users?"
        confirmText="Send Review Link"
        confirmColor="success"
        loading={false}
        onClose={() => setReviewConfirmation(false)}
        onConfirm={handleReviewLink}
      />
      <Toast />
    </>
  );
}
