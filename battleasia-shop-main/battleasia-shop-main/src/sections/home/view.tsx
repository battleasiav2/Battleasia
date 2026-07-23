

import { Box, Grid, Stack, Button, SvgIcon, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';

import { useImagePreloader } from 'src/hooks';

// ----------------------------------------------------------------------

const HOME_IMAGE_PATHS = {
  banner: '/assets/images/banner.webp',
  sBg: '/assets/images/s-bg.webp',
  gsBg: '/assets/images/gs-bg.webp',
  gsTop: '/assets/images/gs-top.webp',
  spr: '/assets/images/spr.webp',
  gameUiBg: '/assets/images/game-ui-bg.webp',
  blackBg: '/assets/images/black_bg.webp',
  dealer: '/assets/images/dealer.webp',
} as const;

// ----------------------------------------------------------------------
const imagePaths = [HOME_IMAGE_PATHS.banner];

export function HomeView() {

  useImagePreloader(imagePaths, {
    delay: 100,
    continueOnError: true,
  });

  const FAQ = [
    {
      question: "No Hacks or Emulators",
      answer: "Using cheats, hacks, or unauthorized tools will result in a permanent ban. Emulators are only allowed if specifically permitted for a tournament."
    },
    {
      question: "Match Join Time",
      answer: "Room ID & Password will be shared 10–15 minutes before the match starts in the app or Telegram group."
    },
    {
      question: "Name Must Match",
      answer: "Your PUBG username must match exactly with the name you entered during registration."
    },
    {
      question: "Kill & Prize Claims",
      answer: "Kills and ranks will be verified via official match result screenshots. Always verify your results before leaving the match."
    },
    {
      question: "No Teaming",
      answer: "Teaming with enemy squads is strictly prohibited and will result in immediate disqualification."
    },
    {
      question: "Payment Rules",
      answer: "All entry fees must be paid before match time. No refunds will be issued after the match starts."
    },
    {
      question: "Disconnect = No Refund",
      answer: "We're not responsible for disconnections, lag, or game glitches. No refunds will be provided for such issues."
    },
    {
      question: "Abusive Behaviour = Ban",
      answer: "Respect other players and staff. Abusive language in voice or chat will result in a permanent ban."
    },
    {
      question: "Prize Distribution",
      answer: "Prize money will be paid within 24 hours to your provided payment method after verification."
    },
    {
      question: "Final Decision",
      answer: "All decisions taken by BattleAsia admins will be final and are not subject to appeal."
    },
  ];

  const sectionSlide = (
    <Box id="home" sx={{
      scrollMarginTop: { xs: '80px', md: '100px' },
      height: { xs: 500, sm: 892 },
      backgroundImage: `url(${HOME_IMAGE_PATHS.banner})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center top',
      backgroundSize: "cover",
      position: 'relative',
    }}>
      {/* Text overlay in the red part of the image */}
      <Stack sx={{
        position: 'absolute',
        top: '30%',
        right: '7%',
        maxWidth: { xs: 300, sm: '500px' },
        zIndex: 2,
      }}>
        <Typography
          className='font-tr'
          sx={{
            fontSize: { xs: 32, md: 48, lg: 58 },
            fontWeight: 'bold',
            color: '#ffffff',
            lineHeight: 1.1,
            mb: 2,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          It&apos;s all about Gaming means BattleAsia
        </Typography>
        <Typography
          className='font-tr'
          sx={{
            fontSize: { xs: 20, md: 28 },
            color: '#ffffff',
            lineHeight: 1,
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
          }}
        >
          Win real cash via playing MOBILE tournaments for free. Get it now!
        </Typography>
      </Stack>

      <Stack sx={{
        width: 1,
        top: { xs: "70%", md: 630 },
        position: 'absolute',
        alignItems: 'center',
      }} >
        <Button sx={{
          display: 'inline-block',
          width: { xs: 86, md: 304 },
          height: 91,
          margin: "0 3px",
          backgroundPosition: "-330px 0",
          backgroundImage: `url(${HOME_IMAGE_PATHS.spr})`,
        }} />
      </Stack>
    </Box>
  );

  const sectionAbout = (
    <Box id="about-us" sx={{
      scrollMarginTop: { xs: '80px', md: '100px' },
      height: { xs: "29rem", sm: 890 },
      background: { xs: `url(${HOME_IMAGE_PATHS.sBg})`, md: `url(${HOME_IMAGE_PATHS.gsBg})` },
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center top !important;",
      position: "relative",
      marginTop: "-25px",
      paddingTop: "37px",
      "::before": {
        content: "''",
        display: "block",
        width: 1,
        height: 65,
        position: "absolute",
        left: 0,
        top: "-65px",
        background: `url(${HOME_IMAGE_PATHS.gsTop})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center bottom",
      },
    }}>
      <Stack sx={{
        width: { xs: 1, lg: 1129 },
        height: { xs: 1, lg: 805 },
        margin: "0 auto",
        px: 5,
        py: { xs: 0, sm: 5 },
        textAlign: "center",
        alignItems: "center",
      }} >
        <Stack sx={{ alignItems: "center", mb: { xs: 2, md: 6 } }}>
          <Typography
            variant='h2'
            className='font-tr'
            sx={{
              fontSize: { xs: 32, md: 48 },
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            ABOUT BATTLEASIA
          </Typography>
          <Box
            sx={{
              width: 200,
              height: 2,
              background: "linear-gradient(90deg, #5a87db 0%, #8b5cf6 100%)",
              borderRadius: 1,
            }}
          />
        </Stack>

        {/* Content Section */}
        <Grid container spacing={{ xs: 2, sm: 4 }} sx={{ zIndex: 2 }} >
          {/* Left Side - Text Content */}
          <Grid item xs={12} md={7}>
            <Stack spacing={{ xs: 0.5, sm: 3 }} sx={{ color: '#ffffff', textAlign: 'left' }}>
              <Typography
                className="font-tr"
                sx={{
                  fontSize: { xs: 14, sm: 24 },
                  lineHeight: { xs: 1, sm: 1.8 },
                  color: '#000000',
                }}
              >
                BattleAsia is a premier mobile gaming tournament platform where players compete in exciting tournaments and win real cash prizes. Our platform brings together the best mobile gamers from around the world to participate in competitive gaming events.
              </Typography>
              <Typography
                className="font-tr"
                sx={{
                  fontSize: { xs: 14, sm: 24 },
                  lineHeight: { xs: 1, sm: 1.8 },
                  color: '#000000',
                }}
              >
                We support popular mobile games including PUBG Mobile, Free Fire, Mobile Legends, and many more. Whether you&apos;re a casual player or a competitive pro, BattleAsia offers tournaments suitable for all skill levels.
              </Typography>
              <Typography
                className="font-tr"
                sx={{
                  fontSize: { xs: 14, sm: 24 },
                  lineHeight: { xs: 1, sm: 1.8 },
                  color: '#000000',
                }}
              >
                With secure payment systems, fair play policies, and a thriving community of gamers, BattleAsia is the ultimate destination for mobile esports. Join thousands of players who are already competing and winning on our platform!
              </Typography>
            </Stack>
          </Grid>

          {/* Right Side - Statistics Grid */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={{ xs: 1, sm: 3 }} justifyContent="center" alignItems="center">
              {[
                { value: "500K+", label: "Active Players" },
                { value: "$2M+", label: "Prize Money" },
                { value: "15+", label: "Games Supported" },
                { value: "24/7", label: "Tournaments" },
              ].map((stat, index) => (
                <Grid item xs={6} sm={3} md={6} key={index}>
                  <Box
                    sx={{
                      position: "relative",
                      height: { xs: 80, sm: 150, md: 200 },
                      borderRadius: 2,
                      background: "rgba(30, 30, 30, 0.8)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      padding: { xs: 1, sm: 3 },
                      overflow: "hidden",
                      "&::before": {
                        content: "''",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `url(${HOME_IMAGE_PATHS.gameUiBg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.1,
                        filter: "blur(2px)",
                        zIndex: 0,
                      }
                    }}
                  >
                    <Typography
                      className="font-tr"
                      sx={{
                        fontSize: { xs: 32, sm: 42 },
                        fontWeight: "bold",
                        color: "#ffffff",
                        mb: { xs: 0, sm: 1 },
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      className="font-tr"
                      sx={{
                        fontSize: 16,
                        color: "#ffffff",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )

  const gameModes = [
    {
      title: 'Solo Mode',
      description: 'Play alone and test your skills against other players',
      iconType: 'svg',
      iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
      iconColor: '#9333ea',
      shadowColor: 'rgba(147, 51, 234, 0.3)',
      hoverShadowColor: 'rgba(147, 51, 234, 0.5)',
      features: [
        { iconPath: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', text: 'Maps: Karakin, Nusa, Erangel, Miramar, Sanhok, Vikendi, Rondo' },
        { iconPath: 'M15.5 12c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5zm-2.5-8c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm-1 15l-5-5 1.41-1.41L12 16.17l4.59-4.58L18 13l-6 6z', text: 'Modes: Classic Matches, TDM, Gun Game' },
        { iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', text: 'Play with random teammates or go fully solo' },
        { iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z', text: 'Your history & stats depend on your own performance' },
      ],
    },
    {
      title: 'Duo Mode',
      description: 'Team up with a partner for double the action',
      iconType: 'dual-svg',
      iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
      iconColor: '#9333ea',
      shadowColor: 'rgba(147, 51, 234, 0.3)',
      hoverShadowColor: 'rgba(147, 51, 234, 0.5)',
      features: [
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: 'Invite a friend or get paired with a random teammate' },
        { iconPath: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z', text: 'Fight for the Chicken Dinner + Cash Rewards' },
        { iconPath: 'M20 12v-1c0-.6-.4-1-1-1h-3V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v4H1c-.6 0-1 .4-1 1v1c0 1.1.9 2 2 2h1v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4h1c1.1 0 2-.9 2-2zm-6 8H6v-4h8v4zm-8-8V6h8v6H6zm14 0h-1v-2c0-.6-.4-1-1-1s-1 .4-1 1v2h-2v-2c0-.6-.4-1-1-1s-1 .4-1 1v2h-2V9c0-.6-.4-1-1-1s-1 .4-1 1v3h3c1.1 0 2 .9 2 2v2h2v-2c0-1.1.9-2 2-2h3z', text: 'Coordinate strategies for maximum effectiveness' },
        { iconPath: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z', text: 'Split earnings with your partner' },
      ],
    },
    {
      title: 'Squad Mode',
      description: 'Form a team of four and dominate the battlefield',
      iconType: 'emoji',
      iconEmoji: '👥',
      iconColor: '#ff8c00',
      shadowColor: 'rgba(255, 140, 0, 0.3)',
      hoverShadowColor: 'rgba(255, 140, 0, 0.5)',
      features: [
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: 'Play with 3 random teammates' },
        { iconPath: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z', text: 'Create unforgettable history together' },
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: 'Teamwork & skills make all the difference' },
        { iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', text: 'Higher rewards for squad victories' },
      ],
    },
    {
      title: 'TDM Mode',
      description: 'Fast-paced Team Deathmatch action',
      iconType: 'svg',
      iconPath: 'M7.05 2.05L5 12h3v7l8-14h-4l2-3z',
      iconColor: '#ff8c00',
      shadowColor: 'rgba(255, 140, 0, 0.3)',
      hoverShadowColor: 'rgba(255, 140, 0, 0.5)',
      features: [
        { iconPath: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z', text: 'Fast-paced 4v4 Team Deathmatch' },
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: 'Play with random teammates' },
        { iconPath: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z', text: 'Win Cash + Victory Joy!' },
        { iconPath: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z', text: 'Quick matches for instant rewards' },
      ],
    },
  ];

  const sectionHowToPlay = (
    <Box id="how-to-play" sx={{
      scrollMarginTop: { xs: '80px', md: '100px' },
      position: 'relative',
      py: { xs: 8, md: 12 },
      mt: { xs: 0, sm: -3 },
      background: `url(${HOME_IMAGE_PATHS.blackBg})`,
      '&::before': {
        content: "''",
        position: 'absolute',
        insetBlockStart: { xs: -24, sm: '-227px' },
        insetInlineEnd: { xs: 0, sm: '20px' },
        width: { xs: 211, md: 582 },
        height: { xs: 303, md: 835 },
        background: `50% / cover url(${HOME_IMAGE_PATHS.dealer}) no-repeat`,
        transition: '.2s ease-in-out',
        zIndex: 1,
      },
    }}>
      <Stack sx={{
        position: 'relative',
        zIndex: 1,
        maxWidth: { xs: 1, md: 1200 },
        margin: '0 auto',
        px: { xs: 2, md: 4 },
      }}>
        {/* Header */}
        <Stack sx={{ alignItems: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
            variant='h2'
            className='font-tr'
            color="primary"
            sx={{
              fontSize: { xs: 36, md: 56 },
              fontWeight: 'bold',
              textAlign: 'center',
              textTransform: 'uppercase',
              mb: 2,
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)',
              position: 'relative',
            }}
          >
            HOW TO PLAY
            <Box
              sx={{
                position: 'absolute',
                bottom: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 120,
                height: 3,
                bgcolor: '#ffffff',
                borderRadius: 1,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
              }}
            />
          </Typography>
        </Stack>

        {/* Game Mode Cards */}
        <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
          {gameModes.map((mode, index) => (
            <Grid item xs={10} md={4} key={index}>
              <Box
                sx={{
                  bgcolor: 'rgba(30, 30, 30, 0.95)',
                  borderRadius: 3,
                  p: { xs: 2, md: 4 },
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px ${mode.shadowColor}`,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 48px rgba(0, 0, 0, 0.6), 0 0 30px ${mode.hoverShadowColor}`,
                  },
                }}
              >
                {/* Icon */}
                <Box sx={{ mb: { xs: 1, sm: 3 }, display: 'flex', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: mode.shadowColor.replace('0.3', '0.2'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${mode.shadowColor.replace('0.3', '0.5')}`,
                      boxShadow: `0 0 20px ${mode.shadowColor.replace('0.3', '0.4')}`,
                      position: mode.iconType === 'dual-svg' ? 'relative' : 'static',
                    }}
                  >
                    {mode.iconType === 'emoji' ? (
                      <Typography sx={{ fontSize: 50 }}>{mode.iconEmoji}</Typography>
                    ) : mode.iconType === 'dual-svg' ? (
                      <>
                        <SvgIcon sx={{ fontSize: 40, color: mode.iconColor, position: 'absolute', left: 8 }}>
                          <path d={mode.iconPath} />
                        </SvgIcon>
                        <SvgIcon sx={{ fontSize: 40, color: mode.iconColor, position: 'absolute', right: 8 }}>
                          <path d={mode.iconPath} />
                        </SvgIcon>
                      </>
                    ) : (
                      <SvgIcon sx={{ fontSize: 50, color: mode.iconColor }}>
                        <path d={mode.iconPath} />
                      </SvgIcon>
                    )}
                  </Box>
                </Box>

                {/* Title */}
                <Typography
                  className='font-tr'
                  sx={{
                    fontSize: { xs: 28, md: 32 },
                    fontWeight: 'bold',
                    color: '#ffffff',
                    mb: { xs: 0, sm: 1.5 },
                  }}
                >
                  {mode.title}
                </Typography>

                {/* Description */}
                <Typography
                  className='font-tr'
                  sx={{
                    fontSize: { xs: 14, md: 16 },
                    color: '#ffffff',
                    mb: { xs: 1, sm: 3 },
                    opacity: 0.9,
                  }}
                >
                  {mode.description}
                </Typography>

                {/* Features */}
                <Stack spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: 'flex-start', textAlign: 'left' }}>
                  {mode.features.map((feature, featureIndex) => (
                    <Stack key={featureIndex} direction="row" spacing={1.5} alignItems="center">
                      <SvgIcon sx={{ fontSize: 20, color: '#b0b0b0', flexShrink: 0 }}>
                        <path d={feature.iconPath} />
                      </SvgIcon>
                      <Typography className='font-tr' sx={{ fontSize: { xs: 13, md: 14 }, color: '#b0b0b0' }}>
                        {feature.text}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );

  const sectionRoules = (
    <Box id="rules" sx={{
      scrollMarginTop: { xs: '80px', md: '100px' },
      bgcolor: '#f8f8f8',
      py: { xs: 6, md: 10 },
    }}>
      <Stack sx={{
        maxWidth: { xs: 1, sm: 980 },
        margin: '0 auto',
        alignItems: 'center',
        mb: 6,
      }}>
        {/* Header with special styling */}
        <Stack sx={{ alignItems: 'center', position: 'relative' }}>
          <Typography
            variant='h2'
            className='font-tr'
            sx={{
              fontSize: { xs: 28, md: 45 },
              fontWeight: 'bold',
              textAlign: 'center',
              textTransform: 'uppercase',
              color: '#1a1a1a',
              mb: 1,
              '& span.textured': {
                background: 'linear-gradient(135deg, #feab02 0%, #ff8c00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              },
            }}
          >
            <Box component="span" className="textured">Tournament Rules</Box>{' '}
            <Box fontSize={22} >
              <Box component="span" style={{ position: 'relative' }}>
                Official BattleAsia Tournament Regulations
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120%',
                    height: 3,
                    bgcolor: '#feab02',
                    borderRadius: 1,
                  }}
                />
              </Box>{' '}
            </Box>
          </Typography>
        </Stack>

        {/* FAQ Accordion */}
        <Box sx={{ width: 1, mt: 4 }}>
          {FAQ.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                boxShadow: 'none',
                border: 'none',
                borderBottom: '1px solid #e0e0e0',
                borderRadius: 0,
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: 0,
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <SvgIcon sx={{ color: '#1a1a1a', fontSize: 24 }}>
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                  </SvgIcon>
                }
                sx={{
                  py: 2,
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                  },
                }}
              >
                <Typography
                  className="font-tr"
                  sx={{
                    fontSize: { xs: 18, md: 24 },
                    fontWeight: 'bold',
                    color: '#1a1a1a',
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pb: 2 }}>
                <Typography
                  className="font-tr"
                  sx={{
                    fontSize: { xs: 14, md: 18 },
                    color: '#666666',
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Stack>
    </Box>
  )


  return (
    <Box>
      {sectionSlide}
      {sectionAbout}
      {sectionHowToPlay}
      {sectionRoules}
    </Box >
  );
}
