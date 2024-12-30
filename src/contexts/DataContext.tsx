import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { GroupUserMappingWithUser, User } from 'src/types/session';
import { Cart } from 'src/types/cart';
import { userApi, UserResponse } from 'src/services/api/user.api';
import { cartApi } from 'src/services/api/cart.api';
import { groupApi } from 'src/services/api/group.api';

interface DataContextType {
  users: User[];
  carts: Cart[];
  groupUsers: Record<string, GroupUserMappingWithUser[]>;
  loading: boolean;
  refreshCarts: () => Promise<void>;
  refreshGroupUsers: () => Promise<void>;
  getGroupUsers: (groupId: string) => GroupUserMappingWithUser[];
  activeGroupUsers: GroupUserMappingWithUser[];
  isUserInActiveRace: (userId: string) => boolean;
  availableCarts: Cart[];
  fetchUsers: (params: {page?: number, pageSize?: number, search?: string}) => Promise<any>;
  totalUsers: number;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [groupUsers, setGroupUsers] = useState<Record<string, GroupUserMappingWithUser[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeGroupUsers, setActiveGroupUsers] = useState<any[]>([]);

  const fetchUsers = async ({page = 1, pageSize = 10, search = ''}: {page?: number, pageSize?: number, search?: string}) => {
    try {
      const response = await userApi.list({page, pageSize, search});
      setUsers(response.users);
      setTotalUsers(response.total);
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      return null;
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

  const refreshUsers = useCallback(async ({page = 1, pageSize = 10, search = ''}: {page?: number, pageSize?: number, search?: string}) => {
    const response = await fetchUsers({page, pageSize, search});
    return response;
  }, []);
  const refreshCarts = useMemo(() => fetchCarts, []);
  const refreshGroupUsers = useCallback(async () => {
    try {
      const response = await groupApi.getActiveUsers();
      setActiveGroupUsers(response.users as any);
    } catch (error) {
      console.error('Error refreshing group users:', error);
    }
  }, []);

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
    fetchUsers: refreshUsers, 
    totalUsers,
    refreshCarts,
    refreshGroupUsers,
    getGroupUsers,
    activeGroupUsers,
    isUserInActiveRace,
  }), [users, carts, groupUsers, availableCarts, loading, refreshUsers, refreshCarts, refreshGroupUsers, getGroupUsers, activeGroupUsers, isUserInActiveRace, totalUsers]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useGUCData = (): ReturnType<typeof useContext<DataContextType>> => useContext(DataContext) as DataContextType;
