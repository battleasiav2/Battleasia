import type { ReactNode } from 'react';

import {

  Box,

  Stack,

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogTitle,

  Grid2 as Grid,

  IconButton,

  Typography,

} from '@mui/material';

import { alpha } from '@mui/material/styles';



import { fDateTime } from 'src/utils/format-time';



import { useTranslate } from 'src/locales/use-locales';



import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';

import CoinValue from 'src/components/coin-value';

import { Iconify } from 'src/components/iconify';

import { Scrollbar } from 'src/components/scrollbar';



import {

  USER_COLORS,

  userGlassDialogPaperSx,

  userGoldButtonSx,

  userGhostButtonSx, goldAlpha } from 'src/layouts/user';



import type { IMatch } from '../match-types';

import { isMatchJoinableByCapacity } from '../match-capacity-utils';

import {

  JoinArenaCard,

  joinArenaBalanceCoinTextSx,

  joinArenaCoinTextSx,

  joinArenaLabelSx,

} from './join-dialog-arena-card';

import { MatchSpotsProgress } from './match-spots-progress';



// ----------------------------------------------------------------------



type MatchJoinDialogProps = {

  match: IMatch | null;

  balance: number;

  joining: boolean;

  onClose: () => void;

  onConfirm: () => void;

};



type DetailRow = {

  label: string;

  value: string;

};



function DetailGrid({ rows }: { rows: DetailRow[] }) {

  return (

    <Grid container spacing={1.25}>

      {rows.map((row) => (

        <Grid key={row.label} size={{ xs: 6 }}>

          <Typography sx={{ ...joinArenaLabelSx, fontSize: 10, color: alpha('#ffffff', 0.55), mb: 0.35 }}>

            {row.label}

          </Typography>

          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#ffffff', lineHeight: 1.35 }}>

            {row.value}

          </Typography>

        </Grid>

      ))}

    </Grid>

  );

}



function ArenaMetricRow({

  label,

  value,

}: {

  label: string;

  value: ReactNode;

}) {

  return (

    <JoinArenaCard sx={{ p: 1.5, pt: 1.75 }}>

      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>

        <Typography sx={joinArenaLabelSx}>{label}</Typography>

        {value}

      </Stack>

    </JoinArenaCard>

  );

}



