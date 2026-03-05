import React from 'react';

import {
  PageCard,
  ProfileContent,
  ProfileTwoColGrid,
  SectionDivider,
  StyledContainer,
} from '@shared/ui/layout/Styled';

import { useProfilePage } from '../hooks/useProfilePage';
import { ProfileLoadingState } from '../components/ProfileLoadingState';
import { ProfileErrorState } from '../components/ProfileErrorState';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileIdentityCardBlock } from '../components/ProfileIdentityCard';
import { ProfileEmailCard } from '../components/ProfileEmailCard';
import { ProfilePasswordCard } from '../components/ProfilePasswordCard';
import { ProfileDangerZone } from '../components/ProfileDangerZone';
import { DeleteAccountDialog } from '../components/DeleteAccountDialog';

const ProfilePage: React.FC = () => {
  const vm = useProfilePage();

  if (vm.profileQuery.isLoading) return <ProfileLoadingState />;

  if (vm.profileQuery.error || !vm.profile) {
    return <ProfileErrorState message={vm.profileQuery.error?.message || 'No profile data'} />;
  }

  const initials = vm.initialsFromName(vm.profile.firstName, vm.profile.lastName);

  return (
    <StyledContainer>
      <PageCard>
        <ProfileHeader initials={initials} updatedLabel={vm.updatedLabel} onRefresh={vm.refresh} />

        <ProfileContent>
          <ProfileIdentityCardBlock
            profile={vm.profile}
            fullName={vm.fullName}
            memberSince={vm.memberSince}
          />

          <ProfileTwoColGrid>
            <ProfileEmailCard
              newEmail={vm.newEmail}
              onNewEmailChange={vm.setNewEmail}
              emailMsg={vm.emailMsg}
              canSubmitEmail={vm.canSubmitEmail}
              isPending={vm.updateEmail.isPending}
              onSubmit={vm.submitEmailUpdate}
              onClearMsg={() => vm.setEmailMsg(null)}
            />

            <ProfilePasswordCard
              currentPwd={vm.currentPwd}
              onCurrentPwdChange={vm.setCurrentPwd}
              newPwd={vm.newPwd}
              onNewPwdChange={vm.setNewPwd}
              pwdMsg={vm.pwdMsg}
              canSubmitPwd={vm.canSubmitPwd}
              isPending={vm.changePassword.isPending}
              onSubmit={vm.submitPasswordChange}
              onClearMsg={() => vm.setPwdMsg(null)}
            />
          </ProfileTwoColGrid>

          <ProfileDangerZone onDeleteClick={vm.openDeleteDialog} />
        </ProfileContent>

        <SectionDivider />
      </PageCard>

      <DeleteAccountDialog
        open={vm.deleteOpen}
        onClose={vm.closeDeleteDialog}
        deleteError={vm.deleteError}
        onConfirm={vm.confirmDelete}
        isPending={vm.deleteAccount.isPending}
        onClearError={() => {}}
      />
    </StyledContainer>
  );
};

export default ProfilePage;
