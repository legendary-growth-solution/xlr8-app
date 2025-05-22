import { Badge, Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { Iconify } from 'src/components/iconify';
import { CreateGroupDialog } from 'src/components/session/create-group-dialog';
import { GroupCard } from 'src/components/session/group-card';
import { SessionPageSkeleton } from 'src/components/skeleton/SessionPageSkeleton';
import Toast, { showToast } from 'src/components/toast';
import {
  Cart,
  Group,
  NewUser,
  Plan,
  Session,
  UpdatingUser,
  User,
  UserRaceStatus,
} from 'src/types/session';
import { api } from 'src/api/api';
import axios from 'axios';
import { apiEndpoints } from 'src/api/apiEndpoints';
import LiveLeaderboard from './live-leaderboard';

interface CartAssignment {
  group_id: string;
  user_id: string;
  cart_id: string;
  timestamp: number;
}

export default function SessionActivePage() {
  const [reviewConfirmation, setReviewConfirmation] = useState<boolean>(false);
  const [openEndSession, setOpenEndSession] = useState<boolean>(false);
  const [openNewGroup, setOpenNewGroup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [createGroupLoading, setCreateGroupLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [session, setSession] = useState<Session>();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isSessionEnding, setIsSessionEnding] = useState<boolean>(false);
  const navigate = useNavigate();


  const pendingCartAssignments = useRef<Record<string, string>>({});
  const confirmedAssignments = useRef<Record<string, CartAssignment>>({});
  const lastPollingTime = useRef<number>(0);
  const releasedCarts = useRef<Record<string, boolean>>({});

  const getActiveSession = useCallback(() => {
    setLoading(true);
    api.session
      .getActiveSession()
      .then((res: any) => {
        if (!res?.active) {
          showToast.error('Session is not active');
          return;
        }
        setSession(res);
      })
      .catch((err) => {
        showToast.error(err?.response?.data?.error || 'Failed to get active session');
        navigate('/');
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const extractAllUsers = useCallback(
    (session1: Session): User[] => session1?.groups?.flatMap((group) => group?.users || []) || [],
    []
  );

  const getCarts = useCallback(() => {
    api.cart.getCarts()
      .then((res) => {
        const processedCarts = res.carts.map((cart: Cart) => {
          const isAssignedLocally = Object.values(confirmedAssignments.current).some(
            (assignment) => assignment.cart_id === cart.cart_id
          );

          const isReleased = releasedCarts.current[cart.cart_id];

          return {
            ...cart,
            is_assigned: isReleased ? false : isAssignedLocally || cart.is_assigned,
          };
        });

        setCarts(processedCarts);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const getPlans = useCallback(() => {
    api.plan.getPlans()
      .then((res) => {
        setPlans(res?.plans);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const refreshSession = useCallback(() => {
    axios
      .get(apiEndpoints.session.activeSession)
      .then((res: any) => {
        setSession(res?.data);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }, []);

  const handleEndSession = useCallback(() => {
    if (session?.session_id) {
      setIsSessionEnding(true);
      api.session
        .endSession(session?.session_id)
        .then((res) => {
          // refreshSession();
          navigate(`/sessions/${session?.session_id}`);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setIsSessionEnding(false);
        });
    }
  }, [session?.session_id, navigate]);

  const handleAssignCart = useCallback(
    (group_id: string, user_id: string, cart_id: string) => {
      if (!session?.session_id) return;

      const currentCartId =
        session.groups
          .find((g) => g.group_id === group_id)
          ?.users.find((u) => u.user_id === user_id)?.cart_id ?? null;

      if (currentCartId === cart_id) return;

      const userKey = `${group_id}:${user_id}`;

      pendingCartAssignments.current[userKey] = cart_id;

      if (currentCartId) {
        releasedCarts.current[currentCartId] = true;

        Object.keys(confirmedAssignments.current).forEach((key) => {
          if (confirmedAssignments.current[key].cart_id === currentCartId) {
            delete confirmedAssignments.current[key];
          }
        });
      }

      confirmedAssignments.current[userKey] = {
        group_id,
        user_id,
        cart_id,
        timestamp: Date.now(),
      };

      setSession((prevSession) => {
        if (!prevSession) return prevSession;

        const updatedSession = JSON.parse(JSON.stringify(prevSession)) as Session;

        updatedSession.groups.forEach((group) => {
          if (group.group_id === group_id) {
            group.users.forEach((user) => {
              if (user.user_id === user_id) {
                user.cart_id = cart_id;
              }
            });
          }
        });

        return updatedSession;
      });

      setCarts((prevCarts) =>
        prevCarts.map((cart) => {
          if (cart.cart_id === cart_id) {
            return { ...cart, is_assigned: true };
          }

          if (cart.cart_id === currentCartId) {
            const isAssignedToOthers = Object.values(confirmedAssignments.current).some(
              (assignment) =>
                assignment.cart_id === currentCartId &&
                !(assignment.group_id === group_id && assignment.user_id === user_id)
            );

            return { ...cart, is_assigned: isAssignedToOthers };
          }

          return cart;
        })
      );

      api.session.group.users.cart
        .assign(session.session_id, group_id, user_id, { cart_id })
        .then((res) => {
          delete pendingCartAssignments.current[userKey];

          if (currentCartId) {
            setTimeout(() => {
              delete releasedCarts.current[currentCartId];
            }, 5000);
          }

          refreshSession();
          showToast.success('Cart assigned successfully');
        })
        .catch((err) => {
          console.log(err);

          delete pendingCartAssignments.current[userKey];
          delete confirmedAssignments.current[userKey];

          if (currentCartId) {
            delete releasedCarts.current[currentCartId];
          }

          setSession((prevSession) => {
            if (!prevSession) return prevSession;

            const revertedSession = JSON.parse(JSON.stringify(prevSession)) as Session;

            revertedSession.groups.forEach((group) => {
              if (group.group_id === group_id) {
                group.users.forEach((user) => {
                  if (user.user_id === user_id) {
                    user.cart_id = currentCartId;
                  }
                });
              }
            });

            return revertedSession;
          });

          setCarts((prevCarts) =>
            prevCarts.map((cart) => {
              if (cart.cart_id === cart_id) {
                const isAssignedToOthers = Object.values(confirmedAssignments.current).some(
                  (assignment) => assignment.cart_id === cart_id
                );

                return { ...cart, is_assigned: isAssignedToOthers };
              }

              if (cart.cart_id === currentCartId) {
                return { ...cart, is_assigned: true };
              }

              return cart;
            })
          );

          showToast.error('Failed to assign cart');
        });
    },
    [session, refreshSession]
  );

  const handleRemoveUser = useCallback(
    (group_id: string, user_id: string) => {
      if (session?.session_id) {
        api.session.group.users
          .delete(session?.session_id, group_id, user_id)
          .then((res) => {
            setSession((prevSession) => {
              if (!prevSession) return prevSession;
              return {
                ...prevSession,
                groups: prevSession.groups.map((group) => {
                  if (group.group_id === group_id) {
                    return {
                      ...group,
                      users: group.users.filter((user) => user.user_id !== user_id),
                    };
                  }
                  return group;
                }),
              };
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    [session?.session_id]
  );

  const handleCreateGroup = useCallback(
    (name: string) => {
      if (session?.session_id) {
        setCreateGroupLoading(true);
        api.session.group
          .create(session?.session_id, {
            name,
          })
          .then((res) => {
            const groupWithUsers = {
              ...res.group,
              users: [],
            };
            setSession((prev) => ({
              ...prev!,
              groups: [...(prev?.groups || []), groupWithUsers],
            }));
            setOpenNewGroup(false);
            showToast.success('Group created successfully');
          })
          .catch((err) => {
            console.error('Error creating group:', err);
            showToast.error(err?.response?.data?.error || 'Failed to create group');
          })
          .finally(() => {
            setCreateGroupLoading(false);
          });
      }
    },
    [session?.session_id]
  );

  const handleDeleteGroup = useCallback(
    (group_id: string) => {
      if (session?.session_id) {
        api.session.group
          .delete(session?.session_id, group_id)
          .then((res) => {
            setSession((prev) => ({
              ...prev!,
              groups: prev!.groups.filter((g) => g.group_id !== group_id),
            }));
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    [session?.session_id]
  );

  const handleAddUsers = useCallback(
    (group_id: string, data: NewUser[], onComplete?: () => void) => {
      if (session?.session_id) {
        return api.session.group.users
          .create(session?.session_id, group_id, data)
          .then((res) => {
            refreshSession();
            return res;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          })
          .finally(() => {
            if (onComplete) onComplete();
          });
      }
      return Promise.reject(new Error('No active session'));
    },
    [session?.session_id, refreshSession]
  );

  const handleUpdateUser = useCallback(
    (group_id: string, user_id: string, data: UpdatingUser) => {
      if (session?.session_id) {
        api.session.group.users
          .update(session?.session_id, group_id, user_id, data)
          .then((res) => {
            setSession((prevSession) => {
              if (!prevSession) return prevSession;

              return {
                ...prevSession,
                groups: prevSession.groups.map((group) => {
                  if (group.group_id === group_id) {
                    return {
                      ...group,
                      users: group.users.map((user) => {
                        if (user.user_id === user_id) {
                          return {
                            ...user,
                            ...data,
                          };
                        }
                        return user;
                      }),
                    };
                  }
                  return group;
                }),
              };
            });
            showToast.success('User updated successfully');
          })
          .catch((err) => {
            console.log(err);
            showToast.error('Failed to update user');
          });
      }
    },
    [session?.session_id]
  );

  const handleManageUserRace = useCallback(
    (group_id: string, user_id: string, status: UserRaceStatus, updates?: any) => {
      if (!session?.session_id) return Promise.reject(new Error('No active session'));

      return new Promise((resolve, reject) => {
        switch (status) {
          case 'start':
            api.session.group.users.race
              .start(session?.session_id, group_id, user_id)
              .then((res) => {
                setSession((prevSession) => {
                  if (!prevSession) return prevSession;

                  const updatedSession = JSON.parse(JSON.stringify(prevSession)) as Session;

                  updatedSession.groups.forEach((group) => {
                    if (group.group_id === group_id) {
                      group.users.forEach((user) => {
                        if (user.user_id === user_id) {
                          user.race_active = true;
                          user.race_end_time = res.race_end_time;
                          user.total_remaining_seconds = res.total_remaining_seconds;
                        }
                      });
                    }
                  });

                  return updatedSession;
                });
                showToast.success('Race started successfully');
                resolve(res);
              })
              .catch((err) => {
                console.log(err);
                showToast.error(err?.response?.data?.error || 'Failed to start race');
                reject(err);
              });
            break;

          case 'pause':
            api.session.group.users.race
              .pause(session?.session_id, group_id, user_id)
              .then((res) => {
                setSession((prevSession) => {
                  if (!prevSession) return prevSession;

                  const updatedSession = JSON.parse(JSON.stringify(prevSession)) as Session;

                  updatedSession.groups.forEach((group) => {
                    if (group.group_id === group_id) {
                      group.users.forEach((user) => {
                        if (user.user_id === user_id) {
                          user.race_active = false;
                          user.race_end_time = '';
                          user.total_remaining_seconds = res.total_remaining_seconds;
                        }
                      });
                    }
                  });

                  return updatedSession;
                });

                showToast.success('Race paused successfully');
                resolve(res);
              })
              .catch((err) => {
                console.log(err);
                showToast.error(err?.response?.data?.error || 'Failed to pause race');
                reject(err);
              });
            break;

          case 'update':
            // Handle local update without API call
            if (updates) {
              setSession((prevSession) => {
                if (!prevSession) return prevSession;

                const updatedSession = JSON.parse(JSON.stringify(prevSession)) as Session;

                updatedSession.groups.forEach((group) => {
                  if (group.group_id === group_id) {
                    group.users.forEach((user) => {
                      if (user.user_id === user_id) {
                        // Apply all updates to the user object
                        Object.assign(user, updates);
                      }
                    });
                  }
                });

                return updatedSession;
              });
              resolve({ success: true });
            } else {
              reject(new Error('No updates provided'));
            }
            break;

          default:
            reject(new Error('Invalid status'));
            break;
        }
      });
    },
    [session]
  );

  const handleReviewLink = () => {
    showToast.error('Feature under development!');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        setOpenNewGroup(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    getActiveSession();
  }, [getActiveSession]);
  useEffect(() => {
    getPlans();
  }, [getPlans]);
  useEffect(() => {
    getCarts();
  }, [getCarts]);
  useEffect(() => {
    if (session) setUsers(extractAllUsers(session));
  }, [session, extractAllUsers]);

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
            <Typography variant="h4">{session?.name}</Typography>
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
              <Button variant="contained" onClick={() => setReviewConfirmation(true)}>
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
            <Grid item xs={12} md={6}>
              {session?.start_time && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Start Time
                  </Typography>
                  <Typography variant="body1">
                    {new Date(session?.start_time).toLocaleString()}
                  </Typography>
                </Stack>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {session?.end_time && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    End Time
                  </Typography>
                  <Typography variant="body1">
                    {new Date(session?.end_time).toLocaleString()}
                  </Typography>
                </Stack>
              )}
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
                  <Typography variant="caption" sx={{ ml: 1, opacity: 0.72 }}>
                    (⌘G/Ctrl+G)
                  </Typography>
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
                  ?.filter((group) => group?.group_id)
                  ?.map((group: Group) => (
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
        {!session?.active && !!session?.session_id && (
          <LiveLeaderboard session_id={session?.session_id} />
        )}
      </Box>

      <CreateGroupDialog
        open={openNewGroup}
        loading={createGroupLoading}
        onClose={() => setOpenNewGroup(false)}
        onSubmit={handleCreateGroup}
      />

      <ConfirmDialog
        open={openEndSession}
        title="End Session"
        content="Are you sure you want to end this session? This action cannot be undone."
        confirmText="End Session"
        confirmColor="error"
        loading={isSessionEnding}
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
