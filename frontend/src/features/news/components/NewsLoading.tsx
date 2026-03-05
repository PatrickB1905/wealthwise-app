import React from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Skeleton from '@mui/material/Skeleton';

import { NewsListItem, PageCard, SectionContent, SectionHeader, StyledContainer } from '@shared/ui';

export default function NewsLoading() {
  return (
    <StyledContainer>
      <PageCard>
        <SectionHeader title="News" subheader="Loading headlines for your portfolio…" />
        <SectionContent>
          <List disablePadding>
            {Array.from({ length: 6 }).map((_, i) => (
              <React.Fragment key={`news_skel_${i}`}>
                <NewsListItem disabled sx={{ py: 2.25 }}>
                  <Skeleton width="92%" height={22} />
                  <Skeleton width="52%" height={18} />
                </NewsListItem>
                {i < 5 ? <Divider /> : null}
              </React.Fragment>
            ))}
          </List>
        </SectionContent>
      </PageCard>
    </StyledContainer>
  );
}
