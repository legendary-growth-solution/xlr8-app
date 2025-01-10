import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cartApi } from 'src/services/api/cart.api';
import { groupApi } from 'src/services/api/group.api';
import { userApi } from 'src/services/api/user.api';
import { Cart } from 'src/types/cart';
import { GroupUserMappingWithUser, User } from 'src/types/session';

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
  fetchUsers: (params: { page?: number; pageSize?: number; search?: string }) => Promise<any>;
  totalUsers: number;
  initGUC: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({
  children,
  defaultInit = false,
}: {
  children: ReactNode;
  defaultInit?: boolean;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [groupUsers, setGroupUsers] = useState<Record<string, GroupUserMappingWithUser[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeGroupUsers, setActiveGroupUsers] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  const fetchUsers = async ({
    page = 1,
    pageSize = 10,
    search = '',
  }: {
    page?: number;
    pageSize?: number;
    search?: string;
  }) => {
    try {
      const response = await userApi.list({ page, pageSize, search });
      setUsers(response.users);
      setTotalUsers(response.pagination.totalItems);
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

  const refreshUsers = useCallback(
    async ({
      page = 1,
      pageSize = 10,
      search = '',
    }: {
      page?: number;
      pageSize?: number;
      search?: string;
    }) => {
      const response = await fetchUsers({ page, pageSize, search });
      return response;
    },
    []
  );
  const refreshCarts = useMemo(() => fetchCarts, []);
  const refreshGroupUsers = useCallback(async () => {
    try {
      const response = await groupApi.getActiveUsers();
      setActiveGroupUsers(response.users as any);
    } catch (error) {
      console.error('Error refreshing group users:', error);
    }
  }, []);

  const getGroupUsers = useMemo(
    () =>
      (groupId: string): GroupUserMappingWithUser[] =>
        activeGroupUsers.filter((gu) => gu.group_id === groupId),
    [activeGroupUsers]
  );

  const isUserInActiveRace = useMemo(
    () =>
      (userId: string): boolean =>
        activeGroupUsers.some((gu) => gu.user_id === userId && gu.race_status === 'in_progress'),
    [activeGroupUsers]
  );

  const availableCarts = useMemo(
    () => carts.filter((cart) => cart.status === 'available'),
    [carts]
  );

  const initGUC = async () => {
    if (initialized) return;

    setLoading(true);
    try {
      const [usersResponse, cartsResponse, activeUsersResponse] = await Promise.all([
        userApi.list({}),
        cartApi.list({}),
        groupApi.getActiveUsers(),
      ]);

      setUsers(usersResponse.users);
      setCarts(cartsResponse.carts);
      setActiveGroupUsers(activeUsersResponse.users);
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (defaultInit) {
      initGUC();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultInit]);

  const value = useMemo(
    () => ({
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
      initGUC,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
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
      isUserInActiveRace,
      totalUsers,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useGUCData = (defaultInit = false): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useGUCData must be used within a DataProvider');
  }

  useEffect(() => {
    if (defaultInit) {
      context.initGUC();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultInit]);

  return context;
};
