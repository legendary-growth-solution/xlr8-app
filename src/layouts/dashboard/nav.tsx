import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { varAlpha } from 'src/theme/styles';
import logo from 'public/assets/logo/logo.jpg'
import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/hooks/use-auth';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: {
    path: string;
    title: string;
    icon: React.ReactNode;
    info?: React.ReactNode;
    children?: {
      path: string;
      title: string;
      icon?: React.ReactNode;
    }[];
  }[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        bgcolor: 'var(--layout-nav-bg)',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          bgcolor: 'var(--layout-nav-bg)',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots}/>
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, sx }: NavContentProps) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { logout } = useAuth();
  const router = useRouter();

  const handleSubmenuClick = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  const handleItemClick = async (item: any) => {
    if (item.title === 'Logout') {
      try {
        await logout();
        router.push('/auth');
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <img src='/public/assets/logo/logo.jpg' alt='logo' />

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box component="nav" display="flex" flex="1 1 auto" flexDirection="column" sx={sx}>
          <Box component="ul" gap={0.5} display="flex" flexDirection="column">
            {data.map((item) => {
              const isActived = item.path === pathname;
              const hasChildren = item.children && item.children.length > 0;
              const isSubmenuOpen = openSubmenu === item.title;
              const isLogout = item.title === 'Logout';

              return (
                <Box key={item.title}>
                  <ListItem disableGutters disablePadding>
                    <ListItemButton
                      disableGutters
                      component={hasChildren || isLogout ? 'div' : RouterLink}
                      href={hasChildren || isLogout ? undefined : item.path}
                      onClick={isLogout 
                        ? () => handleItemClick(item) 
                        : hasChildren 
                        ? () => handleSubmenuClick(item.title) 
                        : undefined}
                      sx={{
                        pl: 2,
                        py: 1,
                        gap: 2,
                        pr: 1.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                        fontWeight: 'fontWeightMedium',
                        color: isLogout ? 'error.main' : 'var(--layout-nav-item-color)',
                        minHeight: 'var(--layout-nav-item-height)',
                        ...(isActived && {
                          fontWeight: 'fontWeightSemiBold',
                          bgcolor: 'var(--layout-nav-item-active-bg)',
                          color: 'var(--layout-nav-item-active-color)',
                          '&:hover': {
                            bgcolor: 'var(--layout-nav-item-hover-bg)',
                          },
                        }),
                      }}
                    >
                      <Box component="span" sx={{ width: 24, height: 24 }}>
                        {item.icon}
                      </Box>

                      <Box component="span" flexGrow={1}>
                        {item.title}
                      </Box>

                      {hasChildren && (
                        <Iconify
                          width={16}
                          icon={isSubmenuOpen ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
                        />
                      )}

                      {item.info && item.info}
                    </ListItemButton>
                  </ListItem>

                  {hasChildren && isSubmenuOpen && (
                    <Box pl={4} sx={{ my: 1 }}>
                      {item.children?.map((child) => (
                        <ListItem key={child.title} sx={{ my: 0.5 }} disableGutters disablePadding>
                          <ListItemButton
                            disableGutters
                            component={RouterLink}
                            href={child.path}
                            sx={{
                              pl: 2,
                              py: 1,
                              gap: 2,
                              pr: 1.5,
                              borderRadius: 0.75,
                              typography: 'body2',
                              fontWeight: 'fontWeightMedium',
                              color: 'var(--layout-nav-item-color)',
                              minHeight: 'var(--layout-nav-item-height)',
                              ...(pathname === child.path && {
                                fontWeight: 'fontWeightSemiBold',
                                bgcolor: 'var(--layout-nav-item-active-bg)',
                                color: 'var(--layout-nav-item-active-color)',
                                '&:hover': {
                                  bgcolor: 'var(--layout-nav-item-hover-bg)',
                                },
                              }),
                            }}
                          >
                            {child.icon && (
                              <Box component="span" sx={{ width: 24, height: 24 }}>
                                {child.icon}
                              </Box>
                            )}
                            <Box component="span" flexGrow={1}>
                              {child.title}
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}
