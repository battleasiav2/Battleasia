import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import useApi from 'src/hooks/use-api';

export interface ICategoryRow {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

type CategoryFormValues = {
  name: string;
  slug: string;
};

const CategorySchema = Yup.object().shape({
  name: Yup.string().required('Name is required').max(100, 'Name must be less than 100 characters'),
  slug: Yup.string().required('Slug is required').max(100, 'Slug must be less than 100 characters'),
});

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  category: ICategoryRow | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function CategoryDialog({ open, mode, category, onClose, onSuccess }: Props) {
  const { createCategoryApi, updateCategoryApi } = useApi();

  const defaultValues: CategoryFormValues = useMemo(
    () => ({
      name: '',
      slug: '',
    }),
    []
  );

  const methods = useForm<CategoryFormValues>({
    resolver: yupResolver(CategorySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const name = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' && name) {
      const autoSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const currentSlug = watch('slug');
      if (!currentSlug || currentSlug === '') {
        setValue('slug', autoSlug, { shouldValidate: false });
      }
    }
  }, [name, mode, setValue, watch]);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && category) {
        reset({
          name: category.name || '',
          slug: category.slug || '',
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, mode, category, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (mode === 'create') {
        const response = await createCategoryApi(data);
        if (response?.data?.status) {
          toast.success('Category created successfully');
          onSuccess();
          onClose();
        }
      } else if (mode === 'edit' && category) {
        const response = await updateCategoryApi(category.id, data);
        if (response?.data?.status) {
          toast.success('Category updated successfully');
          onSuccess();
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast.error(error?.response?.data?.message || 'Failed to save category');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{mode === 'create' ? 'Create Category' : 'Edit Category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <RHFTextField name="name" label="Name" required />
            <RHFTextField name="slug" label="Slug" required helperText="URL-friendly version of the name" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {mode === 'create' ? 'Create' : 'Update'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

