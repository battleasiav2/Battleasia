import { useRef, useState } from 'react';



import { alpha } from '@mui/material/styles';

import {

  Box,

  Stack,

  Avatar,

  TextField,

  IconButton,

  CircularProgress,

  Typography,

} from '@mui/material';



import useApi from 'src/hooks/use-api';

import { useSelector } from 'src/store';

import { useTranslate } from 'src/locales/use-locales';

import { UserGlassCard, UserActionButton, USER_COLORS, userFieldSx, goldAlpha } from 'src/layouts/user';

import { getImageUrl } from 'src/utils/get-image-url';

import { Iconify } from 'src/components/iconify';

import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { Image } from 'src/components/image';



// ----------------------------------------------------------------------



type FeedComposerProps = {

  onPosted?: () => void;

};



export function FeedComposer({ onPosted }: FeedComposerProps) {

  const { t } = useTranslate();

  const { createFeedPostApi, uploadFileApi } = useApi();

  const { user } = useSelector((state) => state.auth);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);



  const clearImage = () => {

    setImageFile(null);

    setImagePreview((prev) => {

      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);

      return null;

    });

    if (fileInputRef.current) fileInputRef.current.value = '';

  };



  const handleImageSelect = (file: File | null) => {
    if (!file) return;
    setImagePreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setImageFile(file);
  };



  const handleSubmit = async () => {

    const description = content.trim();

    if ((!description && !imageFile) || submitting) return;



    try {

      setSubmitting(true);



      let coverUrl: string | undefined;

      let mediaUrls: string[] | undefined;

      let postType = 'text';



      if (imageFile) {

        const uploadResponse = await uploadFileApi(imageFile, { folder: 'feed' });

        const uploadedUrl = uploadResponse?.data?.data?.url;

        if (!uploadResponse?.data?.status || !uploadedUrl) {

          throw new Error('Image upload failed');

        }

        coverUrl = uploadedUrl;

        mediaUrls = [uploadedUrl];

        postType = 'image';

      }



      const response = await createFeedPostApi({

        description: description || t('feed.imagePostFallback'),

        coverUrl,

        mediaUrls,

        postType,

      });



      if (response?.data?.status) {

        setContent('');

        clearImage();

        onPosted?.();

      }

    } catch (error) {

      console.error('Failed to create post:', error);

    } finally {

      setSubmitting(false);

    }

  };



  return (

    <UserGlassCard>

      <Stack spacing={1.5}>

        <Stack direction="row" alignItems="center" spacing={1}>

          <Iconify icon="solar:pen-new-square-bold" width={18} sx={{ color: USER_COLORS.gold }} />

          <Typography

            sx={{

              fontSize: 12,

              fontWeight: 800,

              letterSpacing: 1.2,

              textTransform: 'uppercase',

              color: USER_COLORS.gold,

            }}

          >

            {t('feed.composePlaceholder').split('...')[0]?.trim() || 'Share update'}

          </Typography>

        </Stack>

        <BattleGoldDivider variant="title" sx={{ opacity: 0.65 }} />



        <Stack direction="row" spacing={2} alignItems="flex-start">

          <Avatar

            src={getImageUrl(user?.avatar)}

            alt={user?.username || 'User'}

            sx={{

              width: 44,

              height: 44,

              border: `1px solid ${goldAlpha(0.35)}`,

              boxShadow: `0 0 16px ${goldAlpha(0.12)}`,

            }}

          />

          <Box sx={{ flex: 1 }}>

            <TextField

              fullWidth

              multiline

              minRows={2}

              placeholder={t('feed.composePlaceholder')}

              value={content}

              onChange={(e) => setContent(e.target.value)}

              sx={userFieldSx}

            />



            {imagePreview ? (

              <Box sx={{ position: 'relative', mt: 1.5, maxWidth: 280 }}>

                <Image

                  alt="Post preview"

                  src={imagePreview}

                  sx={{

                    width: '100%',

                    border: `1px solid ${goldAlpha(0.25)}`,

                    '& img': { objectFit: 'cover', aspectRatio: '1 / 1' },

                  }}

                />

                <IconButton

                  size="small"

                  onClick={clearImage}

                  sx={{

                    position: 'absolute',

                    top: 6,

                    right: 6,

                    bgcolor: alpha('#000000', 0.65),

                    color: '#ffffff',

                    '&:hover': { bgcolor: alpha('#000000', 0.85) },

                  }}

                >

                  <Iconify icon="eva:close-fill" width={16} />

                </IconButton>

              </Box>

            ) : null}



            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>

              <Stack direction="row" alignItems="center" spacing={0.5}>

                <input

                  ref={fileInputRef}

                  type="file"

                  accept="image/*"

                  hidden

                  onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}

                />

                <IconButton

                  onClick={() => fileInputRef.current?.click()}

                  sx={{

                    color: USER_COLORS.gold,

                    border: `1px solid ${goldAlpha(0.25)}`,

                    borderRadius: 0,

                    '&:hover': { bgcolor: goldAlpha(0.08) },

                  }}

                >

                  <Iconify icon="solar:gallery-add-bold" width={20} />

                </IconButton>

                <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>

                  {t('feed.addPhoto')}

                </Typography>

              </Stack>



              <UserActionButton

                actionVariant="gold"

                disabled={(!content.trim() && !imageFile) || submitting}

                onClick={handleSubmit}

                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}

              >

                {t('feed.postAction')}

              </UserActionButton>

            </Stack>

          </Box>

        </Stack>

      </Stack>

    </UserGlassCard>

  );

}

