import React from 'react';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import {
  NewsAgeChip,
  NewsArticleItem,
  NewsArticleRightMeta,
  NewsArticleTitle,
  NewsArticlesList,
  NewsDotSeparator,
  NewsMetaSpacer,
  NewsOpenIconBoxMobile,
  NewsOpenLinkDesktop,
} from '@shared/ui';

import type { Article } from '../types/news';
import { ageLabel, formatDate } from '../types/news';

type Props = {
  articles: Article[];
  dimmed?: boolean;
};

export default function NewsArticles({ articles, dimmed }: Props) {
  return (
    <NewsArticlesList disablePadding>
      {articles.map((a, i) => {
        const age = ageLabel(a.publishedAt);
        return (
          <React.Fragment key={`${a.url}_${i}`}>
            <NewsArticleItem
              component="a"
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              dimmed={Boolean(dimmed)}
            >
              <Stack spacing={0.75} sx={{ width: '100%' }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  justifyContent="space-between"
                  sx={{ width: '100%' }}
                >
                  <NewsArticleTitle variant="subtitle1">{a.title}</NewsArticleTitle>

                  <NewsArticleRightMeta>
                    {age ? <NewsAgeChip label={age} size="small" variant="outlined" /> : null}

                    <NewsOpenIconBoxMobile aria-hidden="true">
                      <OpenInNewRoundedIcon fontSize="small" />
                    </NewsOpenIconBoxMobile>
                  </NewsArticleRightMeta>
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 0.25, sm: 1 }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ minWidth: 0 }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>
                    {a.source}
                  </Typography>

                  <NewsDotSeparator>
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                  </NewsDotSeparator>

                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {formatDate(a.publishedAt)}
                  </Typography>

                  <NewsMetaSpacer />

                  <NewsOpenLinkDesktop component="span" underline="hover" color="text.secondary">
                    Open <OpenInNewRoundedIcon fontSize="small" />
                  </NewsOpenLinkDesktop>
                </Stack>
              </Stack>
            </NewsArticleItem>

            {i < articles.length - 1 ? <Divider component="li" /> : null}
          </React.Fragment>
        );
      })}
    </NewsArticlesList>
  );
}
