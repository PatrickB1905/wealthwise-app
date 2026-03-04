import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { SectionEyebrow, SectionWrap } from '@shared/ui/layout/Styled';
import type { FaqItem } from '../types/home';

type Props = {
  faqs: readonly FaqItem[];
};

export function HomeFaqSection({ faqs }: Props) {
  return (
    <>
      <Box id="faq" />
      <SectionWrap maxWidth="lg">
        <Stack spacing={1.2} sx={{ textAlign: 'center', alignItems: 'center' }}>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.03em' }}>
            Quick Answers
          </Typography>
        </Stack>

        <Box sx={{ mt: 2.5, maxWidth: 920, mx: 'auto' }}>
          {faqs.map((f) => (
            <Accordion
              key={f.q}
              disableGutters
              sx={{ borderRadius: 2.5, mb: 1.2, overflow: 'hidden' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 900 }}>{f.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{f.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </SectionWrap>
    </>
  );
}
