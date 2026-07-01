import { AuthShell } from './_components/auth-shell';

function AuthLayout({ children }: React.PropsWithChildren) {
  return <AuthShell>{children}</AuthShell>;
}

export default AuthLayout;
