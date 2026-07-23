import { AnimatedStat } from 'src/components/animated-stat';

import { USER_COLORS } from './user-theme';

// ----------------------------------------------------------------------

type UserAnimatedStatProps = Omit<React.ComponentProps<typeof AnimatedStat>, 'color'> & {
  color?: string;
};

export function UserAnimatedStat({
  color = USER_COLORS.textPrimary,
  ...props
}: UserAnimatedStatProps) {
  return <AnimatedStat color={color} {...props} />;
}
