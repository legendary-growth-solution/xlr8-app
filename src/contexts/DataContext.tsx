import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { GroupUserMappingWithUser, User } from 'src/types/session';
import { Cart } from 'src/types/cart';
import { userApi } from 'src/services/api/user.api';
import { cartApi } from 'src/services/api/cart.api';
import { groupApi } from 'src/services/api/group.api';

interface DataContextType {
  users: User[];
  carts: Cart[];
  groupUsers: Record<string, GroupUserMappingWithUser[]>;
  loading: boolean;
  refreshUsers: () => Promise<void>;
  refreshCarts: () => Promise<void>;
  refreshGroupUsers: () => Promise<void>;
  getGroupUsers: (groupId: string) => GroupUserMappingWithUser[];
  activeGroupUsers: GroupUserMappingWithUser[];
  refreshActiveGroupUsers: () => Promise<void>;
  isUserInActiveRace: (userId: string) => boolean;
  availableCarts: Cart[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [groupUsers, setGroupUsers] = useState<Record<string, GroupUserMappingWithUser[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeGroupUsers, setActiveGroupUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await userApi.list({});
      setUsers(response.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCarts = async () => {
    try {
      const response = await cartApi.list({});
      setCarts(response.carts);
    } catch (error) {
      console.error('Error fetching carts:', error);
    }
  };

  const fetchGroupUsers = async (groupId: string) => {
    try {
      const response = await groupApi.getUsers(groupId);
      setGroupUsers((prev :any) => ({
        ...prev,
        [groupId]: response.users
      }));
    } catch (error) {
      console.error('Error fetching group users:', error);
    }
  };

  const fetchActiveGroupUsers = async () => {
    try {
      const response = await groupApi.getActiveUsers();
      setActiveGroupUsers(response.users as any);
    } catch (error) {
      console.error('Error fetching active group users:', error);
    }
  };

  const refreshUsers = useMemo(() => fetchUsers, []);
  const refreshCarts = useMemo(() => fetchCarts, []);
  const refreshGroupUsers = useCallback(async () => {
    try {
      const response = await groupApi.getActiveUsers();
      setActiveGroupUsers(response.users as any);
    } catch (error) {
      console.error('Error refreshing group users:', error);
    }
  }, []);
  const refreshActiveGroupUsers = useMemo(() => fetchActiveGroupUsers, []);

  const getGroupUsers = useMemo(() => (groupId: string): GroupUserMappingWithUser[] => activeGroupUsers.filter(gu => gu.group_id === groupId), [activeGroupUsers]);

  const isUserInActiveRace = useMemo(
    () => (userId: string): boolean => 
      activeGroupUsers.some(gu => 
        gu.user_id === userId && 
        gu.race_status === 'in_progress'
      ),
    [activeGroupUsers]
  );

  const availableCarts = useMemo(() => carts.filter(cart => cart.status === 'available'), [carts]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const [usersResponse, cartsResponse, activeUsersResponse] = await Promise.all([
          userApi.list({}),
          cartApi.list({}),
          groupApi.getActiveUsers()
        ]);
        
        setUsers(usersResponse.users);
        setCarts(cartsResponse.carts);
        setActiveGroupUsers(activeUsersResponse.users);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
      setLoading(false);
    };

    initializeData();
  }, []);

  const value = useMemo(() => ({
    users, 
    carts, 
    groupUsers,
    availableCarts,
    loading, 
    refreshUsers, 
    refreshCarts,
    refreshGroupUsers,
    getGroupUsers,
    activeGroupUsers,
    refreshActiveGroupUsers,
    isUserInActiveRace,
  }), [users, carts, groupUsers, availableCarts, loading, refreshUsers, refreshCarts, refreshGroupUsers, getGroupUsers, activeGroupUsers, refreshActiveGroupUsers, isUserInActiveRace]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useGUCData = (): ReturnType<typeof useContext<DataContextType>> => useContext(DataContext) as DataContextType;
