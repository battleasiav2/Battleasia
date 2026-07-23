import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button, Stack,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormProvider, { RHFTextField, RHFSelect, RHFUpload, RHFEditor, RHFSwitch } from 'src/components/hook-form';
import useApi from 'src/hooks/use-api';
import { useFileUpload } from 'src/hooks/use-file-upload';
import { API_URL } from 'src/config-global';
import { IFeedRow } from './types';

type FeedFormValues = {
  title: string;
  description: string;
  coverUrl?: File | string | null;
  status: 'published' | 'draft';
  premiumOnly: boolean;
  category: string;
};

interface ICategory {
  id: string;
  name: string;
  slug: string;
}

const FeedSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(200, 'Title must be less than 200 characters'),
  description: Yup.string().required('Description is required'),
  coverUrl: Yup.mixed().nullable().optional(),
  status: Yup.string().oneOf(['published', 'draft'] as const).required('Status is required'),
  premiumOnly: Yup.boolean().default(false),
  category: Yup.string().required('Category is required'),
});

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  feed: IFeedRow | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function FeedDialog({ open, mode, feed, onClose, onSuccess }: Props) {
  const { createFeedApi, updateFeedApi, getCategoriesApi } = useApi();
  const [categories, setCategories] = useState<ICategory[]>([]);

  const {
    uploadFile: uploadCoverFile,
    deleteFile: deleteCoverFile,
    uploading: uploadingCover,
  } = useFileUpload({
    endpoint: 'api/v1/files/upload',
    fieldName: 'file',
    folder: 'feeds',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  });

  const defaultValues: FeedFormValues = useMemo(
    () => ({
      title: '',
      description: '',
      coverUrl: null,
      status: 'draft',
      premiumOnly: false,
      category: '',
    }),
    []
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesApi({ limit: 10000 });
        if (response?.data?.status && response.data.data?.results) {
          setCategories(
            response.data.data.results
          );
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    if (open) {
      fetchCategories();
    }
  }, [open, getCategoriesApi]);

  const methods = useForm<FeedFormValues>({
    resolver: yupResolver(FeedSchema) as any,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && feed) {
        reset({
          title: feed.title || '',
          description: feed.description || '',
          coverUrl: feed.coverUrl ? `${API_URL}${feed.coverUrl}` : null,
          status: feed.status || 'draft',
          premiumOnly: feed.premiumOnly || false,
          category: feed.category?.id || '',
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, mode, feed, reset, defaultValues]);

  const handleDropCover = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setValue('coverUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      let coverUrl = '';

      // Handle cover image upload
      if (data.coverUrl instanceof File) {
        // New file uploaded - upload it
        if (mode === 'edit' && feed?.coverUrl) {
          const existingCoverUrl = feed.coverUrl;
          if (existingCoverUrl && typeof existingCoverUrl === 'string' && existingCoverUrl.trim() !== '') {
            try {
              await deleteCoverFile(existingCoverUrl);
            } catch (error) {
              console.error('Failed to delete old cover:', error);
              // Continue even if delete fails
            }
          }
        }
        const uploadedUrl = await uploadCoverFile(data.coverUrl);
        if (!uploadedUrl) {
          toast.error('Failed to upload cover image');
          return;
        }
        coverUrl = uploadedUrl;
      } else if (typeof data.coverUrl === 'string' && data.coverUrl) {
        // Existing URL - extract the path if it includes API_URL
        const urlString: string = data.coverUrl;
        if (urlString && API_URL && urlString.startsWith(API_URL)) {
          coverUrl = urlString.replace(API_URL, '');
        } else if (urlString) {
          coverUrl = urlString;
        }
      } else if (mode === 'edit' && feed?.coverUrl) {
        // Edit mode but no new file - keep existing
        const existingCover = feed.coverUrl;
        if (existingCover && typeof existingCover === 'string' && existingCover.trim() !== '') {
          coverUrl = existingCover;
        }
      }

      const payload = {
        title: data.title,
        description: data.description,
        coverUrl,
        status: data.status,
        premiumOnly: data.premiumOnly,
        categoryId: data.category,
      };

      if (mode === 'create') {
        const response = await createFeedApi(payload);
        if (response?.data?.status) {
          toast.success('Feed created successfully');
          onSuccess();
          onClose();
        }
      } else if (mode === 'edit' && feed) {
        const response = await updateFeedApi(feed.id, payload);
        if (response?.data?.status) {
          toast.success('Feed updated successfully');
          onSuccess();
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Failed to save feed:', error);
      toast.error(error?.response?.data?.message || 'Failed to save feed');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{mode === 'create' ? 'Create Feed' : 'Edit Feed'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <RHFTextField name="title" label="Title" required />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Description
              </Typography>
              <RHFEditor name="description" simple />
            </Box>
            <RHFSelect name="category" label="Category" required>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect name="status" label="Status">
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
            </RHFSelect>

            <RHFSwitch name="premiumOnly" label="Premium Only" helperText="Only premium members can view this feed" />

            <Box>
              <RHFUpload
                name="coverUrl"
                onDrop={handleDropCover}
                helperText="Upload cover image (JPG, PNG, GIF, WEBP)"
                maxSize={5 * 1024 * 1024}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || uploadingCover}
          >
            {mode === 'create' ? 'Create' : 'Update'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