export function MatchJoinDialog({

  match,

  balance,

  joining,

  onClose,

  onConfirm,

}: MatchJoinDialogProps) {

  const { t } = useTranslate();

  const insufficient = (match?.entryFee ?? 0) > balance;

  const isFull = match ? !isMatchJoinableByCapacity(match) : false;



  const detailRows: DetailRow[] = match

    ? [

        { label: t('match.game'), value: match.gameName || '-' },

        {

          label: t('match.schedule'),

          value: match.matchSchedule ? fDateTime(match.matchSchedule, 'DD/MM/YYYY hh:mm a') : '-',

        },

        { label: t('match.teamType'), value: match.teamType || '-' },

        { label: t('match.map'), value: match.map || '-' },

        { label: t('match.typeLabel'), value: match.matchType || '-' },

      ]

    : [];



  return (

    <Dialog

      open={!!match}

      onClose={onClose}

      maxWidth="sm"

      fullWidth

      scroll="paper"

      PaperProps={{

        sx: {

          ...userGlassDialogPaperSx,

          maxWidth: 480,

          maxHeight: 'calc(100vh - 48px)',

          display: 'flex',

          flexDirection: 'column',

          overflow: 'hidden',

          border: `1px solid ${goldAlpha(0.26)}`,

          backgroundImage: `

            linear-gradient(180deg, ${goldAlpha(0.07)} 0%, transparent 24%),

            linear-gradient(180deg, ${alpha('#0a0a0a', 0.97)} 0%, #050505 100%)

          `,

        },

      }}

    >

      {match ? (

        <>

          <Box

            sx={{

              height: 3,

              flexShrink: 0,

              background: `linear-gradient(90deg, transparent, ${USER_COLORS.gold}, transparent)`,

            }}

          />



          <DialogTitle

            sx={{

              display: 'flex',

              alignItems: 'flex-start',

              justifyContent: 'space-between',

              gap: 1.5,

              px: { xs: 2.5, md: 3 },

              pt: { xs: 2.25, md: 2.75 },

              pb: 1.25,

            }}

          >

            <Box sx={{ minWidth: 0 }}>

              <Typography

                sx={{

                  fontSize: 11,

                  fontWeight: 700,

                  letterSpacing: 1.1,

                  textTransform: 'uppercase',

                  color: goldAlpha(0.9),

                  mb: 0.5,

                }}

              >

                {t('match.secureEntry')}

              </Typography>

              <Typography

                className="font-tr"

                sx={{

                  fontSize: { xs: 18, sm: 22 },

                  fontWeight: 800,

                  textTransform: 'uppercase',

                  color: USER_COLORS.textPrimary,

                  lineHeight: 1.15,

                }}

              >

                {t('match.confirmEntry')}

              </Typography>

              <Typography

                sx={{

                  mt: 0.75,

                  fontSize: 13,

                  color: USER_COLORS.textMuted,

                  lineHeight: 1.5,

                }}

              >

                {t('match.joinMatchFor', { name: match.matchName })}

              </Typography>

            </Box>

            <IconButton

              onClick={onClose}

              sx={{

                color: USER_COLORS.textMuted,

                mt: -0.25,

                mr: -0.25,

                border: `1px solid ${alpha('#ffffff', 0.12)}`,

                borderRadius: `${GLASS_CARD_RADIUS}px`,

              }}

            >

              <Iconify icon="eva:close-fill" width={20} />

            </IconButton>

          </DialogTitle>



          <DialogContent

            dividers

            sx={{

              px: { xs: 2.5, md: 3 },

              py: 2,

              borderColor: alpha('#ffffff', 0.08),

              flex: 1,

              minHeight: 0,

            }}

          >

            <Scrollbar sx={{ maxHeight: { xs: 'calc(100vh - 280px)', sm: 420 } }}>

              <Stack spacing={1.25}>

                {match.map ? (

                  <JoinArenaCard sx={{ p: 0, overflow: 'hidden' }}>

                    <Box sx={{ position: 'relative', height: { xs: 140, sm: 158 } }}>

                      <Box

                        component="img"

                        src={`/assets/images/map/${match.map}.webp`}

                        alt={match.map}

                        sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }}

                      />

                      <Box

                        sx={{

                          position: 'absolute',

                          inset: 0,

                          background: `linear-gradient(180deg, transparent 40%, ${alpha('#000000', 0.88)} 100%)`,

                        }}

                      />

                      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, px: 1.5, py: 1.1 }}>

                        <Typography

                          sx={{

                            fontSize: 10,

                            fontWeight: 700,

                            color: goldAlpha(0.85),

                            textTransform: 'uppercase',

                            letterSpacing: 0.9,

                          }}

                        >

                          {t('match.map')}

                        </Typography>

                        <Typography

                          sx={{ fontSize: 15, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}

                        >

                          {match.map}

                        </Typography>

                      </Box>

                    </Box>

                  </JoinArenaCard>

                ) : null}



                <JoinArenaCard sx={{ p: 1.75, pt: 2 }}>

                  <DetailGrid rows={detailRows} />

                </JoinArenaCard>



                <MatchSpotsProgress

                  variant="featured"

                  participantsCount={match.participantsCount}

                  totalPlayer={match.totalPlayer}

                />



                <Box

                  sx={{

                    display: 'grid',

                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',

                    gap: 1,

                  }}

                >

                  <ArenaMetricRow

                    label={t('match.entryFee')}

                    value={

                      <CoinValue

                        value={match.entryFee ?? 0}

                        size={16}

                        textSx={joinArenaCoinTextSx}

                      />

                    }

                  />

                  <ArenaMetricRow

                    label={t('match.perKill')}

                    value={

                      <CoinValue

                        value={match.perKill ?? 0}

                        size={16}

                        textSx={joinArenaCoinTextSx}

                      />

                    }

                  />

                </Box>



                {match.prizeDescription ? (

                  <JoinArenaCard sx={{ p: 1.75, pt: 2 }}>

                    <Typography sx={{ ...joinArenaLabelSx, fontSize: 10, color: alpha('#ffffff', 0.55), mb: 0.75 }}>

                      {t('match.prize')}

                    </Typography>

                    <Typography sx={{ fontSize: 13, color: '#ffffff', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>

                      {match.prizeDescription}

                    </Typography>

                  </JoinArenaCard>

                ) : null}

              </Stack>

            </Scrollbar>

          </DialogContent>



          <DialogActions

            sx={{

              flexDirection: 'column',

              alignItems: 'stretch',

              gap: 1.25,

              px: { xs: 2.5, md: 3 },

              py: { xs: 2, md: 2.5 },

            }}

          >

            <JoinArenaCard accent={insufficient ? 'error' : 'success'} sx={{ p: 1.5, pt: 1.75 }}>

              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>

                <Typography sx={joinArenaLabelSx}>{t('match.yourBalance')}</Typography>

                <Stack direction="row" alignItems="center" spacing={0.75}>

                  <CoinValue value={balance} size={16} textSx={joinArenaBalanceCoinTextSx} />

                  {insufficient ? (

                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: USER_COLORS.error }}>

                      {t('match.insufficient')}

                    </Typography>

                  ) : null}

                </Stack>

              </Stack>

            </JoinArenaCard>



            <Stack direction="row" spacing={1} justifyContent="flex-end">

              <Button variant="outlined" onClick={onClose} sx={userGhostButtonSx}>

                {t('common.cancel')}

              </Button>

              <Button

                variant="outlined"

                disableElevation

                onClick={onConfirm}

                disabled={joining || insufficient || isFull}

                sx={userGoldButtonSx}

              >

                {joining ? t('match.joining') : isFull ? t('match.matchFull') : t('match.joinMatch')}

              </Button>

            </Stack>

          </DialogActions>

        </>

      ) : null}

    </Dialog>

  );

}


