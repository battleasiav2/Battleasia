import { ASSETS } from '../../lib/assets';

/** Branded BA crest seal above auth titles. */
export function AuthFormSeal() {
  return (
    <div className="auth-seal" aria-hidden>
      <div className="auth-seal-mark">
        <img src={ASSETS.logoLg} alt="" width={34} height={34} decoding="async" />
      </div>
    </div>
  );
}
