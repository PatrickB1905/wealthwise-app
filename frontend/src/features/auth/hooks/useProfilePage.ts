import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import API from '@shared/lib/axios';
import { getErrorMessage } from '@shared/lib/http';
import { useAuth } from '@features/auth';

import { PROFILE_ENDPOINTS, PROFILE_QUERY_KEY } from '../constants';
import type { BannerMsg, Profile } from '../types/profile';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function initialsFromName(firstName?: string, lastName?: string): string {
  const a = (firstName ?? '').trim();
  const b = (lastName ?? '').trim();
  const i1 = a ? a[0].toUpperCase() : '';
  const i2 = b ? b[0].toUpperCase() : '';
  const out = `${i1}${i2}`.trim();
  return out || 'U';
}

function computeUpdatedLabel(updatedAtMs?: number): string {
  const ms = updatedAtMs;
  if (!ms) return '—';
  const sec = Math.max(0, (Date.now() - ms) / 1000);
  if (sec < 60) return `${Math.round(sec)}s ago`;
  const mins = Math.round(sec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (!email) return false;
  return email.includes('@') && email.includes('.');
}

export function useProfilePage() {
  const { logout } = useAuth();

  const profileQuery = useQuery<Profile, Error>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => API.get<Profile>(PROFILE_ENDPOINTS.me).then((r) => r.data),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState<BannerMsg | null>(null);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<BannerMsg | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const profile = profileQuery.data;
  const profileEmail = profile?.email;

  useEffect(() => {
    if (!profileEmail) return;
    setNewEmail(profileEmail);
  }, [profileEmail]);

  const updateEmail = useMutation<{ email: string }, Error, { email: string }>({
    mutationFn: async (vars) => {
      const res = await API.put<{ email: string }>(PROFILE_ENDPOINTS.updateEmail, vars);
      return res.data;
    },
    onSuccess: (data) => {
      setEmailMsg({ type: 'success', text: `Email updated to ${data.email}` });
      profileQuery.refetch();
    },
    onError: (err: unknown) => {
      setEmailMsg({ type: 'error', text: getErrorMessage(err, 'Email update failed') });
    },
  });

  const changePassword = useMutation<void, Error, { currentPassword: string; newPassword: string }>(
    {
      mutationFn: async (vars) => {
        await API.put(PROFILE_ENDPOINTS.changePassword, vars);
      },
      onSuccess: () => {
        setPwdMsg({ type: 'success', text: 'Password updated' });
        setCurrentPwd('');
        setNewPwd('');
      },
      onError: (err: unknown) => {
        setPwdMsg({ type: 'error', text: getErrorMessage(err, 'Password change failed') });
      },
    },
  );

  const deleteAccount = useMutation<void, Error>({
    mutationFn: async () => {
      await API.delete(PROFILE_ENDPOINTS.deleteAccount);
    },
    onSuccess: () => logout(),
    onError: (err: unknown) => setDeleteError(getErrorMessage(err, 'Failed to delete account')),
  });

  const firstName = profile?.firstName ?? '';
  const lastName = profile?.lastName ?? '';
  const createdAt = profile?.createdAt ?? '';

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);
  const memberSince = useMemo(() => formatDateTime(createdAt), [createdAt]);
  const updatedLabel = useMemo(
    () => computeUpdatedLabel(profileQuery.dataUpdatedAt),
    [profileQuery.dataUpdatedAt],
  );

  const canSubmitEmail = useMemo(() => isValidEmail(newEmail), [newEmail]);
  const canSubmitPwd = useMemo(() => {
    if (!currentPwd.trim() || !newPwd.trim()) return false;
    return newPwd.trim().length >= 8;
  }, [currentPwd, newPwd]);

  const refresh = () => profileQuery.refetch();

  const submitEmailUpdate = () => {
    setEmailMsg(null);
    updateEmail.mutate({ email: newEmail.trim() });
  };

  const submitPasswordChange = () => {
    setPwdMsg(null);
    changePassword.mutate({ currentPassword: currentPwd, newPassword: newPwd });
  };

  const openDeleteDialog = () => setDeleteOpen(true);
  const closeDeleteDialog = () => setDeleteOpen(false);

  const confirmDelete = () => {
    setDeleteError('');
    deleteAccount.mutate();
  };

  return {
    // Query
    profileQuery,
    profile,

    // Derived
    fullName,
    memberSince,
    updatedLabel,

    // Email
    newEmail,
    setNewEmail,
    emailMsg,
    setEmailMsg,
    canSubmitEmail,
    submitEmailUpdate,
    updateEmail,

    // Password
    currentPwd,
    setCurrentPwd,
    newPwd,
    setNewPwd,
    pwdMsg,
    setPwdMsg,
    canSubmitPwd,
    submitPasswordChange,
    changePassword,

    // Delete
    deleteOpen,
    deleteError,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    deleteAccount,

    // Actions
    refresh,

    // Helpers
    initialsFromName,
  };
}

export type UseProfilePageReturn = ReturnType<typeof useProfilePage>;
