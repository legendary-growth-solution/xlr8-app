import { Badge, Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { Iconify } from 'src/components/iconify';
import { CreateGroupDialog } from 'src/components/session/create-group-dialog';
import { GroupCard } from 'src/components/session/group-card';
import { SessionPageSkeleton } from 'src/components/skeleton/SessionPageSkeleton';
import Toast, { showToast } from 'src/components/toast';
import { Cart, Group, NewUser, Plan, Session, User, UserRaceStatus } from 'src/types/session';
import LiveLeaderboard from './live-leaderboard';
import { api } from 'src/api/api';


export default function SessionActivePage() {
  const [reviewConfirmation, setReviewConfirmation] = useState<boolean>(false);
  const [openEndSession, setOpenEndSession] = useState<boolean>(false);
  const [openNewGroup, setOpenNewGroup] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [session, setSession] = useState<Session>();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const navigate = useNavigate();
  const extractAllUsers = useCallback((session: Session): User[] => session.groups.flatMap((group) => group.users),[]);
  const getCarts = useCallback(() => {
    api.cart.getCarts
      .then((res) => setCarts(res?.carts))
      .catch((err) => {
        console.log(err)
      })
  }, []);
  const getPlans = useCallback(() => {
    api.plan.getPlans
      .then((res) => {
        setPlans(res?.plans)
      })
      .catch((err) => {
        console.log(err)
      })
  }, []);
  const getActiveSession = useCallback(() => {
    setLoading(true)
    api.session.getActiveSession
      .then((res) => {
        setSession(res)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, []);
  const handleEndSession = useCallback(() => {
    if (session?.session_id) {
      api.session.endSession(session?.session_id)
        .then((res) => {
          navigate('/sessions/history')
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [session?.session_id, navigate]);
  const handleAssignCart = useCallback((group_id: string, user_id: string, cart_id: string) => {
    if (session?.session_id) {
      api.session.group.users.cart.assign(session?.session_id, group_id, user_id, {
        cart_id: cart_id
      })
        .then((res) => {
          // assign cart to the relevant user
          getCarts()
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [session?.session_id, getCarts]);
  const handleRemoveUser = useCallback((group_id: string, user_id: string) => {
    if (session?.session_id) {
      api.session.group.users.delete(session?.session_id, group_id, user_id)
        .then((res) => {
          // assign cart to the relevant user
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [session?.session_id]);
  const handleCreateGroup = useCallback((name: string) => {
    if (session?.session_id) {
      api.session.group.create(session?.session_id, {
        name: name
      })
        .then((res) => {
          // add a new group to the session?.group array
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [session?.session_id]);
  const handleDeleteGroup = useCallback((group_id: string) => {
    if (session?.session_id) {
      api.session.group.delete(session?.session_id, group_id)
        .then((res) => {
          // remove this group from the session?.group array
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [session?.session_id]);
  const handleAddUsers = useCallback((group_id: string, data: NewUser[]) => {
    if (session?.session_id) {
      api.session.group.users.create(session?.session_id, group_id, data)
        .then((res) => {
          // add new users to the group
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [session?.session_id]);
  const handleUpdateUser = useCallback((group_id: string, user_id: string, data: NewUser) => {
    if (session?.session_id) {
      api.session.group.users.update(session?.session_id, group_id, user_id, data)
        .then((res) => {
          // update user to the group
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [session?.session_id]);
  const handleManageUserRace = useCallback((group_id: string, user_id: string, status: UserRaceStatus) => {
    if (session?.session_id) {
      switch (status) {
        case 'start':
          api.session.group.users.race.start(session?.session_id, group_id, user_id)
            .then((res) => {
              // handle start race for user
            })
            .catch((err) => {
              console.log(err)
            });
          break;

        case 'pause':
          api.session.group.users.race.pause(session?.session_id, group_id, user_id)
            .then((res) => {
              // handle pause race for user
            })
            .catch((err) => {
              console.log(err)
            });
          break;

        case 'end':
          api.session.group.users.race.end(session?.session_id, group_id, user_id)
            .then((res) => {
              // handle end race for user
            })
            .catch((err) => {
              console.log(err)
            });
          break;
      }
    }
  }, [session?.session_id]);
  const handleReviewLink = () => {
    showToast.error('Feature under development!');
  };

  useLayoutEffect(() => { getActiveSession() }, [getActiveSession]);
  useEffect(() => { getPlans() }, [getPlans])
  useEffect(() => { if (session) setUsers(extractAllUsers(session)) }, [session, extractAllUsers])

  if (loading) return <SessionPageSkeleton />;

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
            {!session?.active && (
              <Button
                variant="contained"
                // color="error"
                onClick={() => navigate('lap-data')}
              >
                Lap Data
              </Button>
            )}
            {!session?.active && (
              <Button
                variant="contained"
                onClick={() => setReviewConfirmation(true)}
              >
                Send Review Link
              </Button>
            )}
            {session?.active && (
              <Button variant="contained" color="error" onClick={() => setOpenEndSession(true)}>
                End Session
              </Button>
            )}
          </Stack>
        </Stack>

        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              {session?.start_time && <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Start Time
                </Typography>
                <Typography variant="body1">
                  {new Date(session?.start_time).toLocaleString()}
                </Typography>
              </Stack>}

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

        {session?.active && (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h6">Groups</Typography>
              {session.active && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={() => setOpenNewGroup(true)}
                >
                  New Group
                </Button>
              )}
            </Stack>

            {session?.groups?.length === 0 ? (
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 2 }}>
                  No groups created yet
                </Typography>
                {session.active && (
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    onClick={() => setOpenNewGroup(true)}
                  >
                    Create First Group
                  </Button>
                )}
              </Card>
            ) : (
              <Grid container spacing={3}>
                {session?.groups
                  .map((group: Group) => (
                    <Grid key={group.group_id} item xs={12} md={6} lg={4}>
                      <GroupCard
                        group={group}
                        carts={carts}
                        getCarts={getCarts}
                        plans={plans}
                        handleAssignCart={handleAssignCart}
                        handleRemoveUser={handleRemoveUser}
                        handleDeleteGroup={handleDeleteGroup}
                        handleAddUsers={handleAddUsers}
                        handleUpdateUser={handleUpdateUser}
                        handleManageUserRace={handleManageUserRace}
                        sessionId={session.session_id}
                        users={users}
                      />
                    </Grid>
                  ))}
              </Grid>
            )}
          </>
        )}
        {!session?.active && !!session?.session_id && <LiveLeaderboard session_id={session?.session_id} />}
      </Box>

      <CreateGroupDialog
        open={openNewGroup}
        loading={false}
        onClose={() => setOpenNewGroup(false)}
        onSubmit={handleCreateGroup}
      />

      <ConfirmDialog
        open={openEndSession}
        title="End Session"
        content="Are you sure you want to end this session? This action cannot be undone."
        confirmText="End Session"
        confirmColor="error"
        loading={loading}
        onClose={() => setOpenEndSession(false)}
        onConfirm={handleEndSession}
      />

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
